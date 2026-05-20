import { randomUUID } from 'node:crypto';
import { eq, and, like, count } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { products } from '../../db/schema/index.js';
import { NotFoundError } from '../../lib/errors.js';

interface CreateProductInput {
  sku?: string;
  name: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  unit?: string;
  badge?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

interface ListQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

export const catalogService = {
  async list(userId: string, query: ListQuery) {
    const conditions = [eq(products.userId, userId)];

    // MySQL `LIKE` is case-insensitive when the column collation is *_ci
    // (default utf8mb4_0900_ai_ci). No ILIKE needed.
    if (query.search) {
      conditions.push(like(products.name, `%${query.search}%`));
    }
    if (query.category) {
      conditions.push(eq(products.category, query.category));
    }

    const where = and(...conditions);
    const offset = (query.page - 1) * query.limit;

    const [data, totalRows] = await Promise.all([
      db
        .select()
        .from(products)
        .where(where)
        .limit(query.limit)
        .offset(offset)
        .orderBy(products.createdAt),
      db.select({ total: count() }).from(products).where(where),
    ]);
    const total = Number(totalRows[0]?.total ?? 0);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  },

  async getById(userId: string, id: string) {
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.userId, userId)),
    });
    if (!product) throw new NotFoundError('Ürün bulunamadı');
    return product;
  },

  async create(userId: string, input: CreateProductInput) {
    const id = randomUUID();
    await db.insert(products).values({
      id,
      userId,
      sku: input.sku ?? null,
      name: input.name,
      price: input.price?.toString() ?? null,
      originalPrice: input.originalPrice?.toString() ?? null,
      currency: input.currency ?? 'TRY',
      unit: input.unit ?? null,
      badge: input.badge ?? null,
      category: input.category ?? null,
      metadata: input.metadata ?? {},
    });
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) throw new Error('Insert failed');
    return product;
  },

  async update(userId: string, id: string, input: Partial<CreateProductInput>) {
    const values: Record<string, unknown> = {};
    if (input.name !== undefined) values.name = input.name;
    if (input.sku !== undefined) values.sku = input.sku;
    if (input.price !== undefined) values.price = input.price?.toString();
    if (input.originalPrice !== undefined) values.originalPrice = input.originalPrice?.toString();
    if (input.currency !== undefined) values.currency = input.currency;
    if (input.unit !== undefined) values.unit = input.unit;
    if (input.badge !== undefined) values.badge = input.badge;
    if (input.category !== undefined) values.category = input.category;
    if (input.metadata !== undefined) values.metadata = input.metadata;

    const where = and(eq(products.id, id), eq(products.userId, userId));
    const result = await db.update(products).set(values).where(where);
    // mysql2 ResultSetHeader has `affectedRows`
    const affected = (result as unknown as [{ affectedRows: number }])[0]?.affectedRows ?? 0;
    if (affected === 0) throw new NotFoundError('Ürün bulunamadı');

    const product = await db.query.products.findFirst({ where });
    if (!product) throw new NotFoundError('Ürün bulunamadı');
    return product;
  },

  async remove(userId: string, id: string) {
    const result = await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.userId, userId)));
    const affected = (result as unknown as [{ affectedRows: number }])[0]?.affectedRows ?? 0;
    if (affected === 0) throw new NotFoundError('Ürün bulunamadı');
  },
};
