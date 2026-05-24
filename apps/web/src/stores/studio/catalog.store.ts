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
  StudioFooterCell,
  StudioForma,
  StudioSlot,
  TempPoolProduct,
} from '@matbaapro/shared';
import { availableTemplates, Template1 } from '@matbaapro/shared';
import { recalculateLayout } from '@matbaapro/grid-engine';
import {
  buildFormasForTemplate,
  clone,
  createPageSlots,
  deepMerge,
  defaultFooterCells,
  initialGlobalSettings,
} from './defaults';
import { ModuleRegistry } from './module-registry';
import { useHistoryStore } from './history.store';
import { useUIStore } from './ui.store';

type FooterScope = number | 'global';
type GridScope = 'global' | number;

interface CatalogState {
  activeTemplate: BrochureTemplate;
  formas: StudioForma[];
  activeFormaId: number;
  activeTab: 'outer' | 'inner';
  productPool: ProductInfo[];
  masterProductPool: ProductInfo[];
  tempProductPool: TempPoolProduct[];
  globalSettings: CatalogSettings;
  copiedSlotSettings: DeepPartial<CatalogSettings> | null;
}

interface CatalogActions {
  // Template / forma
  setActiveTemplate: (templateId: string) => void;
  applyTemplate: (template: BrochureTemplate) => void;
  setActiveTab: (tab: 'outer' | 'inner') => void;
  setActiveFormaId: (id: number) => void;
  setFormas: (formas: StudioForma[]) => void;
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
  updatePageFooterCells: (
    pageNumber: number,
    cellId: string,
    updates: Partial<StudioFooterCell>,
  ) => void;
  setPageFooterMode: (pageNumber: number, mode: 'global' | 'custom' | 'hidden') => void;
  updateFooterSettings: (
    scope: FooterScope,
    updates: Partial<{ heightMm: number; cells: StudioFooterCell[] }>,
  ) => void;
  updateFooterCellStore: (
    scope: FooterScope,
    cellId: string,
    updates: Partial<StudioFooterCell>,
  ) => void;
  mergeFooterCellsStore: (
    scope: FooterScope,
    selectedIds: string[],
  ) => { success: boolean; error?: string };
  unmergeFooterCellStore: (scope: FooterScope, cellId: string) => void;

  // Product pool
  setProductPool: (products: ProductInfo[]) => void;
  setMasterProductPool: (products: ProductInfo[]) => void;
  autoFillSlots: () => void;
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
  clearSlot: (pageNumber: number, slotId: string) => void;
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
  ) => void;

  // Grid management
  updateGridSettings: (scope: GridScope, settings: { rows: number; cols: number }) => void;
  applyGridChanges: () => void;
  applyPageGridChange: (pageNumber: number) => void;
  revertToGlobalGrid: (pageNumber: number) => void;

  // Temp pool
  addToTempPool: (
    product: ProductInfo,
    originalPage?: number,
    originalSlotId?: string,
  ) => void;
  removeFromTempPool: (sku: string) => void;
  clearTempPool: () => void;
  moveSlotToTempPool: (pageNumber: number, slotId: string) => void;
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

export const useCatalogStore = create<Store>()(
  persist(
    (set, get) => ({
      activeTemplate: Template1,
      activeFormaId: 1,
      activeTab: 'outer',
      formas: buildFormasForTemplate(Template1),
      productPool: [],
      masterProductPool: [],
      tempProductPool: [],
      globalSettings: clone(initialGlobalSettings),
      copiedSlotSettings: null,

      // === Template / forma ===
      setActiveTemplate: (templateId) => {
        const tmpl = availableTemplates.find((t) => t.id === templateId);
        if (!tmpl) return;
        get().applyTemplate(tmpl);
      },
      applyTemplate: (tmpl) => {
        const formas = buildFormasForTemplate(tmpl);
        set({
          activeTemplate: tmpl,
          formas: recalculateLayout(formas, initialGlobalSettings.defaultGrid),
          activeFormaId: 1,
          activeTab: 'outer',
        });
        useHistoryStore.getState().clearHistory();
      },
      setActiveTab: (tab) =>
        set({ activeTab: tab, activeFormaId: tab === 'inner' ? 2 : 1 }),
      setActiveFormaId: (id) =>
        set({ activeFormaId: id, activeTab: id === 2 ? 'inner' : 'outer' }),
      setFormas: (formas) => set({ formas }),

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
      setGlobalSettings: (settings) =>
        set((state) => ({
          globalSettings: deepMerge(
            state.globalSettings as unknown as Record<string, unknown>,
            settings as unknown as Record<string, unknown>,
          ) as unknown as CatalogSettings,
        })),
      updateGlobalSettings: (settings) =>
        set((state) => ({ globalSettings: { ...state.globalSettings, ...settings } })),

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
      updatePageFooterCells: (pageNumber, cellId, updates) => {
        const { getActivePages, setActivePages, globalSettings } = get();
        setActivePages(
          getActivePages().map((page) => {
            if (page.pageNumber !== pageNumber) return page;
            let footerMode = page.footerMode;
            let customFooter = page.customFooter;
            if (page.footerMode === 'global') {
              footerMode = 'custom';
              customFooter = clone(globalSettings.footer);
            }
            if (customFooter?.cells) {
              customFooter = {
                ...customFooter,
                cells: customFooter.cells.map((c) =>
                  c.id === cellId ? { ...c, ...updates } : c,
                ),
              };
            }
            return { ...page, footerMode, customFooter };
          }),
        );
      },
      setPageFooterMode: (pageNumber, mode) => {
        const { getActivePages, setActivePages, globalSettings } = get();
        setActivePages(
          getActivePages().map((p) => {
            if (p.pageNumber !== pageNumber) return p;
            let customFooter = p.customFooter;
            if (mode === 'custom' && !customFooter) customFooter = clone(globalSettings.footer);
            return { ...p, footerMode: mode, customFooter: mode === 'custom' ? customFooter : null };
          }),
        );
      },
      updateFooterSettings: (scope, updates) => {
        if (scope === 'global') {
          set((state) => ({
            globalSettings: { ...state.globalSettings, footer: { ...state.globalSettings.footer, ...updates } },
          }));
          return;
        }
        const { getActivePages, setActivePages } = get();
        setActivePages(
          getActivePages().map((p) =>
            p.pageNumber === scope && p.customFooter
              ? { ...p, customFooter: { ...p.customFooter, ...updates } }
              : p,
          ),
        );
      },
      updateFooterCellStore: (scope, cellId, updates) => {
        if (scope === 'global') {
          set((state) => {
            const cells = state.globalSettings.footer.cells.map((c) =>
              c.id === cellId ? { ...c, ...updates } : c,
            );
            return {
              globalSettings: {
                ...state.globalSettings,
                footer: { ...state.globalSettings.footer, cells },
              },
            };
          });
          return;
        }
        const { getActivePages, setActivePages } = get();
        setActivePages(
          getActivePages().map((p) => {
            if (p.pageNumber !== scope || !p.customFooter) return p;
            const cells = p.customFooter.cells.map((c) =>
              c.id === cellId ? { ...c, ...updates } : c,
            );
            return { ...p, customFooter: { ...p.customFooter, cells } };
          }),
        );
      },
      mergeFooterCellsStore: (scope, selectedIds) => {
        if (selectedIds.length < 2)
          return { success: false, error: 'En az 2 hucre secmelisiniz.' };

        let cells: StudioFooterCell[] = [];
        if (scope === 'global') {
          cells = get().globalSettings.footer.cells;
        } else {
          const p = get().getActivePages().find((pp) => pp.pageNumber === scope);
          if (!p?.customFooter) return { success: false, error: 'Custom footer bulunamadi.' };
          cells = p.customFooter.cells;
        }

        const visible = cells.filter((c) => !c.hidden);
        const selectedVisible = visible.filter((c) => selectedIds.includes(c.id));
        if (selectedVisible.length !== selectedIds.length)
          return { success: false, error: 'Gecersiz secim.' };

        const sorted = selectedIds
          .slice()
          .sort((a, b) => cells.findIndex((c) => c.id === a) - cells.findIndex((c) => c.id === b));
        const survivorId = sorted[0];
        const survivorIdx = cells.findIndex((c) => c.id === survivorId);
        const totalColSpan = selectedVisible.reduce((s, c) => s + c.colSpan, 0);

        const next: StudioFooterCell[] = clone(cells);
        next[survivorIdx].colSpan = totalColSpan;
        for (const id of sorted.slice(1)) {
          const idx = next.findIndex((c) => c.id === id);
          next[idx].hidden = true;
          next[idx].mergedInto = survivorId;
          next[idx].text = '';
          next[idx].image = null;
        }

        get().updateFooterSettings(scope, { cells: next });
        return { success: true };
      },
      unmergeFooterCellStore: (scope, cellId) => {
        let cells: StudioFooterCell[] = [];
        if (scope === 'global') {
          cells = get().globalSettings.footer.cells;
        } else {
          const p = get().getActivePages().find((pp) => pp.pageNumber === scope);
          if (!p?.customFooter) return;
          cells = p.customFooter.cells;
        }
        const next: StudioFooterCell[] = clone(cells);
        const survivorIdx = next.findIndex((c) => c.id === cellId);
        if (survivorIdx === -1) return;
        next[survivorIdx].colSpan = 1;
        next.forEach((c, i) => {
          if (c.mergedInto === cellId) {
            next[i].hidden = false;
            next[i].mergedInto = null;
          }
        });
        get().updateFooterSettings(scope, { cells: next });
      },

      // === Product pool ===
      setProductPool: (products) => set({ productPool: products }),
      setMasterProductPool: (products) => set({ masterProductPool: products }),

      autoFillSlots: () => {
        const { formas, productPool, globalSettings } = get();
        useHistoryStore.getState().saveState(clone(get().getActivePages()));

        const next = clone(formas);
        const valid: StudioSlot[] = [];
        for (const f of next) {
          for (const p of f.pages) {
            for (const s of p.slots) {
              if (!s.hidden && s.role === 'product') valid.push(s);
            }
          }
        }
        for (const s of valid) s.product = null;

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
          if (posValue > 0 && posValue <= valid.length) {
            const autoImage =
              product.image ?? (product.sku ? `/images/products/${product.sku}.png` : undefined);
            valid[posValue - 1].product = { ...product, image: autoImage ?? product.image };
            if (product.sku) get().removeFromTempPool(product.sku);
          }
        }

        set({ formas: recalculateLayout(next, globalSettings.defaultGrid) });
      },

      clearProducts: () => {
        const { getActivePages, setActivePages } = get();
        useHistoryStore.getState().saveState(clone(getActivePages()));
        const next = clone(getActivePages());
        next.forEach((p) => p.slots.forEach((s) => (s.product = null)));
        setActivePages(next);
      },

      resetCatalog: () => {
        const { getActivePages, activeTemplate } = get();
        useHistoryStore.getState().saveState(clone(getActivePages()));
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
        useHistoryStore.getState().saveState(clone(getActivePages()));

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
        useHistoryStore.getState().saveState(clone(getActivePages()), clone(tempProductPool));

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

        const survivorIdx = newSlots.findIndex((s) => s.id === survivorId);
        newSlots[survivorIdx] = {
          ...newSlots[survivorIdx],
          colSpan: maxC - minC + 1,
          rowSpan: maxR - minR + 1,
          product: targetProduct,
        };
        for (const id of selectedSlotIds) {
          if (id === survivorId) continue;
          const idx = newSlots.findIndex((s) => s.id === id);
          newSlots[idx] = { ...newSlots[idx], hidden: true, mergedInto: survivorId, product: null };
        }

        const newPages = [...pages];
        newPages[pageIdx] = { ...page, slots: newSlots };
        const newFormas = formas.map((f) =>
          f.id === activeFormaId ? { ...f, pages: newPages } : f,
        );

        let newTemp = [...tempProductPool];
        for (const item of productsToPool) {
          const sku = item.product.sku;
          if (sku) newTemp = newTemp.filter((p) => p.sku !== sku);
          newTemp.unshift({
            ...item.product,
            originalPage: pageNumber,
            originalSlotId: item.slotId,
          });
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
        useHistoryStore.getState().saveState(clone(getActivePages()));

        const pages = getActivePages();
        const pageIdx = pages.findIndex((p) => p.pageNumber === pageNumber);
        if (pageIdx < 0) return;
        const page = pages[pageIdx];
        const newSlots = [...page.slots];
        const survivorIdx = newSlots.findIndex((s) => s.id === slotId);
        newSlots[survivorIdx] = { ...newSlots[survivorIdx], colSpan: 1, rowSpan: 1 };
        newSlots.forEach((s, i) => {
          if (s.mergedInto === slotId) {
            newSlots[i] = { ...s, hidden: false, mergedInto: null, product: null };
          }
        });
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
        useHistoryStore.getState().saveState(clone(getActivePages()));
        const pages = clone(getActivePages());
        for (const id of selectedSlotIds) {
          for (const p of pages) {
            for (const s of p.slots) {
              if (s.id === id) {
                s.isCustom = enabled;
                if (enabled && !s.customSettings) {
                  s.customSettings = clone(globalSettings) as DeepPartial<CatalogSettings>;
                }
              }
            }
          }
        }
        setActivePages(pages);
      },
      updateSlotCustomSettings: (settings) => {
        const { getActivePages, setActivePages } = get();
        const { selectedSlotIds } = useUIStore.getState();
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
      pasteSlotSettings: () => {
        const { getActivePages, setActivePages, copiedSlotSettings } = get();
        const { selectedSlotIds } = useUIStore.getState();
        if (!copiedSlotSettings || selectedSlotIds.length === 0) return;
        useHistoryStore.getState().saveState(clone(getActivePages()));
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
        useHistoryStore.getState().saveState(clone(getActivePages()));
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
      clearSlot: (pageNumber, slotId) => {
        const { getActivePages, setActivePages } = get();
        useHistoryStore.getState().saveState(clone(getActivePages()));
        const pages = clone(getActivePages());
        const page = pages.find((p) => p.pageNumber === pageNumber);
        if (page) {
          const slot = page.slots.find((s) => s.id === slotId);
          if (slot) slot.product = null;
        }
        setActivePages(pages);
      },
      setSlotProduct: (pageNumber, slotId, product) => {
        const { getActivePages, setActivePages } = get();
        useHistoryStore.getState().saveState(clone(getActivePages()));
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
        useHistoryStore.getState().saveState(clone(getActivePages()));
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
        useHistoryStore.getState().saveState(clone(getActivePages()));

        const pages = clone(getActivePages());
        for (const id of selectedSlotIds) {
          for (const p of pages) {
            for (const s of p.slots) {
              if (s.id !== id) continue;
              s.role = role;
              if (role === 'free') {
                s.product = null;
                s.isCustom = true;
                const cs = clone(globalSettings) as CatalogSettings;
                cs.spacings.cell = { t: 0, r: 0, b: 0, l: 0, linked: true };
                cs.borderWidth = 0;
                cs.colors.cellBg = { type: 'solid', color: '#ffffff', opacity: 0 };
                cs.colors.cellBorder = { c: cs.colors.cellBorder.c, o: 0 };
                cs.shadows.cell.active = false;
                cs.radiuses.cell = { tl: 0, tr: 0, bl: 0, br: 0, linked: true };
                s.customSettings = cs;
              } else {
                s.moduleData = null;
                s.moduleType = null;
              }
            }
          }
        }
        const newFormas = formas.map((f) => (f.id === activeFormaId ? { ...f, pages } : f));
        set({ formas: recalculateLayout(newFormas, globalSettings.defaultGrid) });
      },
      setSlotModule: (pageNumber, slotId, moduleType) => {
        const { getActivePages, setActivePages } = get();
        useHistoryStore.getState().saveState(clone(getActivePages()));
        const pages = clone(getActivePages());
        const page = pages.find((p) => p.pageNumber === pageNumber);
        if (!page) return;
        const slot = page.slots.find((s) => s.id === slotId);
        if (!slot || slot.role !== 'free') return;
        slot.moduleType = moduleType;
        slot.moduleData =
          moduleType && ModuleRegistry[moduleType]
            ? ModuleRegistry[moduleType].initialData()
            : null;
        setActivePages(pages);
      },
      updateSlotModuleData: (pageNumber, slotId, updates) => {
        const { getActivePages, setActivePages } = get();
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

      // === Grid management ===
      updateGridSettings: (scope, settings) => {
        const rows = Math.max(1, Math.min(10, settings.rows));
        const cols = Math.max(1, Math.min(10, settings.cols));
        const next = { rows, cols };
        const target = rows * cols;

        const occupiedArea = (page: CatalogPage) =>
          page.slots
            .filter((s) => !s.hidden)
            .reduce((sum, s) => sum + s.colSpan * s.rowSpan, 0);

        // Eksikse bos 1x1 slot append et; fazlaysa yalniz arkadaki tamamen bos
        // 1x1 slot'lari traş et (icerikli/birlestirilmiş olanlara dokunma).
        const reconcilePage = (page: CatalogPage) => {
          // Grow
          let occupied = occupiedArea(page);
          if (occupied < target) {
            const missing = target - occupied;
            const startIdx = page.slots.length + 1;
            for (let i = 0; i < missing; i++) {
              page.slots.push({
                id: `page-${page.pageNumber}-slot-${startIdx + i}`,
                colSpan: 1,
                rowSpan: 1,
                product: null,
                hidden: false,
                mergedInto: null,
                isCustom: false,
                role: 'product',
              });
            }
            return;
          }
          // Shrink — sadece tamamen bos trailing slot'lari at
          while (occupiedArea(page) > target && page.slots.length > 0) {
            const last = page.slots[page.slots.length - 1];
            const isExpendable =
              !last.hidden &&
              !last.mergedInto &&
              !last.product &&
              !last.moduleData &&
              !last.isCustom &&
              (last.role ?? 'product') === 'product' &&
              last.colSpan === 1 &&
              last.rowSpan === 1;
            if (!isExpendable) break;
            page.slots.pop();
            occupied = occupiedArea(page);
          }
        };

        const formas = clone(get().formas);

        if (scope === 'global') {
          // Global default grid degisti — explicit gridSettings'i olmayan
          // tum sayfalari hedefe gore tamamla.
          for (const f of formas) {
            for (const p of f.pages) {
              if (!p.gridSettings) reconcilePage(p);
            }
          }
          set((state) => ({
            globalSettings: { ...state.globalSettings, defaultGrid: next },
            formas: recalculateLayout(formas, next),
          }));
          return;
        }

        const page = formas.flatMap((f) => f.pages).find((p) => p.pageNumber === scope);
        if (!page) return;
        page.gridSettings = next;
        reconcilePage(page);
        const defaultGrid = get().globalSettings.defaultGrid ?? { rows: 4, cols: 4 };
        set({ formas: recalculateLayout(formas, defaultGrid) });
      },
      applyGridChanges: () => {
        const { formas, globalSettings } = get();
        useHistoryStore.getState().saveState(clone(get().getActivePages()));
        const next = clone(formas);
        for (const f of next) {
          for (const p of f.pages) {
            const grid = p.gridSettings ?? globalSettings.defaultGrid ?? { rows: 4, cols: 4 };
            const newCount = grid.rows * grid.cols;
            const saved = p.slots.filter((s) => s.product || s.role === 'free' || s.isCustom);
            const fresh = createPageSlots(p.pageNumber, newCount);
            for (let i = 0; i < fresh.length && i < saved.length; i++) {
              fresh[i].product = saved[i].product;
              fresh[i].role = saved[i].role;
              fresh[i].moduleData = saved[i].moduleData;
              fresh[i].moduleType = saved[i].moduleType;
              fresh[i].isCustom = saved[i].isCustom;
              fresh[i].customSettings = saved[i].customSettings;
              fresh[i].imageSettings = saved[i].imageSettings;
            }
            p.slots = fresh;
          }
        }
        set({ formas: recalculateLayout(next, globalSettings.defaultGrid) });
      },
      applyPageGridChange: (pageNumber) => {
        const { formas, globalSettings } = get();
        useHistoryStore.getState().saveState(clone(get().getActivePages()));
        const next = clone(formas);
        for (const f of next) {
          const page = f.pages.find((p) => p.pageNumber === pageNumber);
          if (!page) continue;
          const grid = page.gridSettings ?? globalSettings.defaultGrid ?? { rows: 4, cols: 4 };
          page.slots = createPageSlots(page.pageNumber, grid.rows * grid.cols);
        }
        set({ formas: recalculateLayout(next, globalSettings.defaultGrid) });
      },
      revertToGlobalGrid: (pageNumber) => {
        const { formas } = get();
        useHistoryStore.getState().saveState(clone(get().getActivePages()));
        const next = clone(formas);
        const page = next.flatMap((f) => f.pages).find((p) => p.pageNumber === pageNumber);
        if (!page) return;
        page.gridSettings = undefined;
        set({ formas: next });
        setTimeout(() => get().applyPageGridChange(pageNumber), 50);
      },

      // === Temp pool ===
      addToTempPool: (product, originalPage, originalSlotId) => {
        useHistoryStore
          .getState()
          .saveState(clone(get().getActivePages()), clone(get().tempProductPool));
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
          .saveState(clone(get().getActivePages()), clone(get().tempProductPool));
        set((state) => ({
          tempProductPool: state.tempProductPool.filter((p) => p.sku !== sku),
        }));
      },
      clearTempPool: () => {
        useHistoryStore
          .getState()
          .saveState(clone(get().getActivePages()), clone(get().tempProductPool));
        set({ tempProductPool: [] });
      },
      moveSlotToTempPool: (pageNumber, slotId) => {
        const { getActivePages, setActivePages, tempProductPool } = get();
        useHistoryStore.getState().saveState(clone(getActivePages()), clone(tempProductPool));
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
          const filtered = tempProductPool.filter((p) => p.sku !== moved!.sku);
          set({
            tempProductPool: [
              { ...moved, originalPage: pageNumber, originalSlotId: slotId },
              ...filtered,
            ],
          });
        }
        setActivePages(pages);
      },
      dumpPageToTempPool: (pageNumber) => {
        const { getActivePages, setActivePages, tempProductPool } = get();
        useHistoryStore.getState().saveState(clone(getActivePages()), clone(tempProductPool));
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
        useHistoryStore.getState().saveState(clone(getActivePages()), clone(tempProductPool));
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
      name: 'matbaapro-studio-v1',
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as Partial<CatalogState>;
        const base = current as CatalogState;

        const mergedGlobal = deepMerge(
          (base.globalSettings ?? initialGlobalSettings) as unknown as Record<string, unknown>,
          (incoming.globalSettings ?? {}) as unknown as Record<string, unknown>,
        ) as unknown as CatalogSettings;
        if (!mergedGlobal.defaultGrid) mergedGlobal.defaultGrid = { rows: 4, cols: 4 };
        if (!mergedGlobal.footer) mergedGlobal.footer = initialGlobalSettings.footer;

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
  if (data.type === 'pizza' && data.colors && typeof data.colors === 'object') {
    const colors = data.colors as Record<string, unknown>;
    const bgKeys = ['bg', 'tableBg', 'tableTitleBg', 'cellBg', 'cellPriceBg', 'imgBg'];
    const nextColors: Record<string, unknown> = { ...colors };
    for (const k of bgKeys) {
      if (k in colors) nextColors[k] = migrateColorValue(colors[k]);
    }
    return { ...data, colors: nextColors };
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
  let footerMode = page.footerMode;
  let customFooter = page.customFooter;
  if (!footerMode && (page.footerText || page.footerLogo)) {
    footerMode = 'custom';
    customFooter = { heightMm: 18, cells: defaultFooterCells() };
    if (page.footerLogo) customFooter.cells[0].image = page.footerLogo;
    if (page.footerText) customFooter.cells[1].text = page.footerText;
    page.footerText = '';
    page.footerLogo = null;
  }
  const migratedBg = page.background
    ? (migratePageBackground(page.background) as typeof page.background)
    : page.background;
  const slots = page.slots?.map((s) => {
    let next = s;
    if (s.moduleData) {
      next = { ...next, moduleData: migrateModuleData(s.moduleData) };
    }
    if (s.customSettings && typeof s.customSettings === 'object') {
      next = {
        ...next,
        customSettings: migrateSettingsColors(s.customSettings as { colors?: Record<string, unknown> }) as typeof s.customSettings,
      };
    }
    return next;
  });
  return {
    ...page,
    slots: slots ?? page.slots,
    background: migratedBg,
    footerMode: footerMode ?? 'global',
    customFooter: customFooter ?? null,
  };
}
