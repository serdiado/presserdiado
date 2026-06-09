export interface ListProductsQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  price?: number;
  category?: string;
  unit?: string;
  description?: string;
}

export const productsService = {
  async list(userId: string, query: ListProductsQuery) {
    // Sadece route iskeletini destekleyecek boş servis metodu
    return {
      data: [] as any[],
      total: 0,
      page: query.page,
      limit: query.limit,
      totalPages: 0,
    };
  },

  async create(userId: string, input: CreateProductInput) {
    // Sadece route iskeletini destekleyecek boş servis metodu
    return {
      id: 'placeholder-uuid',
      userId,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async update(userId: string, id: string, input: Partial<CreateProductInput>) {
    // Sadece route iskeletini destekleyecek boş servis metodu
    return {
      id,
      userId,
      sku: 'placeholder-sku',
      name: 'placeholder-name',
      ...input,
      updatedAt: new Date().toISOString(),
    };
  },

  async remove(userId: string, id: string) {
    // Sadece route iskeletini destekleyecek boş servis metodu
    return {
      success: true,
      id,
      userId,
    };
  },
};
