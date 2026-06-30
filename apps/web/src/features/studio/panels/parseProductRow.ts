// Ürün Excel/CSV satırını ProductInfo'ya çeviren SAF dönüştürücü (React'ten bağımsız → birim test
// edilebilir). ProductManagement yüklemesi + testleri bunu paylaşır.
//
// KİLİTLİ SÜTUN DÜZENİ (konum-bazlı; başlık metni serbest, sistem SIRAYA bakar):
//   0=POS · 1=SKU · 2=Ürün Adı · 3=Fiyat · 4=Görsel URL (5. opsiyonel)
// Başlık adına bağlı eski eşleştirme kaldırıldı — "Ürün Adı"/"Fiyat" gibi okunur başlıklar da çalışsın
// ve dosya formatı tek standartta kilitlensin diye. POS → raw.POS olarak taşınır (yerleştirme okur).

import type { ProductInfo } from '@matbaapro/shared';

export type ExcelCell = string | number | undefined;

export function rowToProduct(cols: ExcelCell[], i: number): ProductInfo {
  const at = (idx: number) => String(cols[idx] ?? '').trim();
  const sku = at(1) || `u-${i}`;
  return {
    id: sku,
    sku,
    name: at(2) || 'İsimsiz',
    price: at(3) || '0',
    category: 'Yüklenen',
    image: at(4),
    raw: { POS: at(0) },
  };
}
