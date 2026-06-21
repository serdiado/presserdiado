// Snapshot-based undo/redo (20 levels). Captures the entire studio state (all formas, tempPool, globalSettings, activeFormaId, activeTab).

import { create } from 'zustand';
import type { StudioForma, TempPoolProduct, CatalogSettings, StudioSlot } from '@matbaapro/shared';
import { useCatalogStore } from './catalog.store';
import { clone, deepEqual } from './defaults';
import { isFooterSlotId, footerPageNumber, synthFooterSlot, setFooterModule, footerWriteTarget, setPageFooterModule } from './footerSlot';

const MAX_HISTORY = 20;

export interface HistorySnapshot {
  formas: StudioForma[];
  tempPool: TempPoolProduct[];
  globalSettings: CatalogSettings;
  activeFormaId: number;
  activeTab: 'outer' | 'inner';
}

// === Modül İzolasyon oturumu (geçici, oturum-scoped) ===
// editingContent(banner) ile ATOMİK yaşar (enter/exit, ui.store). null = izolasyon yok.
// Global past/future'a DOKUNMAZ; yalnız çıkışta (değişmişse) baselineSnapshot global'e +1 gider.
interface IsoSession {
  slotId: string;
  /** Girişteki TAM durum — çıkışta global past'e itilecek (tek atomik geri-al adımı). */
  baselineSnapshot: HistorySnapshot;
  /** Girişteki moduleData klonu — çıkış kıyasının TEK otoritesi + yerel undo tabanı (I3). */
  baselineModuleData: unknown;
  /** Yerel (modül-içi) undo/redo yığını: PRE-edit moduleData klonları, [0] = baseline. */
  localPast: unknown[];
  localFuture: unknown[];
  /** Yerel coalesce penceresi (global saveState 800ms ile aynı ilke). */
  localLastTime: number;
}

const snapshotOf = (): HistorySnapshot => {
  const catalog = useCatalogStore.getState();
  return {
    formas: clone(catalog.formas),
    tempPool: clone(catalog.tempProductPool),
    globalSettings: clone(catalog.globalSettings),
    activeFormaId: catalog.activeFormaId,
    activeTab: catalog.activeTab,
  };
};

const findActiveSlot = (slotId: string): StudioSlot | undefined => {
  // SNAPSHOT tarafı (fold-2): footer-slot izolasyonu da buradan okunur → snapshot footer modülünü alır
  // (yalnız restore değil). Footer-farkındalığı footerSlot.ts'te (funnel'a if-isFooter sızmaz).
  if (isFooterSlotId(slotId)) {
    const catalog = useCatalogStore.getState();
    return synthFooterSlot(footerPageNumber(slotId), catalog.getActivePages(), catalog.globalSettings);
  }
  for (const p of useCatalogStore.getState().getActivePages()) {
    const s = p.slots.find((x) => x.id === slotId);
    if (s) return s;
  }
  return undefined;
};

// moduleData'yı slota geri yaz — updateSlotModuleData yönlendirmesini (ve yeni snapshot'ı) ATLAR.
const restoreModuleData = (slotId: string, md: unknown) => {
  // RESTORE tarafı: footer-slot → override-varlığına göre route (snapshot/yönlendirme yok).
  // 2a-i: footerWriteTarget daima 'global' → eski setFooterModule yolu birebir; page dalı DORMANT.
  if (isFooterSlotId(slotId)) {
    const pn = footerPageNumber(slotId);
    const catalog = useCatalogStore.getState();
    const page = catalog.getActivePages().find((p) => p.pageNumber === pn);
    if (footerWriteTarget(page) === 'page' && page) {
      catalog.setActivePages(
        catalog.getActivePages().map((p) => (p.pageNumber === pn ? setPageFooterModule(p, md) : p)),
      );
    } else {
      useCatalogStore.setState((s) => ({ globalSettings: setFooterModule(s.globalSettings, md) }));
    }
    return;
  }
  const catalog = useCatalogStore.getState();
  const pages = catalog.getActivePages().map((p) => ({
    ...p,
    slots: p.slots.map((s) => (s.id === slotId ? { ...s, moduleData: md } : s)),
  }));
  catalog.setActivePages(pages);
};

interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  lastSavedTime: number;
  isoSession: IsoSession | null;
  /** Atomik işlem penceresi: açıkken iç saveState/pushIsolationSnapshot bastırılır (tek undo). */
  batching: boolean;
  /** Batch içinde ilk snapshot henüz alınmadı → ilk iç yazım forced çeker, sonrakiler bastırılır. */
  batchPending: boolean;
  saveState: (force?: boolean) => void;
  /** Birden çok yazımı TEK undo adımına sar: bir pre-state snapshot + iç save'leri bastır. */
  withHistoryBatch: (fn: () => void) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  // İzolasyon
  beginIsolation: (slotId: string) => void;
  pushIsolationSnapshot: () => void;
  isolationUndo: () => void;
  isolationRedo: () => void;
  commitIsolation: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  lastSavedTime: 0,
  isoSession: null,
  batching: false,
  batchPending: false,

  saveState: (force = false) => {
    if (get().batching) {
      if (!get().batchPending) return; // batch: ilk snapshot alındı → sonrakileri bastır
      set({ batchPending: false }); // batch ilk: bu çağrı geçsin (pre-mutation orijinali yakalar)
      force = true; // cooldown bypass → atomik taban garanti
    }
    const now = Date.now();
    const { past, lastSavedTime } = get();

    // Slider sürüklemeleri ve hızlı ardışık güncellemeler için 800ms cooldown koruması.
    // Ancak sürüklemenin ilk başındaki orijinal durumu kaydetmek için ilk çağrıyı her zaman kabul ederiz.
    if (!force && now - lastSavedTime < 800) {
      return;
    }

    const catalog = useCatalogStore.getState();
    catalog.setIsDirty(true);
    const snapshot: HistorySnapshot = {
      formas: clone(catalog.formas),
      tempPool: clone(catalog.tempProductPool),
      globalSettings: clone(catalog.globalSettings),
      activeFormaId: catalog.activeFormaId,
      activeTab: catalog.activeTab,
    };
    set({
      past: [...past.slice(-MAX_HISTORY), snapshot],
      future: [],
      // Yalnız force'suz (sürekli) save'ler cooldown saatini ilerletir. Forced ayrık
      // işlemler coalesce penceresini KİRLETMEZ → art arda yapılan farklı ayrık işlemler
      // (ör. modül uygula + ürün sürükle) ayrı undo adımı kalır.
      ...(force ? {} : { lastSavedTime: now }),
    });
  },

  // Atomik işlem: birden çok yazımı (ör. cell-level container patch + run-property strip HTML) TEK
  // undo adımına sarar. TEK pre-state snapshot (forced, iso-aware) yakalar; sonra iç save'leri bastırır
  // → tek Ctrl+Z tam orijinale döner, yarı-geri-alınmış ara-durum YOK. (Slider undo-gruplama ile aynı infra.)
  withHistoryBatch: (fn) => {
    if (get().batching) {
      fn(); // nested → dış batch ilk snapshot'ı yönetiyor
      return;
    }
    // "İlk-yazım yakalar": withHistoryBatch ön-snapshot ALMAZ. Batch içindeki İLK iç save (mutasyondan
    // ÖNCE, KENDİ mekanizmasıyla — ürün→global saveState; banner→iso pushIsolationSnapshot) forced çeker;
    // sonraki yazımlar bastırılır → iso-vs-global tahmini YOK, doğru route, tek atomik snapshot.
    set({ batching: true, batchPending: true });
    try {
      fn();
    } finally {
      set({ batching: false, batchPending: false });
    }
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;
    const catalog = useCatalogStore.getState();
    const currentSnapshot: HistorySnapshot = {
      formas: clone(catalog.formas),
      tempPool: clone(catalog.tempProductPool),
      globalSettings: clone(catalog.globalSettings),
      activeFormaId: catalog.activeFormaId,
      activeTab: catalog.activeTab,
    };
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [currentSnapshot, ...future],
    });
    
    catalog.setFormas(previous.formas);
    useCatalogStore.setState({
      tempProductPool: previous.tempPool,
      globalSettings: previous.globalSettings,
      activeFormaId: previous.activeFormaId,
      activeTab: previous.activeTab,
    });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;
    const catalog = useCatalogStore.getState();
    const currentSnapshot: HistorySnapshot = {
      formas: clone(catalog.formas),
      tempPool: clone(catalog.tempProductPool),
      globalSettings: clone(catalog.globalSettings),
      activeFormaId: catalog.activeFormaId,
      activeTab: catalog.activeTab,
    };
    const next = future[0];
    set({
      past: [...past, currentSnapshot],
      future: future.slice(1),
    });

    catalog.setFormas(next.formas);
    useCatalogStore.setState({
      tempProductPool: next.tempPool,
      globalSettings: next.globalSettings,
      activeFormaId: next.activeFormaId,
      activeTab: next.activeTab,
    });
  },

  // lastSavedTime de sıfırlanır: history temizlendikten (load/yeni proje/applyTemplate/reset)
  // sonraki İLK saveState her zaman yazsın — bayat cooldown bir sonraki belgeye sızmasın.
  // isoSession da atılır: belge değişirken yarım bir izolasyon oturumu sızmasın.
  clearHistory: () => set({ past: [], future: [], lastSavedTime: 0, isoSession: null }),

  // === İzolasyon: yerel oturum makinesi ===
  // GİRİŞTE global saveState ÇAĞIRMA (I1) — yalnız tam baseline'ı yerelde tut.
  beginIsolation: (slotId) => {
    const slot = findActiveSlot(slotId);
    set({
      isoSession: {
        slotId,
        baselineSnapshot: snapshotOf(),
        baselineModuleData: clone(slot?.moduleData ?? null),
        localPast: [],
        localFuture: [],
        localLastTime: 0,
      },
    });
  },

  // updateSlotModuleData mutasyondan ÖNCE çağırır → o anki (PRE-edit) moduleData'yı klonlayıp
  // yerel yığına iter. Coalesce: 800ms penceresi (global saveState ile aynı ilke). localLastTime=0
  // başladığı için İLK push (baseline) her zaman kaydolur → yerel undo tabanı garanti.
  pushIsolationSnapshot: () => {
    if (get().batching && !get().batchPending) return; // batch: ilk snapshot alındı → sonrakileri bastır
    const { isoSession } = get();
    if (!isoSession) return;
    const now = Date.now();
    if (get().batching) {
      set({ batchPending: false }); // batch ilk: coalesce bypass (bu çağrı geçsin)
    } else if (now - isoSession.localLastTime < 800) {
      return;
    }
    const slot = findActiveSlot(isoSession.slotId);
    set({
      isoSession: {
        ...isoSession,
        localPast: [...isoSession.localPast.slice(-MAX_HISTORY), clone(slot?.moduleData ?? null)],
        localFuture: [],
        localLastTime: now,
      },
    });
  },

  // Yerel undo: en geriye baseline'a kadar (ÖTESİNE değil) → modül asla silinemez (I3).
  isolationUndo: () => {
    const { isoSession } = get();
    if (!isoSession || isoSession.localPast.length === 0) return;
    const slot = findActiveSlot(isoSession.slotId);
    const current = clone(slot?.moduleData ?? null);
    const prev = isoSession.localPast[isoSession.localPast.length - 1];
    set({
      isoSession: {
        ...isoSession,
        localPast: isoSession.localPast.slice(0, -1),
        localFuture: [current, ...isoSession.localFuture],
      },
    });
    restoreModuleData(isoSession.slotId, clone(prev));
  },

  isolationRedo: () => {
    const { isoSession } = get();
    if (!isoSession || isoSession.localFuture.length === 0) return;
    const slot = findActiveSlot(isoSession.slotId);
    const current = clone(slot?.moduleData ?? null);
    const next = isoSession.localFuture[0];
    set({
      isoSession: {
        ...isoSession,
        localPast: [...isoSession.localPast, current],
        localFuture: isoSession.localFuture.slice(1),
      },
    });
    restoreModuleData(isoSession.slotId, clone(next));
  },

  // Çıkış commit: yapısal deepEqual(baseline, final) TEK otorite. Değişmişse baselineSnapshot'ı
  // global past'e it + future temizle → global undo TÜM oturumu tek adımda geri alır (I2/I4).
  // Bu, "saveState-önce-mutate" girişiyle ŞEKİLCE özdeş; özel-kılıf yok, redo normal çalışır.
  commitIsolation: () => {
    const { isoSession, past } = get();
    if (!isoSession) return;
    const slot = findActiveSlot(isoSession.slotId);
    const finalModuleData = slot?.moduleData ?? null;
    const changed = !deepEqual(isoSession.baselineModuleData, finalModuleData);
    if (changed) {
      useCatalogStore.getState().setIsDirty(true);
      set({
        past: [...past.slice(-MAX_HISTORY), isoSession.baselineSnapshot],
        future: [],
      });
    }
    set({ isoSession: null });
  },
}));
