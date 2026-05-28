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
    bgColor: { type: 'solid', color: '#ffffff', opacity: 0 },
    border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: '#e2e8f0', o: 100 }, style: 'solid' },
    image: null,
  })),
});

const pizzaInit = () => ({
  type: 'pizza',
  title: 'PIZZA-MENU',
  prices: Array(19).fill(''),
  colors: {
    bg: { type: 'solid', color: '#ffffff', opacity: 100 },
    border: { c: '#1e293b', o: 100 },
    tableBg: { type: 'solid', color: '#ffffff', opacity: 100 },
    tableTitleBg: { type: 'solid', color: '#1e293b', opacity: 100 },
    cellBg: { type: 'solid', color: '#f1f5f9', opacity: 100 },
    cellPriceBg: { type: 'solid', color: '#ffffff', opacity: 100 },
    tableLine: { c: '#cbd5e1', o: 100 },
    imgBg: { type: 'solid', color: '#f8fafc', opacity: 100 },
    imgBorder: { c: '#94a3b8', o: 100 },
  },
  fonts: {
    title: { fontFamily: 'Inter', fontWeight: '900', fontSize: 18, lineHeight: 1.2, letterSpacing: 0, textAlign: 'center', textTransform: 'uppercase', textDecoration: 'none', color: '#0f172a', opacity: 100, verticalAlign: 'middle', decimalScale: 100 },
    tableTitle: { fontFamily: 'Inter', fontWeight: '700', fontSize: 11, lineHeight: 1.2, letterSpacing: 0, textAlign: 'center', textTransform: 'uppercase', textDecoration: 'none', color: '#ffffff', opacity: 100, verticalAlign: 'middle', decimalScale: 100 },
    sizes: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, lineHeight: 1.2, letterSpacing: 0, textAlign: 'center', textTransform: 'none', textDecoration: 'none', color: '#000000', opacity: 100, verticalAlign: 'middle', decimalScale: 100 },
    prices: { fontFamily: 'Inter', fontWeight: '900', fontSize: 12, lineHeight: 1.2, letterSpacing: 0, textAlign: 'center', textTransform: 'none', textDecoration: 'none', color: '#dc2626', opacity: 100, verticalAlign: 'middle', decimalScale: 100 },
  },
  radiuses: {
    container: { tl: 8, tr: 8, bl: 8, br: 8, linked: true },
    table: { tl: 4, tr: 4, bl: 4, br: 4, linked: true },
    image: { tl: 4, tr: 4, bl: 4, br: 4, linked: true },
  },
  spacings: {
    container: { t: 16, r: 16, b: 16, l: 16, linked: true },
    tableTitle: { t: 6, r: 8, b: 6, l: 8, linked: false },
    cell: { t: 0, r: 0, b: 0, l: 0, linked: true },
  },
  shadows: {
    container: { x: 0, y: 4, blur: 10, spread: -1, color: '#000000', opacity: 5, active: true },
    table: { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 10, active: false },
    image: { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 10, active: false },
    cell: { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 10, active: false },
  },
  tableLineWidth: 2,
});

export const ModuleRegistry: Record<NonNullable<ModuleType>, ModuleConfig> = {
  banner: { id: 'banner', label: 'Tablo Alanı', initialData: bannerInit },
  pizza: { id: 'pizza', label: 'Pizza Menusu', initialData: pizzaInit },
};
