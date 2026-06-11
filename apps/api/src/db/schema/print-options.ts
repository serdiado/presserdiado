import { mysqlTable, varchar, mysqlEnum, json, boolean, int, timestamp, index } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { productTypes } from './product-types.js';

export const printOptions = mysqlTable('print_options', {
  id: uuidPk(),
  productTypeId: uuidFk('product_type_id').references(() => productTypes.id).notNull(),
  category: mysqlEnum('category', [
    'size',
    'fold',
    'paper_type',
    'paper_weight',
    'color_mode',
    'coating',
    'binding',
  ]).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  // TRUE ise stüdyoda değişimi tasarımı bozar (size/fold) — tek kaynak, UI'da hardcode değil.
  affectsDesign: boolean('affects_design').default(false).notNull(),
  // Ebat için {width,height,unit} gibi ek veri.
  metadata: json('metadata'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull().onUpdateNow(),
}, (table) => [
  index('print_options_product_type_id_category_is_active_idx').on(
    table.productTypeId,
    table.category,
    table.isActive,
  ),
]);
