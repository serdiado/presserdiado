// Module data shapes (mirror module-registry initialData()).

import type {
  BorderData,
  BorderRadiusData,
  ColorOpacity,
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
  bgColor: ColorOpacity;
  border: BorderData;
  image: string | null;
}

export interface BannerModuleData {
  type: 'banner';
  cells: BannerCellData[];
}

export interface PizzaModuleData {
  type: 'pizza';
  title: string;
  prices: string[];
  imageUrl?: string;
  colors: {
    bg: ColorOpacity;
    border: ColorOpacity;
    tableBg: ColorOpacity;
    tableTitleBg: ColorOpacity;
    cellBg: ColorOpacity;
    cellPriceBg: ColorOpacity;
    tableLine: ColorOpacity;
    imgBg: ColorOpacity;
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
