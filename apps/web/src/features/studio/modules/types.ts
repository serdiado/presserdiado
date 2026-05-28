// Module data shapes (mirror module-registry initialData()).

import type {
  BorderData,
  BorderRadiusData,
  ColorOpacity,
  ColorValue,
  ShadowData,
  SpacingData,
  TypographyData,
} from '@matbaapro/shared';

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
  imageMode: 'contain' | 'cover' | 'free';
  imagePosX: number;
  imagePosY: number;
  imageScale: number;
}

export interface BannerModuleData {
  type: 'banner';
  rows: number;
  cols: number;
  cells: BannerCellData[];
  bgColor: ColorValue;
  containerBorder: { color: { c: string; o: number }; width: number };
  radius: BorderRadiusData;
  shadow: ShadowData;
}

export interface PizzaModuleData {
  type: 'pizza';
  title: string;
  prices: string[];
  imageUrl?: string;
  colors: {
    bg: ColorValue;
    border: ColorOpacity;
    tableBg: ColorValue;
    tableTitleBg: ColorValue;
    cellBg: ColorValue;
    cellPriceBg: ColorValue;
    tableLine: ColorOpacity;
    imgBg: ColorValue;
    imgBorder: ColorOpacity;
  };
  fonts: {
    title: TypographyData;
    tableTitle: TypographyData;
    sizes: TypographyData;
    prices: TypographyData;
  };
  radiuses: {
    container: BorderRadiusData;
    table: BorderRadiusData;
    image: BorderRadiusData;
  };
  spacings: {
    container: SpacingData;
    tableTitle: SpacingData;
    cell: SpacingData;
  };
  shadows: {
    container: ShadowData;
    table: ShadowData;
    image: ShadowData;
    cell: ShadowData;
  };
  tableLineWidth: number;
}

export type AnyModuleData = BannerModuleData | PizzaModuleData;
