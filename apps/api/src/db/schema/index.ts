import { relations } from 'drizzle-orm';
import { products } from './products.js';
import { productImages } from './product-images.js';

export { users } from './users.js';
export { products } from './products.js';
export { productImages } from './product-images.js';
export { mediaAssets } from './media-assets.js';
export { productTypes } from './product-types.js';
export { projects } from './projects.js';
export { orders } from './orders.js';
export { printers } from './printers.js';
export { systemTemplates } from './system-templates.js';
export { userModules } from './user-modules.js';
export { themeConfigs } from './theme.js';

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
