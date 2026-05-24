// Brochure templates — physical fold definitions for catalog products.

export type FoldType = 'roll-fold' | 'z-fold' | 'half-fold' | 'none';

export interface PageTemplateConfig {
  pageNumber: number;
  widthMm: number;
  safeZone: [number, number, number, number]; // top, right, bottom, left
}

export interface BrochureTemplate {
  id: string;
  name: string;
  designType?: string;
  paperSize?: string;
  mode?: string;
  pageCount: number;
  foldCount: number;
  foldType: FoldType;
  wizardSelection?: Record<string, string>;
  openWidthMm: number;
  openHeightMm: number;
  bleedMm: number;
  safeAreaMm?: number;
  defaultGrid?: string;
  pages: PageTemplateConfig[];
}

export const Template1: BrochureTemplate = {
  id: 'template-6-page-roll',
  name: 'A4 6 Sayfa Iceri Kirimli Brosur',
  pageCount: 6,
  foldCount: 2,
  foldType: 'roll-fold',
  openWidthMm: 627,
  openHeightMm: 297,
  bleedMm: 2,
  pages: [
    { pageNumber: 5, widthMm: 207, safeZone: [5, 5, 5, 5] },
    { pageNumber: 6, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 1, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 2, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 3, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 4, widthMm: 207, safeZone: [5, 5, 5, 5] },
  ],
};

export const Template2: BrochureTemplate = {
  id: 'template-4-page-half',
  name: 'A4 4 Sayfa Ortadan Kirimli',
  pageCount: 4,
  foldCount: 1,
  foldType: 'half-fold',
  openWidthMm: 420,
  openHeightMm: 297,
  bleedMm: 2,
  pages: [
    { pageNumber: 4, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 1, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 2, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 3, widthMm: 210, safeZone: [5, 5, 5, 5] },
  ],
};

export const availableTemplates: BrochureTemplate[] = [Template1, Template2];

export function getTemplateById(id: string): BrochureTemplate | undefined {
  return availableTemplates.find((t) => t.id === id);
}

export const DEFAULT_SLOTS_PER_PAGE = 16; // 4x4 grid baseline
