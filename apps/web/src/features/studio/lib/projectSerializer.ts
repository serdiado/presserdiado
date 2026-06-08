import { useCatalogStore, useLayerStore, useHistoryStore } from '@/stores/studio';
import type { BrochureTemplate, CatalogSettings, ProductInfo, TempPoolProduct, StudioForma, Layer } from '@matbaapro/shared';

export interface StudioCanvasData {
  version: 1;
  catalog: {
    activeTemplate: BrochureTemplate | null;
    formas: StudioForma[];
    activeFormaId: number;
    activeTab: 'outer' | 'inner';
    productPool: ProductInfo[];
    masterProductPool: ProductInfo[];
    tempProductPool: TempPoolProduct[];
    globalSettings: CatalogSettings;
  };
  layers: Layer[];
  exportedAt: string;
}

export interface ProjectFile {
  version: 1;
  name: string;
  canvasData: StudioCanvasData;
  exportedAt: string;
}

export function serializeStudioState(): StudioCanvasData {
  const c = useCatalogStore.getState();
  const l = useLayerStore.getState();
  return {
    version: 1,
    catalog: {
      activeTemplate: c.activeTemplate,
      formas: c.formas,
      activeFormaId: c.activeFormaId,
      activeTab: c.activeTab,
      productPool: c.productPool,
      masterProductPool: c.masterProductPool,
      tempProductPool: c.tempProductPool,
      globalSettings: c.globalSettings,
    },
    layers: l.layers,
    exportedAt: new Date().toISOString(),
  };
}

export function deserializeStudioState(data: StudioCanvasData) {
  if (!data || !data.catalog?.formas) {
    throw new Error('Geçersiz veya bozuk proje formatı');
  }

  const gs = data.catalog.globalSettings ?? {};
  useCatalogStore.setState({
    activeTemplate: data.catalog.activeTemplate as BrochureTemplate,
    formas: data.catalog.formas,
    activeFormaId: data.catalog.activeFormaId ?? 1,
    activeTab: data.catalog.activeTab ?? 'outer',
    productPool: data.catalog.productPool ?? [],
    masterProductPool: data.catalog.masterProductPool ?? [],
    tempProductPool: data.catalog.tempProductPool ?? [],
    globalSettings: {
      ...gs,
      imageScale: 100,
      imagePosX: 0,
      imagePosY: 0,
      imageEditMode: false,
    },
    copiedSlotSettings: null,
    isDirty: false,
  });

  useLayerStore.setState({
    layers: data.layers ?? [],
    selectedPageIds: [],
  });

  useHistoryStore.getState().clearHistory();
}

export function serializeProjectFile(): ProjectFile {
  const c = useCatalogStore.getState();
  return {
    version: 1,
    name: c.projectName,
    canvasData: serializeStudioState(),
    exportedAt: new Date().toISOString(),
  };
}

export function deserializeProjectFile(file: ProjectFile) {
  if (!file || !file.canvasData) {
    throw new Error('Geçersiz proje dosyası formatı');
  }
  deserializeStudioState(file.canvasData);
  useCatalogStore.setState({ projectName: file.name || 'İsimsiz Proje' });
}
