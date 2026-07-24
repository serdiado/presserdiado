import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { printCatalogService } from './print-catalog.service.js';

const keyParamSchema = z.object({
  key: z.string().min(1),
});

// NOT: Bu endpoint pilotta PUBLIC (auth yok) — yalnızca hassas olmayan katalog verisi döner
// ve web ürün seçimi giriş öncesi olabilir. Pilot sonrası: rate-limit eklenecek.
export async function printCatalogRoutes(app: FastifyInstance) {
  // Vitrin ürün grid'i — aktif ürün tipleri.
  app.get('/catalog/product-types', async (_request, reply) => {
    const result = await printCatalogService.listProductTypes();
    return reply.send({ productTypes: result });
  });

  app.get('/catalog/product-types/:key/options', async (request, reply) => {
    const { key } = keyParamSchema.parse(request.params);
    const result = await printCatalogService.getProductTypeOptions(key);
    return reply.send(result);
  });

  // Paket kuralları — ürün detay sayfası geçerli adet listesini bundan türetir.
  app.get('/catalog/product-types/:key/packages', async (request, reply) => {
    const { key } = keyParamSchema.parse(request.params);
    const result = await printCatalogService.listProductTypePackages(key);
    return reply.send({ packages: result });
  });
}
