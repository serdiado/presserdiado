// Document-level layers (background fills, overlays, masks).

import { create } from 'zustand';
import type { Layer, LayerMask } from '@matbaapro/shared';
import { useCatalogStore } from './catalog.store';
import { useUIStore } from './ui.store';

interface LayerState {
  layers: Layer[];
  selectedPageIds: string[];

  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  updateLayerBounds: (id: string, bounds: Partial<Layer['bounds']>) => void;
  updateLayerTransform: (id: string, transform: Partial<Layer['transform']>) => void;
  updateLayerProperties: (id: string, properties: Partial<Layer['properties']>) => void;
  setTargetPagesForMask: (id: string, pageIds: string[]) => void;
  selectPages: (pageIds: string[], options?: { multi?: boolean; toggle?: boolean }) => void;
  selectLayers: (layerIds: string[]) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  setLayerMask: (id: string, mask: LayerMask | undefined) => void;
  fitLayerToPages: (id: string, pageIds: string[]) => void;
  duplicateLayer: (id: string) => void;
  reorderLayers: (layers: Layer[]) => void;
  syncGroupBackground: (
    groupIds: string[],
    type: 'base' | 'overlay',
    props: Partial<Layer['properties']>,
  ) => void;
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `layer-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`;

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: [],
  selectedPageIds: [],

  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, { ...layer, visible: layer.visible ?? true }],
    })),

  removeLayer: (id) => {
    set((state) => ({ layers: state.layers.filter((l) => l.id !== id) }));
    const sel = useUIStore.getState().selection;
    if (sel.type === 'layer' && sel.ids.includes(id)) {
      const remaining = sel.ids.filter((x) => x !== id);
      if (remaining.length === 0) useUIStore.getState().clearSelection();
      else useUIStore.getState().setSelection({ ids: remaining });
    }
  },

  updateLayerBounds: (id, bounds) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, bounds: { ...l.bounds, ...bounds } } : l,
      ),
    })),

  updateLayerTransform: (id, transform) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, transform: { ...l.transform, ...transform } } : l,
      ),
    })),

  updateLayerProperties: (id, properties) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, properties: { ...(l.properties ?? {}), ...properties } } : l,
      ),
    })),

  setTargetPagesForMask: (id, pageIds) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id
          ? {
              ...l,
              mask: l.mask
                ? { ...l.mask, targetIds: pageIds }
                : { type: 'page', targetIds: pageIds },
            }
          : l,
      ),
    })),

  selectPages: (pageIds, options) => {
    set((state) => {
      let next = pageIds;
      if (options?.multi) {
        next = [...state.selectedPageIds];
        for (const id of pageIds) {
          if (next.includes(id)) {
            if (options.toggle) next = next.filter((x) => x !== id);
          } else next.push(id);
        }
      } else if (options?.toggle && pageIds.length === 1) {
        next = state.selectedPageIds.includes(pageIds[0]) ? [] : [pageIds[0]];
      }
      const numericIds = next
        .map((id) => {
          const m = id.match(/\d+/);
          return m ? parseInt(m[0], 10) : null;
        })
        .filter((n): n is number => n !== null);
      setTimeout(() => useUIStore.getState().setContextualBarSelectedPages(numericIds), 0);
      return { selectedPageIds: next };
    });
  },

  selectLayers: (layerIds) => {
    if (layerIds.length === 0) useUIStore.getState().clearSelection();
    else useUIStore.getState().setSelection({ type: 'layer', ids: layerIds });
  },

  moveLayer: (id, direction) =>
    set((state) => {
      const idx = state.layers.findIndex((l) => l.id === id);
      if (idx === -1) return state;
      const next = [...state.layers];
      const target = direction === 'up' ? idx + 1 : idx - 1;
      if (target >= 0 && target < next.length) {
        [next[idx], next[target]] = [next[target], next[idx]];
      }
      return { layers: next };
    }),

  toggleLayerVisibility: (id) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    })),

  toggleLayerLock: (id) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
    })),

  setLayerMask: (id, mask) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, mask } : l)),
    })),

  fitLayerToPages: (id, pageIds) => {
    const template = useCatalogStore.getState().activeTemplate;
    if (!template) return;
    let minX = Infinity;
    let maxX = -Infinity;

    for (const pid of pageIds) {
      const m = pid.split('-')[1];
      const pageNum = m ? parseInt(m, 10) : NaN;
      const pageIdx = template.pages.findIndex((p) => p.pageNumber === pageNum);
      if (pageIdx === -1) continue;
      const xOffset = template.pages
        .slice(0, pageIdx)
        .reduce((sum, p) => sum + p.widthMm, 0);
      const w = template.pages[pageIdx].widthMm;
      minX = Math.min(minX, xOffset);
      maxX = Math.max(maxX, xOffset + w);
    }
    if (minX === Infinity) return;

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id
          ? {
              ...l,
              bounds: { x: minX, y: 0, w: maxX - minX, h: template.openHeightMm },
            }
          : l,
      ),
    }));
  },

  duplicateLayer: (id) => {
    const source = get().layers.find((l) => l.id === id);
    if (!source) return;
    const copy: Layer = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId(),
      name: `${source.name ?? 'Katman'} (Kopya)`,
      bounds: { ...source.bounds, x: source.bounds.x + 10, y: source.bounds.y + 10 },
    };
    set((state) => ({ layers: [...state.layers, copy] }));
    useUIStore.getState().setSelection({ type: 'layer', ids: [copy.id] });
  },

  reorderLayers: (layers) => set({ layers }),

  syncGroupBackground: (groupIds, type, props) => {
    if (!groupIds || groupIds.length === 0) return;
    const state = get();
    const catalog = useCatalogStore.getState();
    const template = catalog.activeTemplate;
    if (!template) return;

    const wantSolid = type === 'base';
    const existing = state.layers.find((l) => {
      const matchesType = wantSolid ? l.type === 'solid' : l.type === 'image';
      const ids = l.mask?.targetIds ?? [];
      const sameSize = ids.length === groupIds.length;
      const sameIds = sameSize && ids.every((id) => groupIds.includes(id));
      return matchesType && sameIds;
    });
    if (existing) {
      state.updateLayerProperties(existing.id, props);
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;

    for (const pid of groupIds) {
      const forma = catalog.formas.find((f) => f.pages.some((p) => p.id === pid));
      if (!forma) continue;
      const targetIdx = forma.pages.findIndex((p) => p.id === pid);
      if (targetIdx === -1) continue;
      const xOffset = forma.pages.slice(0, targetIdx).reduce((sum, p) => {
        const tp = template.pages.find((tt) => tt.pageNumber === p.pageNumber);
        return sum + (tp?.widthMm ?? 210);
      }, 0);
      const pc = template.pages.find((tp) => tp.pageNumber === forma.pages[targetIdx].pageNumber);
      const pageWidth = pc ? pc.widthMm : 210;
      let startX = xOffset + template.bleedMm;
      let endX = startX + pageWidth;
      if (targetIdx === 0) startX -= template.bleedMm;
      if (targetIdx === forma.pages.length - 1) endX += template.bleedMm;
      minX = Math.min(minX, startX);
      maxX = Math.max(maxX, endX);
    }
    if (minX === Infinity || maxX === -Infinity) return;

    const layer: Layer = {
      id: newId(),
      type: wantSolid ? 'solid' : 'image',
      name: wantSolid ? 'Zemin Rengi' : 'Zemin Gorseli',
      bounds: {
        x: minX,
        y: 0,
        w: maxX - minX,
        h: template.openHeightMm + template.bleedMm * 2,
      },
      transform: {
        rotation: 0,
        scale: 100,
        flipX: false,
        flipY: false,
        offsetX: 0,
        offsetY: 0,
      },
      mask: {
        type: groupIds.length > 1 ? 'spread' : 'page',
        targetIds: [...groupIds],
        excludeGaps: true,
      },
      zIndex: wantSolid ? 0 : 1,
      properties: { ...props },
      visible: true,
      locked: false,
    };

    state.addLayer(layer);
  },
}));
