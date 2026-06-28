import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { productImagesService } from './service.js';

const createProductImageSchema = z.object({
  sku: z.string().min(1).max(100).optional(),
  imageKey: z.string().min(1).max(500),
  fileName: z.string().max(255).optional(),
  // Verilmezse servis, SKU'nun mevcut en yüksek sortOrder'ının +1'ini otomatik atar.
  sortOrder: z.number().int().min(1).optional(),
  isTransparent: z.boolean().default(false),
});

const updateSkuSchema = z.object({
  sku: z.string().min(1).max(100).nullable(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
});

const rematchSchema = z.object({
  // Kullanıcının inceleyip onayladığı SKU atamaları (id → sku).
  assignments: z
    .array(z.object({ id: z.string().min(1), sku: z.string().min(1).max(100) }))
    .max(1000),
});

const reorderSchema = z.object({
  sku: z.string().min(1).max(100),
  orderedIds: z.array(z.string().min(1)).min(1).max(100),
});

export async function productImagesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // GET /product-images — kullanıcının tüm resimleri
  app.get('/product-images', async (request, reply) => {
    const userId = request.user.id; // IDOR Protection: Sadece kendi resimlerini listeleyebilir.
    const images = await productImagesService.listAll(userId);
    return reply.send(images);
  });

  // GET /product-images/by-sku/:sku — SKU'ya ait resimler
  // NOT: statik "by-sku" segmenti, aşağıdaki dinamik :id route'larından önce tanımlanmalı.
  app.get('/product-images/by-sku/:sku', async (request, reply) => {
    const { sku } = request.params as { sku: string };
    const userId = request.user.id; // IDOR Protection: Sadece kendi resimlerini listeleyebilir.
    const images = await productImagesService.getBySku(userId, sku);
    return reply.send(images);
  });

  // POST /product-images — resim kaydı oluştur (upload ayrı yapılır)
  app.post('/product-images', async (request, reply) => {
    const body = createProductImageSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi adına resim kaydı oluşturabilir.
    const image = await productImagesService.create(userId, body);
    return reply.status(201).send(image);
  });

  // POST /product-images/rematch — kullanıcının onayladığı SKU atamalarını mevcut resimlere uygula.
  // Statik segment; dinamik :id route'larından önce tanımlı.
  app.post('/product-images/rematch', async (request, reply) => {
    const { assignments } = rematchSchema.parse(request.body ?? {});
    const userId = request.user.id; // IDOR Protection: Sadece kendi resimlerini günceller.
    const result = await productImagesService.applyRematch(userId, assignments);
    return reply.send(result);
  });

  // PATCH /product-images/reorder — bir SKU'nun resim sırasını yeniden diz (sortOrder).
  // Statik segment; dinamik :id route'larından önce tanımlı.
  app.patch('/product-images/reorder', async (request, reply) => {
    const { sku, orderedIds } = reorderSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi resimlerini sıralayabilir.
    const result = await productImagesService.reorder(userId, sku, orderedIds);
    return reply.send(result);
  });

  // PATCH /product-images/:id/sku — SKU güncelle
  app.patch('/product-images/:id/sku', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sku } = updateSkuSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi resmini güncelleyebilir.
    const image = await productImagesService.updateSku(userId, id, sku);
    return reply.send(image);
  });

  // DELETE /product-images/bulk — toplu sil. Statik segment :id'den önce tanımlı.
  app.delete('/product-images/bulk', async (request, reply) => {
    const { ids } = bulkDeleteSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi resimlerini silebilir.
    const result = await productImagesService.bulkRemove(userId, ids);
    return reply.send(result);
  });

  // DELETE /product-images/:id — resim sil
  app.delete('/product-images/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id; // IDOR Protection: Sadece kendi resmini silebilir.
    await productImagesService.remove(userId, id);
    return reply.status(204).send();
  });
}
