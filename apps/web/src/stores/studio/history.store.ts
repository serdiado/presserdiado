// Snapshot-based undo/redo (20 levels). Captures the entire studio state (all formas, tempPool, globalSettings, activeFormaId, activeTab).

import { create } from 'zustand';
import type { StudioForma, TempPoolProduct, CatalogSettings, StudioSlot } from '@matbaapro/shared';
import { useCatalogStore } from './catalog.store';
import { clone, deepEqual } from './defaults';

const MAX_HISTORY = 20;

export interface HistorySnapshot {
  formas: StudioForma[];
  tempPool: TempPoolProduct[];
  globalSettings: CatalogSettings;
  activeFormaId: number;
  activeTab: 'outer' | 'inner';
}

// === Modül İzolasyon oturumu (geçici, oturum-scoped) ===
// editingContent(banner|pizza) ile ATOMİK yaşar (enter/exit, ui.store). null = izolasyon yok.
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
  for (const p of useCatalogStore.getState().getActivePages()) {
    const s = p.slots.find((x) => x.id === slotId);
    if (s) return s;
  }
  return undefined;
};

// moduleData'yı slota geri yaz — updateSlotModuleData yönlendirmesini (ve yeni snapshot'ı) ATLAR.
const restoreModuleData = (slotId: string, md: unknown) => {
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
  saveState: (force?: boolean) => void;
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

  saveState: (force = false) => {
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
    const { isoSession } = get();
    if (!isoSession) return;
    const now = Date.now();
    if (now - isoSession.localLastTime < 800) return;
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
