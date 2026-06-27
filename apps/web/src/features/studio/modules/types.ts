// Module data shapes (mirror module-registry initialData()).

import type {
  BorderData,
  BorderRadiusData,
  CatalogSettings,
  ColorValue,
  DeepPartial,
  ModuleType,
  ShadowData,
  SpacingData,
  TypographyData,
} from '@matbaapro/shared';
import type { ImageSizeType, ImagePositionType } from '../pickers/ImagePickerPopover';

export interface BannerCellData {
  id: string;
  text: string;
  colSpan: number;
  rowSpan: number;
  hidden: boolean;
  mergedInto: string | null;
  font: TypographyData;
  padding: SpacingData;
  bgColor: ColorValue;
  border: BorderData;
  image: string | null;
  // Birleşik resim modeli — sayfa zemini ile AYNI (ImagePickerPopover yazar). BannerSection
  // render'ı bunlara göre çizer; yoksa geriye-uyum: eski imageMode'dan türetir.
  imageSize?: ImageSizeType; // Sığdır/Doldur/Uzat/Döşe
  imagePosition?: ImagePositionType; // 9-konum
  imageOpacity?: number; // 0-100
  // @deprecated Eski serbest-sürükle modeli — yalnız geriye-uyum (eski projeler) için OKUNUR;
  // yeni UI yazmaz. BannerSection imageSize yoksa imageMode'dan türetir (contain/free→fit, cover→fill).
  imageMode?: 'contain' | 'cover' | 'free';
  imagePosX?: number;
  imagePosY?: number;
  imageScale?: number;
}

export interface BannerModuleData {
  type: 'banner';
  rows: number;
  cols: number;
  cells: BannerCellData[];
  // Oransal (fr) kolon/satır boyutları. Opsiyonel: yoksa/uzunluk uyumsuzsa eşit-bölü
  // fallback (materializeFractions). Eski modüller migration'sız açılır. uzunluk = cols/rows.
  colFractions?: number[];
  rowFractions?: number[];
  bgColor: ColorValue;
  containerBorder: { color: { c: string; o: number }; width: number };
  radius: BorderRadiusData;
  shadow: ShadowData;
}

export type AnyModuleData = BannerModuleData;

// ─────────────────────────────────────────────────────────────────────────────
// StudioModule — kütüphanedeki hazır modül ÖRNEĞİ (TİP değil).
//
// TİP ≠ ÖRNEK: ModuleRegistry (module-registry.ts) yetenek/tipi ("boş banner")
// tutar; StudioModule tipe referans veren DOLU içeriktir ("Kırmızı Kampanya
// Banner'ı"). Presetlerin (StudioPreset) kardeşi — ama shared'da DEĞİL web'de:
// moduleData, web-only BannerModuleData'ya bağlandığı için.
//
// Payload slotRole'a göre TİP SEVİYESİNDE ayrışır (discriminated union):
//   free    → moduleData (ZORUNLU), customSettings YASAK
//   product → customSettings (ZORUNLU), moduleData YASAK
// ─────────────────────────────────────────────────────────────────────────────

/** Ortak kimlik alanları. */
interface StudioModuleBase {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  source: 'system';
}

/** free slot modülü: ModuleRegistry tipine (banner) referans + dolu içerik. */
export interface FreeStudioModule extends StudioModuleBase {
  slotRole: 'free';
  type: NonNullable<ModuleType>;
  moduleData: AnyModuleData;
  customSettings?: never;
}

/** ürün-sunuş modülü: product slotta, mevcut isCustom/customSettings katmanı üstüne. */
export interface ProductStudioModule extends StudioModuleBase {
  slotRole: 'product';
  type: 'product-presentation';
  customSettings: DeepPartial<CatalogSettings>;
  moduleData?: never;
}

export type StudioModule = FreeStudioModule | ProductStudioModule;
