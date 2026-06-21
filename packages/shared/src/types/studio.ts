// Rich studio data model ported from katalog-tasarim-v2.
// Used by the DOM-based studio editor (Faz 3+). Stored as jsonb in Project.canvasData.

import type {
  BorderData,
  BorderRadiusData,
  ColorOpacity,
  ColorValue,
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
  bgColor?: ColorValue;
  containerBorder?: { color: ColorOpacity; width: number };
  radius?: BorderRadiusData;
}

// === Text Element Settings ===

export interface TextElementSettings {
  isFreePosition: boolean;
  posX: number; // 0-100 yüzde
  posY: number; // 0-100 yüzde
  bgColor?: string;
  bgOpacity?: number;
  borderColor?: string;
  borderOpacity?: number;
  borderWidth?: number;
  borderRadius?: number;
  width?: number;
  height?: number;
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
  bgOpacity?: number;
  textColor: string;
  textOpacity?: number;
  position: BadgePosition;
  shape: BadgeShape;
  borderColor: string;
  borderOpacity?: number;
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
  gridGap: number; // mm — tek kanonik hücre boşluğu (genel + özel sayfa ortak)
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
  nameSettings: TextElementSettings;
  priceSettings: TextElementSettings;
  colors: {
    cellBg: ColorValue;
    cellBorder: ColorOpacity;
    priceBg: ColorValue;
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
  /**
   * Footer GridModule (tek global). `unknown` — web-only `BannerModuleData` shared'a bağlanmasın
   * diye (mevcut `StudioSlot.moduleData: unknown` paterni). Web tarafı `as BannerModuleData` okur;
   * yoksa default'a düşer (footerSlot.resolveFooterModule). Evre 1 = tek global footer.
   */
  footerModule?: unknown;
}

// === Hazır şablon (preset) ===

/** Şablonun "boş banner alanı" işareti — sayfa içi sıralı slot indeksiyle konumlanır. */
export interface StudioPresetBannerArea {
  pageNumber: number;
  /** Sayfanın taze slot dizisindeki 0-bazlı indeks (export ↔ apply aynı semantik). */
  slotIndex: number;
  colSpan?: number;
  rowSpan?: number;
}

/**
 * Şablonun taşıdığı sayfa zemini — pageNumber bazlı, seyrek (yalnız zemini olan
 * sayfalar diziye girer). background tipi mevcut CatalogPage şemasından türetilir
 * (yeniden tanımlanmaz). pageNumber bu projede forma-bağımsız global ve sıralı →
 * export ↔ apply aynı semantik (bannerAreas ile tutarlı).
 */
export interface StudioPresetPageBackground {
  pageNumber: number;
  background: NonNullable<CatalogPage['background']>;
}

/** Tek tıkla uygulanan hazır şablon: stil (defaultGrid + footer dahil) + boş banner alanları. */
export interface StudioPreset {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  settings: DeepPartial<CatalogSettings>;
  bannerAreas?: StudioPresetBannerArea[];
  pageBackgrounds?: StudioPresetPageBackground[];
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

export type ModuleType = 'banner' | null;

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
  // gap? = REZERVE: şu an yazılmaz/okunmaz (tek kanonik gridGap kullanılır); ileride
  // sayfa-özel gap UI'ı için mimari kapı açık kalsın diye tipte tutuluyor.
  gridSettings?: { rows: number; cols: number; gap?: number };
  background?: {
    type: 'color' | 'image';
    /** Solid or gradient fill (covers former 'color' + 'gradient' page bg types). */
    value?: ColorValue;
    imageUrl?: string;
    imageSize?: 'fit' | 'fill' | 'stretch' | 'tile';
    imagePosition?:
      | 'top-left' | 'top-center' | 'top-right'
      | 'middle-left' | 'center' | 'middle-right'
      | 'bottom-left' | 'bottom-center' | 'bottom-right';
    imageOpacity?: number; // 0-100
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
