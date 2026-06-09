import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { productImagesService } from './service.js';

const createProductImageSchema = z.object({
  sku: z.string().min(1).max(100),
  imageKey: z.string().min(1).max(500),
  fileName: z.string().max(255).optional(),
  sortOrder: z.number().int().min(1).default(1),
  isTransparent: z.boolean().default(false),
});

export async function productImagesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // GET /product-images/:sku — SKU'ya ait resimler
  app.get('/product-images/:sku', async (request, reply) => {
    const { sku } = request.params as { sku: string };
    const userId = request.user.id; // IDOR Protection: Sadece kendi resimlerini listeleyebilir.
    const images = await productImagesService.getBySku(userId, sku);
    return reply.send(images);
  });

  // POST /product-images — resim yükle + SKU ata
  app.post('/product-images', async (request, reply) => {
    const body = createProductImageSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi adına resim yükleyip eşleştirebilir.
    const image = await productImagesService.create(userId, body);
    return reply.status(201).send(image);
  });

  // DELETE /product-images/:id — resim sil
  app.delete('/product-images/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id; // IDOR Protection: Sadece kendi resmini silebilir.
    await productImagesService.remove(userId, id);
    return reply.status(204).send();
  });
}
