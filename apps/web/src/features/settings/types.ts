export type BillingProfileType = 'individual' | 'corporate';

export interface BillingProfile {
  id: string;
  type: BillingProfileType;
  title: string;
  taxOffice: string | null;
  taxNumber: string | null;
  idNumber: string | null;
  invoiceAddress: string;
  shippingAddress: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBillingProfileInput {
  type?: BillingProfileType;
  title: string;
  taxOffice?: string | null;
  taxNumber?: string | null;
  idNumber?: string | null;
  invoiceAddress: string;
  shippingAddress: string;
  isDefault?: boolean;
}

export type UpdateBillingProfileInput = Partial<CreateBillingProfileInput>;