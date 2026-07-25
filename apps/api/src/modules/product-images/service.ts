import { randomUUID } from 'node:crypto';
import { eq, and, asc, count, inArray, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { productImages } from '../../db/schema/index.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import { deleteUploadFile } from '../../lib/uploads.js';

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
    // Dosya adına göre tekilleştirme: aynı (userId, fileName) varsa yeni kayıt açmak yerine
    // mevcut resmin görselini güncelle (ÜZERİNE YAZ). SKU ve sıra AYNEN korunur; yalnız
    // imageKey/isTransparent değişir. Böylece ERP/otomasyon aynı dosyayı tekrar gönderince
    // kopya oluşmaz. fileName yoksa tekilleştirme yapılamaz → normal INSERT.
    const fileName = input.fileName?.trim();
    if (fileName) {
      const existing = await db.query.productImages.findFirst({
        where: and(eq(productImages.userId, userId), eq(productImages.fileName, fileName)),
      });
      if (existing) {
        const patch: { imageKey: string; isTransparent: boolean; sku?: string; sortOrder?: number } = {
          imageKey: input.imageKey,
          isTransparent: input.isTransparent ?? false,
        };
        // Atanmamış (sku=null) bir resme SKU geliyorsa ATA: o SKU'nun sonuna sırala + limit kontrolü.
        // Mevcut sku doluysa dokunma (başka ürünün atamasını çalma); yalnız görsel üzerine yazılır.
        if (!existing.sku && input.sku) {
          const [row] = await db
            .select({ n: count() })
            .from(productImages)
            .where(and(eq(productImages.userId, userId), eq(productImages.sku, input.sku)));
          if ((row?.n ?? 0) >= MAX_IMAGES_PER_SKU) {
            throw new ConflictError(`Bu SKU için maksimum ${MAX_IMAGES_PER_SKU} resim yüklenebilir`);
          }
          const [maxRow] = await db
            .select({ maxSortOrder: sql<number | null>`max(${productImages.sortOrder})` })
            .from(productImages)
            .where(and(eq(productImages.userId, userId), eq(productImages.sku, input.sku)));
          patch.sku = input.sku;
          patch.sortOrder = (maxRow?.maxSortOrder ?? 0) + 1;
        }
        await db
          .update(productImages)
          .set(patch)
          .where(and(eq(productImages.id, existing.id), eq(productImages.userId, userId)));
        // Eski disk dosyasını temizle (yeni imageKey'den farklıysa).
        if (existing.imageKey !== input.imageKey) {
          await deleteUploadFile(existing.imageKey);
        }
        const updated = await db.query.productImages.findFirst({
          where: eq(productImages.id, existing.id),
        });
        if (!updated) throw new Error('Update failed');
        return { ...updated, replaced: true };
      }
    }

    let sortOrder = input.sortOrder;

    // SKU atanmışsa: limit kontrolü + sortOrder verilmemişse otomatik (mevcut max + 1).
    // Bu, assignToProduct ile aynı sıralama mantığıdır; sortOrder hesabı tek yerde toplanır.
    if (input.sku) {
      const [row] = await db
        .select({ n: count() })
        .from(productImages)
        .where(and(eq(productImages.userId, userId), eq(productImages.sku, input.sku)));
      if ((row?.n ?? 0) >= MAX_IMAGES_PER_SKU) {
        throw new ConflictError(`Bu SKU için maksimum ${MAX_IMAGES_PER_SKU} resim yüklenebilir`);
      }
      if (sortOrder === undefined) {
        const [maxRow] = await db
          .select({ maxSortOrder: sql<number | null>`max(${productImages.sortOrder})` })
          .from(productImages)
          .where(and(eq(productImages.userId, userId), eq(productImages.sku, input.sku)));
        sortOrder = (maxRow?.maxSortOrder ?? 0) + 1;
      }
    }

    const id = randomUUID();
    await db.insert(productImages).values({
      id,
      userId,
      sku: input.sku ?? null,
      imageKey: input.imageKey,
      fileName: input.fileName ?? null,
      sortOrder: sortOrder ?? 1,
      isTransparent: input.isTransparent ?? false,
    });

    const image = await db.query.productImages.findFirst({
      where: eq(productImages.id, id),
    });
    if (!image) throw new Error('Insert failed');
    return { ...image, replaced: false };
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

  // Kullanıcının inceleyip onayladığı SKU atamalarını mevcut resimlere uygula.
  // Eşleştirme/öneri client'ta hesaplanır; burada yalnız atanmış (id, sku) çiftleri işlenir.
  // sortOrder her SKU için mevcut max'ın üstüne eklenir (birincil resim değişmez);
  // SKU başına MAX_IMAGES_PER_SKU limiti korunur, aşan resimler atlanır (skipped).
  async applyRematch(userId: string, assignments: { id: string; sku: string }[]) {
    // 1) Temizle: boş sku/id ele; id başına tek sku (son kazanır).
    const byId = new Map<string, string>();
    for (const a of assignments) {
      const id = a.id?.trim();
      const sku = a.sku?.trim();
      if (id && sku) byId.set(id, sku);
    }
    if (byId.size === 0) return { matched: 0, skipped: 0 };

    // 2) Sahiplik (IDOR): yalnız bu kullanıcıya ait id'ler.
    const ids = [...byId.keys()];
    const owned = await db
      .select({ id: productImages.id })
      .from(productImages)
      .where(and(eq(productImages.userId, userId), inArray(productImages.id, ids)));
    const ownedSet = new Set(owned.map((o) => o.id));

    // 3) SKU'ya göre grupla (yalnız sahip olunan id'ler).
    const bySku = new Map<string, string[]>();
    for (const [id, sku] of byId) {
      if (!ownedSet.has(id)) continue;
      const arr = bySku.get(sku) ?? [];
      arr.push(id);
      bySku.set(sku, arr);
    }
    if (bySku.size === 0) return { matched: 0, skipped: 0 };

    // 4) Her hedef SKU için mevcut adet + max sortOrder (tek sorgu).
    const skus = [...bySku.keys()];
    const existing = await db
      .select({
        sku: productImages.sku,
        n: count(),
        maxSort: sql<number | null>`max(${productImages.sortOrder})`,
      })
      .from(productImages)
      .where(and(eq(productImages.userId, userId), inArray(productImages.sku, skus)))
      .groupBy(productImages.sku);
    const existingBySku = new Map<string, { n: number; maxSort: number }>();
    for (const e of existing) {
      if (e.sku) existingBySku.set(e.sku, { n: Number(e.n), maxSort: Number(e.maxSort ?? 0) });
    }

    // 5) sortOrder ata + SKU başına limit uygula.
    const updates: { id: string; sku: string; sortOrder: number }[] = [];
    let skipped = 0;
    for (const [sku, skuIds] of bySku) {
      const cur = existingBySku.get(sku) ?? { n: 0, maxSort: 0 };
      let assigned = 0;
      for (const id of skuIds) {
        if (cur.n + assigned >= MAX_IMAGES_PER_SKU) {
          skipped++;
          continue;
        }
        assigned++;
        updates.push({ id, sku, sortOrder: cur.maxSort + assigned });
      }
    }

    // 6) Tek transaction'da uygula.
    if (updates.length > 0) {
      await db.transaction(async (tx) => {
        for (const u of updates) {
          await tx
            .update(productImages)
            .set({ sku: u.sku, sortOrder: u.sortOrder })
            .where(and(eq(productImages.id, u.id), eq(productImages.userId, userId)));
        }
      });
    }

    return { matched: updates.length, skipped };
  },

  // Bir SKU'nun resimlerini verilen sıraya göre yeniden dizer (sortOrder = index + 1).
  // orderedIds yalnız bu kullanıcıya + bu SKU'ya ait id'lere filtrelenir (IDOR/bütünlük);
  // listede yer almayan sahip-resimler mevcut sıralarını koruyarak sona eklenir (savunmacı —
  // UI tam liste gönderse de eksik/fazla id'de bütünlük bozulmaz). Birincil = en düşük sortOrder.
  async reorder(userId: string, sku: string, orderedIds: string[]) {
    // Bu SKU'nun tüm resimleri — mevcut sırayla (sona-ekleme için referans).
    const current = await db
      .select({ id: productImages.id })
      .from(productImages)
      .where(and(eq(productImages.userId, userId), eq(productImages.sku, sku)))
      .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));
    const ownedIds = new Set(current.map((r) => r.id));

    // İstenen sıra: yalnız sahip olunan + tekil; ardından listede olmayan sahip-resimler.
    const seen = new Set<string>();
    const finalOrder: string[] = [];
    for (const id of orderedIds) {
      if (ownedIds.has(id) && !seen.has(id)) {
        seen.add(id);
        finalOrder.push(id);
      }
    }
    for (const r of current) {
      if (!seen.has(r.id)) finalOrder.push(r.id);
    }
    if (finalOrder.length === 0) return { reordered: 0 };

    await db.transaction(async (tx) => {
      for (let i = 0; i < finalOrder.length; i++) {
        await tx
          .update(productImages)
          .set({ sortOrder: i + 1 })
          .where(and(eq(productImages.id, finalOrder[i]), eq(productImages.userId, userId)));
      }
    });

    return { reordered: finalOrder.length };
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
    // Güvenlik taraması bulgusu: silme öncesinde dosya diskten hiç kaldırılmıyordu —
    // "silinen" resmin public URL'i çalışmaya devam ediyordu.
    await deleteUploadFile(existing.imageKey);

    return { success: true };
  },

  async bulkRemove(userId: string, ids: string[]) {
    // Yalnız bu kullanıcıya ait id'leri al (IDOR koruması).
    const owned = await db
      .select({ id: productImages.id, imageKey: productImages.imageKey })
      .from(productImages)
      .where(and(eq(productImages.userId, userId), inArray(productImages.id, ids)));

    if (owned.length === 0) {
      return { deleted: 0 };
    }

    const ownedIds = owned.map((i) => i.id);
    await db
      .delete(productImages)
      .where(and(eq(productImages.userId, userId), inArray(productImages.id, ownedIds)));
    await Promise.all(owned.map((i) => deleteUploadFile(i.imageKey)));

    return { deleted: ownedIds.length };
  },
};
