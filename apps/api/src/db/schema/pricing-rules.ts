import { mysqlTable, varchar, json, decimal, boolean, timestamp, index } from 'drizzle-orm/mysql-core';
import { uuidPk, uuidFk } from './_helpers.js';
import { productTypes } from './product-types.js';

export const pricingRules = mysqlTable('pricing_rules', {
  id: uuidPk(),
  productTypeId: uuidFk('product_type_id').references(() => productTypes.id).notNull(),
  // print_options.key referansları (esnek eşleşme). NULL = "bu kritere bakma".
  sizeKey: varchar('size_key', { length: 100 }),
  paperTypeKey: varchar('paper_type_key', { length: 100 }),
  paperWeightKey: varchar('paper_weight_key', { length: 100 }),
  colorModeKey: varchar('color_mode_key', { length: 100 }),
  coatingKey: varchar('coating_key', { length: 100 }),
  bindingKey: varchar('binding_key', { length: 100 }),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  setupFee: decimal('setup_fee', { precision: 10, scale: 2 }).default('0').notNull(),
  // [{min:100, discountPct:8}, ...] adet indirimleri.
  quantityTiers: json('quantity_tiers'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('20.00').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull().onUpdateNow(),
}, (table) => [
  index('pricing_rules_product_type_id_is_active_idx').on(table.productTypeId, table.isActive),
]);
