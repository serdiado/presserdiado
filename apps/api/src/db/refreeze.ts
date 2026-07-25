// Sipariş üretim PDF'ini yeniden dondur — sipariş oluşturmadaki non-fatal freeze denemesi
// başarısız kalıp productionPdfKey null kalmışsa manuel kurtarma için (freezeOrderPdf idempotent).
//   çalıştırma: npx tsx src/db/refreeze.ts <orderId|orderNumber>
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { orders } from './schema/index.js';
import { orderPdfService } from '../modules/orders/order-pdf.service.js';

const arg = process.argv[2];
if (!arg) {
  console.error('Kullanım: tsx src/db/refreeze.ts <orderId|orderNumber>');
  process.exit(1);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function refreeze(idOrNumber: string) {
  const order = await db.query.orders.findFirst({
    where: UUID_RE.test(idOrNumber) ? eq(orders.id, idOrNumber) : eq(orders.orderNumber, idOrNumber),
    columns: { id: true, orderNumber: true },
  });

  if (!order) {
    console.error(`Sipariş bulunamadı: ${idOrNumber}`);
    process.exit(1);
  }

  const result = await orderPdfService.freezeOrderPdf(order.id);
  console.log(`✓ ${order.orderNumber} donduruldu: ${result.productionPdfKey}`);
}

refreeze(arg)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Refreeze hatası:', err);
    process.exit(1);
  });
