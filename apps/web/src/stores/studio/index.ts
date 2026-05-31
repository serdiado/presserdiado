export { useCatalogStore } from './catalog.store';
export { useThemeStore } from '../theme.store';
export type { ThemeMode } from '../theme.store';
export { useHistoryStore } from './history.store';
export { useUIStore } from './ui.store';
export { useLayerStore } from './layer.store';
export { ModuleRegistry } from './module-registry';
export { initialGlobalSettings, defaultFooterCells, buildFormasForTemplate } from './defaults';
export type { SelectionState, SelectionType, TextElementType } from './ui.store';
export type { HistorySnapshot } from './history.store';

import { useCatalogStore } from './catalog.store';
import { useUIStore } from './ui.store';

if (import.meta.env.DEV) {
  (window as any).__stores = {
    catalog: useCatalogStore,
    ui: useUIStore,
  };
}
