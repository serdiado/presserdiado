// Rich studio data model ported from katalog-tasarim-v2.
// Used by the DOM-based studio editor (Faz 3+). Stored as jsonb in Project.canvasData.

import type {
  BorderData,
  BorderRadiusData,
  ColorOpacity,
  ShadowData,
  SpacingData,
  TypographyData,
} from './design-tokens.js';

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// === Footer system ===

export interface StudioFooterCell {
  id: string;
  colSpan: number;
  text: string;
  image: string | null;
  hidden: boolean;
  mergedInto: string | null;
  font: TypographyData;
  padding: SpacingData;
  bgColor: ColorOpacity;
  border: BorderData;
}

export interface FooterSettings {
  heightMm: number;
  cells: StudioFooterCell[];
}

// === Badge ===

export type BadgePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
export type BadgeShape =
  | 'rectangle'
  | 'pill'
  | 'circle'
  | 'banner'
  | 'burst'
  | 'flama';

export interface BadgeConfig {
  active: boolean;
  text: string;
  bgColor: string;
  textColor: string;
  position: BadgePosition;
  shape: BadgeShape;
  borderColor: string;
  borderWidth: number;
  font: TypographyData;
  shadow: ShadowData;
  size: number; // 0-200 (percentage)
  isFreePosition: boolean;
  posX: number;
  posY: number;
}

// === Catalog (page-level) settings ===

export interface CatalogSettings {
  defaultGrid: { rows: number; cols: number };
  gridGap: number; // mm
  borderWidth: number;
  priceBorderWidth: number;
  pricePosition: 'left' | 'center' | 'right';
  priceWidth: number; // %
  priceHeight: number; // mm
  imageScale: number;
  imagePosX: number;
  imagePosY: number;
  imageEditMode: boolean;
  badge: BadgeConfig;
  colors: {
    cellBg: ColorOpacity;
    cellBorder: ColorOpacity;
    priceBg: ColorOpacity;
    priceBorder: ColorOpacity;
  };
  radiuses: {
    cell: BorderRadiusData;
    price: BorderRadiusData;
  };
  fonts: {
    productName: TypographyData;
    price: TypographyData;
  };
  spacings: {
    cell: SpacingData;
  };
  shadows: {
    cell: ShadowData;
  };
  footer: FooterSettings;
}

// === Product / temp pool ===

export interface ProductInfo {
  id?: string;
  name?: string;
  price?: string;
  image?: string;
  sku?: string;
  category?: string;
  raw?: unknown;
  [key: string]: unknown;
}

export interface TempPoolProduct extends ProductInfo {
  originalPage?: number;
  originalSlotId?: string;
}

// === Slot (rich) ===

export type StudioSlotRole = 'product' | 'free';

export interface StudioSlotImageSettings {
  scale?: number;
  posX?: number;
  posY?: number;
  editMode?: boolean;
}

export interface StudioSlotGridPosition {
  colStart: number; // 1-indexed CSS grid line
  rowStart: number;
}

export type ModuleType = 'banner' | 'pizza' | null;

export interface StudioSlot {
  id: string;
  colSpan: number;
  rowSpan: number;
  product: ProductInfo | null;
  hidden?: boolean;
  mergedInto?: string | null;
  isCustom?: boolean;
  customSettings?: DeepPartial<CatalogSettings>;
  imageSettings?: StudioSlotImageSettings;
  role?: StudioSlotRole;
  moduleType?: ModuleType;
  moduleData?: unknown;
  gridPosition?: StudioSlotGridPosition;
  globalNumber?: number;
}

// === Page / forma ===

export type PageFooterMode = 'global' | 'custom' | 'hidden';

export interface PageHeaderData {
  logoUrl: string;
  title: string;
  date: string;
  no: string;
}

export interface CatalogPage {
  id: string;
  pageNumber: number;
  slots: StudioSlot[];
  footerText: string;
  footerLogo: string | null;
  headerData?: PageHeaderData;
  footerMode: PageFooterMode;
  customFooter: FooterSettings | null;
  gridSettings?: { rows: number; cols: number };
  background?: {
    type: 'color' | 'gradient' | 'image';
    color?: ColorOpacity;
    gradient?: import('./layer.js').LayerGradientConfig;
    imageUrl?: string;
    overlay?: {
      imageUrl?: string;
      blendMode?: string;
      opacity?: number;
    };
  };
}

export interface StudioForma {
  id: number;
  name: string;
  pages: CatalogPage[];
  pageMergeGroups: string[][];
}
