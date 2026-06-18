// Module registry stub. Real canvas/sidebar components are added in Faz 5.
// initialData() returns the persisted shape ports from katalog-tasarim-v2.

import type { ModuleType } from '@matbaapro/shared';

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
  cells: Array.from({ length: 16 }, (_, i) => ({
    id: `banner-inst-${i}`,
    text: '',
    colSpan: 1,
    rowSpan: 1,
    hidden: false,
    mergedInto: null,
    font: {
      fontFamily: 'Inter',
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 1.2,
      letterSpacing: 0,
      textAlign: 'center',
      verticalAlign: 'middle',
      textTransform: 'none',
      textDecoration: 'none',
      color: '#1e293b',
      opacity: 100,
      decimalScale: 100,
    },
    padding: { t: 0, r: 0, b: 0, l: 0, linked: true },
    bgColor: { type: 'solid', color: '#ffffff', opacity: 100 },
    border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: '#e2e8f0', o: 100 }, style: 'solid' },
    image: null,
  })),
});

export const ModuleRegistry: Record<NonNullable<ModuleType>, ModuleConfig> = {
  banner: { id: 'banner', label: 'Tablo Alanı', initialData: bannerInit },
};
