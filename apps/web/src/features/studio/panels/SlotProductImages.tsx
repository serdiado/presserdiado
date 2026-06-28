// Stüdyo içinde, seçili hücre ürününün resimlerini yönetir — düzenleme modalıyla BİREBİR aynı
// bileşeni (ProductImagesManager) yeniden kullanır: ekle / sil / sürükle-sırala / birincil-yap.
//
// Her değişiklikten sonra syncProductImagesFromLibrary() ile o SKU'nun güncel birincili açık
// projedeki TÜM yerleşimlerine yansır (sağ panel + popover ortak bu sarmalı kullanır).
//
// SKU yoksa (Excel-only ürün / boş hücre) hiçbir şey render edilmez — yalnız kütüphane kartı
// olan ürünlerde gösterilir.

import { ProductImagesManager } from '@/features/dashboard/components/ProductImagesManager';
import { syncProductImagesFromLibrary } from '../lib/syncProductImagesFromLibrary';

export function SlotProductImages({ sku }: { sku?: string | null }) {
  const trimmed = sku?.trim();
  if (!trimmed) return null;
  return (
    <ProductImagesManager
      sku={trimmed}
      onChange={() => {
        void syncProductImagesFromLibrary({ markDirty: true });
      }}
    />
  );
}
