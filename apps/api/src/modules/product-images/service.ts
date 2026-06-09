export interface CreateProductImageInput {
  sku: string;
  imageKey: string;
  fileName?: string;
  sortOrder?: number;
  isTransparent?: boolean;
}

export const productImagesService = {
  async getBySku(userId: string, sku: string) {
    // Sadece route iskeletini destekleyecek boş servis metodu
    return [] as any[];
  },

  async create(userId: string, input: CreateProductImageInput) {
    // Sadece route iskeletini destekleyecek boş servis metodu
    return {
      id: 'placeholder-image-uuid',
      userId,
      ...input,
      createdAt: new Date().toISOString(),
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
