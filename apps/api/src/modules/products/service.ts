import { randomUUID } from 'node:crypto';
import { eq, and, desc, like, ne } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { products, productImages } from '../../db/schema/index.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';

export interface ListProductsQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  price?: number;
  category?: string;
  unit?: string;
  description?: string;
}

export const productsService = {
  async list(userId: string, query: ListProductsQuery) {
    const conditions = [eq(products.userId, userId)];

    if (query.search) {
      conditions.push(like(products.name, `%${query.search}%`));
    }
    if (query.category) {
      conditions.push(eq(products.category, query.category));
    }

    const where = and(...conditions);

    // Pagination is disabled for now, returning all matches
    const data = await db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.createdAt));

    return {
      data,
      total: data.length,
      page: 1,
      limit: data.length,
      totalPages: 1,
    };
  },

  async create(userId: string, input: CreateProductInput) {
    // Check uniqueness (userId, sku)
    const existing = await db.query.products.findFirst({
      where: and(eq(products.userId, userId), eq(products.sku, input.sku)),
      columns: { id: true },
    });
    if (existing) {
      throw new ConflictError('Bu SKU zaten kullanımda');
    }

    const id = randomUUID();
    await db.insert(products).values({
      id,
      userId,
      sku: input.sku,
      name: input.name,
      price: input.price?.toString() ?? null,
      category: input.category ?? null,
      unit: input.unit ?? null,
      description: input.description ?? null,
    });

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) throw new Error('Insert failed');
    return product;
  },

  async update(userId: string, id: string, input: Partial<CreateProductInput>) {
    // Ensure product exists and belongs to user
    const existing = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.userId, userId)),
    });
    if (!existing) {
      throw new NotFoundError('Ürün bulunamadı');
    }

    // Check SKU conflict if sku is being updated
    if (input.sku !== undefined && input.sku !== existing.sku) {
      const skuConflict = await db.query.products.findFirst({
        where: and(
          eq(products.userId, userId),
          eq(products.sku, input.sku),
          ne(products.id, id)
        ),
        columns: { id: true },
      });
      if (skuConflict) {
        throw new ConflictError('Bu SKU zaten kullanımda');
      }
    }

    const values: Record<string, unknown> = {};
    if (input.name !== undefined) values.name = input.name;
    if (input.sku !== undefined) values.sku = input.sku;
    if (input.price !== undefined) values.price = input.price?.toString() ?? null;
    if (input.category !== undefined) values.category = input.category ?? null;
    if (input.unit !== undefined) values.unit = input.unit ?? null;
    if (input.description !== undefined) values.description = input.description ?? null;

    if (Object.keys(values).length > 0) {
      const where = and(eq(products.id, id), eq(products.userId, userId));
      await db.update(products).set(values).where(where);
    }

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.userId, userId)),
    });
    if (!product) throw new NotFoundError('Ürün bulunamadı');
    return product;
  },

  async remove(userId: string, id: string) {
    const existing = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.userId, userId)),
    });
    if (!existing) {
      throw new NotFoundError('Ürün bulunamadı');
    }

    // Cascade delete: productImages first
    await db.delete(productImages).where(
      and(eq(productImages.userId, userId), eq(productImages.sku, existing.sku))
    );

    // Delete product
    await db.delete(products).where(
      and(eq(products.id, id), eq(products.userId, userId))
    );

    return { success: true };
  },
};
