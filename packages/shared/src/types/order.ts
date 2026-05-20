export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'sent_to_printer'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  projectId: string;
  printConfig: Record<string, unknown>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  commissionRate: number;
  commissionAmount: number;
  status: OrderStatus;
  printerId: string | null;
  exportPdfKey: string | null;
  paymentRef: string | null;
  createdAt: string;
  updatedAt: string;
}
