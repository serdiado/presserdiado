import { mysqlTable, varchar, mysqlEnum, int, json, decimal, timestamp, index } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { orders } from './orders.js';
import { projects } from './projects.js';

export const orderItems = mysqlTable('order_items', {
  id: uuidPk(),
  orderId: uuidFk('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  // Bağlı tasarım projesi (varsa).
  projectId: uuidFk('project_id').references(() => projects.id),
  itemType: mysqlEnum('item_type', ['studio_design', 'uploaded_file']).default('studio_design').notNull(),
  // product_types.slug ('brochure', pilotta sabit) — string snapshot, FK değil.
  productTypeKey: varchar('product_type_key', { length: 100 }),
  // Baskı özellikleri — sipariş anında DONDURULUR.
  quantity: int('quantity').default(1).notNull(),
  size: varchar('size', { length: 50 }),
  foldType: varchar('fold_type', { length: 50 }),
  paperType: varchar('paper_type', { length: 100 }),
  paperWeight: varchar('paper_weight', { length: 50 }),
  colorMode: varchar('color_mode', { length: 50 }),
  coating: varchar('coating', { length: 100 }),
  binding: varchar('binding', { length: 100 }),
  // İleride genişleyecek serbest alan.
  printOptions: json('print_options'),
  // Sipariş anındaki birim fiyat DONDURULUR.
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 10, scale: 2 }).notNull(),
  // MinIO object key — dondurulmuş baskı PDF'i.
  productionPdfKey: varchar('production_pdf_key', { length: 500 }),
  previewImageKey: varchar('preview_image_key', { length: 500 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
  index('order_items_project_id_idx').on(table.projectId),
]);
