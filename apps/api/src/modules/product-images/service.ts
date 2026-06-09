import { randomUUID } from 'node:crypto';
import { eq, and, asc, count } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { productImages } from '../../db/schema/index.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';

// Aynı SKU'ya atanabilecek maksimum resim sayısı.
const MAX_IMAGES_PER_SKU = 10;

export interface CreateProductImageInput {
  sku?: string;
  imageKey: string;
  fileName?: string;
  sortOrder?: number;
  isTransparent?: boolean;
}

export const productImagesService = {
  // Kullanıcının tüm resimleri — SKU'ya, sonra sıraya göre.
  async listAll(userId: string) {
    return db
      .select()
      .from(productImages)
      .where(eq(productImages.userId, userId))
      .orderBy(asc(productImages.sku), asc(productImages.sortOrder));
  },

  // Belirli SKU'nun resimleri — sıraya göre.
  async getBySku(userId: string, sku: string) {
    return db
      .select()
      .from(productImages)
      .where(and(eq(productImages.userId, userId), eq(productImages.sku, sku)))
      .orderBy(asc(productImages.sortOrder));
  },

  async create(userId: string, input: CreateProductImageInput) {
    // SKU atanmışsa, bu kullanıcıda o SKU için resim limitini aşmadığını doğrula.
    if (input.sku) {
      const [row] = await db
        .select({ n: count() })
        .from(productImages)
        .where(and(eq(productImages.userId, userId), eq(productImages.sku, input.sku)));
      if ((row?.n ?? 0) >= MAX_IMAGES_PER_SKU) {
        throw new ConflictError(`Bu SKU için maksimum ${MAX_IMAGES_PER_SKU} resim yüklenebilir`);
      }
    }

    const id = randomUUID();
    await db.insert(productImages).values({
      id,
      userId,
      sku: input.sku ?? null,
      imageKey: input.imageKey,
      fileName: input.fileName ?? null,
      sortOrder: input.sortOrder ?? 1,
      isTransparent: input.isTransparent ?? false,
    });

    const image = await db.query.productImages.findFirst({
      where: eq(productImages.id, id),
    });
    if (!image) throw new Error('Insert failed');
    return image;
  },

  async updateSku(userId: string, id: string, sku: string | null) {
    const existing = await db.query.productImages.findFirst({
      where: and(eq(productImages.id, id), eq(productImages.userId, userId)),
    });
    if (!existing) {
      throw new NotFoundError('Resim bulunamadı');
    }

    await db
      .update(productImages)
      .set({ sku })
      .where(and(eq(productImages.id, id), eq(productImages.userId, userId)));

    const image = await db.query.productImages.findFirst({
      where: and(eq(productImages.id, id), eq(productImages.userId, userId)),
    });
    if (!image) throw new NotFoundError('Resim bulunamadı');
    return image;
  },

  async remove(userId: string, id: string) {
    const existing = await db.query.productImages.findFirst({
      where: and(eq(productImages.id, id), eq(productImages.userId, userId)),
    });
    if (!existing) {
      throw new NotFoundError('Resim bulunamadı');
    }

    await db
      .delete(productImages)
      .where(and(eq(productImages.id, id), eq(productImages.userId, userId)));

    return { success: true };
  },
};
