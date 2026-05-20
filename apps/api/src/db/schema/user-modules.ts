import { mysqlTable, varchar, json, timestamp } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { users } from './users.js';

export const userModules = mysqlTable('user_modules', {
  id: uuidPk(),
  userId: uuidFk('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 500 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  moduleData: json('module_data').notNull(),
  thumbnailKey: varchar('thumbnail_key', { length: 500 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
});
