import { mysqlTable, varchar, json, int, decimal, timestamp } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { users } from './users.js';
import { projects } from './projects.js';
import { printers } from './printers.js';

export const orders = mysqlTable('orders', {
  id: uuidPk(),
  userId: uuidFk('user_id').references(() => users.id).notNull(),
  projectId: uuidFk('project_id').references(() => projects.id).notNull(),
  printConfig: json('print_config').notNull(),
  quantity: int('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  commissionRate: decimal('commission_rate', { precision: 4, scale: 2 }),
  commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 30 }).default('pending').notNull(),
  printerId: uuidFk('printer_id').references(() => printers.id),
  exportPdfKey: varchar('export_pdf_key', { length: 500 }),
  paymentRef: varchar('payment_ref', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull().onUpdateNow(),
});
