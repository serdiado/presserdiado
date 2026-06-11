import { mysqlTable, varchar, mysqlEnum, json, decimal, text, timestamp, index } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { users } from './users.js';

export const orders = mysqlTable('orders', {
  id: uuidPk(),
  userId: uuidFk('user_id').references(() => users.id).notNull(),
  orderNumber: varchar('order_number', { length: 50 }).unique().notNull(),
  // ÜRETİM akışı — ödeme akışından (paymentStatus) ayrı tutulur.
  status: mysqlEnum('status', ['draft', 'submitted', 'in_production', 'shipped', 'completed', 'cancelled'])
    .default('submitted')
    .notNull(),
  // ÖDEME akışı — ayrı alan.
  paymentStatus: mysqlEnum('payment_status', ['none', 'pending', 'paid', 'refunded'])
    .default('none')
    .notNull(),
  // user_billing_profiles.id — sadece referans/iz. FK constraint YOK: profil silinse de
  // sipariş bütünlüğü billingSnapshot ile korunur.
  billingProfileId: uuidFk('billing_profile_id'),
  // Sipariş anındaki fatura bilgisi dondurulur (yasal/üretimsel kanıt).
  billingSnapshot: json('billing_snapshot'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discountTotal: decimal('discount_total', { precision: 10, scale: 2 }).default('0').notNull(),
  taxTotal: decimal('tax_total', { precision: 10, scale: 2 }).default('0').notNull(),
  grandTotal: decimal('grand_total', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('TRY').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull().onUpdateNow(),
}, (table) => [
  index('orders_user_id_created_at_idx').on(table.userId, table.createdAt),
  index('orders_status_idx').on(table.status),
]);
