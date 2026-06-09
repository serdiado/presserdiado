export interface CreateMediaAssetInput {
  type: 'logo' | 'background' | 'shape' | 'other';
  imageKey: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
}

export interface ListMediaAssetsQuery {
  type?: 'logo' | 'background' | 'shape' | 'other';
}

export const mediaAssetsService = {
  async list(userId: string, query: ListMediaAssetsQuery) {
    // Sadece route iskeletini destekleyecek boş servis metodu
    return [] as any[];
  },

  async create(userId: string, input: CreateMediaAssetInput) {
    // Sadece route iskeletini destekleyecek boş servis metodu
    return {
      id: 'placeholder-asset-uuid',
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
