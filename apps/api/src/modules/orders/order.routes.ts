import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { orderService } from './order.service.js';
import { orderPdfService } from './order-pdf.service.js';

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

const createOrderSchema = z.object({
  productTypeKey: z.string().min(1),
  quantity: z.number().int().min(1),
  options: optionsSchema,
  itemType: z.enum(['studio_design', 'uploaded_file']).default('studio_design'),
  projectId: z.string().uuid().optional(),
  billingProfileId: z.string().uuid(),
  // Zorunlu: frontend'in gösterdiği tutar. Gönderilmezse fiyat doğrulaması atlanmaz, 400 verilir.
  clientGrandTotal: z.union([z.string(), z.number()]),
  notes: z.string().optional(),
  previewImageKey: z.string().optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

export async function orderRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.post('/orders', async (request, reply) => {
    const body = createOrderSchema.parse(request.body);
    const order = await orderService.createOrder(request.user.id, body);

    // PDF dondurma: transaction DIŞINDA, commit sonrası, non-fatal.
    // Render hatası siparişi bozmaz (201 döner, productionPdfKey null kalır, loglanır).
    try {
      await orderPdfService.freezeOrderPdf(order.id);
    } catch (err) {
      request.log.error({ err, orderId: order.id }, 'PDF dondurma başarısız');
    }

    const fresh = await orderService.getByIdForUser(request.user.id, order.id);
    return reply.status(201).send(fresh);
  });

  // Başarısız/atlanmış freeze'leri manuel tetikleme (idempotent).
  app.post('/orders/:id/freeze-pdf', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await orderService.getByIdForUser(request.user.id, id); // sahiplik (IDOR)
    const result = await orderPdfService.freezeOrderPdf(id);
    return reply.send(result);
  });

  app.get('/orders', async (request, reply) => {
    const list = await orderService.listForUser(request.user.id);
    return reply.send(list);
  });

  app.get('/orders/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const order = await orderService.getByIdForUser(request.user.id, id);
    return reply.send(order);
  });
}
