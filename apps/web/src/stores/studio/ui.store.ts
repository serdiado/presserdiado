// Unified selection + UI state for the studio.

import { create } from 'zustand';

export type SelectionType =
  | 'none'
  | 'slot'
  | 'layer'
  | 'bannerCell'
  | 'textElement'
  | 'footerCell'
  | 'pageBackground';

export type TextElementType = 'name' | 'price' | 'badge';

export interface SelectionState {
  type: SelectionType;
  ids: string[];
  parentId?: string | null;
  textElementType?: TextElementType;
}

interface SidebarState {
  activePanel: string | null;
  activeTab: string | null;
  activeSubTab: string | null;
}

interface UIState {
  isZoomed: boolean;
  isTempPoolOpen: boolean;
  userScale: number;
  pan: { x: number; y: number };
  foregroundOpacity: number;
  selectedBackgroundPageIds: number[];
  backgroundMerged: boolean;
  mergedPageGroups: number[][];
  activeBadgeMoveSlotId: string | null;
  isSidebarOpen: boolean;
  activeFlyout: string | null;

  // Legacy mirrors (kept in sync from `selection`)
  selectedSlotIds: string[];
  selectedPageNumber: number | null;
  selectedTextElement: { slotId: string; elementType: TextElementType } | null;

  selection: SelectionState;
  sidebarState: SidebarState;
  contextualBarFormaId: string | null;
  contextualBarSelectedPages: number[];
  editingContent: { slotId: string; contentType: 'product' | 'banner' | 'pizza' } | null;
  isPreviewMode: boolean;

  setPreviewMode: (open: boolean) => void;
  toggleZoom: () => void;
  setUserZoom: (scale: number, pan?: { x: number; y: number }) => void;
  resetZoom: () => void;
  toggleTempPool: () => void;
  setTempPoolOpen: (open: boolean) => void;

  setSelection: (updates: Partial<SelectionState>) => void;
  toggleElementSelection: (
    type: SelectionType,
    id: string,
    isMulti: boolean,
    parentId?: string | null,
  ) => void;
  toggleSlotSelection: (id: string, isMulti: boolean) => void;
  clearSelection: () => void;

  setSelectedPage: (pageNumber: number | null) => void;
  setSelectedTextElement: (
    el: { slotId: string; elementType: TextElementType } | null,
  ) => void;

  setSidebarState: (panel: string | null, tab?: string | null, subTab?: string | null) => void;
  setContextualBarFormaId: (id: string | null) => void;
  setContextualBarSelectedPages: (pages: number[]) => void;
  setEditingContent: (
    content: { slotId: string; contentType: 'product' | 'banner' | 'pizza' } | null,
  ) => void;
  clearSelectionAndSelectPage: (pageNumber: number) => void;
  setForegroundOpacity: (v: number) => void;
  setSelectedBackgroundPageIds: (ids: number[]) => void;
  setBackgroundMerged: (merged: boolean) => void;
  setMergedPageGroups: (groups: number[][]) => void;
  setActiveBadgeMoveSlotId: (slotId: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveFlyout: (id: string | null) => void;
}

const initialSidebar: SidebarState = {
  activePanel: 'products',
  activeTab: null,
  activeSubTab: null,
};

export const useUIStore = create<UIState>((set, get) => ({
  isZoomed: false,
  isTempPoolOpen: false,
  userScale: 1,
  pan: { x: 0, y: 0 },
  foregroundOpacity: 100,
  selectedBackgroundPageIds: [],
  backgroundMerged: false,
  mergedPageGroups: [],
  activeBadgeMoveSlotId: null,
  isSidebarOpen: true,
  activeFlyout: null,
  selectedSlotIds: [],
  selectedPageNumber: null,
  selectedTextElement: null,
  selection: { type: 'none', ids: [] },
  sidebarState: initialSidebar,
  contextualBarFormaId: '1',
  contextualBarSelectedPages: [],
  editingContent: null,
  isPreviewMode: false,

  setPreviewMode: (open) => set({ isPreviewMode: open }),
  toggleZoom: () => set((s) => ({ isZoomed: !s.isZoomed })),
  setUserZoom: (scale, pan) =>
    set(() => ({ userScale: scale, ...(pan ? { pan } : {}) })),
  resetZoom: () => set({ userScale: 1, pan: { x: 0, y: 0 } }),
  toggleTempPool: () => set((s) => ({ isTempPoolOpen: !s.isTempPoolOpen })),
  setTempPoolOpen: (open) => set({ isTempPoolOpen: open }),

  setSelection: (updates) =>
    set((state) => {
      const next: SelectionState = { ...state.selection, ...updates };
      return {
        selection: next,
        selectedSlotIds: next.type === 'slot' ? next.ids : [],
        selectedPageNumber: null,
        selectedTextElement:
          next.type === 'textElement'
            ? { slotId: next.parentId ?? '', elementType: next.textElementType ?? 'name' }
            : null,
      };
    }),

  toggleElementSelection: (type, id, isMulti, parentId = null) =>
    set((state) => {
      let ids: string[] = [];
      if (state.selection.type !== type || state.selection.parentId !== parentId) {
        ids = [id];
      } else if (isMulti) {
        ids = state.selection.ids.includes(id)
          ? state.selection.ids.filter((x) => x !== id)
          : [...state.selection.ids, id];
      } else {
        ids = [id];
      }
      const next: SelectionState = {
        type: ids.length === 0 ? 'none' : type,
        ids,
        parentId,
      };
      return {
        selection: next,
        selectedSlotIds: next.type === 'slot' ? next.ids : [],
        selectedPageNumber: null,
        selectedTextElement: null,
      };
    }),

  toggleSlotSelection: (id, isMulti) => {
    get().toggleElementSelection('slot', id, isMulti);
  },

  clearSelection: () =>
    set({
      selection: { type: 'none', ids: [] },
      selectedSlotIds: [],
      selectedPageNumber: null,
      selectedTextElement: null,
    }),

  setSelectedPage: (pageNumber) => {
    if (pageNumber === null) {
      set({
        selectedPageNumber: null,
        selection: { type: 'none', ids: [] },
        selectedSlotIds: [],
      });
      return;
    }
    set({
      selectedPageNumber: pageNumber,
      selectedSlotIds: [],
      selection: { type: 'none', ids: [] },
      contextualBarSelectedPages: [pageNumber],
    });
  },

  setSelectedTextElement: (el) => {
    if (!el) {
      set({ selectedTextElement: null, selection: { type: 'none', ids: [] } });
      return;
    }
    set({
      selectedTextElement: el,
      selection: {
        type: 'textElement',
        ids: [`${el.slotId}-${el.elementType}`],
        parentId: el.slotId,
        textElementType: el.elementType,
      },
    });
  },

  setSidebarState: (panel, tab = null, subTab = null) =>
    set((state) => ({
      sidebarState: { activePanel: panel, activeTab: tab, activeSubTab: subTab },
      isSidebarOpen: panel !== null ? true : state.isSidebarOpen,
    })),

  setContextualBarFormaId: (id) => set({ contextualBarFormaId: id }),
  setContextualBarSelectedPages: (pages) => set({ contextualBarSelectedPages: pages }),
  setEditingContent: (content) => set({ editingContent: content }),
  setForegroundOpacity: (v) => set({ foregroundOpacity: Math.max(0, Math.min(100, v)) }),
  setSelectedBackgroundPageIds: (ids) => set({ selectedBackgroundPageIds: ids }),
  setBackgroundMerged: (merged) => set({ backgroundMerged: merged }),
  setMergedPageGroups: (groups) => set({ mergedPageGroups: groups }),
  setActiveBadgeMoveSlotId: (slotId) => set({ activeBadgeMoveSlotId: slotId }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setActiveFlyout: (id) => set({ activeFlyout: id }),

  clearSelectionAndSelectPage: (pageNumber) => {
    get().clearSelection();
    get().setSelectedPage(pageNumber);
  },
}));
