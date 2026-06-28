import { randomUUID } from 'node:crypto';
import { eq, and, desc, like, ne, inArray, sql, getTableColumns } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { products } from '../../db/schema/index.js';
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

    // Her ürünün birincil resmi (en düşük sortOrder, eşitlikte en eski). Korelasyon
    // kolonları (products.user_id / products.sku) literal yazılmalı: ham sql`` içine
    // ${products.sku} interpolasyonu tablo-qualifiye edilmeden basılır ve alt-sorguda
    // pi.sku'ya çözülür -> korelasyon kopar, herkese aynı resim döner. Bkz. listWithImages.
    const primaryImage = sql<string | null>`(
      SELECT pi.image_key FROM product_images pi
      WHERE pi.user_id = products.user_id AND pi.sku = products.sku
      ORDER BY pi.sort_order ASC, pi.created_at ASC LIMIT 1
    )`;

    // Pagination is disabled for now, returning all matches
    const data = await db
      .select({ ...getTableColumns(products), primaryImage })
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

  // Hafif SKU listesi — dosya adı → SKU eşleştirme için yalnız { sku, name }.
  // list()'teki korelasyonlu primaryImage alt-sorgusu yok; büyük kataloglarda hızlıdır.
  async listSkus(userId: string) {
    return db
      .select({ sku: products.sku, name: products.name })
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(desc(products.createdAt));
  },

  // Stüdyo ürün havuzu: her ürünü birincil resmiyle (en düşük sortOrder, eşitlikte
  // en eski) döndürür. primaryImage relative imageKey'dir; mutlak URL çevirimi frontend'de.
  async listWithImages(userId: string) {
    // Korelasyon kolonları (products.user_id / products.sku) literal yazılmalı:
    // ham sql`` içine ${products.sku} interpolasyonu tablo-qualifiye edilmeden basılır
    // ve alt-sorguda pi.sku'ya çözülür -> korelasyon kopar, herkese aynı resim döner.
    const primaryImage = sql<string | null>`(
      SELECT pi.image_key FROM product_images pi
      WHERE pi.user_id = products.user_id AND pi.sku = products.sku
      ORDER BY pi.sort_order ASC, pi.created_at ASC LIMIT 1
    )`;
    return db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        price: products.price,
        category: products.category,
        unit: products.unit,
        primaryImage,
      })
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(desc(products.createdAt));
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

  async bulkCreate(userId: string, items: CreateProductInput[]) {
    // 1. Dosya-içi tekrar eden SKU'ları ele (ilkini tut), boş SKU'ları çıkar
    const seen = new Set<string>();
    const skippedSkus: string[] = [];
    const unique: CreateProductInput[] = [];
    for (const item of items) {
      const sku = item.sku?.trim();
      if (!sku || !item.name?.trim()) {
        if (sku) skippedSkus.push(sku);
        continue;
      }
      if (seen.has(sku)) {
        skippedSkus.push(sku);
        continue;
      }
      seen.add(sku);
      unique.push(item);
    }

    // 2. Bu kullanıcıda zaten var olan SKU'ları tek sorguda çek
    const skus = unique.map((i) => i.sku);
    const existing = skus.length
      ? await db
          .select({ sku: products.sku })
          .from(products)
          .where(and(eq(products.userId, userId), inArray(products.sku, skus)))
      : [];
    const existingSet = new Set(existing.map((e) => e.sku));

    // 3. Eklenecekleri hazırla, mevcutları atla
    const toInsert: (typeof products.$inferInsert)[] = [];
    for (const item of unique) {
      if (existingSet.has(item.sku)) {
        skippedSkus.push(item.sku);
        continue;
      }
      toInsert.push({
        id: randomUUID(),
        userId,
        sku: item.sku,
        name: item.name,
        price: item.price?.toString() ?? null,
        category: item.category ?? null,
        unit: item.unit ?? null,
        description: item.description ?? null,
      });
    }

    // 4. Transaction içinde toplu insert
    if (toInsert.length > 0) {
      await db.transaction(async (tx) => {
        await tx.insert(products).values(toInsert);
      });
    }

    return {
      inserted: toInsert.length,
      skipped: skippedSkus.length,
      skippedSkus,
    };
  },

  async bulkRemove(userId: string, ids: string[]) {
    // Yalnız bu kullanıcıya ait id'leri al (IDOR koruması).
    const owned = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.userId, userId), inArray(products.id, ids)));

    if (owned.length === 0) {
      return { deleted: 0 };
    }

    const ownedIds = owned.map((p) => p.id);

    // Ürün resimleri SİLİNMEZ: ürün silinince ilgili resimler korunur ve "eşleşmemiş"
    // (SKU var ama ürün yok) duruma geçer; aynı SKU'lu ürün tekrar eklenince yeniden eşleşir.
    await db
      .delete(products)
      .where(and(eq(products.userId, userId), inArray(products.id, ownedIds)));

    return { deleted: ownedIds.length };
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

    // Ürün resmi SİLİNMEZ (bkz. bulkRemove): resimler korunur, "eşleşmemiş" duruma geçer.
    await db.delete(products).where(
      and(eq(products.id, id), eq(products.userId, userId))
    );

    return { success: true };
  },
};
