export interface ProductType {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  dimensions: {
    widthMm: number;
    heightMm: number;
    folds: number;
    pagesPerForma: number;
  };
  bleedMm: number;
  defaultGrid: { cols: number; rows: number };
  configSchema: ConfigSchema;
  basePriceTable: PriceTableEntry[] | null;
  active: boolean;
  sortOrder: number;
}

export interface ConfigSchema {
  steps: ConfigStep[];
}

export interface ConfigStep {
  title: string;
  fields: ConfigField[];
}

export interface ConfigField {
  key: string;
  type: 'select' | 'number' | 'checkbox';
  label: string;
  options?: ConfigOption[];
  default?: string | number | boolean;
}

export interface ConfigOption {
  value: string;
  label: string;
  priceModifier: number;
}

export interface PriceTableEntry {
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
}
