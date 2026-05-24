// Initial values, default factories, and template-driven builders for the studio.

import {
  Template1,
  availableTemplates,
  defaultBorder,
  defaultRadius,
  defaultShadow,
  defaultSpacing,
  defaultTypography,
  type BrochureTemplate,
  type CatalogPage,
  type CatalogSettings,
  type StudioFooterCell,
  type StudioForma,
  type StudioSlot,
} from '@matbaapro/shared';

export { Template1, availableTemplates };

export function defaultFooterCells(): StudioFooterCell[] {
  const base = (id: string, colSpan: number, hidden: boolean, mergedInto: string | null, text = '') => ({
    id,
    colSpan,
    text,
    image: null,
    hidden,
    mergedInto,
    font: { ...defaultTypography },
    padding: { ...defaultSpacing, t: 2, r: 2, b: 2, l: 2 },
    bgColor: { c: '#ffffff', o: 0 },
    border: { ...defaultBorder, color: { c: '#e2e8f0', o: 100 } },
  });

  return [
    base('fc-1', 1, false, null),
    { ...base('fc-2', 4, false, null, 'Sayfa altı notu...'), font: { ...defaultTypography, textAlign: 'right' } },
    base('fc-3', 1, true, 'fc-2'),
    base('fc-4', 1, true, 'fc-2'),
    base('fc-5', 1, true, 'fc-2'),
  ];
}

export const initialGlobalSettings: CatalogSettings = {
  defaultGrid: { rows: 4, cols: 4 },
  gridGap: 2,
  borderWidth: 1,
  priceBorderWidth: 0,
  pricePosition: 'right',
  priceWidth: 30,
  priceHeight: 8,
  imageScale: 100,
  imagePosX: 0,
  imagePosY: 0,
  imageEditMode: false,
  badge: {
    active: false,
    text: 'YENI',
    bgColor: '#e60000',
    textColor: '#ffffff',
    position: 'top-left',
    shape: 'rectangle',
    borderColor: '#ffffff',
    borderWidth: 2,
    font: {
      ...defaultTypography,
      fontFamily: 'Inter',
      fontWeight: '900',
      fontSize: 10,
      textAlign: 'center',
      color: '#ffffff',
    },
    shadow: { ...defaultShadow, active: false },
    size: 100,
    isFreePosition: false,
    posX: 0,
    posY: 0,
  },
  colors: {
    cellBg: { type: 'solid', color: '#ffffff', opacity: 100 },
    cellBorder: { c: '#e2e8f0', o: 100 },
    priceBg: { type: 'solid', color: '#e60000', opacity: 100 },
    priceBorder: { c: '#ffffff', o: 100 },
  },
  radiuses: {
    cell: { ...defaultRadius, tl: 0, tr: 0, bl: 0, br: 0 },
    price: { ...defaultRadius, tl: 0, tr: 0, bl: 0, br: 0, linked: true },
  },
  fonts: {
    productName: {
      ...defaultTypography,
      fontFamily: 'Inter',
      fontWeight: '700',
      fontSize: 10,
      lineHeight: 1.2,
      textAlign: 'center',
      verticalAlign: 'middle',
      color: '#1e293b',
    },
    price: {
      ...defaultTypography,
      fontFamily: 'Inter',
      fontWeight: '700',
      fontSize: 20,
      lineHeight: 1.2,
      textAlign: 'center',
      verticalAlign: 'middle',
      color: '#ffffff',
      decimalScale: 40,
    },
  },
  spacings: { cell: { ...defaultSpacing, t: 8, r: 8, b: 8, l: 8 } },
  shadows: { cell: { ...defaultShadow, active: false } },
  footer: { heightMm: 15, cells: defaultFooterCells() },
};

export function createPageSlots(pageNumber: number, count: number): StudioSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `page-${pageNumber}-slot-${i + 1}`,
    colSpan: 1,
    rowSpan: 1,
    product: null,
    hidden: false,
    mergedInto: null,
    isCustom: false,
    role: 'product',
  }));
}

export function buildPagesForTemplate(template: BrochureTemplate): CatalogPage[] {
  return template.pages.map((p) => ({
    id: `page-${p.pageNumber}`,
    pageNumber: p.pageNumber,
    slots: createPageSlots(p.pageNumber, 16),
    footerText: 'Sayfa altı notu...',
    footerLogo: null,
    footerMode: 'global',
    customFooter: null,
  }));
}

export function buildFormasForTemplate(template: BrochureTemplate): StudioForma[] {
  const pages = buildPagesForTemplate(template);
  const splitIndex = Math.ceil(pages.length / 2);
  const initialGroups = (formPages: CatalogPage[]) => formPages.map((p) => [p.id]);
  const p1 = pages.slice(0, splitIndex);
  const p2 = pages.slice(splitIndex);

  return [
    { id: 1, name: 'Forma 1 (Kapaklar)', pages: p1, pageMergeGroups: initialGroups(p1) },
    { id: 2, name: 'Forma 2 (Ic Sayfalar)', pages: p2, pageMergeGroups: initialGroups(p2) },
  ];
}

export function clone<T>(value: T): T {
  const sc = (globalThis as { structuredClone?: <V>(v: V) => V }).structuredClone;
  return sc ? sc(value) : (JSON.parse(JSON.stringify(value)) as T);
}

export function isObject(item: unknown): item is Record<string, unknown> {
  return !!item && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge<A extends Record<string, unknown>, B extends Record<string, unknown>>(
  target: A,
  source: B,
): A & B {
  if (!target) return source as A & B;
  if (!source) return target as A & B;
  const output: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = (source as Record<string, unknown>)[key];
    const tgtVal = (target as Record<string, unknown>)[key];
    if (isObject(srcVal) && isObject(tgtVal)) {
      output[key] = deepMerge(tgtVal, srcVal);
    } else {
      output[key] = srcVal;
    }
  }
  return output as A & B;
}
