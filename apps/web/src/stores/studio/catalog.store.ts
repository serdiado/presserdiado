// Main studio state — catalog, slots, formas, settings, temp pool.
// Ported from katalog-tasarim-v2/src/store/useCatalogStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BrochureTemplate,
  CatalogPage,
  CatalogSettings,
  DeepPartial,
  ModuleType,
  ProductInfo,
  StudioForma,
  StudioSlot,
  StudioPreset,
  StudioPresetArchetype,
  StudioPresetBannerArea,
  StudioPresetPageBackground,
  TempPoolProduct,
} from '@matbaapro/shared';
import { availableTemplates, Template1, STUDIO_STORE_NAME, STUDIO_STORE_VERSION, normalizeSku, defaultCellAppearance } from '@matbaapro/shared';
import { applyUnmerge, recalculateLayout, reconcileGrid } from '@matbaapro/grid-engine';
import {
  buildFormasForTemplate,
  clone,
  createPageSlots,
  deepMerge,
  initialGlobalSettings,
} from './defaults';
import { ModuleRegistry } from './module-registry';
// Doğrudan dosyadan (barrel DEĞİL): modules/index → BannerSection → store döngüsünü
// kırmak için. studioModules.ts yalnız ./types (saf tip) import eder, döngü yok.
import { listStudioModules } from '../../features/studio/modules/studioModules';
// gridMutate saf motor (yalnız ./types + ./fractions import eder → döngü yok). Banner yapısal
// mutasyonları (satır/sütun ekle-sil, merge/split) buradan; store yalnız ince sarmal.
import {
  insertColumn as gridInsertColumn,
  deleteColumn as gridDeleteColumn,
  insertRow as gridInsertRow,
  deleteRow as gridDeleteRow,
  mergeCells as gridMergeCells,
  splitCell as gridSplitCell,
  resizeGridTo as gridResizeTo,
  type GridState,
} from '../../features/studio/modules/gridMutate';
import type { BannerModuleData } from '../../features/studio/modules/types';
import { isFooterSlotId, resolveModuleSlot, mergeFooterModule, footerWriteTarget, mergePageFooterModule, resolveFooterModule, defaultFooterModule } from './footerSlot';
import { useHistoryStore } from './history.store';
import { useUIStore } from './ui.store';
import { foldNameMap } from '../../features/wizard/buildTemplate';
import { DEFAULT_OPTIONS, DEFAULT_QUANTITY } from '../../features/print-order/constants';
import type { PrintOptionsValue } from '../../features/print-order/types';

type GridScope = 'global' | number;

/**
 * Preset banner alanlarını taze slot dizisine işler: anchor slot 'free' olur,
 * span > 1 ise kapsanan hücreler merge konvansiyonuyla gizlenir.
 */
function applyBannerAreas(
  formas: StudioForma[],
  areas: StudioPresetBannerArea[] | undefined,
  cols: number,
): void {
  if (!areas?.length) return;
  const allPages = formas.flatMap((f) => f.pages);
  for (const area of areas) {
    const page = allPages.find((p) => p.pageNumber === area.pageNumber);
    const anchor = page?.slots[area.slotIndex];
    if (!page || !anchor) continue;
    const colSpan = Math.max(1, area.colSpan ?? 1);
    const rowSpan = Math.max(1, area.rowSpan ?? 1);
    anchor.role = 'free';
    anchor.colSpan = colSpan;
    anchor.rowSpan = rowSpan;
    anchor.product = null;
    if (colSpan === 1 && rowSpan === 1) continue;
    const row = Math.floor(area.slotIndex / cols);
    const col = area.slotIndex % cols;
    for (let ir = 0; ir < rowSpan; ir++) {
      for (let ic = 0; ic < colSpan; ic++) {
        if (ir === 0 && ic === 0) continue;
        const covered = page.slots[(row + ir) * cols + (col + ic)];
        if (covered) {
          covered.hidden = true;
          covered.mergedInto = anchor.id;
          covered.product = null;
        }
      }
    }
  }
}

/**
 * Preset sayfa zeminlerini taze formalara işler: pageNumber ile eşleşen sayfaya
 * background KOPYALANIR (clone — tema↔broşür referans bağı olmasın; preset objesi ile
 * broşür sayfası referans paylaşmaz). Eşleşme yoksa girdi sessizce atlanır; preset
 * karşılığı OLMAYAN sayfanın mevcut zemini KORUNUR (silinmez). pageBackgrounds yok/boşsa
 * erken döner → eski presetler eski davranışı korur (geri uyum).
 */
function applyPageBackgrounds(
  formas: StudioForma[],
  pageBackgrounds: StudioPresetPageBackground[] | undefined,
): void {
  if (!pageBackgrounds?.length) return;
  const allPages = formas.flatMap((f) => f.pages);
  for (const entry of pageBackgrounds) {
    const page = allPages.find((p) => p.pageNumber === entry.pageNumber);
    if (!page) continue;
    page.background = clone(entry.background);
  }
}

/**
 * Bir hedef sayfaya rol-bazlı arketibi (ürünsüz KOMPLE sayfa snapshot'ı) uygular: grid + özel
 * slotlar + modüller + birleşme + zemin + header + footer. Slot id'leri hedef sayfaya göre TAZE
 * üretilir (iç arketip N sayfaya uygulanınca id çakışmasın); `mergedInto` arketip-index → taze-id
 * remap'lenir. Ürün taşınmaz (apply'da yeniden dağıtılır). Tüm alt-nesneler clone ile izole.
 */
function applyArchetype(page: CatalogPage, arch: StudioPresetArchetype): void {
  page.gridSettings = { rows: arch.grid.rows, cols: arch.grid.cols };
  const fresh = createPageSlots(page.pageNumber, arch.grid.rows * arch.grid.cols);
  const archIdToIndex = new Map<string, number>();
  arch.slots.forEach((s, i) => archIdToIndex.set(s.id, i));
  page.slots = fresh.map((f, i) => {
    const a = arch.slots[i];
    if (!a) return f;
    const mergedInto =
      a.mergedInto != null ? (fresh[archIdToIndex.get(a.mergedInto) ?? -1]?.id ?? null) : a.mergedInto;
    return {
      ...f,
      role: a.role,
      isCustom: a.isCustom,
      customSettings: a.customSettings
        ? (clone(a.customSettings) as DeepPartial<CatalogSettings>)
        : undefined,
      moduleType: a.moduleType ?? null,
      moduleData: a.moduleData != null ? clone(a.moduleData) : null,
      colSpan: a.colSpan,
      rowSpan: a.rowSpan,
      hidden: a.hidden,
      mergedInto,
      product: null,
    };
  });
  page.background = arch.background ? clone(arch.background) : undefined;
  page.headerData = arch.headerData ? clone(arch.headerData) : undefined;
  page.footerMode = arch.footerMode;
  page.footerOverride = arch.footerOverride ? clone(arch.footerOverride) : undefined;
  page.footerText = arch.footerText ?? page.footerText;
  page.footerLogo = arch.footerLogo ?? null;
}

/**
 * Görünür ürün slotlarını kanonik sırada döndürür: sayfalar pageNumber artan,
 * her sayfada slot dizisi sırası, yalnız !hidden && role==='product'.
 * Bu sıra recalculateLayout'un globalNumber atamasıyla birebir aynıdır (= ekrandaki 1,2,3).
 */
export function productSlotsInOrder(formas: StudioForma[]): StudioSlot[] {
  const out: StudioSlot[] = [];
  const pages = formas.flatMap((f) => f.pages).sort((a, b) => a.pageNumber - b.pageNumber);
  for (const page of pages) {
    for (const slot of page.slots) {
      if (!slot.hidden && slot.role === 'product') out.push(slot);
    }
  }
  return out;
}

/**
 * Tasarıma sığmayan (overflow) ürünleri bekleme havuzuna ekler: mevcut havuzu
 * korur, yeni ürünleri sku-dedup ile başa (unshift) koyar. Tek-kaynak overflow kuralı.
 */
function appendOverflowToTempPool(
  tempPool: TempPoolProduct[],
  overflow: ProductInfo[],
): TempPoolProduct[] {
  let result = [...tempPool];
  for (const product of overflow) {
    if (product.sku) result = result.filter((p) => p.sku !== product.sku);
    result.unshift({ ...product });
  }
  return result;
}

/**
 * Tek ürünü havuza YAKALAR (kaybolmaz): aynı SKU varsa havuzdan çıkarır, ürünü origin-etiketiyle
 * (originalPage/originalSlotId — geri-getirme için) en başa koyar. SAF: set() YAPMAZ, dizi döner →
 * çağıran kendi set()'inde kullanır. TEK-KAYNAK: clearSlotToPool + setSlotModule + mergeSelected.
 * mergeSelected çoklu ürünü bunu fold'layarak işler → tek atomik set bozulmaz (§7 borcu kapandı).
 */
function captureProductToPool(
  pool: TempPoolProduct[],
  product: ProductInfo,
  pageNumber: number,
  slotId: string,
): TempPoolProduct[] {
  const filtered = product.sku ? pool.filter((p) => p.sku !== product.sku) : pool;
  return [{ ...product, originalPage: pageNumber, originalSlotId: slotId }, ...filtered];
}

/**
 * Serbest hücre (free) görünümü için customSettings üretir: globalSettings klonlanır,
 * hücre arkaplanı/kenarlığı/gölgesi/boşluğu/yarıçapı sıfırlanır (şeffaf görünüm).
 * TEK-KAYNAK: hem toggleSlotRole('free') hem setSlotModule (Tablo Alanı drop'u) bunu kullanır
 * → "Serbest Alan Yap" ile drop'un görünümü birebir özdeş kalır, drift olmaz.
 */
function buildFreeCellSettings(globalSettings: CatalogSettings): CatalogSettings {
  const cs = clone(globalSettings) as CatalogSettings;
  cs.spacings.cell = { t: 0, r: 0, b: 0, l: 0, linked: true };
  cs.colors.cellBg = { type: 'solid', color: '#ffffff', opacity: 0 };
  cs.colors.cellBorder = { ...cs.colors.cellBorder, t: 0, r: 0, b: 0, l: 0, color: { ...cs.colors.cellBorder.color, o: 0 } };
  cs.shadows.cell.active = false;
  cs.radiuses.cell = { tl: 0, tr: 0, bl: 0, br: 0, linked: true };
  return cs;
}

interface CatalogState {
  _hasHydrated: boolean;
  projectId: string | null;
  projectName: string;
  activeTemplate: BrochureTemplate;
  formas: StudioForma[];
  activeFormaId: number;
  activeTab: 'outer' | 'inner';
  productPool: ProductInfo[];
  tempProductPool: TempPoolProduct[];
  globalSettings: CatalogSettings;
  copiedSlotSettings: DeepPartial<CatalogSettings> | null;
  copiedBackground: CatalogPage['background'] | null;
  isDirty: boolean;
  // Baskı özellikleri + adet — web/sihirbazdan taşınır, canvasData ile round-trip eder (S6).
  printOptions: PrintOptionsValue;
  quantity: number;
}

interface CatalogActions {
  setHasHydrated: (state: boolean) => void;
  setProjectId: (id: string | null) => void;
  setIsDirty: (val: boolean) => void;
  // Template / forma
  setProjectName: (name: string) => void;
  setActiveTemplate: (templateId: string) => void;
  applyTemplate: (template: BrochureTemplate) => void;
  startFreshCatalog: (
    template: BrochureTemplate,
    printOptions?: PrintOptionsValue,
    quantity?: number,
  ) => void;
  // "Kaydetmeden Çık": oturumu temiz başlangıca döndür (projectId=null) ki tekrar açılışta
  // sunucudan yüklensin. Kalıcı localStorage temizliği koordinatörde yapılır (projectSerializer).
  discardSession: () => void;
  // Proje açılışında: yerleştirilmiş ürünlerin resimlerini SKU'ya göre güncel kütüphaneyle
  // yeniden bağla. map: normalize SKU → mutlak URL (yalnız resmi olan ürünler).
  // Dönüş: herhangi bir görsel gerçekten değiştiyse true (çağıran isterse dirty işaretler).
  reconcileProductImagesBySku: (skuToImage: Map<string, string>) => boolean;
  setPrintOptions: (options: PrintOptionsValue) => void;
  setQuantity: (quantity: number) => void;
  setActiveTab: (tab: 'outer' | 'inner') => void;
  setActiveFormaId: (id: number) => void;
  setFormas: (formas: StudioForma[]) => void;
  updateFormaName: (formaId: number, name: string) => void;
  getActivePages: () => CatalogPage[];
  setActivePages: (pages: CatalogPage[]) => void;

  // Settings
  setGlobalSettings: (settings: DeepPartial<CatalogSettings>) => void;
  updateGlobalSettings: (settings: Partial<CatalogSettings>) => void;

  // Page header/footer
  updatePageFooter: (
    pageNumber: number,
    data: Partial<{ footerText: string; footerLogo: string | null }>,
  ) => void;
  updatePageHeader: (
    pageNumber: number,
    data: Partial<{ logoUrl: string; title: string; date: string; no: string }>,
  ) => void;
  setPageFooterMode: (pageNumber: number, mode: 'global' | 'custom' | 'hidden') => void;
  // Footer per-sayfa fork (Evre 2a-ii). "custom" tek semantik kaynağı = footerOverride VARLIĞI.
  forkPageFooter: (pageNumber: number) => void;
  revertPageFooter: (pageNumber: number) => void;
  showPageFooter: (pageNumber: number) => void;
  setFooterHeight: (pageNumber: number, mm: number) => void;
  resetFooterToDefault: (scope: number | 'global') => void;
  copyBackground: (pageNumber: number) => void;
  pasteBackground: (pageNumber: number) => void;

  // Hazır şablon (preset)
  applyPreset: (preset: StudioPreset) => void;

  // Product pool
  setProductPool: (products: ProductInfo[]) => void;
  autoFillSlots: (skuImageMap?: Record<string, string>) => void;
  /** Saf doldurma — saveState çağırmaz; applyPreset + autoFillSlots ortak kullanır. */
  _fillSlotsFromPool: (skuImageMap?: Record<string, string>) => void;
  clearProducts: () => void;
  resetCatalog: () => void;
  swapSlotContents: (
    sPageNum: number,
    sIdx: number,
    tPageNum: number,
    tIdx: number,
  ) => void;

  // Slot ops
  mergeSelected: (
    pageNumber: number,
    targetSlotId: string,
  ) => { success: boolean; error?: string };
  unmergeSlot: (pageNumber: number, slotId: string) => void;
  toggleSlotCustomSettings: (enabled: boolean) => void;
  updateSlotCustomSettings: (settings: DeepPartial<CatalogSettings>) => void;
  copySlotSettings: () => void;
  pasteSlotSettings: () => void;
  clearSlotSettings: () => void;
  setSlotProduct: (pageNumber: number, slotId: string, product: ProductInfo) => void;
  updateSlotProduct: (
    pageNumber: number,
    slotId: string,
    updates: Partial<ProductInfo>,
  ) => void;
  updateSlotImageSettings: (
    pageNumber: number,
    slotId: string,
    settings: Partial<NonNullable<StudioSlot['imageSettings']>>,
  ) => void;
  updateSelectedSlotsImageSettings: (
    settings: Partial<NonNullable<StudioSlot['imageSettings']>>,
  ) => void;
  disableAllImageEditModes: () => void;

  // Page merging (spreads)
  mergePages: (pageIds: string[]) => void;
  unmergePages: (pageIds: string[]) => void;

  // Roles / modules
  toggleSlotRole: (role: 'product' | 'free') => void;
  setSlotModule: (
    pageNumber: number,
    slotId: string,
    moduleType: ModuleType,
  ) => void;
  updateSlotModuleData: (
    pageNumber: number,
    slotId: string,
    updates: Record<string, unknown> | null,
    history?: 'discrete' | 'none',
  ) => void;
  /** Kütüphane örneğini (studioModules) slota uygular: free→moduleData klonu, product→customSettings. */
  applyStudioModule: (pageNumber: number, slotId: string, moduleId: string) => void;
  /** Seçili banner hücrelerinde içeriği (text + image) temizler; yapı/boyut/stil korunur. Atomik (tek undo). */
  clearBannerCells: (slotId: string, cellIds: string[]) => void;
  /** Banner kolon/satır oransal (fr) boyutlarını yazar. Atomik (tek undo). Drag + panel ortak. */
  setBannerFractions: (slotId: string, axis: 'col' | 'row', fractions: number[]) => void;
  /** Banner ızgarasına sütun ekler (atCol konumuna). Merge-aware, fraction-senkron, atomik (tek undo). */
  insertBannerColumn: (slotId: string, atCol: number) => void;
  /** Banner ızgarasından sütun siler (cols>1). Merge-aware (küçült/dissolve), atomik. */
  deleteBannerColumn: (slotId: string, atCol: number) => void;
  /** Banner ızgarasına satır ekler (atRow konumuna). Merge-aware, fraction-senkron, atomik. */
  insertBannerRow: (slotId: string, atRow: number) => void;
  /** Banner ızgarasından satır siler (rows>1). Merge-aware (küçült/dissolve), atomik. */
  deleteBannerRow: (slotId: string, atRow: number) => void;
  /** Banner ızgara boyutunu hedef rows×cols'a getirir (tail insert/delete). Merge-aware, atomik. */
  setBannerGridSize: (slotId: string, rows: number, cols: number) => void;
  /** Seçili banner hücrelerini birleştirir (bounding-box anchor). Atomik (tek undo). */
  mergeBannerCells: (slotId: string, cellIds: string[]) => void;
  /** Birleştirilmiş banner hücresini ayırır (dissolve). Atomik (tek undo). */
  splitBannerCell: (slotId: string, anchorId: string) => void;

  // Grid management
  updateGridSettings: (scope: GridScope, settings: { rows: number; cols: number; gap?: number }) => void;
  revertToGlobalGrid: (pageNumber: number) => void;

  // Temp pool
  addToTempPool: (
    product: ProductInfo,
    originalPage?: number,
    originalSlotId?: string,
  ) => void;
  removeFromTempPool: (sku: string) => void;
  clearTempPool: () => void;
  clearSlotToPool: (pageNumber: number, slotId: string) => void;
  dumpPageToTempPool: (pageNumber: number) => void;
  returnProductFromTempPool: (sku: string) => void;

  updatePagesBackground: (
    pageNumbers: number[],
    background: NonNullable<CatalogPage['background']>,
  ) => void;

  applyBackgroundToAllFormas: (
    sourcePageNumbers: number[],
  ) => { formaId: number; success: boolean; reason?: string }[];

  applyBackgroundGlobally: (
    background: NonNullable<CatalogPage['background']>,
  ) => { formaId: number; success: boolean; reason?: string }[];

  // History bridge
  undo: () => void;
  redo: () => void;
}

type Store = CatalogState & CatalogActions;

// Banner yapısal mutasyon ortak sarmalı: sayfayı slot'tan çöz → saf motoru çağır → atomik yaz.
// Motor (gridMutate) saf; girdiyi mutate etmez. Fraction undefined ise updates'e KONMAZ →
// deepMerge eski modülün undefined'ını korur (fraction'sız modül regresyon yaşamaz).
function applyBannerMutation(
  get: () => Store,
  slotId: string,
  mutate: (g: GridState) => GridState,
): void {
  const { getActivePages, updateSlotModuleData, globalSettings } = get();
  // Footer-farkındalığı resolveModuleSlot'ta (footer-slot → globalSettings.footerModule, default-if-absent).
  const resolved = resolveModuleSlot(slotId, getActivePages(), globalSettings);
  if (!resolved) return;
  const md = resolved.moduleData as BannerModuleData | null;
  if (!md || md.type !== 'banner' || !Array.isArray(md.cells)) return;
  const next = mutate({
    cells: md.cells,
    rows: md.rows,
    cols: md.cols,
    colFractions: md.colFractions,
    rowFractions: md.rowFractions,
  });
  const updates: Record<string, unknown> = { cells: next.cells, rows: next.rows, cols: next.cols };
  if (next.colFractions !== undefined) updates.colFractions = next.colFractions;
  if (next.rowFractions !== undefined) updates.rowFractions = next.rowFractions;
  useHistoryStore.getState().withHistoryBatch(() => {
    updateSlotModuleData(resolved.pageNumber, slotId, updates, 'discrete');
  });
}

const generateAutoProjectName = (tmpl: BrochureTemplate) => {
  const paperTitle = (tmpl.paperSize || 'A4').trim().replace(/\s+/g, '_');
  const foldKey = tmpl.wizardSelection?.foldType || tmpl.foldType || 'none';
  const foldTitle = (foldNameMap[foldKey] || 'Kırım_Yok').trim().replace(/\s+/g, '_');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${paperTitle}_${foldTitle}_${randomNum}`;
};

export const useCatalogStore = create<Store>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      projectId: null,
      projectName: 'A4_Kırım_Yok_1001',
      activeTemplate: Template1,
      activeFormaId: 1,
      activeTab: 'outer',
      formas: buildFormasForTemplate(Template1),
      productPool: [],
      tempProductPool: [],
      globalSettings: clone(initialGlobalSettings),
      copiedSlotSettings: null,
      copiedBackground: null,
      isDirty: false,
      printOptions: { ...DEFAULT_OPTIONS },
      quantity: DEFAULT_QUANTITY,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setProjectId: (id) => set({ projectId: id }),
      setIsDirty: (val) => set({ isDirty: val }),

      // === Template / forma ===
      setProjectName: (name) => {
        set({ projectName: name, isDirty: true });
      },
      setPrintOptions: (options) => set({ printOptions: options, isDirty: true }),
      setQuantity: (quantity) =>
        set({ quantity: Math.max(1, Math.floor(quantity) || 1), isDirty: true }),
      setActiveTemplate: (templateId) => {
        const tmpl = availableTemplates.find((t) => t.id === templateId);
        if (!tmpl) return;
        get().applyTemplate(tmpl);
      },
      applyTemplate: (tmpl) => {
        const { formas: currentFormas } = get();

        // Mevcut arka plan ayarlarını sakla — forma id → pageNumber → background
        const savedBackgrounds = new Map<number, Map<number, CatalogPage['background']>>();
        currentFormas.forEach((f) => {
          const pageMap = new Map<number, CatalogPage['background']>();
          f.pages.forEach((p) => {
            if (p.background) pageMap.set(p.pageNumber, p.background);
          });
          if (pageMap.size > 0) savedBackgrounds.set(f.id, pageMap);
        });

        const newFormas = buildFormasForTemplate(tmpl);
        const recalculated = recalculateLayout(newFormas, initialGlobalSettings.defaultGrid);

        // Arka planları yeni formaslara aktar
        const formasWithBackgrounds = recalculated.map((f) => {
          const pageMap = savedBackgrounds.get(f.id);
          if (!pageMap) return f;
          return {
            ...f,
            pages: f.pages.map((p) => ({
              ...p,
              background: pageMap.get(p.pageNumber) ?? p.background,
            })),
          };
        });

        set({
          activeTemplate: tmpl,
          formas: formasWithBackgrounds,
          activeFormaId: 1,
          activeTab: 'outer',
          // globalSettings, productPool, tempProductPool'a DOKUNMA
        });
        useHistoryStore.getState().clearHistory();

        const firstSlot = formasWithBackgrounds.find((f) => f.id === 1)?.pages[0]?.slots[0];
        if (firstSlot) {
          useUIStore.getState().toggleSlotSelection(firstSlot.id, false);
        }
      },
      applyPreset: (preset) => {
        useHistoryStore.getState().saveState(); // TEK saveState → tek undo adımı
        const { formas, tempProductPool } = get();

        // 1) Mevcut yerleşimi kanonik (globalNumber) sırada çıkar — Excel POS DEĞİL
        const ordered = productSlotsInOrder(formas)
          .map((s) => s.product)
          .filter((p): p is ProductInfo => !!p);

        // 2) Stil: replace → varsayılan + şablon override'ları
        const newSettings = deepMerge(
          clone(initialGlobalSettings) as unknown as Record<string, unknown>,
          (preset.settings ?? {}) as unknown as Record<string, unknown>,
        ) as unknown as CatalogSettings;
        const grid = newSettings.defaultGrid ?? { rows: 4, cols: 4 };

        // 3) Slotları kur — productPool'a DOKUNMA.
        const next = clone(formas);
        if (preset.cover || preset.inner || preset.backCover) {
          // Yeni format: rol-bazlı arketip. Sayfalar pageNumber'a göre sıralı; ilk←cover,
          // son←backCover, ortadakiler←inner. Eksik arketip (örn. inner yok) → global-stil boş grid.
          const allPages = next
            .flatMap((f) => f.pages)
            .slice()
            .sort((a, b) => a.pageNumber - b.pageNumber);
          allPages.forEach((p, idx) => {
            const arch =
              idx === 0
                ? preset.cover
                : idx === allPages.length - 1
                  ? preset.backCover
                  : preset.inner;
            if (arch) {
              applyArchetype(p, arch);
            } else {
              p.gridSettings = undefined;
              p.slots = createPageSlots(p.pageNumber, grid.rows * grid.cols);
            }
          });
        } else {
          // Legacy format: tek defaultGrid + boş banner alanları + sayfa zeminleri.
          for (const f of next) {
            for (const p of f.pages) {
              p.gridSettings = undefined; // genel ızgaraya dön
              p.slots = createPageSlots(p.pageNumber, grid.rows * grid.cols);
            }
          }
          applyBannerAreas(next, preset.bannerAreas, grid.cols);
          applyPageBackgrounds(next, preset.pageBackgrounds);
        }

        // 4) Listeyi yeni ürün slotlarına SIRAYLA dağıt; artan → overflow
        const targets = productSlotsInOrder(next);
        for (let i = 0; i < targets.length && i < ordered.length; i++) {
          targets[i].product = ordered[i];
        }
        const overflow = ordered.slice(targets.length);

        set({
          globalSettings: newSettings,
          formas: recalculateLayout(next, grid),
          tempProductPool: appendOverflowToTempPool(tempProductPool, overflow),
          // productPool'a DOKUNULMADI (Excel master listesi)
        });
      },
      startFreshCatalog: (tmpl, printOptions, quantity) => {
        const formas = buildFormasForTemplate(tmpl);
        const recalculated = recalculateLayout(formas, initialGlobalSettings.defaultGrid);
        set({
          projectId: null,
          projectName: generateAutoProjectName(tmpl),
          activeTemplate: tmpl,
          formas: recalculated,
          activeFormaId: 1,
          activeTab: 'outer',
          globalSettings: clone(initialGlobalSettings),
          productPool: [],
          tempProductPool: [],
          copiedSlotSettings: null,
          copiedBackground: null,
          isDirty: false,
          printOptions: printOptions ?? { ...DEFAULT_OPTIONS },
          quantity: quantity ?? DEFAULT_QUANTITY,
        });
        useHistoryStore.getState().clearHistory();
        const firstSlot = recalculated.find((f) => f.id === 1)?.pages[0]?.slots[0];
        if (firstSlot) {
          useUIStore.getState().toggleSlotSelection(firstSlot.id, false);
        }
      },
      discardSession: () => {
        set({
          projectId: null,
          projectName: '',
          formas: [],
          activeFormaId: 1,
          activeTab: 'outer',
          productPool: [],
          tempProductPool: [],
          globalSettings: clone(initialGlobalSettings),
          copiedSlotSettings: null,
          copiedBackground: null,
          isDirty: false,
          printOptions: { ...DEFAULT_OPTIONS },
          quantity: DEFAULT_QUANTITY,
        });
        useHistoryStore.getState().clearHistory();
      },
      reconcileProductImagesBySku: (skuToImage) => {
        // Kütüphane URL'i (silinince temizlenecek) vs harici/Excel URL (korunacak) ayrımı.
        const isLibraryUrl = (u: unknown): u is string =>
          typeof u === 'string' && u.includes('/uploads/');
        let changed = false;
        // Tek ürün için resmi çöz: SKU'suz → dokunma; kütüphanede varsa güncelle; yoksa ve
        // mevcut resim kütüphane URL'iyse temizle ("Resim Yok"); harici ise koru.
        // Görsel gerçekten değiştiğinde changed=true (çağıran dirty kararına kullanır).
        const resolve = <T extends ProductInfo>(p: T): T => {
          const sku = typeof p.sku === 'string' ? p.sku.trim() : '';
          if (!sku) return p;
          const lib = skuToImage.get(normalizeSku(sku));
          if (lib) {
            if (p.image === lib) return p;
            changed = true;
            return { ...p, image: lib };
          }
          if (isLibraryUrl(p.image)) {
            changed = true;
            return { ...p, image: '' };
          }
          return p;
        };
        set((state) => ({
          formas: state.formas.map((f) => ({
            ...f,
            pages: f.pages.map((pg) => ({
              ...pg,
              slots: pg.slots.map((s) =>
                s.product ? { ...s, product: resolve(s.product) } : s,
              ),
            })),
          })),
          productPool: state.productPool.map(resolve),
          tempProductPool: state.tempProductPool.map(resolve),
        }));
        return changed;
      },
      setActiveTab: (tab) =>
        set({ activeTab: tab, activeFormaId: tab === 'inner' ? 2 : 1 }),
      setActiveFormaId: (id) =>
        set({ activeFormaId: id, activeTab: id === 2 ? 'inner' : 'outer' }),
      setFormas: (formas) => set({ formas }),
      updateFormaName: (formaId, name) => {
        useHistoryStore.getState().saveState();
        set((state) => ({
          formas: state.formas.map((f) => (f.id === formaId ? { ...f, name } : f)),
        }));
      },

      getActivePages: () => {
        const { formas, activeFormaId } = get();
        return formas.find((f) => f.id === activeFormaId)?.pages ?? [];
      },
      setActivePages: (pages) => {
        const { activeFormaId, formas } = get();
        set({
          formas: formas.map((f) => (f.id === activeFormaId ? { ...f, pages } : f)),
        });
      },

      // === Settings ===
      setGlobalSettings: (settings) => {
        useHistoryStore.getState().saveState();
        set((state) => ({
          globalSettings: deepMerge(
            state.globalSettings as unknown as Record<string, unknown>,
            settings as unknown as Record<string, unknown>,
          ) as unknown as CatalogSettings,
        }));
      },
      updateGlobalSettings: (settings) => {
        useHistoryStore.getState().saveState();
        set((state) => ({ globalSettings: { ...state.globalSettings, ...settings } }));
      },

      // === Page header/footer ===
      updatePageFooter: (pageNum, data) => {
        const { getActivePages, setActivePages } = get();
        setActivePages(
          getActivePages().map((p) => (p.pageNumber === pageNum ? { ...p, ...data } : p)),
        );
      },
      updatePageHeader: (pageNum, data) => {
        const { getActivePages, setActivePages } = get();
        setActivePages(
          getActivePages().map((p) =>
            p.pageNumber === pageNum
              ? {
                  ...p,
                  headerData: {
                    logoUrl: '',
                    title: 'SELBSTABHOLER - ANGEBOT',
                    date: '',
                    no: '41',
                    ...(p.headerData ?? {}),
                    ...data,
                  },
                }
              : p,
          ),
        );
      },
      setPageFooterMode: (pageNumber, mode) => {
        const { getActivePages, setActivePages } = get();
        setActivePages(
          getActivePages().map((p) =>
            p.pageNumber === pageNumber ? { ...p, footerMode: mode } : p,
          ),
        );
      },

      // ── Footer per-sayfa fork (Evre 2a-ii) ──────────────────────────────────────
      // Sözleşme: footerOverride VARLIĞI = "custom" tek semantik kaynağı; footerMode yalnız 'hidden'.
      // Hepsi withHistoryBatch + ilk iç saveState(true) (raw setActivePages history tetiklemez →
      // pre-state'i açıkça yakala → tek Ctrl+Z). Düzenleme funnel'ları (updateSlotModuleData/history/
      // resolver) override yaratılınca 2a-i route'undan OTOMATİK per-sayfa hedefe gider — yeni kablaj yok.
      forkPageFooter: (pageNumber) => {
        useHistoryStore.getState().withHistoryBatch(() => {
          useHistoryStore.getState().saveState(true);
          const { getActivePages, setActivePages, globalSettings } = get();
          setActivePages(
            getActivePages().map((p) =>
              p.pageNumber === pageNumber
                ? {
                    ...p,
                    footerMode: 'custom',
                    // clone = structuredClone (referans-izolasyon ŞART): override.module global
                    // footerModule ile hiçbir iç referans (cells/renk) paylaşmaz → çapraz mutasyon yok.
                    footerOverride: {
                      module: clone(resolveFooterModule(undefined, globalSettings)),
                      heightMm: globalSettings.footer.heightMm,
                    },
                  }
                : p,
            ),
          );
        });
      },
      revertPageFooter: (pageNumber) => {
        useHistoryStore.getState().withHistoryBatch(() => {
          useHistoryStore.getState().saveState(true);
          const { getActivePages, setActivePages } = get();
          // override SİL + mode='global' (tutarlı: override-yok ⟺ global). Discard; Ctrl+Z geri getirir.
          setActivePages(
            getActivePages().map((p) =>
              p.pageNumber === pageNumber
                ? { ...p, footerMode: 'global', footerOverride: undefined }
                : p,
            ),
          );
        });
      },
      showPageFooter: (pageNumber) => {
        useHistoryStore.getState().withHistoryBatch(() => {
          useHistoryStore.getState().saveState(true);
          const { getActivePages, setActivePages } = get();
          // mode override-VARLIĞINDAN türetilir (sabit 'global' değil) → "custom ama gizli" Göster'de
          // 'custom'a döner, override hayatta. (override-yok → 'global'.)
          setActivePages(
            getActivePages().map((p) =>
              p.pageNumber === pageNumber
                ? { ...p, footerMode: p.footerOverride ? 'custom' : 'global' }
                : p,
            ),
          );
        });
      },
      setFooterHeight: (pageNumber, mm) => {
        const clamped = Math.max(5, Math.min(60, mm));
        useHistoryStore.getState().withHistoryBatch(() => {
          useHistoryStore.getState().saveState(true);
          const { getActivePages, setActivePages } = get();
          const page = getActivePages().find((p) => p.pageNumber === pageNumber);
          if (footerWriteTarget(page) === 'page' && page?.footerOverride) {
            // Per-sayfa: yalnız o sayfanın override yüksekliği.
            setActivePages(
              getActivePages().map((p) =>
                p.pageNumber === pageNumber && p.footerOverride
                  ? { ...p, footerOverride: { ...p.footerOverride, heightMm: clamped } }
                  : p,
              ),
            );
          } else {
            // Global: gs.footer.heightMm (resolveFooterHeight global dalıyla tutarlı; tüm global sayfaları etkiler).
            set((state) => ({
              globalSettings: {
                ...state.globalSettings,
                footer: { ...state.globalSettings.footer, heightMm: clamped },
              },
            }));
          }
        });
      },
      // Footer'ı fabrika varsayılanına döndür (defaultFooterModule + initialGlobalSettings.footer).
      // scope='global' → global footerModule + height; scope=pageNumber → o sayfanın custom
      // override'ı default'a sıfırlanır, footerMode='custom' KALIR (revert/global'e dönüş DEĞİL).
      // Footer ailesi paterni: withHistoryBatch + ilk iç saveState(true) → tek Ctrl+Z.
      resetFooterToDefault: (scope) => {
        useHistoryStore.getState().withHistoryBatch(() => {
          useHistoryStore.getState().saveState(true);
          if (scope === 'global') {
            set((state) => ({
              globalSettings: {
                ...state.globalSettings,
                footerModule: defaultFooterModule(),
                footer: { ...state.globalSettings.footer, heightMm: initialGlobalSettings.footer.heightMm },
              },
            }));
          } else {
            const { getActivePages, setActivePages } = get();
            setActivePages(
              getActivePages().map((p) =>
                p.pageNumber === scope
                  ? {
                      ...p,
                      footerMode: 'custom',
                      footerOverride: {
                        module: defaultFooterModule(),
                        heightMm: initialGlobalSettings.footer.heightMm,
                      },
                    }
                  : p,
              ),
            );
          }
        });
      },

      // === Product pool ===
      setProductPool: (products) => set({ productPool: products }),

      autoFillSlots: (skuImageMap) => {
        useHistoryStore.getState().saveState();
        get()._fillSlotsFromPool(skuImageMap);
      },

      _fillSlotsFromPool: (skuImageMap) => {
        const { formas, productPool, globalSettings, tempProductPool } = get();

        // POS = ekrandaki slot numarası (globalNumber). YERLEŞTİRME SIRASINI YENİDEN KURMUYORUZ:
        // doğrudan globalNumber'a keylenir. Eski hata, sırayı ham dizi düzeniyle (formas→pages→slots)
        // yeniden kuruyordu; oysa globalNumber pageNumber'a göre sıralı atanır (recalculateLayout) →
        // imposition sıralı şablonlarda (ör. pages [5,6,1,...]) POS 1 en soldaki sayfaya düşüyordu.
        // Tek otorite: recalculateLayout'un globalNumber'ı. Önce tazele, sonra numaraya göre eşle.
        const next = recalculateLayout(clone(formas), globalSettings.defaultGrid);
        const byNumber = new Map<number, StudioSlot>();
        for (const f of next) {
          for (const p of f.pages) {
            for (const s of p.slots) {
              if (s.globalNumber != null) {
                s.product = null;
                byNumber.set(s.globalNumber, s);
              }
            }
          }
        }
        const slotCount = byNumber.size;

        const placedSkus = new Set<string>();
        const overflow: ProductInfo[] = []; // POS slot sayısını aşan → bekleme havuzu
        for (const product of productPool) {
          let posValue = 0;
          if (product.raw && typeof product.raw === 'object') {
            const raw = product.raw as Record<string, unknown>;
            const keys = Object.keys(raw);
            const posKey = keys.find((k) =>
              ['POS', 'SIRA', 'INDEX'].includes(k.trim().toUpperCase()),
            );
            if (posKey) {
              const m = String(raw[posKey]).match(/\d+/);
              posValue = m ? parseInt(m[0], 10) : 0;
            }
          }
          // Öncelik: Excel RESIM > DB birincil resim > boş. DB değerleri panelde
          // zaten toAbsoluteUrl ile mutlak. /images/products fallback'i kaldırıldı.
          const excelImage =
            product.image && product.image.trim() ? product.image.trim() : undefined;
          const dbImage = product.sku ? skuImageMap?.[product.sku] : undefined;
          const withImage = { ...product, image: excelImage ?? dbImage };

          if (posValue > 0 && posValue <= slotCount) {
            byNumber.get(posValue)!.product = withImage; // POS = globalNumber (ekrandaki slot no)
            if (product.sku) placedSkus.add(product.sku);
          } else if (posValue > slotCount) {
            // Tek-kaynak overflow kuralı: sığmayan ürün sessizce kaybolmaz.
            overflow.push(withImage);
          }
          // posValue === 0 (POS'suz) → mevcut davranış: yerleştirilmez, havuza eklenmez.
        }

        // Yerleştirilenleri havuzdan düş, overflow'u havuza ekle (tek set, saveState yok).
        const baseTemp = tempProductPool.filter((p) => !p.sku || !placedSkus.has(p.sku));
        set({
          formas: recalculateLayout(next, globalSettings.defaultGrid),
          tempProductPool: appendOverflowToTempPool(baseTemp, overflow),
        });
      },

      clearProducts: () => {
        const { getActivePages, setActivePages } = get();
        useHistoryStore.getState().saveState();
        const next = clone(getActivePages());
        next.forEach((p) => p.slots.forEach((s) => (s.product = null)));
        setActivePages(next);
      },

      resetCatalog: () => {
        const { getActivePages, activeTemplate } = get();
        useHistoryStore.getState().saveState();
        set({
          formas: recalculateLayout(
            buildFormasForTemplate(activeTemplate),
            initialGlobalSettings.defaultGrid,
          ),
          activeFormaId: 1,
          activeTab: 'outer',
          globalSettings: clone(initialGlobalSettings),
        });
        useHistoryStore.getState().clearHistory();
      },

      swapSlotContents: (sPageNum, sIdx, tPageNum, tIdx) => {
        const { getActivePages, globalSettings, activeFormaId, formas } = get();
        useHistoryStore.getState().saveState();

        const pages = clone(getActivePages());
        const sPage = pages.find((p) => p.pageNumber === sPageNum);
        const tPage = pages.find((p) => p.pageNumber === tPageNum);
        if (!sPage || !tPage) return;
        const src = sPage.slots[sIdx];
        const tgt = tPage.slots[tIdx];
        [src.product, tgt.product] = [tgt.product, src.product];
        [src.imageSettings, tgt.imageSettings] = [tgt.imageSettings, src.imageSettings];

        const newFormas = formas.map((f) => (f.id === activeFormaId ? { ...f, pages } : f));
        set({ formas: recalculateLayout(newFormas, globalSettings.defaultGrid) });
      },

      // === Slot merge / unmerge ===
      mergeSelected: (pageNumber, targetSlotId) => {
        const { getActivePages, tempProductPool, globalSettings, activeFormaId, formas } = get();
        const { selectedSlotIds, clearSelection } = useUIStore.getState();
        useHistoryStore.getState().saveState();

        const pages = getActivePages();
        const pageIdx = pages.findIndex((p) => p.pageNumber === pageNumber);
        if (pageIdx < 0) return { success: false, error: 'Sayfa bulunamadi.' };
        const page = pages[pageIdx];
        const targetSlot = page.slots.find((s) => s.id === targetSlotId);
        const targetProduct = targetSlot?.product ?? null;

        const grid = page.gridSettings ?? globalSettings.defaultGrid;
        const maxCols = grid.cols;
        const occupancy: (string | null)[][] = [];
        const coords: Record<string, { r: number; c: number; w: number; h: number }> = {};
        let r = 0;
        let c = 0;

        for (const slot of page.slots.filter((s) => !s.hidden)) {
          let placed = false;
          while (!placed) {
            if (!occupancy[r]) occupancy[r] = Array(maxCols).fill(null);
            if (occupancy[r][c] === null) {
              let canFit = c + slot.colSpan <= maxCols;
              if (canFit) {
                outer: for (let ir = 0; ir < slot.rowSpan; ir++) {
                  if (!occupancy[r + ir]) occupancy[r + ir] = Array(maxCols).fill(null);
                  for (let ic = 0; ic < slot.colSpan; ic++) {
                    if (occupancy[r + ir][c + ic] !== null) {
                      canFit = false;
                      break outer;
                    }
                  }
                }
              }
              if (canFit) {
                for (let ir = 0; ir < slot.rowSpan; ir++) {
                  for (let ic = 0; ic < slot.colSpan; ic++) {
                    occupancy[r + ir][c + ic] = slot.id;
                  }
                }
                coords[slot.id] = { r, c, w: slot.colSpan, h: slot.rowSpan };
                placed = true;
              }
            }
            if (!placed) {
              c++;
              if (c >= maxCols) {
                c = 0;
                r++;
              }
            }
          }
        }

        let minR = Infinity;
        let maxR = -Infinity;
        let minC = Infinity;
        let maxC = -Infinity;
        let totalArea = 0;
        for (const id of selectedSlotIds) {
          const ci = coords[id];
          if (!ci) continue;
          minR = Math.min(minR, ci.r);
          maxR = Math.max(maxR, ci.r + ci.h - 1);
          minC = Math.min(minC, ci.c);
          maxC = Math.max(maxC, ci.c + ci.w - 1);
          totalArea += ci.w * ci.h;
        }
        const expected = (maxR - minR + 1) * (maxC - minC + 1);
        if (totalArea !== expected)
          return { success: false, error: 'Yalnizca dikdortgen formunda birlestirme yapabilirsiniz.' };

        const survivorId = occupancy[minR][minC];
        if (!survivorId || !selectedSlotIds.includes(survivorId))
          return { success: false, error: 'Hucre yerlesimi hesaplanamadi.' };

        const newSlots = [...page.slots];
        const productsToPool: { product: ProductInfo; slotId: string }[] = [];
        for (const id of selectedSlotIds) {
          const idx = newSlots.findIndex((s) => s.id === id);
          if (idx === -1 || !newSlots[idx].product) continue;
          if (!targetProduct || newSlots[idx].product?.sku !== targetProduct.sku) {
            productsToPool.push({ product: newSlots[idx].product!, slotId: id });
          }
        }

        // Survivor (geometrik sol-üst) ANCHOR'ın TÜM içeriğini benimser; geometri survivor'ın kalır.
        // Yalnız product taşımak modül+ürün'de boş hücreye yol açıyordu — role/moduleType/moduleData/
        // isCustom/customSettings de aktarılır. imageSettings ürüne özgü (Slot.tsx ürün <img> transform'u):
        // ürün varsa kadrajı birlikte gelir, modülde anlamsız → product guard'lı (modüle ölü alan taşımaz).
        const a = targetSlot;
        const survivorIdx = newSlots.findIndex((s) => s.id === survivorId);
        newSlots[survivorIdx] = {
          ...newSlots[survivorIdx],
          colSpan: maxC - minC + 1,
          rowSpan: maxR - minR + 1,
          role: a?.role ?? 'product',
          product: a?.product ?? null,
          moduleType: a?.moduleType ?? null,
          moduleData: a?.moduleData ?? null,
          isCustom: a?.isCustom ?? false,
          customSettings: a?.customSettings,
          imageSettings: a?.product ? a?.imageSettings : undefined,
        };
        // Non-survivor'lar TEMİZ boş ürün hücresine sıfırlanır: ürün havuza gitti (yukarıda), modül
        // sessizce DÜŞÜRÜLÜR (kural: ürün asla yok edilmez, modül edilebilir). moduleType/moduleData da
        // temizlenir — applyUnmerge yalnız hidden/mergedInto/product sıfırlar; aksi halde ayırınca modül DİRİLİR.
        for (const id of selectedSlotIds) {
          if (id === survivorId) continue;
          const idx = newSlots.findIndex((s) => s.id === id);
          newSlots[idx] = {
            ...newSlots[idx],
            hidden: true,
            mergedInto: survivorId,
            role: 'product',
            product: null,
            moduleType: null,
            moduleData: null,
            isCustom: false,
            customSettings: undefined,
            imageSettings: undefined,
          };
        }

        const newPages = [...pages];
        newPages[pageIdx] = { ...page, slots: newSlots };
        const newFormas = formas.map((f) =>
          f.id === activeFormaId ? { ...f, pages: newPages } : f,
        );

        // Kaybedilen ürünleri (anchor-SKU hariç) havuza yakala — saf helper'ı fold'la (tek-kaynak,
        // çoklu ürün). Modüller product:null olduğu için productsToPool'a hiç girmez → havuza gitmez.
        let newTemp = [...tempProductPool];
        for (const item of productsToPool) {
          newTemp = captureProductToPool(newTemp, item.product, pageNumber, item.slotId);
        }

        set({
          formas: recalculateLayout(newFormas, globalSettings.defaultGrid),
          tempProductPool: newTemp,
        });
        clearSelection();
        return { success: true };
      },

      unmergeSlot: (pageNumber, slotId) => {
        const { getActivePages, globalSettings, activeFormaId, formas } = get();
        useHistoryStore.getState().saveState();

        const pages = getActivePages();
        const pageIdx = pages.findIndex((p) => p.pageNumber === pageNumber);
        if (pageIdx < 0) return;
        const page = pages[pageIdx];
        // Anchor-içerik kuralı TEK-KAYNAK: reconcileGrid ile aynı helper.
        const newSlots = [...page.slots];
        applyUnmerge(newSlots, slotId);
        const newPages = [...pages];
        newPages[pageIdx] = { ...page, slots: newSlots };
        const newFormas = formas.map((f) =>
          f.id === activeFormaId ? { ...f, pages: newPages } : f,
        );
        set({ formas: recalculateLayout(newFormas, globalSettings.defaultGrid) });
        useUIStore.getState().clearSelection();
      },

      // === Custom slot settings ===
      toggleSlotCustomSettings: (enabled) => {
        const { getActivePages, setActivePages, globalSettings } = get();
        const { selectedSlotIds } = useUIStore.getState();
        useHistoryStore.getState().saveState();
        const pages = clone(getActivePages());
        for (const id of selectedSlotIds) {
          for (const p of pages) {
            for (const s of p.slots) {
              if (s.id === id) {
                // Global→Özel geçişinde slotun MEVCUT görünümünü (= global) customSettings'e tohumla
                // ki görsel hiç değişmesin. Bayat/eski customSettings'i de ez (yoksa eski değerler
                // global'i ezip "varsayılana dönme" yaşatıyordu). Zaten özel olanı yeniden tohumlama.
                if (enabled && !s.isCustom) {
                  s.customSettings = clone(globalSettings) as DeepPartial<CatalogSettings>;
                }
                s.isCustom = enabled;
              }
            }
          }
        }
        setActivePages(pages);
      },
      updateSlotCustomSettings: (settings) => {
        const { getActivePages, setActivePages } = get();
        const { selectedSlotIds } = useUIStore.getState();
        useHistoryStore.getState().saveState();
        const pages = clone(getActivePages());
        for (const id of selectedSlotIds) {
          for (const p of pages) {
            for (const s of p.slots) {
              if (s.id === id && s.isCustom) {
                s.customSettings = deepMerge(
                  (s.customSettings ?? {}) as Record<string, unknown>,
                  settings as unknown as Record<string, unknown>,
                ) as DeepPartial<CatalogSettings>;
              }
            }
          }
        }
        setActivePages(pages);
      },
      copySlotSettings: () => {
        const { getActivePages, globalSettings } = get();
        const { selectedSlotIds } = useUIStore.getState();
        if (selectedSlotIds.length !== 1) return;
        let toCopy: DeepPartial<CatalogSettings> | null = null;
        for (const p of getActivePages()) {
          for (const s of p.slots) {
            if (s.id === selectedSlotIds[0]) {
              toCopy = (s.isCustom && s.customSettings ? s.customSettings : globalSettings) as DeepPartial<CatalogSettings>;
            }
          }
        }
        set({ copiedSlotSettings: toCopy ? clone(toCopy) : null });
      },
      copyBackground: (pageNumber) => {
        const { getActivePages } = get();
        const page = getActivePages().find((p) => p.pageNumber === pageNumber);
        if (page?.background) {
          set({ copiedBackground: clone(page.background) });
        }
      },
      pasteBackground: (pageNumber) => {
        const { copiedBackground } = get();
        if (copiedBackground) {
          useHistoryStore.getState().saveState();
          get().updatePagesBackground([pageNumber], copiedBackground);
        }
      },
      pasteSlotSettings: () => {
        const { getActivePages, setActivePages, copiedSlotSettings } = get();
        const { selectedSlotIds } = useUIStore.getState();
        if (!copiedSlotSettings || selectedSlotIds.length === 0) return;
        useHistoryStore.getState().saveState();
        const pages = clone(getActivePages());
        for (const id of selectedSlotIds) {
          for (const p of pages) {
            for (const s of p.slots) {
              if (s.id !== id) continue;
              s.isCustom = true;
              const copied = clone(copiedSlotSettings) as DeepPartial<CatalogSettings> & {
                imageEditMode?: boolean;
                badge?: { isFreePosition?: boolean };
              };
              copied.imageEditMode = false;
              if (copied.badge) copied.badge.isFreePosition = false;
              s.customSettings = copied;
            }
          }
        }
        setActivePages(pages);
      },
      clearSlotSettings: () => {
        const { getActivePages, setActivePages } = get();
        const { selectedSlotIds } = useUIStore.getState();
        if (selectedSlotIds.length === 0) return;
        useHistoryStore.getState().saveState();
        const pages = clone(getActivePages());
        for (const id of selectedSlotIds) {
          for (const p of pages) {
            for (const s of p.slots) {
              if (s.id === id) {
                s.isCustom = false;
                s.customSettings = undefined;
              }
            }
          }
        }
        setActivePages(pages);
      },

      // === Slot product ops ===
      setSlotProduct: (pageNumber, slotId, product) => {
        const { getActivePages, setActivePages } = get();
        useHistoryStore.getState().saveState();
        const pages = clone(getActivePages());
        const page = pages.find((p) => p.pageNumber === pageNumber);
        if (page) {
          const slot = page.slots.find((s) => s.id === slotId);
          if (slot) slot.product = product;
        }
        setActivePages(pages);
        if (product?.sku) get().removeFromTempPool(product.sku);
      },
      updateSlotProduct: (pageNumber, slotId, updates) => {
        const { getActivePages, setActivePages } = get();
        useHistoryStore.getState().saveState();
        const pages = clone(getActivePages());
        const page = pages.find((p) => p.pageNumber === pageNumber);
        if (page) {
          const slot = page.slots.find((s) => s.id === slotId);
          if (slot?.product) slot.product = { ...slot.product, ...updates };
        }
        setActivePages(pages);
      },
      updateSlotImageSettings: (pageNumber, slotId, settings) => {
        const { getActivePages, setActivePages } = get();
        useHistoryStore.getState().saveState();
        setActivePages(
          getActivePages().map((p) =>
            p.pageNumber === pageNumber
              ? {
                  ...p,
                  slots: p.slots.map((s) =>
                    s.id === slotId
                      ? { ...s, imageSettings: { ...(s.imageSettings ?? {}), ...settings } }
                      : s,
                  ),
                }
              : p,
          ),
        );
      },
      updateSelectedSlotsImageSettings: (settings) => {
        const { getActivePages, setActivePages } = get();
        const { selectedSlotIds } = useUIStore.getState();
        if (selectedSlotIds.length === 0) return;
        useHistoryStore.getState().saveState();
        setActivePages(
          getActivePages().map((p) => ({
            ...p,
            slots: p.slots.map((s) =>
              selectedSlotIds.includes(s.id)
                ? { ...s, imageSettings: { ...(s.imageSettings ?? {}), ...settings } }
                : s,
            ),
          })),
        );
      },
      disableAllImageEditModes: () => {
        const { getActivePages, setActivePages } = get();
        setActivePages(
          getActivePages().map((p) => ({
            ...p,
            slots: p.slots.map((s) =>
              s.imageSettings?.editMode
                ? { ...s, imageSettings: { ...s.imageSettings, editMode: false } }
                : s,
            ),
          })),
        );
      },

      // === Page merging ===
      mergePages: (pageIds) =>
        set((state) => {
          if (pageIds.length < 2) return state;
          return {
            formas: state.formas.map((forma) => {
              const has = pageIds.some((id) => forma.pages.some((p) => p.id === id));
              if (!has) return forma;
              const groups = forma.pageMergeGroups.length
                ? forma.pageMergeGroups
                : forma.pages.map((p) => [p.id]);
              const remaining = groups.filter(
                (g) => !g.some((id) => pageIds.includes(id)),
              );
              return { ...forma, pageMergeGroups: [...remaining, pageIds] };
            }),
          };
        }),
      unmergePages: (pageIds) =>
        set((state) => ({
          formas: state.formas.map((forma) => {
            const has = pageIds.some((id) => forma.pages.some((p) => p.id === id));
            if (!has) return forma;
            const groups = forma.pageMergeGroups.length
              ? forma.pageMergeGroups
              : forma.pages.map((p) => [p.id]);
            const next: string[][] = [];
            for (const g of groups) {
              if (g.some((id) => pageIds.includes(id))) g.forEach((id) => next.push([id]));
              else next.push(g);
            }
            return { ...forma, pageMergeGroups: next };
          }),
        })),

      // === Roles / modules ===
      toggleSlotRole: (role) => {
        const { getActivePages, globalSettings, activeFormaId, formas } = get();
        const { selectedSlotIds } = useUIStore.getState();
        if (selectedSlotIds.length === 0) return;
        useHistoryStore.getState().saveState();

        const pages = clone(getActivePages());
        for (const id of selectedSlotIds) {
          for (const p of pages) {
            for (const s of p.slots) {
              if (s.id !== id) continue;
              s.role = role;
              if (role === 'free') {
                s.product = null;
                s.isCustom = true;
                s.customSettings = buildFreeCellSettings(globalSettings);
              } else {
                s.moduleData = null;
                s.moduleType = null;
                s.isCustom = false;
                s.customSettings = undefined;
                s.imageSettings = {
                  editMode: initialGlobalSettings.imageEditMode,
                  scale: initialGlobalSettings.imageScale,
                  posX: initialGlobalSettings.imagePosX,
                  posY: initialGlobalSettings.imagePosY,
                };
              }
            }
          }
        }
        const newFormas = formas.map((f) => (f.id === activeFormaId ? { ...f, pages } : f));
        set({ formas: recalculateLayout(newFormas, globalSettings.defaultGrid) });
      },
      setSlotModule: (pageNumber, slotId, moduleType) => {
        const { getActivePages, globalSettings, activeFormaId, formas } = get();
        // clone'dan ÖNCE hedef slotu oku; yoksa saveState'siz erken çık (gereksiz snapshot olmasın).
        const target = getActivePages()
          .find((p) => p.pageNumber === pageNumber)
          ?.slots.find((s) => s.id === slotId);
        if (!target) return;

        useHistoryStore.getState().saveState(true); // ayrık işlem — cooldown'a takılma, saati ilerletme
        const pages = clone(getActivePages());
        const slot = pages
          .find((p) => p.pageNumber === pageNumber)
          ?.slots.find((s) => s.id === slotId);
        if (!slot) return;

        // Rol dönüşümü drop'un GERÇEK slot.id'si üstünde yapılır (selectedSlotIds DEĞİL) — Bug 2.
        // toggleSlotRole('free') ile birebir aynı görünüm (buildFreeCellSettings tek-kaynak).
        // A-fix: ürünü null'dan ÖNCE havuza at (clearSlotToPool mantığı — ikinci kopya yazma).
        let movedProduct: ProductInfo | null = null;
        if (slot.role !== 'free') {
          if (slot.product) movedProduct = slot.product;
          slot.role = 'free';
          slot.product = null;
          slot.isCustom = true;
          slot.customSettings = buildFreeCellSettings(globalSettings);
        }
        slot.moduleType = moduleType;
        slot.moduleData =
          moduleType && ModuleRegistry[moduleType]
            ? ModuleRegistry[moduleType].initialData()
            : null;

        // recalculateLayout ile bitir — ürün→free dönüşümünde globalNumber renumber korunur
        // (toggleSlotRole'ün eski davranışı; setActivePages recalc yapmazdı).
        const newFormas = formas.map((f) => (f.id === activeFormaId ? { ...f, pages } : f));
        if (movedProduct) {
          // Havuz güncellemesini formas ile aynı set() içinde atomik yaz — tek undo kapsar ikisini.
          set({
            formas: recalculateLayout(newFormas, globalSettings.defaultGrid),
            tempProductPool: captureProductToPool(get().tempProductPool, movedProduct, pageNumber, slotId),
          });
        } else {
          set({ formas: recalculateLayout(newFormas, globalSettings.defaultGrid) });
        }
      },
      updateSlotModuleData: (pageNumber, slotId, updates, history = 'none') => {
        const { getActivePages, setActivePages } = get();
        // §6 TEK yönlendirme noktası. Tüm modül-data yazıcıları buradan geçer.
        // İzolasyon penceresi (bu slot için aktif oturum): global history'ye DOKUNMA (I1);
        // bunun yerine PRE-edit moduleData'yı yerel yığına it (coalesce'lı). enterIsolation
        // editingContent(banner) ile isoSession'ı ATOMİK kurduğu için bu kapı eşdeğer.
        // İzolasyon dışında davranış bugünküyle BİREBİR aynı: 'discrete' → forced snapshot,
        // 'none' → snapshot yok.
        const hist = useHistoryStore.getState();
        if (hist.isoSession && hist.isoSession.slotId === slotId) {
          hist.pushIsolationSnapshot();
        } else if (history === 'discrete') {
          hist.saveState(true);
        }
        // History tetikleme yukarıda BİREBİR aynı (izolasyon/discrete). Yalnız YAZIM HEDEFİ değişir:
        // footer-slot → globalSettings.footerModule (deepMerge); değilse page.slots. Footer bilgisi
        // mergeFooterModule'de (deepMerge enjekte — defaults↔footerSlot cycle'ı önler).
        if (isFooterSlotId(slotId)) {
          if (updates && typeof updates === 'object') {
            const u = updates as Record<string, unknown>;
            // Yazım hedefi override-varlığından (footerWriteTarget). 2a-i: daima 'global' → eski yol birebir.
            const page = getActivePages().find((p) => p.pageNumber === pageNumber);
            if (footerWriteTarget(page) === 'page' && page) {
              // PER-SAYFA override hedefi (2a-ii fork'u seed'ler). 2a-i'de DORMANT.
              setActivePages(
                getActivePages().map((p) =>
                  p.pageNumber === pageNumber ? mergePageFooterModule(p, u, deepMerge) : p,
                ),
              );
            } else {
              set((state) => ({
                globalSettings: mergeFooterModule(state.globalSettings, u, deepMerge),
              }));
            }
          }
          return;
        }
        setActivePages(
          getActivePages().map((p) =>
            p.pageNumber === pageNumber
              ? {
                  ...p,
                  slots: p.slots.map((s) => {
                    if (s.id !== slotId) return s;
                    if (updates === null) return { ...s, moduleData: null };
                    if (typeof updates !== 'object') return { ...s, moduleData: updates };
                    const current = (s.moduleData as Record<string, unknown>) ?? {};
                    return {
                      ...s,
                      moduleData: deepMerge(
                        current,
                        updates as Record<string, unknown>,
                      ),
                    };
                  }),
                }
              : p,
          ),
        );
      },
      clearBannerCells: (slotId, cellIds) => {
        if (cellIds.length === 0) return;
        const { getActivePages, updateSlotModuleData, globalSettings } = get();
        // Footer-farkındalığı resolveModuleSlot'ta (footer-slot dahil; çağıran pageNumber bilmez).
        const resolved = resolveModuleSlot(slotId, getActivePages(), globalSettings);
        if (!resolved) return;
        const cells = (resolved.moduleData as { cells?: Record<string, unknown>[] } | null)?.cells;
        if (!Array.isArray(cells)) return;

        const idSet = new Set(cellIds);
        // Boş undo adımı oluşturma: seçili hücrelerden en az birinde gerçek içerik varsa çalış.
        const willChange = cells.some(
          (c) => idSet.has(c.id as string) && ((c.text as string) !== '' || c.image != null),
        );
        if (!willChange) return;

        // İÇERİK temizle: yalnız içerik alanları. Yapı (colSpan/rowSpan/hidden/mergedInto)
        // ve stil (font/padding/bgColor/border) patch'te YOK → değişmezlik yapısal garanti.
        const nextCells = cells.map((c) =>
          idSet.has(c.id as string)
            ? {
                ...c,
                text: '',
                image: null,
                imageMode: 'contain',
                imagePosX: 0,
                imagePosY: 0,
                imageScale: 100,
              }
            : c,
        );

        // Atomik: tek snapshot → tek Ctrl+Z. İzolasyonda pushIsolationSnapshot 800ms
        // coalesce'lı (metin edit'inden hemen sonraki Del bastırılırdı); withHistoryBatch
        // ilk snapshot'ı forced çeker. İzolasyon dışında 'discrete' zaten forced saveState.
        useHistoryStore.getState().withHistoryBatch(() => {
          updateSlotModuleData(resolved.pageNumber, slotId, { cells: nextCells }, 'discrete');
        });
      },
      setBannerFractions: (slotId, axis, fractions) => {
        const { getActivePages, updateSlotModuleData, globalSettings } = get();
        const resolved = resolveModuleSlot(slotId, getActivePages(), globalSettings);
        if (!resolved) return;
        const key = axis === 'col' ? 'colFractions' : 'rowFractions';
        // Atomik: tek snapshot → tek Ctrl+Z (izolasyonda coalesce'ı withHistoryBatch forces;
        // dışında 'discrete' zaten forced). Drag mouseup ve panel sayısal aynı kapıdan geçer.
        useHistoryStore.getState().withHistoryBatch(() => {
          updateSlotModuleData(resolved.pageNumber, slotId, { [key]: fractions }, 'discrete');
        });
      },
      // Banner yapısal mutasyonlar — hepsi saf motoru (gridMutate) çağıran ince sarmal.
      // applyBannerMutation: sayfa çöz → motor → withHistoryBatch + updateSlotModuleData('discrete').
      insertBannerColumn: (slotId, atCol) =>
        applyBannerMutation(get, slotId, (g) => gridInsertColumn(g, atCol)),
      deleteBannerColumn: (slotId, atCol) =>
        applyBannerMutation(get, slotId, (g) => gridDeleteColumn(g, atCol)),
      insertBannerRow: (slotId, atRow) =>
        applyBannerMutation(get, slotId, (g) => gridInsertRow(g, atRow)),
      deleteBannerRow: (slotId, atRow) =>
        applyBannerMutation(get, slotId, (g) => gridDeleteRow(g, atRow)),
      setBannerGridSize: (slotId, rows, cols) =>
        applyBannerMutation(get, slotId, (g) => gridResizeTo(g, rows, cols)),
      mergeBannerCells: (slotId, cellIds) =>
        applyBannerMutation(get, slotId, (g) => gridMergeCells(g, cellIds)),
      splitBannerCell: (slotId, anchorId) =>
        applyBannerMutation(get, slotId, (g) => gridSplitCell(g, anchorId)),
      applyStudioModule: (pageNumber, slotId, moduleId) => {
        const { getActivePages, setActivePages } = get();
        const module = listStudioModules().find((m) => m.id === moduleId);
        if (!module) return;
        // Slot var mı? (clone'dan ÖNCE okuyup erken çık — gereksiz saveState olmasın)
        const target = getActivePages()
          .find((p) => p.pageNumber === pageNumber)
          ?.slots.find((s) => s.id === slotId);
        if (!target) return;
        // Runtime guard (saveState'ten ÖNCE): bozuk/eksik örneği reddet. Discriminated
        // union zaten daraltıyor; bu, elle eklenen geçersiz JSON'a karşı ikinci ağ.
        if (module.slotRole === 'product' && !module.customSettings) return;
        if (module.slotRole === 'free' && !module.moduleData) return;

        useHistoryStore.getState().saveState(true); // ayrık işlem — cooldown'a takılma, saati ilerletme
        const pages = clone(getActivePages());
        const slot = pages
          .find((p) => p.pageNumber === pageNumber)
          ?.slots.find((s) => s.id === slotId);
        if (!slot) return;

        if (module.slotRole === 'free') {
          // Dolu slota drop: içerik KOŞULSUZ ezilir (bilinçli karar; Ctrl+Z kurtarır).
          slot.role = 'free';
          slot.product = null; // free slot ürün taşımaz
          slot.moduleType = module.type;
          slot.moduleData = clone(module.moduleData); // dolu içerik klonlanır (referans paylaşımı yok)
        } else {
          // Ürün-sunuş: ÜRÜN BAĞLI KALIR (role/product değişmez), yalnız özel stil eklenir.
          slot.isCustom = true;
          slot.customSettings = clone(module.customSettings);
        }
        setActivePages(pages);
      },

      // === Grid management ===
      updateGridSettings: (scope, settings) => {
        const rows = Math.max(1, Math.min(10, settings.rows));
        const cols = Math.max(1, Math.min(10, settings.cols));
        // Gap artık grid ayarına KOPYALANMIYOR — tek kanonik gridGap (globalSettings.gridGap).
        // Özel sayfa da gridGap'i kullanır; page.gridSettings yalnız {rows, cols} taşır.
        // (Eski bug: gap defaultGrid'den page.gridSettings'e kopyalanınca özel sayfa
        // global slider'ı dinlemiyordu — kopukluk burada çözülür.)
        const next = { rows, cols };

        // Tek atomik grid-değiştirme yolu: merkezi reconcileGrid çekirdeği. Sığmayan
        // ürünler tek-kaynak overflow kuralıyla bekleme havuzuna, modül/birleşik
        // slotlar unmerge ile çözülür (içerik kaybolmaz). Anlık + tek undo adımı.
        useHistoryStore.getState().saveState();
        const formas = clone(get().formas);
        const overflow: ProductInfo[] = [];

        if (scope === 'global') {
          // Global default grid degisti — explicit gridSettings'i olmayan tum
          // sayfalari hedefe uyumla.
          for (const f of formas) {
            for (const p of f.pages) {
              if (p.gridSettings) continue;
              const res = reconcileGrid(p.slots, { rows, cols }, p.pageNumber);
              p.slots = res.slots;
              overflow.push(...res.overflowProducts);
            }
          }
          set((state) => ({
            globalSettings: { ...state.globalSettings, defaultGrid: next },
            formas: recalculateLayout(formas, next),
            tempProductPool: appendOverflowToTempPool(state.tempProductPool, overflow),
          }));
          return;
        }

        const page = formas.flatMap((f) => f.pages).find((p) => p.pageNumber === scope);
        if (!page) return;
        page.gridSettings = next;
        const res = reconcileGrid(page.slots, { rows, cols }, page.pageNumber);
        page.slots = res.slots;
        overflow.push(...res.overflowProducts);
        const defaultGrid = get().globalSettings.defaultGrid ?? { rows: 4, cols: 4 };
        set((state) => ({
          formas: recalculateLayout(formas, defaultGrid),
          tempProductPool: appendOverflowToTempPool(state.tempProductPool, overflow),
        }));
      },
      // Özel sayfayı genel ızgaraya döndür: gridSettings'i kaldır + global gride
      // reconcile et (yıkıcı reset/setTimeout hack'i YOK — tek atomik çekirdek).
      revertToGlobalGrid: (pageNumber) => {
        useHistoryStore.getState().saveState();
        const formas = clone(get().formas);
        const page = formas.flatMap((f) => f.pages).find((p) => p.pageNumber === pageNumber);
        if (!page) return;
        const globalGrid = get().globalSettings.defaultGrid ?? { rows: 4, cols: 4 };
        page.gridSettings = undefined;
        const res = reconcileGrid(
          page.slots,
          { rows: globalGrid.rows, cols: globalGrid.cols },
          page.pageNumber,
        );
        page.slots = res.slots;
        set((state) => ({
          formas: recalculateLayout(formas, globalGrid),
          tempProductPool: appendOverflowToTempPool(state.tempProductPool, res.overflowProducts),
        }));
      },

      // === Temp pool ===
      addToTempPool: (product, originalPage, originalSlotId) => {
        useHistoryStore
          .getState()
          .saveState();
        if (!product?.sku) return;
        set((state) => {
          const filtered = state.tempProductPool.filter((p) => p.sku !== product.sku);
          return {
            tempProductPool: [
              { ...product, originalPage, originalSlotId },
              ...filtered,
            ],
          };
        });
      },
      removeFromTempPool: (sku) => {
        useHistoryStore
          .getState()
          .saveState();
        set((state) => ({
          tempProductPool: state.tempProductPool.filter((p) => p.sku !== sku),
        }));
      },
      clearTempPool: () => {
        useHistoryStore
          .getState()
          .saveState();
        set({ tempProductPool: [] });
      },
      // Hücreyi boşalt → ürün YOK EDİLMEZ, tempProductPool'a gider (slot ürün hücresi olarak kalır).
      // TEK "Hücreyi Boşalt" action'ı: eski clearSlot (yok ederdi) + moveSlotToTempPool ikilisi burada
      // birleşti (sağ tık, ContextualBar, sağ panel, sürükle-bırak hepsi bunu çağırır; etiket her yerde aynı).
      clearSlotToPool: (pageNumber, slotId) => {
        const { getActivePages, setActivePages, tempProductPool } = get();
        useHistoryStore.getState().saveState();
        const pages = clone(getActivePages());
        const page = pages.find((p) => p.pageNumber === pageNumber);
        let moved: ProductInfo | null = null;
        if (page) {
          const slot = page.slots.find((s) => s.id === slotId);
          if (slot?.product) {
            moved = slot.product;
            slot.product = null;
          }
        }
        if (moved) {
          set({ tempProductPool: captureProductToPool(tempProductPool, moved, pageNumber, slotId) });
        }
        setActivePages(pages);
      },
      dumpPageToTempPool: (pageNumber) => {
        const { getActivePages, setActivePages, tempProductPool } = get();
        useHistoryStore.getState().saveState();
        const pages = clone(getActivePages());
        const page = pages.find((p) => p.pageNumber === pageNumber);
        if (!page) return;
        const newPool = [...tempProductPool];
        for (const slot of page.slots) {
          if (slot.role === 'product' && slot.product) {
            const product = slot.product;
            slot.product = null;
            const idx = newPool.findIndex((p) => p.sku === product.sku);
            if (idx >= 0) newPool.splice(idx, 1);
            newPool.unshift({
              ...product,
              originalPage: pageNumber,
              originalSlotId: slot.id,
            });
          }
        }
        set({ tempProductPool: newPool });
        setActivePages(pages);
      },
      returnProductFromTempPool: (sku) => {
        const { getActivePages, setActivePages, tempProductPool } = get();
        useHistoryStore.getState().saveState();
        const idx = tempProductPool.findIndex((p) => p.sku === sku);
        if (idx === -1) return;
        const product = tempProductPool[idx];
        if (!product.originalPage || !product.originalSlotId) return;

        const pages = clone(getActivePages());
        const page = pages.find((p) => p.pageNumber === product.originalPage);
        let displaced: ProductInfo | null = null;
        if (page) {
          const slot = page.slots.find((s) => s.id === product.originalSlotId);
          if (slot) {
            displaced = slot.product;
            slot.product = product;
          }
        }
        const newPool = [...tempProductPool];
        newPool.splice(idx, 1);
        if (displaced?.sku) {
          const dIdx = newPool.findIndex((p) => p.sku === displaced!.sku);
          if (dIdx >= 0) newPool.splice(dIdx, 1);
          newPool.unshift({
            ...displaced,
            originalPage: product.originalPage,
            originalSlotId: product.originalSlotId,
          });
        }
        set({ tempProductPool: newPool });
        setActivePages(pages);
      },

      updatePagesBackground: (pageNumbers, background) => {
        const { getActivePages, setActivePages } = get();
        useHistoryStore.getState().saveState();
        setActivePages(
          getActivePages().map((p) =>
            pageNumbers.includes(p.pageNumber) ? { ...p, background } : p,
          ),
        );
      },

      applyBackgroundToAllFormas: (sourcePageNumbers) => {
        const { formas, activeFormaId } = get();
        const activeForma = formas.find((f) => f.id === activeFormaId);
        if (!activeForma) return [];

        const indexToBackground = new Map<number, NonNullable<CatalogPage['background']>>();
        for (const pageNum of sourcePageNumbers) {
          const idx = activeForma.pages.findIndex((p) => p.pageNumber === pageNum);
          if (idx === -1) continue;
          const bg = activeForma.pages[idx].background;
          if (bg) indexToBackground.set(idx, bg);
        }
        if (indexToBackground.size === 0) return [];

        const report: { formaId: number; success: boolean; reason?: string }[] = [];
        const nextFormas = formas.map((f) => {
          if (f.id === activeFormaId) return f;
          if (f.pages.length !== activeForma.pages.length) {
            report.push({ formaId: f.id, success: false, reason: 'Sayfa sayısı eşleşmiyor' });
            return f;
          }
          const pages = f.pages.map((p, idx) => {
            const bg = indexToBackground.get(idx);
            return bg ? { ...p, background: bg } : p;
          });
          report.push({ formaId: f.id, success: true });
          return { ...f, pages };
        });
        set({ formas: nextFormas });
        return report;
      },

      applyBackgroundGlobally: (background) => {
        const { formas, activeFormaId } = get();
        const activeForma = formas.find((f) => f.id === activeFormaId);
        const activePageCount = activeForma?.pages.length ?? 0;
        const report: { formaId: number; success: boolean; reason?: string }[] = [];
        const nextFormas = formas.map((f) => {
          if (f.pages.length !== activePageCount) {
            report.push({ formaId: f.id, success: false, reason: 'Sayfa sayısı uyumsuz' });
            return f;
          }
          report.push({ formaId: f.id, success: true });
          return { ...f, pages: f.pages.map((p) => ({ ...p, background })) };
        });
        set({ formas: nextFormas });
        return report;
      },

      // === History bridge ===
      undo: () => useHistoryStore.getState().undo(),
      redo: () => useHistoryStore.getState().redo(),
    }),
    {
      name: STUDIO_STORE_NAME,
      version: STUDIO_STORE_VERSION,
      onRehydrateStorage: (_) => {
        return (state, error) => {
          if (!error) {
            state?.setHasHydrated(true);
          }
        };
      },
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          // Sıfırlamak için undefined döndürüyoruz, Zustand varsayılan state'i yükler.
          return undefined as any;
        }
        if (version < 4) {
          if (persistedState?.globalSettings) {
            if (!persistedState.globalSettings.nameSettings) {
              persistedState.globalSettings.nameSettings = {};
            }
            persistedState.globalSettings.nameSettings = {
              bgColor: '#ffffff',
              bgOpacity: 0,
              borderColor: '#e2e8f0',
              borderOpacity: 100,
              borderWidth: 0,
              borderRadius: 0,
              ...persistedState.globalSettings.nameSettings,
            };
          }
        }
        if (version < 5) {
          if (persistedState?.globalSettings) {
            if (!persistedState.globalSettings.nameSettings) {
              persistedState.globalSettings.nameSettings = {};
            }
            persistedState.globalSettings.nameSettings = {
              width: undefined,
              height: undefined,
              ...persistedState.globalSettings.nameSettings,
            };
          }
        }
        if (version < 6) {
          if (persistedState?.globalSettings) {
            if (!persistedState.globalSettings.priceSettings) {
              persistedState.globalSettings.priceSettings = {};
            }
            persistedState.globalSettings.priceSettings = {
              isFreePosition: false,
              posX: 50,
              posY: 50,
              bgColor: '#ffffff',
              bgOpacity: 0,
              borderColor: '#e2e8f0',
              borderOpacity: 100,
              borderWidth: 0,
              borderRadius: 0,
              width: undefined,
              height: undefined,
              ...persistedState.globalSettings.priceSettings,
            };
          }
        }
        return persistedState;
      },
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as Partial<CatalogState>;
        const base = current as CatalogState;

        const mergedGlobal = deepMerge(
          (base.globalSettings ?? initialGlobalSettings) as unknown as Record<string, unknown>,
          (incoming.globalSettings ?? {}) as unknown as Record<string, unknown>,
        ) as unknown as CatalogSettings;
        if (!mergedGlobal.defaultGrid) mergedGlobal.defaultGrid = { rows: 4, cols: 4 };
        if (!mergedGlobal.footer) mergedGlobal.footer = initialGlobalSettings.footer;
        if (!mergedGlobal.nameSettings) {
          mergedGlobal.nameSettings = { isFreePosition: false, posX: 50, posY: 50, appearance: defaultCellAppearance };
        }
        if (!mergedGlobal.priceSettings) {
          mergedGlobal.priceSettings = { isFreePosition: false, posX: 50, posY: 50, appearance: defaultCellAppearance };
        }

        const normalizedGlobal: CatalogSettings = migrateSettingsColors({
          ...mergedGlobal,
          imageScale: 100,
          imagePosX: 0,
          imagePosY: 0,
          imageEditMode: false,
        }) as CatalogSettings;

        const formas =
          incoming.formas ??
          base.formas ??
          buildFormasForTemplate(incoming.activeTemplate ?? base.activeTemplate ?? Template1);

        const finalFormas = recalculateLayout(
          formas.map(normalizeForma),
          normalizedGlobal.defaultGrid,
        );

        return {
          ...base,
          ...incoming,
          formas: finalFormas,
          activeFormaId: incoming.activeFormaId ?? base.activeFormaId ?? 1,
          activeTab:
            incoming.activeTab ?? (incoming.activeFormaId === 2 ? 'inner' : 'outer'),
          globalSettings: normalizedGlobal,
          tempProductPool: incoming.tempProductPool ?? [],
          isDirty: false,
          printOptions: incoming.printOptions ?? { ...DEFAULT_OPTIONS },
          quantity: incoming.quantity ?? DEFAULT_QUANTITY,
        } as Store;
      },
    },
  ),
);

// === Persistence normalizers ===

/**
 * Upgrade legacy `{ c, o }` ColorOpacity stored under a field that is now
 * typed as ColorValue. Returns the input unchanged when it already looks
 * like a ColorValue, or when it is null/undefined.
 */
function migrateColorValue(v: unknown): unknown {
  if (!v || typeof v !== 'object') return v;
  const obj = v as Record<string, unknown>;
  if (obj.type === 'solid' || obj.type === 'gradient') return obj;
  if (typeof obj.c === 'string' && typeof obj.o === 'number') {
    return { type: 'solid', color: obj.c, opacity: obj.o };
  }
  return v;
}

function migrateModuleData(md: unknown): unknown {
  if (!md || typeof md !== 'object') return md;
  const data = md as Record<string, unknown>;
  if (data.type === 'banner' && Array.isArray(data.cells)) {
    return {
      ...data,
      cells: data.cells.map((cell) => {
        const c = cell as Record<string, unknown>;
        return { ...c, bgColor: migrateColorValue(c.bgColor) };
      }),
    };
  }
  return md;
}

/**
 * Migrate a legacy CatalogPage.background payload to the unified ColorValue
 * shape. The old model used:
 *   { type: 'color' | 'gradient' | 'image',
 *     color?: { c, o },
 *     gradient?: { type: 'linear'|'radial'|'radial-star', angle?, stops: [{color, opacity?, position}] },
 *     imageUrl? }
 * The new model collapses 'color' and 'gradient' into 'color' with a
 * ColorValue value:
 *   { type: 'color' | 'image', value?: ColorValue, imageUrl? }
 * radial-star is mapped to diamond.
 */
function migratePageBackground(bg: unknown): unknown {
  if (!bg || typeof bg !== 'object') return bg;
  const old = bg as Record<string, unknown>;
  if (old.type === 'color' || old.type === 'image') {
    // Already partially upgraded? If `value` exists, keep as-is, otherwise
    // try to upgrade `color: {c,o}` → value: SolidValue.
    if (old.type === 'color' && !old.value && old.color) {
      const c = old.color as Record<string, unknown>;
      return {
        type: 'color',
        value: { type: 'solid', color: c.c ?? '#ffffff', opacity: c.o ?? 100 },
        ...(old.imageUrl ? { imageUrl: old.imageUrl } : {}),
        ...(old.overlay ? { overlay: old.overlay } : {}),
      };
    }
    return old;
  }
  if (old.type === 'gradient' && old.gradient && typeof old.gradient === 'object') {
    const g = old.gradient as Record<string, unknown>;
    const oldType = g.type as string | undefined;
    const gradientType =
      oldType === 'radial-star' ? 'diamond' : oldType === 'radial' ? 'radial' : 'linear';
    const stops = (Array.isArray(g.stops) ? g.stops : []).map((s) => {
      const stop = s as Record<string, unknown>;
      return {
        color: typeof stop.color === 'string' ? stop.color : '#ffffff',
        opacity: typeof stop.opacity === 'number' ? stop.opacity : 100,
        position: typeof stop.position === 'number' ? stop.position : 0,
      };
    });
    return {
      type: 'color',
      value: {
        type: 'gradient',
        gradientType,
        ...(typeof g.angle === 'number' ? { angle: g.angle } : {}),
        stops,
      },
    };
  }
  return bg;
}

function migrateSettingsColors<T extends { colors?: Record<string, unknown> }>(s: T): T {
  if (!s.colors) return s;
  const next = { ...s.colors };
  if ('cellBg' in next) next.cellBg = migrateColorValue(next.cellBg);
  if ('priceBg' in next) next.priceBg = migrateColorValue(next.priceBg);
  return { ...s, colors: next };
}

function normalizeForma(forma: StudioForma): StudioForma {
  return {
    ...forma,
    pages: (forma.pages ?? []).map(normalizeCatalogPage),
    pageMergeGroups:
      forma.pageMergeGroups && forma.pageMergeGroups.length > 0
        ? forma.pageMergeGroups
        : (forma.pages ?? []).map((p) => [p.id]),
  };
}

function normalizeCatalogPage(page: CatalogPage): CatalogPage {
  // Eski footer-cell sistemi kaldırıldı (2c). Legacy footerText/footerLogo artık yok sayılır
  // (greenfield — eski veri umursanmıyor); customFooter üretimi kalktı. Load-safe (crash yok).
  const migratedBg = page.background
    ? (migratePageBackground(page.background) as typeof page.background)
    : page.background;
  const slots = page.slots?.map((s) => {
    let next = s;
    if (s.moduleData) {
      next = { ...next, moduleData: migrateModuleData(s.moduleData) };
    }
    if (s.customSettings && typeof s.customSettings === 'object') {
      const cs = s.customSettings as Record<string, any>;
      if (cs.badge) {
        cs.badge = {
          bgOpacity: 100,
          borderOpacity: 100,
          textOpacity: 100,
          ...cs.badge,
        };
      }
      next = {
        ...next,
        customSettings: migrateSettingsColors(cs) as typeof s.customSettings,
      };
    }
    return next;
  });
  return {
    ...page,
    slots: slots ?? page.slots,
    background: migratedBg,
    footerMode: page.footerMode ?? 'global',
  };
}
