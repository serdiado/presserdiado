import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { adminService, ORDER_STATUSES } from './admin.service.js';

const idParamSchema = z.object({ id: z.string().uuid() });
// Geçersiz string burada 400 ile reddedilir (enum dışı değer kabul edilmez).
const statusBodySchema = z.object({ status: z.enum(ORDER_STATUSES) });

export async function adminRoutes(app: FastifyInstance) {
  // Önce kimlik (request.user.id), sonra rol doğrulama. İkisi de onRequest.
  app.addHook('onRequest', app.authenticate);
  app.addHook('onRequest', app.authorizeAdmin);

  // Tüm siparişler (müşteri + kalemlerle).
  app.get('/admin/orders', async (_request, reply) => {
    const list = await adminService.listAllOrders();
    return reply.send(list);
  });

  // Durum güncelle — serbest geçiş, sadece geçerli enum.
  app.patch('/admin/orders/:id/status', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const { status } = statusBodySchema.parse(request.body);
    const updated = await adminService.updateOrderStatus(id, status);
    return reply.send(updated);
  });

  // Dondurulmuş üretim PDF'ini indir (stream).
  app.get('/admin/orders/:id/pdf', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const { stream, filename } = await adminService.getOrderPdf(id);
    reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${filename}"`);
    return reply.send(stream);
  });

  // Sipariş oluşturmadaki non-fatal freeze denemesi başarısız kaldıysa yeniden tetikle
  // (sahiplik kısıtı yok — müşteri /orders/:id/freeze-pdf'i yalnız kendi siparişi için çağırabilir).
  app.post('/admin/orders/:id/freeze-pdf', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await adminService.refreezeOrderPdf(id);
    return reply.send(result);
  });
}
