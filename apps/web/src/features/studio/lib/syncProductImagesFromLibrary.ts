// Yerleştirilmiş ürün resimlerini SKU'ya göre güncel kütüphaneyle yeniden bağlar:
// /products/with-images'ten TAM SKU→birincil-URL haritasını çekip reconcileProductImagesBySku'ya verir.
//
// TEK-KAYNAK senkron: hem proje açılışında (StudioPage) hem de Stüdyo içinde resim
// ekleme/silme/sıralama sonrası (SlotProductImages) çağrılır.
//
// NEDEN TAM HARİTA: reconcileProductImagesBySku, haritada OLMAYAN + kütüphane-URL'li ürünleri
// "Resim Yok"a çeker. Tek-SKU'luk kısmi harita diğer ürünleri yanlışlıkla temizler — bu yüzden
// her seferinde tam liste alınır (kütüphaneden silinen → temizlenir, değişen/sıralanan → güncellenir).

import api from '@/lib/api';
import { toAbsoluteUrl } from '@/lib/upload';
import { normalizeSku } from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';

// markDirty: kullanıcı eylemi (Stüdyo'da resim ekle/sil/sırala) sonrası çağrılırsa ve gerçekten
// bir görsel değiştiyse projeyi dirty işaretler ("Kaydet" aktifleşsin). Proje AÇILIŞINDA verilmez
// → açılış reconcile'ı dirty yapmaz.
export async function syncProductImagesFromLibrary(opts?: { markDirty?: boolean }): Promise<void> {
  try {
    const { data } = await api.get<{ sku: string; primaryImage: string | null }[]>(
      '/products/with-images',
    );
    const map = new Map<string, string>();
    for (const p of data ?? []) {
      if (p.sku && p.primaryImage) map.set(normalizeSku(p.sku), toAbsoluteUrl(p.primaryImage));
    }
    const changed = useCatalogStore.getState().reconcileProductImagesBySku(map);
    if (opts?.markDirty && changed) {
      useCatalogStore.getState().setIsDirty(true);
    }
  } catch (e) {
    console.error('Ürün resmi senkronu başarısız:', e);
  }
}
