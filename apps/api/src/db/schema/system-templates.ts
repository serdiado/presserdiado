import { mysqlTable, varchar, json, boolean, int } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { productTypes } from './product-types.js';

export const systemTemplates = mysqlTable('system_templates', {
  id: uuidPk(),
  productTypeId: uuidFk('product_type_id').references(() => productTypes.id).notNull(),
  name: varchar('name', { length: 500 }).notNull(),
  thumbnailKey: varchar('thumbnail_key', { length: 500 }),
  canvasData: json('canvas_data').notNull(),
  category: varchar('category', { length: 100 }),
  sortOrder: int('sort_order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
});
