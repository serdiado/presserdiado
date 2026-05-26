import { mysqlTable, varchar, json, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { uuidPk } from './_helpers.js';

export const themeConfigs = mysqlTable('theme_configs', {
  id:        uuidPk(),
  mode:      varchar('mode', { length: 5 }).notNull(), // 'light' | 'dark'
  tokens:    json('tokens').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull().onUpdateNow(),
}, (t) => [uniqueIndex('theme_configs_mode_unique').on(t.mode)]);
