import { mysqlTable, varchar, decimal, json, timestamp, text, unique } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { users } from './users.js';

export const products = mysqlTable('products', {
  id: uuidPk(),
  userId: uuidFk('user_id').references(() => users.id).notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  name: varchar('name', { length: 500 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('TRY').notNull(),
  unit: varchar('unit', { length: 50 }),
  badge: varchar('badge', { length: 100 }),
  imageKey: varchar('image_key', { length: 500 }),
  imageThumbKey: varchar('image_thumb_key', { length: 500 }),
  category: varchar('category', { length: 100 }),
  metadata: json('metadata').default({}),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  unique('products_user_id_sku_unique').on(table.userId, table.sku),
]);
