import { useCatalogStore, useLayerStore, useHistoryStore } from '@/stores/studio';
import type { BrochureTemplate, CatalogSettings, ProductInfo, TempPoolProduct, StudioForma, Layer } from '@matbaapro/shared';
import { DEFAULT_OPTIONS, DEFAULT_QUANTITY } from '@/features/print-order/constants';
import type { PrintOptionsValue } from '@/features/print-order/types';

export interface StudioCanvasData {
  version: 1;
  catalog: {
    activeTemplate: BrochureTemplate | null;
    formas: StudioForma[];
    activeFormaId: number;
    activeTab: 'outer' | 'inner';
    productPool: ProductInfo[];
    masterProductPool?: ProductInfo[]; // for backward compatibility
    tempProductPool: TempPoolProduct[];
    globalSettings: CatalogSettings;
    // Baskı özellikleri + adet — web/sihirbazdan taşınır (S6). Eski projelerde yok → guard ile default.
    printOptions?: PrintOptionsValue;
    quantity?: number;
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
      tempProductPool: c.tempProductPool,
      globalSettings: c.globalSettings,
      printOptions: c.printOptions,
      quantity: c.quantity,
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
    tempProductPool: data.catalog.tempProductPool ?? [],
    globalSettings: {
      ...gs,
      imageScale: 100,
      imagePosX: 0,
      imagePosY: 0,
      imageEditMode: false,
    },
    // Guard: eski projelerde printOptions/quantity yok → default'a düş.
    printOptions: data.catalog.printOptions ?? { ...DEFAULT_OPTIONS },
    quantity: data.catalog.quantity ?? DEFAULT_QUANTITY,
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
