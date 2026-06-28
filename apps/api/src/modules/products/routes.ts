import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { productsService } from './service.js';

const createProductSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(500),
  price: z.coerce.number().positive().optional(),
  category: z.string().max(100).optional(),
  unit: z.string().max(50).optional(),
  description: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial();

const bulkCreateSchema = z.object({
  products: z.array(createProductSchema).min(1).max(1000),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
});

const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
});

export async function productsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // GET /products — kullanıcının ürün listesi
  app.get('/products', async (request, reply) => {
    const query = listProductsQuerySchema.parse(request.query);
    const userId = request.user.id; // IDOR Protection: Sadece kendi ürünlerini listeleyebilir.
    const result = await productsService.list(userId, query);
    return reply.send(result);
  });

  // GET /products/skus — hafif SKU listesi (dosya adı → SKU eşleştirme için)
  app.get('/products/skus', async (request, reply) => {
    const userId = request.user.id; // IDOR Protection: Sadece kendi ürünlerini listeleyebilir.
    const result = await productsService.listSkus(userId);
    return reply.send(result);
  });

  // GET /products/with-images — stüdyo havuzu: ürün + birincil resim
  app.get('/products/with-images', async (request, reply) => {
    const userId = request.user.id; // IDOR Protection: Sadece kendi ürünlerini listeleyebilir.
    const result = await productsService.listWithImages(userId);
    return reply.send(result);
  });

  // POST /products — tekil ürün ekle
  app.post('/products', async (request, reply) => {
    const body = createProductSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi adına ürün ekleyebilir.
    const product = await productsService.create(userId, body);
    return reply.status(201).send(product);
  });

  // POST /products/bulk — toplu ürün ekle (kolon eşleştirmeli Excel import)
  app.post('/products/bulk', async (request, reply) => {
    const body = bulkCreateSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi adına ürün ekleyebilir.
    const result = await productsService.bulkCreate(userId, body.products);
    return reply.send(result);
  });

  // DELETE /products/bulk — toplu sil (resimlere dokunmaz). :id'den önce tanımlı.
  app.delete('/products/bulk', async (request, reply) => {
    const { ids } = bulkDeleteSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi ürünlerini silebilir.
    const result = await productsService.bulkRemove(userId, ids);
    return reply.send(result);
  });

  // PATCH /products/:id — güncelle
  app.patch('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateProductSchema.parse(request.body);
    const userId = request.user.id; // IDOR Protection: Sadece kendi ürünü üzerinde güncelleme yapabilir.
    const product = await productsService.update(userId, id, body);
    return reply.send(product);
  });

  // DELETE /products/:id — sil
  app.delete('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id; // IDOR Protection: Sadece kendi ürününü silebilir.
    await productsService.remove(userId, id);
    return reply.status(204).send();
  });
}
