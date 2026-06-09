import { mysqlTable, varchar, int, boolean, timestamp, index } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { users } from './users.js';

export const productImages = mysqlTable('product_images', {
  id: uuidPk(),
  userId: uuidFk('user_id').references(() => users.id).notNull(),
  sku: varchar('sku', { length: 100 }),
  imageKey: varchar('image_key', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }),
  sortOrder: int('sort_order').default(1).notNull(),
  isTransparent: boolean('is_transparent').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index('product_images_user_id_sku_idx').on(table.userId, table.sku),
]);
