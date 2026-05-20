import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { catalogService } from './catalog.service.js';

const createProductSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  currency: z.string().length(3).default('TRY'),
  unit: z.string().optional(),
  badge: z.string().optional(),
  category: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
});

export async function catalogRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/products', async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const result = await catalogService.list(request.user.id, query);
    return reply.send(result);
  });

  app.get('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const product = await catalogService.getById(request.user.id, id);
    return reply.send(product);
  });

  app.post('/products', async (request, reply) => {
    const body = createProductSchema.parse(request.body);
    const product = await catalogService.create(request.user.id, body);
    return reply.status(201).send(product);
  });

  app.put('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = createProductSchema.partial().parse(request.body);
    const product = await catalogService.update(request.user.id, id, body);
    return reply.send(product);
  });

  app.delete('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await catalogService.remove(request.user.id, id);
    return reply.status(204).send();
  });
}
