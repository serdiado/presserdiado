import { randomUUID } from 'node:crypto';
import { and, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { mediaAssets, productImages } from '../../db/schema/index.js';
import { ConflictError, NotFoundError } from '../../lib/errors.js';

const MAX_IMAGES_PER_SKU = 10;

export interface CreateMediaAssetInput {
  type: 'logo' | 'background' | 'shape' | 'other';
  imageKey: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
}

export interface ListMediaAssetsQuery {
  type?: 'logo' | 'background' | 'shape' | 'other';
}

export interface AssignMediaAssetToProductInput {
  sku: string;
}

export const mediaAssetsService = {
  async list(userId: string, query: ListMediaAssetsQuery) {
    const conditions = [eq(mediaAssets.userId, userId)];
    if (query.type) {
      conditions.push(eq(mediaAssets.type, query.type));
    }

    return db
      .select()
      .from(mediaAssets)
      .where(and(...conditions))
      .orderBy(desc(mediaAssets.createdAt));
  },

  async create(userId: string, input: CreateMediaAssetInput) {
    const id = randomUUID();
    await db.insert(mediaAssets).values({
      id,
      userId,
      type: input.type,
      imageKey: input.imageKey,
      fileName: input.fileName ?? null,
      mimeType: input.mimeType ?? null,
      size: input.size ?? null,
    });

    const asset = await db.query.mediaAssets.findFirst({
      where: and(eq(mediaAssets.id, id), eq(mediaAssets.userId, userId)),
    });
    if (!asset) throw new Error('Insert failed');
    return asset;
  },

  async remove(userId: string, id: string) {
    const existing = await db.query.mediaAssets.findFirst({
      where: and(eq(mediaAssets.id, id), eq(mediaAssets.userId, userId)),
    });
    if (!existing) {
      throw new NotFoundError('Medya bulunamadı');
    }

    await db
      .delete(mediaAssets)
      .where(and(eq(mediaAssets.id, id), eq(mediaAssets.userId, userId)));

    return { success: true };
  },

  async bulkRemove(userId: string, ids: string[]) {
    // Yalnız bu kullanıcıya ait id'leri al (IDOR koruması).
    const owned = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(and(eq(mediaAssets.userId, userId), inArray(mediaAssets.id, ids)));

    if (owned.length === 0) {
      return { deleted: 0 };
    }

    const ownedIds = owned.map((m) => m.id);
    await db
      .delete(mediaAssets)
      .where(and(eq(mediaAssets.userId, userId), inArray(mediaAssets.id, ownedIds)));

    return { deleted: ownedIds.length };
  },

  async assignToProduct(userId: string, id: string, input: AssignMediaAssetToProductInput) {
    const asset = await db.query.mediaAssets.findFirst({
      where: and(eq(mediaAssets.id, id), eq(mediaAssets.userId, userId)),
    });
    if (!asset) {
      throw new NotFoundError('Medya bulunamadı');
    }

    const [countRow] = await db
      .select({ n: count() })
      .from(productImages)
      .where(and(eq(productImages.userId, userId), eq(productImages.sku, input.sku)));

    if ((countRow?.n ?? 0) >= MAX_IMAGES_PER_SKU) {
      throw new ConflictError(`Bu SKU için maksimum ${MAX_IMAGES_PER_SKU} resim yüklenebilir`);
    }

    const [maxRow] = await db
      .select({ maxSortOrder: sql<number | null>`max(${productImages.sortOrder})` })
      .from(productImages)
      .where(and(eq(productImages.userId, userId), eq(productImages.sku, input.sku)));

    const nextSortOrder = (maxRow?.maxSortOrder ?? 0) + 1;
    const imageId = randomUUID();

    await db.insert(productImages).values({
      id: imageId,
      userId,
      sku: input.sku,
      imageKey: asset.imageKey,
      fileName: asset.fileName ?? null,
      sortOrder: nextSortOrder,
      isTransparent: false,
    });

    const image = await db.query.productImages.findFirst({
      where: and(eq(productImages.id, imageId), eq(productImages.userId, userId)),
    });
    if (!image) throw new Error('Insert failed');
    return image;
  },
};
