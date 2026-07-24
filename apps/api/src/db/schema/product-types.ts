import { mysqlTable, varchar, json, decimal, boolean, int, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';
import { uuidPk } from './_helpers.js';

export const productTypes = mysqlTable('product_types', {
  id: uuidPk(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  category: varchar('category', { length: 100 }),
  // Vitrin satış modu: design = stüdyoda tasarla, upload = hazır dosya yükle, quote = teklif al.
  // Default 'design' → mevcut brochure satırı migration'da doğru değeri alır.
  saleMode: mysqlEnum('sale_mode', ['design', 'upload', 'quote']).default('design').notNull(),
  // Vitrin kart/detay açıklaması (kısa pazarlama metni).
  description: varchar('description', { length: 500 }),
  dimensions: json('dimensions').notNull(),
  bleedMm: decimal('bleed_mm', { precision: 4, scale: 1 }).default('3.0').notNull(),
  defaultGrid: json('default_grid').default({ cols: 4, rows: 4 }).notNull(),
  configSchema: json('config_schema').notNull(),
  basePriceTable: json('base_price_table'),
  active: boolean('active').default(true).notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull().onUpdateNow(),
});
