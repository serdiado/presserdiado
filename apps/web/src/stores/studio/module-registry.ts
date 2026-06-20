// Module registry stub. Real canvas/sidebar components are added in Faz 5.
// initialData() returns the persisted shape ports from katalog-tasarim-v2.

import type { ModuleType } from '@matbaapro/shared';
// Kanonik boş hücre TEK KAYNAK: makeCell ile aynı yerden beslenir (drift yok). Cycle yok —
// gridMutate yalnız ./types + ./fractions import eder, module-registry'ye geri bağı yoktur.
import { defaultBannerCell } from '../../features/studio/modules/gridMutate';

export interface ModuleConfig {
  id: string;
  label: string;
  initialData: () => Record<string, unknown>;
}

const bannerInit = () => ({
  type: 'banner',
  rows: 4,
  cols: 4,
  bgColor: { type: 'solid', color: '#ffffff', opacity: 100 },
  containerBorder: { color: { c: '#e2e8f0', o: 100 }, width: 0 },
  radius: { tl: 0, tr: 0, bl: 0, br: 0, linked: true },
  shadow: { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0, active: false },
  cells: Array.from({ length: 16 }, (_, i) => defaultBannerCell(`banner-inst-${i}`)),
});

export const ModuleRegistry: Record<NonNullable<ModuleType>, ModuleConfig> = {
  banner: { id: 'banner', label: 'Tablo Alanı', initialData: bannerInit },
};
