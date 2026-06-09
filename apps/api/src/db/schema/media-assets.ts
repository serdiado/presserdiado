import { mysqlTable, varchar, mysqlEnum, int, timestamp, index } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { users } from './users.js';

export const mediaAssets = mysqlTable('media_assets', {
  id: uuidPk(),
  userId: uuidFk('user_id').references(() => users.id).notNull(),
  type: mysqlEnum('type', ['logo', 'background', 'shape', 'other']).notNull(),
  imageKey: varchar('image_key', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }),
  mimeType: varchar('mime_type', { length: 100 }),
  size: int('size'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index('media_assets_user_id_type_idx').on(table.userId, table.type),
]);
