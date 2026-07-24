// Katalog okuma (salt-okunur) — PrintOptionsSelector (S5) ve web ürün seçimi (S6) buradan
// beslenir. Katalog YÖNETİMİ (CRUD) burada yok; o ayrı admin epic.
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { productTypes, printOptions, pricingRules } from '../../db/schema/index.js';
import { NotFoundError } from '../../lib/errors.js';

export interface CatalogOption {
  key: string;
  label: string;
  affectsDesign: boolean;
  metadata: unknown;
  sortOrder: number;
}

export interface CatalogProductType {
  key: string;
  name: string;
  category: string | null;
  description: string | null;
  saleMode: 'design' | 'upload' | 'quote';
  dimensions: unknown;
  configSchema: unknown;
  sortOrder: number;
}

export interface ProductTypeOptions {
  productType: CatalogProductType;
  options: Record<string, CatalogOption[]>;
}

// Paket kuralı (pricing_rules.quantity dolu) — UI geçerli adet listesini + kart fiyat
// etiketini bundan türetir. Bağlayıcı/nihai fiyat yine tek kaynaktan (POST /pricing/quote).
export interface CatalogPackage {
  quantity: number;
  sizeKey: string | null;
  paperTypeKey: string | null;
  paperWeightKey: string | null;
  colorModeKey: string | null;
  coatingKey: string | null;
  bindingKey: string | null;
  // Kart/liste fiyat etiketi için (KDV hariç taban paket fiyatı) + oran.
  basePrice: string;
  taxRate: string;
}

function toCatalogProductType(row: typeof productTypes.$inferSelect): CatalogProductType {
  return {
    key: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    saleMode: row.saleMode,
    dimensions: row.dimensions,
    configSchema: row.configSchema,
    sortOrder: row.sortOrder,
  };
}

export const printCatalogService = {
  // Vitrin ürün grid'i buradan beslenir (aktif ürün tipleri, sortOrder sıralı).
  async listProductTypes(): Promise<CatalogProductType[]> {
    const rows = await db
      .select()
      .from(productTypes)
      .where(eq(productTypes.active, true))
      .orderBy(asc(productTypes.sortOrder), asc(productTypes.name));
    return rows.map(toCatalogProductType);
  },

  async getProductTypeOptions(key: string): Promise<ProductTypeOptions> {
    const productType = await db.query.productTypes.findFirst({
      where: and(eq(productTypes.slug, key), eq(productTypes.active, true)),
    });
    if (!productType) {
      throw new NotFoundError(`Ürün tipi bulunamadı: ${key}`);
    }

    const rows = await db
      .select()
      .from(printOptions)
      .where(and(eq(printOptions.productTypeId, productType.id), eq(printOptions.isActive, true)))
      .orderBy(asc(printOptions.category), asc(printOptions.sortOrder));

    const options: Record<string, CatalogOption[]> = {};
    for (const row of rows) {
      (options[row.category] ??= []).push({
        key: row.key,
        label: row.label,
        affectsDesign: row.affectsDesign,
        metadata: row.metadata,
        sortOrder: row.sortOrder,
      });
    }

    return {
      productType: toCatalogProductType(productType),
      options,
    };
  },

  // Paket kuralları (quantity dolu) — UI, seçili komboya uyan adetleri bundan çıkarır.
  async listProductTypePackages(key: string): Promise<CatalogPackage[]> {
    const productType = await db.query.productTypes.findFirst({
      where: and(eq(productTypes.slug, key), eq(productTypes.active, true)),
    });
    if (!productType) {
      throw new NotFoundError(`Ürün tipi bulunamadı: ${key}`);
    }

    const rows = await db
      .select()
      .from(pricingRules)
      .where(and(
        eq(pricingRules.productTypeId, productType.id),
        eq(pricingRules.isActive, true),
        isNotNull(pricingRules.quantity),
      ))
      .orderBy(asc(pricingRules.quantity));

    return rows.map((r) => ({
      quantity: r.quantity as number,
      sizeKey: r.sizeKey,
      paperTypeKey: r.paperTypeKey,
      paperWeightKey: r.paperWeightKey,
      colorModeKey: r.colorModeKey,
      coatingKey: r.coatingKey,
      bindingKey: r.bindingKey,
      basePrice: r.basePrice,
      taxRate: r.taxRate,
    }));
  },
};
