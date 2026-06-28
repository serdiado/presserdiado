import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { mediaAssetsService } from './service.js';

const createMediaAssetSchema = z.object({
  type: z.enum(['logo', 'background', 'shape', 'other']),
  imageKey: z.string().min(1).max(500),
  fileName: z.string().max(255).optional(),
  mimeType: z.string().max(100).optional(),
  size: z.number().int().nonnegative().optional(),
});

const listMediaAssetsQuerySchema = z.object({
  type: z.enum(['logo', 'background', 'shape', 'other']).optional(),
});

const assignMediaAssetToProductSchema = z.object({
  sku: z.string().min(1).max(100),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
});

export async function mediaAssetsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // GET /media-assets — medya listesi (type filtreli)
  app.get('/media-assets', async (request, reply) => {
    const query = listMediaAssetsQuerySchema.parse(request.query);
    const userId = request.user.id; // IDOR Protection: Sadece kendi medya kütüphanesini listeleyebilir.
    const assets = await mediaAssetsService.list(userId, query);
    return reply.send(assets);
  });

  // POST /media-assets — medya yükle
  app.post('/media-assets', async (request, reply) => {
    const body = createMediaAssetSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi kütüphanesine medya ekleyebilir.
    const asset = await mediaAssetsService.create(userId, body);
    return reply.status(201).send(asset);
  });

  // POST /media-assets/:id/assign-to-product — medyayı ürün resmi olarak kopyala
  app.post('/media-assets/:id/assign-to-product', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = assignMediaAssetToProductSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi medyasını ürün resmi olarak atayabilir.
    const image = await mediaAssetsService.assignToProduct(userId, id, body);
    return reply.status(201).send(image);
  });

  // DELETE /media-assets/bulk — toplu sil. Statik segment :id'den önce tanımlı.
  app.delete('/media-assets/bulk', async (request, reply) => {
    const { ids } = bulkDeleteSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi medyalarını silebilir.
    const result = await mediaAssetsService.bulkRemove(userId, ids);
    return reply.send(result);
  });

  // DELETE /media-assets/:id — medya sil
  app.delete('/media-assets/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id; // IDOR Protection: Sadece kendi medyasını silebilir.
    await mediaAssetsService.remove(userId, id);
    return reply.status(204).send();
  });
}
