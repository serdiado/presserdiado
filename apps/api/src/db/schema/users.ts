import { mysqlTable, varchar, json, timestamp } from 'drizzle-orm/mysql-core';
import { uuidPk } from './_helpers.js';

export const users = mysqlTable('users', {
  id: uuidPk(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }),
  defaultPrintPrefs: json('default_print_prefs').default({}),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull().onUpdateNow(),
});
