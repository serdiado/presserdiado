export interface Product {
  id: string;
  userId: string;
  sku: string | null;
  name: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  unit: string | null;
  badge: string | null;
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
  category: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
