// Snapshot-based undo/redo (20 levels). Captures the entire studio state (all formas, tempPool, globalSettings, activeFormaId, activeTab).

import { create } from 'zustand';
import type { StudioForma, TempPoolProduct, CatalogSettings } from '@matbaapro/shared';
import { useCatalogStore } from './catalog.store';
import { clone } from './defaults';

const MAX_HISTORY = 20;

export interface HistorySnapshot {
  formas: StudioForma[];
  tempPool: TempPoolProduct[];
  globalSettings: CatalogSettings;
  activeFormaId: number;
  activeTab: 'outer' | 'inner';
}

interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  lastSavedTime: number;
  saveState: (force?: boolean) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  lastSavedTime: 0,

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
  clearHistory: () => set({ past: [], future: [], lastSavedTime: 0 }),
}));
