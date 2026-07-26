// Sipariş PDF dondurma — mevcut exportCatalog (Puppeteer RGB) yeniden kullanılır.
// Siparişin projesinden PDF üretir, MinIO'ya yazar, productionPdfKey'i günceller.
// İdempotent: zaten dondurulmuş kalem yeniden render edilmez.
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { orders, orderItems, projects } from '../../db/schema/index.js';
import { config } from '../../config.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import { ensureBucket, putObject } from '../../lib/storage.js';
import { convertPdfToCmyk } from '../../lib/ghostscript.js';
import { exportCatalog, type ExportRequest } from '../export/export.service.js';

// project.canvasData = StudioCanvasData (projectSerializer). Render için gereken alt küme.
interface StudioCanvasData {
  catalog?: { formas?: { id: number }[]; layers?: unknown[]; [k: string]: unknown };
  layers?: unknown[];
}

export interface FreezeResult {
  orderId: string;
  productionPdfKey: string;
}

export const orderPdfService = {
  async freezeOrderPdf(orderId: string): Promise<FreezeResult> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true },
    });
    if (!order) throw new NotFoundError('Sipariş bulunamadı');

    // Pilot: 1 sipariş = 1 kalem. studio_design + projeli kalem(ler) dondurulur.
    const item = order.items.find((i) => i.itemType === 'studio_design' && i.projectId);
    if (!item || !item.projectId) {
      throw new ValidationError('Dondurulacak studio_design kalemi bulunamadı');
    }

    // İdempotent: zaten dondurulmuşsa mevcut key'i döndür (render/upload yok).
    if (item.productionPdfKey) {
      return { orderId, productionPdfKey: item.productionPdfKey };
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, item.projectId),
    });
    const canvas = project?.canvasData as StudioCanvasData | undefined;
    if (!canvas?.catalog?.formas?.length) {
      throw new ValidationError('Sipariş render edilemiyor: geçersiz tasarım verisi');
    }

    // canvasData.catalog → catalogState, canvasData.layers → layerState (export ile aynı eşleme).
    const req: ExportRequest = {
      formaIds: canvas.catalog.formas.map((f) => f.id),
      format: 'pdf',
      catalogState: { ...canvas.catalog, copiedSlotSettings: null } as unknown as ExportRequest['catalogState'],
      layerState: { layers: canvas.layers ?? [] },
    };
    const result = await exportCatalog(req);
    const cmykBuffer = await convertPdfToCmyk(result.buffer);

    const bucket = config.s3.ordersBucket;
    await ensureBucket(bucket);
    const key = `${order.userId}/${order.id}/production.pdf`;
    await putObject(bucket, key, cmykBuffer, 'application/pdf');

    await db.update(orderItems).set({ productionPdfKey: key }).where(eq(orderItems.id, item.id));

    return { orderId, productionPdfKey: key };
  },
};
