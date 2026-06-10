// Kullanıcı Paneli — TypeScript tipleri
// apps/web/src/features/dashboard/types.ts

export type NavItemId =
  | 'home'
  | 'projects'
  | 'templates'
  | 'lists'
  | 'brand'
  | 'orders'
  | 'files'
  | 'team'
  | 'billing'
  | 'account'
  | 'help';

export interface NavItem {
  id: NavItemId;
  label: string;
  badge?: string | number;
}

export type ProjectStatus = 'taslak' | 'baskıda' | 'kargoda' | 'teslim' | 'onayda';

export interface Project {
  id: string | number;
  name: string;
  type: string;         // "Katalog · A4 · 8 sayfa"
  updatedAt: string;    // ISO string veya formatlanmış tarih
  status: ProjectStatus;
  thumbnailKey?: string | null;
  coverColor?: string;  // mock için placeholder arka plan rengi
}

export type OrderStatus = 'yeni' | 'onay' | 'baskıda' | 'kargoda' | 'teslim' | 'iptal';

export interface Order {
  id: string;
  code: string;           // "SİP-2026-0341"
  name: string;
  type: string;
  qty: number;
  totalPrice: string;     // "4.890" (display)
  date: string;
  status: OrderStatus;
}

export interface BrandAsset {
  id: string;
  label: string;
  fileType: string;       // "PNG · SVG"
  fileSize: string;       // "2 MB"
  bgColor: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface FontEntry {
  name: string;
  use: string;
  sample: string;
  weights: string;
}

export interface User {
  id: string;
  email: string;
  companyName?: string;
  displayName?: string;   // "Mehmet Kara"
  avatarInitials?: string;// "MK"
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price?: string | number | null;
  currency?: string;
  category?: string | null;
  unit?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  userId: string;
  sku: string | null;
  imageKey: string;
  fileName?: string | null;
  sortOrder: number;
  isTransparent: boolean;
  createdAt?: string;
}

export type MediaAssetType = 'logo' | 'background' | 'shape' | 'other';

export interface MediaAsset {
  id: string;
  userId: string;
  type: MediaAssetType;
  imageKey: string;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  createdAt?: string;
}

export interface UsageStat {
  used: number;
  limit: number;
  period: string;         // "Bu Ay"
}
