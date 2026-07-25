// Backend order/order_items şeması ile birebir — GET /orders, GET /orders/:id, GET /admin/orders
// hepsi bu şekli döner. Admin + müşteri (Siparişlerim) sayfaları arasında TEK KAYNAK; ikisi de
// aynı dondurulmuş kalem alanlarını gösterir, sadece görsel dili farklıdır.
import type { CatalogOptions } from './types';

export interface OrderItemApi {
  id: string;
  itemType: 'studio_design' | 'uploaded_file';
  productTypeKey: string | null;
  quantity: number;
  size: string | null;
  foldType: string | null;
  paperType: string | null;
  paperWeight: string | null;
  colorMode: string | null;
  coating: string | null;
  binding: string | null;
  unitPrice: string;
  lineTotal: string;
  productionPdfKey: string | null;
  previewImageKey: string | null;
}

export interface BillingSnapshotApi {
  profileId: string;
  type: string;
  title: string;
  taxOffice: string | null;
  taxNumber: string | null;
  idNumber: string | null;
  invoiceAddress: string | null;
  shippingAddress: string | null;
  capturedAt: string;
}

export interface OrderApi {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: string;
  currency: string;
  createdAt: string;
  billingSnapshot: BillingSnapshotApi | null;
  items: OrderItemApi[];
}

// catalog.options (kategori → seçenek listesi) → "kategori:key" → etiket sözlüğü.
// Dondurulmuş kalemler internal key saklar (ör. "z-fold", "4-4"); ekranda DB'nin insan-okur
// label'ı gösterilmeli, ham anahtar değil.
export function buildOptionLabelMap(catalog: CatalogOptions | null | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  if (!catalog) return map;
  for (const [category, opts] of Object.entries(catalog.options)) {
    for (const o of opts) map[`${category}:${o.key}`] = o.label;
  }
  return map;
}

// Bir sipariş kaleminin baskı özetini "A4 · Z Kırım · 128 gr · Kuşe · Parlak Selefon" biçiminde kurar.
export function describeOrderItem(item: OrderItemApi, labels: Record<string, string>): string {
  const look = (category: string, key: string | null) =>
    key ? (labels[`${category}:${key}`] ?? key) : null;
  return [
    look('size', item.size),
    look('fold', item.foldType),
    look('paper_weight', item.paperWeight),
    look('paper_type', item.paperType),
    look('coating', item.coating),
    look('color_mode', item.colorMode),
  ]
    .filter((v): v is string => Boolean(v))
    .join(' · ');
}
