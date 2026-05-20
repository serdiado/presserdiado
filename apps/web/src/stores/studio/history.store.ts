// Snapshot-based undo/redo (20 levels). Captures pages + tempPool together.

import { create } from 'zustand';
import type { CatalogPage, TempPoolProduct } from '@matbaapro/shared';
import { useCatalogStore } from './catalog.store';
import { clone } from './defaults';

const MAX_HISTORY = 20;

export interface HistorySnapshot {
  pages: CatalogPage[];
  tempPool: TempPoolProduct[];
}

interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  saveState: (pages: CatalogPage[], tempPool?: TempPoolProduct[]) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  saveState: (pages, tempPool) => {
    const { past } = get();
    const tp = tempPool ?? clone(useCatalogStore.getState().tempProductPool);
    const next = [...past.slice(-MAX_HISTORY), { pages: clone(pages), tempPool: clone(tp) }];
    set({ past: next, future: [] });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;
    const catalog = useCatalogStore.getState();
    const currentPages = catalog.getActivePages();
    const currentTempPool = catalog.tempProductPool;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ pages: clone(currentPages), tempPool: clone(currentTempPool) }, ...future],
    });
    catalog.setActivePages(previous.pages);
    useCatalogStore.setState({ tempProductPool: previous.tempPool });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;
    const catalog = useCatalogStore.getState();
    const currentPages = catalog.getActivePages();
    const currentTempPool = catalog.tempProductPool;
    const next = future[0];
    set({
      past: [...past, { pages: clone(currentPages), tempPool: clone(currentTempPool) }],
      future: future.slice(1),
    });
    catalog.setActivePages(next.pages);
    useCatalogStore.setState({ tempProductPool: next.tempPool });
  },

  clearHistory: () => set({ past: [], future: [] }),
}));
