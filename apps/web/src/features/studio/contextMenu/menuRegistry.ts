// Sağ tık menüsü — aksiyon REGISTRY'si (veri-driven menü, doc §8). Her aksiyon bir descriptor
// {id,label,group,danger,visible,run}. Renderer (ContextMenu.tsx) bunu mevcut bağlama göre filtreler/
// gruplar/çizer → yeni aksiyon = listeye bir SATIR (JSX'e dokunma). §2 sıra + §3 renk descriptor'dan
// OTOMATİK türetilir (buildMenu + renderer). 2a pilot kapsamı: Dal 1/2/3/4 (slot) + Dal 7 (pageBg).
// run içinde store getState() — call-time (Page.tsx onClick deseninin aynısı). Cycle yok: store registry'yi
// import ETMEZ. Relative store importu (alias '@' değil) → vitest registry'yi test ederken çözebilsin.

import type { ComponentType } from 'react';
// Barrel (../../../stores/studio) DEĞİL, doğrudan modül: barrel theme.store'u re-export eder, o da '@'
// alias kullanır → vitest.config alias taşımadığından test çözemez. Direkt importlar '@'-zincirinden kaçar.
import { useCatalogStore } from '../../../stores/studio/catalog.store';
import { useUIStore } from '../../../stores/studio/ui.store';
import type { MenuContext } from './menuContext';

export interface MenuAction {
  id: string;
  /** Dinamik etiket (ör. Özel/Genel, Ekle/Değiştir). Pilotta sabit. */
  label: (ctx: MenuContext) => string;
  icon?: ComponentType<{ size?: number | string }>;
  /** §2 grup: 1 Oluştur/Ekle · 2 Düzenle/Dönüştür · 3 Stil/Pano · 4 Yıkıcı. */
  group: 1 | 2 | 3 | 4;
  /** §3: yalnız geri-dönüşü-zor aksiyonda true (kırmızı). MENU_DANGER_ALLOWLIST zorlar. */
  danger?: boolean;
  visible: (ctx: MenuContext) => boolean;
  /** KALICI katman pasif durumu (destek yoksa). Pilotta kullanılmaz; renderer disabled çizer. */
  enabled?: (ctx: MenuContext) => boolean;
  run: (ctx: MenuContext) => void;
}

// §3 invariant ALLOW-LIST: yalnız bu id'ler danger:true olabilir (geri-dönüşü-zor). ŞU AN BOŞ — hiç
// kırmızı kalem yok: "Hücreyi Boşalt" + "Varsayılana Sıfırla" ikisi de Ctrl+Z/havuz ile geri alınır → NÖTR.
// İlk gerçek geri-dönüşü-zor kalem geldiğinde id buraya + descriptor'a danger:true BİRLİKTE eklenir.
export const MENU_DANGER_ALLOWLIST = new Set<string>([]);

const cat = () => useCatalogStore.getState();
const ui = () => useUIStore.getState();

// "Önce seç" guard (Page.tsx:192-196 ile birebir): seçili değilse seç → sonra stil aksiyonu doğru hedefte.
const ensureSelected = (slotId: string) => {
  if (!ui().selectedSlotIds.includes(slotId)) ui().toggleSlotSelection(slotId, false);
};

export const MENU_ACTIONS: MenuAction[] = [
  // ── Dal 1/2/3/4 — ürün/serbest slot (kind:'slot') ───────────────────────────
  // Grup 1: Oluştur/Ekle — ürün rolündeyken (Modül Ekle: free'ye çevirir; Ürün: sidebar açar)
  {
    id: 'slot-modul-ekle',
    label: () => 'Modül Ekle',
    group: 1,
    visible: (c) => c.kind === 'slot' && c.role === 'product',
    run: (c) => {
      if (c.kind === 'slot') cat().setSlotModule(c.pageNumber, c.slotId, 'banner');
    },
  },
  {
    id: 'slot-urun',
    label: (c) => (c.kind === 'slot' && c.hasProduct ? 'Ürünü Değiştir' : 'Ürün Ekle'),
    group: 1,
    visible: (c) => c.kind === 'slot' && c.role === 'product',
    run: () => {
      ui().setSidebarState('products');
    },
  },
  {
    id: 'slot-birlestir',
    label: () => 'Hücreleri Birleştir',
    group: 2,
    visible: (c) => c.kind === 'slot' && c.canMerge,
    run: (c) => {
      if (c.kind === 'slot') cat().mergeSelected(c.pageNumber, c.slotId);
    },
  },
  {
    id: 'slot-ayir',
    label: () => 'Hücreleri Ayır',
    group: 2,
    visible: (c) => c.kind === 'slot' && c.canUnmerge,
    run: (c) => {
      if (c.kind === 'slot') cat().unmergeSlot(c.pageNumber, c.slotId);
    },
  },
  {
    id: 'slot-urun-hucresi',
    label: () => 'Ürün Hücresi Yap',
    group: 2,
    visible: (c) => c.kind === 'slot' && c.role === 'free',
    run: (c) => {
      if (c.kind !== 'slot') return;
      ui().toggleSlotSelection(c.slotId, false); // toggleSlotRole selectedSlotIds'i kullanır
      cat().toggleSlotRole('product');
    },
  },
  {
    id: 'slot-stil-kopyala',
    label: () => 'Hücre Stili Kopyala',
    group: 3,
    visible: (c) => c.kind === 'slot',
    run: (c) => {
      if (c.kind !== 'slot') return;
      ensureSelected(c.slotId);
      cat().copySlotSettings();
    },
  },
  {
    id: 'slot-stil-yapistir',
    label: () => 'Hücre Stili Yapıştır',
    group: 3,
    visible: (c) => c.kind === 'slot' && c.hasCopiedSlotStyle,
    run: (c) => {
      if (c.kind !== 'slot') return;
      ensureSelected(c.slotId);
      cat().pasteSlotSettings();
    },
  },
  {
    id: 'slot-bosalt',
    label: () => 'Hücreyi Boşalt',
    group: 4,
    danger: false, // §3: havuz+undo → NÖTR (eski kırmızı "Temizle" + "Havuza Gönder" tek aksiyonda birleşti)
    visible: (c) => c.kind === 'slot' && c.hasProduct,
    run: (c) => {
      if (c.kind === 'slot') cat().clearSlotToPool(c.pageNumber, c.slotId);
    },
  },
  // ── Dal 5 — footer host-slot seçim modu (kind:'footerSel') ──────────────────
  {
    id: 'footer-ozel-genel',
    // Dinamik: custom footer (footerOverride VAR) → "Genele Dön"; global → "Özel Ayar Yap".
    label: (c) => (c.kind === 'footerSel' && c.isCustom ? 'Genele Dön' : 'Özel Ayar Yap'),
    group: 2,
    visible: (c) => c.kind === 'footerSel' && !c.isHidden,
    run: (c) => {
      if (c.kind !== 'footerSel') return;
      if (c.isCustom) cat().revertPageFooter(c.pageNumber);
      else cat().forkPageFooter(c.pageNumber);
    },
  },
  {
    id: 'footer-sifirla',
    label: () => 'Varsayılana Sıfırla',
    group: 4,
    // danger YOK (§3): resetFooterToDefault Ctrl+Z ile geri alınır → NÖTR. ALLOWLIST boş kalır.
    visible: (c) => c.kind === 'footerSel' && !c.isHidden,
    run: (c) => {
      if (c.kind !== 'footerSel') return;
      if (c.isCustom) {
        // Tek sayfa (custom override) → doğrudan, onaysız.
        cat().resetFooterToDefault(c.pageNumber);
      } else {
        // Global footer → TÜM global-footer sayfalarını etkiler → ONAY ZORUNLU (sürpriz kayıp önlenir).
        ui().requestConfirm({
          title: 'Genel Alt Bilgiyi Sıfırla',
          description:
            'Genel ayarlı tüm alt bilgiler varsayılan ayarlara döndürülecek. Onaylıyor musunuz?',
          confirmLabel: 'Varsayılana Sıfırla',
          confirmVariant: 'primary',
          onConfirm: () => cat().resetFooterToDefault('global'),
        });
      }
    },
  },
  // ── Dal 6 — banner/footer cell-edit (izole iç hücre, kind:'bannerCell') ─────
  // SÜPERSET: lokal #banner-ctx-menu (satır/sütun ekle-sil) registry'ye taşındı + Birleştir/Ayır/
  // İçeriği Temizle eklendi. Action paritesi BİREBİR (insert/deleteBannerRow/Column anchor sr/sc =
  // anchorRow/anchorCol). Footer-aware: action'lar resolveModuleSlot ile footerModule'e yönlenir.
  // §3 NÖTR: hiç kırmızı yok (hepsi Ctrl+Z ile geri alınır). Düzenle YOK (çift-tık zaten girer).
  {
    id: 'cell-row-above',
    label: () => 'Üste satır ekle',
    group: 1,
    visible: (c) => c.kind === 'bannerCell',
    run: (c) => {
      if (c.kind === 'bannerCell') cat().insertBannerRow(c.slotId, c.anchorRow);
    },
  },
  {
    id: 'cell-row-below',
    label: () => 'Alta satır ekle',
    group: 1,
    visible: (c) => c.kind === 'bannerCell',
    run: (c) => {
      if (c.kind === 'bannerCell') cat().insertBannerRow(c.slotId, c.anchorRow + 1);
    },
  },
  {
    id: 'cell-col-left',
    label: () => 'Sola sütun ekle',
    group: 1,
    visible: (c) => c.kind === 'bannerCell',
    run: (c) => {
      if (c.kind === 'bannerCell') cat().insertBannerColumn(c.slotId, c.anchorCol);
    },
  },
  {
    id: 'cell-col-right',
    label: () => 'Sağa sütun ekle',
    group: 1,
    visible: (c) => c.kind === 'bannerCell',
    run: (c) => {
      if (c.kind === 'bannerCell') cat().insertBannerColumn(c.slotId, c.anchorCol + 1);
    },
  },
  {
    id: 'cell-birlestir',
    label: () => 'Hücreleri Birleştir',
    group: 2,
    visible: (c) => c.kind === 'bannerCell' && c.cellIds.length >= 2,
    run: (c) => {
      if (c.kind === 'bannerCell') cat().mergeBannerCells(c.slotId, c.cellIds);
    },
  },
  {
    id: 'cell-ayir',
    label: () => 'Hücreleri Ayır',
    group: 2,
    visible: (c) => c.kind === 'bannerCell' && c.isMerged,
    run: (c) => {
      if (c.kind === 'bannerCell') cat().splitBannerCell(c.slotId, c.anchorCellId);
    },
  },
  {
    id: 'cell-satir-sil',
    label: () => 'Satırı sil',
    group: 4,
    // visible-gizleme (disabled DEĞİL): son satırda (rows<=1) menüde görünmez. enabled mekanizması yok.
    visible: (c) => c.kind === 'bannerCell' && c.rows > 1,
    run: (c) => {
      if (c.kind === 'bannerCell') cat().deleteBannerRow(c.slotId, c.anchorRow);
    },
  },
  {
    id: 'cell-sutun-sil',
    label: () => 'Sütunu sil',
    group: 4,
    visible: (c) => c.kind === 'bannerCell' && c.cols > 1,
    run: (c) => {
      if (c.kind === 'bannerCell') cat().deleteBannerColumn(c.slotId, c.anchorCol);
    },
  },
  {
    id: 'cell-sil',
    // clearBannerCells YALNIZ içerik (text+image) temizler; yapı+stil korunur → "İçeriği Temizle"
    // (Satırı/Sütunu sil yapı siler; bu ondan ayrışır). danger YOK: tek Ctrl+Z geri alır.
    label: () => 'İçeriği Temizle',
    group: 4,
    visible: (c) => c.kind === 'bannerCell',
    run: (c) => {
      if (c.kind === 'bannerCell') cat().clearBannerCells(c.slotId, c.cellIds);
    },
  },
  // ── Dal 7 — sayfa zemini (kind:'pageBg') ────────────────────────────────────
  {
    id: 'bg-stil-kopyala',
    label: () => 'Zemin Stili Kopyala',
    group: 3,
    visible: (c) => c.kind === 'pageBg',
    run: (c) => {
      if (c.kind === 'pageBg') cat().copyBackground(c.pageNumber);
    },
  },
  {
    id: 'bg-stil-yapistir',
    label: () => 'Zemin Stili Yapıştır',
    group: 3,
    visible: (c) => c.kind === 'pageBg' && c.hasCopiedBg,
    run: (c) => {
      if (c.kind === 'pageBg') cat().pasteBackground(c.pageNumber);
    },
  },
];

export interface MenuGroup {
  group: number;
  items: MenuAction[];
  /** §2: bu grubun ÖNÜNE divider çizilsin mi (yalnız BLOK sınırında true). */
  dividerBefore: boolean;
}

// §2 BLOK haritası: G1(Oluştur)+G2(Dönüştür) BİTİŞİK (blok 1) → aralarında divider YOK; G3(Stil) blok 2;
// G4(Yıkıcı) blok 3. block, group'tan TÜRETİLİR (descriptor'a ayrı 'block' alanı KOYMA → tekrar/tutarsızlık
// riski; tek-kaynak group). Divider yalnız blok DEĞİŞİNCE, "her grup arası" DEĞİL.
const GROUP_BLOCK: Record<1 | 2 | 3 | 4, 1 | 2 | 3> = { 1: 1, 2: 1, 3: 2, 4: 3 };

// Saf: filtrele(visible) → §2 grup sırası (1→4), yalnız DOLU gruplar; her gruba blok-sınırı divider'ı
// (dividerBefore) işlenir → §2 (G1+G2 bitişik; divider yalnız blok arası) + §3 (renk descriptor.danger'dan)
// OTOMATİK. Yeni dal eklemek = MENU_ACTIONS'a satır; render/sıra/renk koda gömülü invariant.
export function buildMenu(ctx: MenuContext, actions: MenuAction[] = MENU_ACTIONS): MenuGroup[] {
  const filled: { group: 1 | 2 | 3 | 4; items: MenuAction[] }[] = [];
  for (const g of [1, 2, 3, 4] as const) {
    const items = actions.filter((a) => a.group === g && a.visible(ctx));
    if (items.length > 0) filled.push({ group: g, items });
  }
  return filled.map((grp, i) => ({
    ...grp,
    dividerBefore: i > 0 && GROUP_BLOCK[grp.group] !== GROUP_BLOCK[filled[i - 1].group],
  }));
}
