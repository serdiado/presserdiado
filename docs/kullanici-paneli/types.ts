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

export interface UsageStat {
  used: number;
  limit: number;
  period: string;         // "Bu Ay"
}
