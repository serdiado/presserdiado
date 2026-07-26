import { randomUUID } from 'node:crypto';
import { and, desc, eq, like } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { orders, orderItems } from '../../db/schema/index.js';
import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors.js';
import { projectService } from '../project/project.service.js';
import { billingService } from '../billing/billing.service.js';
import { pricingService, type PrintOptionSelection } from '../pricing/pricing.service.js';
import { BROCHURE_QUANTITY_CHOICES } from '@matbaapro/shared';

export interface CreateOrderInput {
  productTypeKey: string;
  quantity: number;
  options?: PrintOptionSelection;
  itemType?: 'studio_design' | 'uploaded_file';
  projectId?: string;
  billingProfileId: string;
  clientGrandTotal: string | number;
  notes?: string;
  previewImageKey?: string;
}

const MAX_ORDER_NUMBER_ATTEMPTS = 3;

// order_number UNIQUE ihlali mi? (yalnızca numara çakışması retry'lanır.)
function isDuplicateOrderNumber(err: unknown): boolean {
  const e = err as { code?: string; errno?: number };
  return e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062;
}

export const orderService = {
  async createOrder(userId: string, input: CreateOrderInput) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      throw new ValidationError('Adet en az 1 olmalı');
    }

    // Adet SABİT KADEMELERDEN biri olmalı. İstemci zaten <select> ile sınırlıyor ama bu bir
    // görüntü kısıtı; API'ye doğrudan istek atan biri (ya da eski bir istemci) 1 veya 137 adet
    // gönderebilir. Fiyatlama birim-fiyat + adet-indirimi modeliyle çalıştığından böyle bir
    // adet sessizce hesaplanır ve sipariş üretime kabul edilirdi. Kademe listesi shared'da.
    if (
      input.productTypeKey === 'brochure' &&
      !BROCHURE_QUANTITY_CHOICES.includes(input.quantity)
    ) {
      throw new ValidationError(
        `Geçersiz adet: ${input.quantity}. Geçerli adetler: ${BROCHURE_QUANTITY_CHOICES.join(', ')}`,
      );
    }

    const itemType = input.itemType ?? 'studio_design';

    // Sahiplik: studio_design ise proje zorunlu + sahibe ait olmalı (IDOR).
    if (itemType === 'studio_design') {
      if (!input.projectId) {
        throw new ValidationError('studio_design siparişi için projectId zorunlu');
      }
      await projectService.getById(userId, input.projectId);
    }

    // Sahiplik: fatura profili sahibe ait olmalı (yoksa NotFound) — snapshot kaynağı.
    const profile = await billingService.getProfileById(userId, input.billingProfileId);

    // Fiyat backend'de yeniden hesaplanır; clientGrandTotal uyuşmazsa reddedilir.
    const quote = await pricingService.verifyClientTotal(
      { productTypeKey: input.productTypeKey, quantity: input.quantity, options: input.options },
      input.clientGrandTotal,
    );

    // Fatura bilgisi sipariş anında DONDURULUR.
    const billingSnapshot = {
      profileId: profile.id,
      type: profile.type,
      title: profile.title,
      taxOffice: profile.taxOffice,
      taxNumber: profile.taxNumber,
      idNumber: profile.idNumber,
      invoiceAddress: profile.invoiceAddress,
      shippingAddress: profile.shippingAddress,
      capturedAt: new Date().toISOString(),
    };

    const year = new Date().getFullYear();
    const options = input.options ?? {};
    let createdId: string | null = null;

    for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
      const orderId = randomUUID();
      try {
        await db.transaction(async (tx) => {
          // Yılın son numarasını FOR UPDATE ile kilitle, +1; yoksa (yılın ilk siparişi) 1.
          // Sabit-genişlikli sıfır-pad olduğundan sözlüksel DESC == sayısal DESC.
          const lastRows = await tx
            .select({ orderNumber: orders.orderNumber })
            .from(orders)
            .where(like(orders.orderNumber, `PR-${year}-%`))
            .orderBy(desc(orders.orderNumber))
            .limit(1)
            .for('update');
          let next = 1;
          if (lastRows.length > 0) {
            const seq = parseInt(lastRows[0].orderNumber.slice(-5), 10);
            next = (Number.isNaN(seq) ? 0 : seq) + 1;
          }
          const orderNumber = `PR-${year}-${String(next).padStart(5, '0')}`;

          await tx.insert(orders).values({
            id: orderId,
            userId,
            orderNumber,
            status: 'submitted',
            paymentStatus: 'none',
            billingProfileId: profile.id,
            billingSnapshot,
            subtotal: quote.subtotal,
            discountTotal: quote.discountTotal,
            taxTotal: quote.taxTotal,
            grandTotal: quote.grandTotal,
            currency: quote.currency,
            notes: input.notes ?? null,
          });

          await tx.insert(orderItems).values({
            id: randomUUID(),
            orderId,
            projectId: input.projectId ?? null,
            itemType,
            productTypeKey: input.productTypeKey,
            quantity: input.quantity,
            size: options.size ?? null,
            foldType: options.fold ?? null,
            paperType: options.paperType ?? null,
            paperWeight: options.paperWeight ?? null,
            colorMode: options.colorMode ?? null,
            coating: options.coating ?? null,
            binding: options.binding ?? null,
            printOptions: options,
            unitPrice: quote.unitPrice,
            lineTotal: quote.lineTotal,
            previewImageKey: input.previewImageKey ?? null,
          });
        });
        createdId = orderId;
        break;
      } catch (err) {
        // Numara çakışması: baştan yeniden hesapla (max'ı yeniden sorgular → yeni numara).
        // Aynı numara tekrar denenmez. Diğer hatalar doğrudan fırlatılır.
        if (isDuplicateOrderNumber(err)) {
          if (attempt < MAX_ORDER_NUMBER_ATTEMPTS) continue;
          throw new ConflictError('Sipariş numarası üretilemedi, lütfen tekrar deneyin');
        }
        throw err;
      }
    }

    return this.getByIdForUser(userId, createdId!);
  },

  async getByIdForUser(userId: string, orderId: string) {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
      with: { items: true },
    });
    if (!order) throw new ValidationError('Sipariş bulunamadı');
    return order;
  },

  async listForUser(userId: string) {
    return db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: { items: true },
      orderBy: [desc(orders.createdAt)],
    });
  },
};
