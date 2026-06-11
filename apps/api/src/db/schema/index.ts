import { relations } from 'drizzle-orm';
import { products } from './products.js';
import { productImages } from './product-images.js';
import { users } from './users.js';
import { projects } from './projects.js';
import { productTypes } from './product-types.js';
import { orders } from './orders.js';
import { orderItems } from './order-items.js';
import { printOptions } from './print-options.js';
import { pricingRules } from './pricing-rules.js';

export { users } from './users.js';
export { products } from './products.js';
export { productImages } from './product-images.js';
export { mediaAssets } from './media-assets.js';
export { productTypes } from './product-types.js';
export { projects } from './projects.js';
export { orders } from './orders.js';
export { orderItems } from './order-items.js';
export { printOptions } from './print-options.js';
export { pricingRules } from './pricing-rules.js';
export { printers } from './printers.js';
export { systemTemplates } from './system-templates.js';
export { userModules } from './user-modules.js';
export { themeConfigs } from './theme.js';
export { billingProfiles } from './billing-profiles.js';

// Soft Relations (foreign key içermeyen, uygulama katmanında join sağlayan ilişkiler)
export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.userId, productImages.sku],
    references: [products.userId, products.sku],
  }),
}));

// Sipariş modülü ilişkileri
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  project: one(projects, {
    fields: [orderItems.projectId],
    references: [projects.id],
  }),
}));

// Katalog ilişkileri
export const productTypesRelations = relations(productTypes, ({ many }) => ({
  printOptions: many(printOptions),
  pricingRules: many(pricingRules),
}));

export const printOptionsRelations = relations(printOptions, ({ one }) => ({
  productType: one(productTypes, {
    fields: [printOptions.productTypeId],
    references: [productTypes.id],
  }),
}));

export const pricingRulesRelations = relations(pricingRules, ({ one }) => ({
  productType: one(productTypes, {
    fields: [pricingRules.productTypeId],
    references: [productTypes.id],
  }),
}));
