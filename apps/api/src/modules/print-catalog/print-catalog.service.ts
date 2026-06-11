// Katalog okuma (salt-okunur) — PrintOptionsSelector (S5) ve web ürün seçimi (S6) buradan
// beslenir. Katalog YÖNETİMİ (CRUD) burada yok; o ayrı admin epic.
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { productTypes, printOptions } from '../../db/schema/index.js';
import { NotFoundError } from '../../lib/errors.js';

export interface CatalogOption {
  key: string;
  label: string;
  affectsDesign: boolean;
  metadata: unknown;
  sortOrder: number;
}

export interface ProductTypeOptions {
  productType: { key: string; name: string };
  options: Record<string, CatalogOption[]>;
}

export const printCatalogService = {
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
      productType: { key: productType.slug, name: productType.name },
      options,
    };
  },
};
