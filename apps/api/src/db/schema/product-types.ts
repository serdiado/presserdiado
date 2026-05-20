import { mysqlTable, varchar, json, decimal, boolean, int } from 'drizzle-orm/mysql-core';
import { uuidPk } from './_helpers.js';

export const productTypes = mysqlTable('product_types', {
  id: uuidPk(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  category: varchar('category', { length: 100 }),
  dimensions: json('dimensions').notNull(),
  bleedMm: decimal('bleed_mm', { precision: 4, scale: 1 }).default('3.0').notNull(),
  defaultGrid: json('default_grid').default({ cols: 4, rows: 4 }).notNull(),
  configSchema: json('config_schema').notNull(),
  basePriceTable: json('base_price_table'),
  active: boolean('active').default(true).notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
});
