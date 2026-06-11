// Sipariş modülü tipleri — order-module-architecture.md veri modeliyle hizalı.
// ÜRETİM akışı (status) ile ÖDEME akışı (paymentStatus) ayrı alanlar.
export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'in_production'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'none' | 'pending' | 'paid' | 'refunded';

export type OrderItemType = 'studio_design' | 'uploaded_file';

// Sipariş anında fatura profilinden DONDURULAN bilgi (profil silinse de korunur).
export interface BillingSnapshot {
  profileId: string;
  type: 'individual' | 'corporate';
  title: string;
  taxOffice: string | null;
  taxNumber: string | null;
  idNumber: string | null;
  invoiceAddress: string;
  shippingAddress: string;
  capturedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  projectId: string | null;
  itemType: OrderItemType;
  productTypeKey: string | null;
  // Baskı özellikleri — sipariş anında dondurulur.
  quantity: number;
  size: string | null;
  foldType: string | null;
  paperType: string | null;
  paperWeight: string | null;
  colorMode: string | null;
  coating: string | null;
  binding: string | null;
  printOptions: Record<string, unknown> | null;
  // Para alanları DECIMAL(10,2) → string.
  unitPrice: string;
  lineTotal: string;
  productionPdfKey: string | null;
  previewImageKey: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  billingProfileId: string | null;
  billingSnapshot: BillingSnapshot | null;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  grandTotal: string;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}
