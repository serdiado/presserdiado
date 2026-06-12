// Admin sipariş yönetimi — TÜM siparişlere erişir (sahiplik kısıtı YOK).
// Bu modüldeki route'lar authorizeAdmin guard'ı ile korunur (server.ts).
import { desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { orders } from '../../db/schema/index.js';
import { config } from '../../config.js';
import { NotFoundError } from '../../lib/errors.js';
import { getObject } from '../../lib/storage.js';

// orders.status enum değerleri — PATCH doğrulaması bununla yapılır.
export const ORDER_STATUSES = [
  'draft',
  'submitted',
  'in_production',
  'shipped',
  'completed',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const adminService = {
  // Tüm siparişler + müşteri bilgisi (email/companyName) + kalemler.
  async listAllOrders() {
    return db.query.orders.findMany({
      with: {
        user: { columns: { id: true, email: true, companyName: true } },
        items: true,
      },
      orderBy: [desc(orders.createdAt)],
    });
  },

  // Durum güncelle — serbest geçiş (her geçerli enum). Sıralı akış zorunluluğu yok.
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const existing = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: { id: true },
    });
    if (!existing) throw new NotFoundError('Sipariş bulunamadı');

    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    return db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        user: { columns: { id: true, email: true, companyName: true } },
        items: true,
      },
    });
  },

  // Dondurulmuş üretim PDF'ini stream olarak getirir.
  // GÜVENLİK: getObject key'i SADECE DB'den (order_items.productionPdfKey) okunur;
  // route param/query asla key'e konkat edilmez (path traversal yok). Bucket sabit.
  async getOrderPdf(orderId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true },
    });
    if (!order) throw new NotFoundError('Sipariş bulunamadı');

    const item = order.items.find((i) => i.productionPdfKey);
    if (!item?.productionPdfKey) {
      throw new NotFoundError('PDF henüz dondurulmamış');
    }

    const stream = await getObject(config.s3.ordersBucket, item.productionPdfKey);
    return { stream, filename: `${order.orderNumber}.pdf` };
  },
};
