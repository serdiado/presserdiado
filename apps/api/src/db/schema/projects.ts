import { mysqlTable, varchar, json, timestamp } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { users } from './users.js';
import { productTypes } from './product-types.js';

export const projects = mysqlTable('projects', {
  id: uuidPk(),
  userId: uuidFk('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 500 }).notNull(),
  productTypeId: uuidFk('product_type_id').references(() => productTypes.id).notNull(),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  canvasData: json('canvas_data').notNull(),
  thumbnailKey: varchar('thumbnail_key', { length: 500 }),
  printConfig: json('print_config').default({}),
  autoSavedAt: timestamp('auto_saved_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull().onUpdateNow(),
});
