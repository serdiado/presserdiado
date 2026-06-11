import { boolean, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { uuidFk, uuidPk } from './_helpers.js';
import { users } from './users.js';

export const billingProfiles = mysqlTable('user_billing_profiles', {
  id: uuidPk(),
  userId: uuidFk('user_id').references(() => users.id).notNull(),
  type: mysqlEnum('type', ['individual', 'corporate']).default('corporate').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  taxOffice: varchar('tax_office', { length: 150 }),
  taxNumber: varchar('tax_number', { length: 20 }),
  idNumber: varchar('id_number', { length: 11 }),
  invoiceAddress: text('invoice_address').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull().onUpdateNow(),
});