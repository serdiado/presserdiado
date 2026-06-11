import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pricingService } from './pricing.service.js';

const optionsSchema = z
  .object({
    size: z.string().optional(),
    fold: z.string().optional(),
    paperType: z.string().optional(),
    paperWeight: z.string().optional(),
    colorMode: z.string().optional(),
    coating: z.string().optional(),
    binding: z.string().optional(),
  })
  .default({});

const quoteSchema = z.object({
  productTypeKey: z.string().min(1),
  quantity: z.number().int().min(1),
  options: optionsSchema,
});

// NOT: Bu endpoint pilotta PUBLIC (auth yok) — yalnızca hassas olmayan katalog/fiyat
// verisi döner ve web ürün seçimi giriş öncesi olabilir. Pilot sonrası: kötüye kullanım /
// fiyat kazıma (scraping) önlemek için rate-limit eklenecek.
export async function pricingRoutes(app: FastifyInstance) {
  app.post('/pricing/quote', async (request, reply) => {
    const body = quoteSchema.parse(request.body);
    const quote = await pricingService.calculateQuote(body);
    return reply.send(quote);
  });
}
