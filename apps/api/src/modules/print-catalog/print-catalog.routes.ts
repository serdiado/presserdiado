import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { printCatalogService } from './print-catalog.service.js';

const keyParamSchema = z.object({
  key: z.string().min(1),
});

// NOT: Bu endpoint pilotta PUBLIC (auth yok) — yalnızca hassas olmayan katalog verisi döner
// ve web ürün seçimi giriş öncesi olabilir. Pilot sonrası: rate-limit eklenecek.
export async function printCatalogRoutes(app: FastifyInstance) {
  app.get('/catalog/product-types/:key/options', async (request, reply) => {
    const { key } = keyParamSchema.parse(request.params);
    const result = await printCatalogService.getProductTypeOptions(key);
    return reply.send(result);
  });
}
