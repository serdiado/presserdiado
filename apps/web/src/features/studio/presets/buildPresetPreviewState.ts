// Önizleme (thumbnail) için STANDART bir tuval durumunu store'a yükler: tek forma / 2 sayfa /
// tek kırım (Template2'nin 1. forması = yan yana 2 sayfa) + preset uygulanmış. Stil/grid/banner/
// zemin mantığının TEK otoritesi applyPreset olduğundan onu AYNEN yeniden kullanır.
//
// Ürün slotları, GERÇEK ürün yerine NÖTR placeholder içerikle doldurulur: fiyat kutusu (tema
// renginde), isim tipografisi ve görsel-alanı yalnızca slot.product DOLUYKEN render edildiğinden
// (Slot.tsx), "ürün hariç tüm özellikleri" (renkler, fiyat kutusu, slot yapısı) göstermenin tek
// yolu budur. Placeholder = gri görsel + örnek isim/fiyat; kullanıcının gerçek ürünü DEĞİL.
// /preset-preview route'u mount'ta bunu çağırır.

import type { ProductInfo, StudioPreset } from '@matbaapro/shared';
import { Template2 } from '@matbaapro/shared';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { buildFormasForTemplate, clone, initialGlobalSettings } from '@/stores/studio/defaults';

// Nötr görsel-alanı dolgusu (gerçek foto DEĞİL): hem beyaz hem koyu hücrede görünür açık-gri kutu.
const PREVIEW_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">' +
      '<rect width="240" height="240" rx="10" fill="#d6dbe4"/>' +
      '<path d="M40 170l50-55 35 38 28-30 47 47z" fill="#b8c0cd"/>' +
      '<circle cx="92" cy="78" r="20" fill="#b8c0cd"/>' +
      '</svg>',
  );

// Önizlemede her ürün slotunu dolduran nötr placeholder ürün (örnek isim + fiyat → tema
// renkleri/tipografisi görünür). Tüm hücrelerde aynı: bir şablon önizlemesi, veri değil.
function placeholderProduct(i: number): ProductInfo {
  return { id: `preview-${i}`, name: 'Ürün Adı', price: '9,99', image: PREVIEW_IMAGE };
}

/**
 * Verilen preset'in standart önizlemesini store'a yükler. Taban = Template2 (half-fold);
 * Forma 1 tam olarak "tek forma / 2 sayfa / tek kırım" yapısıdır. applyPreset bunun
 * üzerine preset stilini/grid'ini/banner alanlarını/sayfa zeminlerini uygular; ardından
 * görünür ürün slotları nötr placeholder ile doldurulur (chrome görünür olsun).
 */
export function loadPresetPreviewState(preset: StudioPreset): void {
  const formas = buildFormasForTemplate(Template2);
  useCatalogStore.setState({
    activeTemplate: Template2,
    formas,
    activeFormaId: 1,
    activeTab: 'outer',
    globalSettings: clone(initialGlobalSettings),
    productPool: [],
    tempProductPool: [],
  });
  // Grid/banner/zemin/stil: applyPreset (productPool boş → taze, ürünsüz slotlar).
  useCatalogStore.getState().applyPreset(preset);

  // Ürün slotlarını nötr placeholder ile doldur → fiyat kutusu (tema renginde), isim ve görsel
  // alanı render edilir. Banner/free slotlara (birleşmiş alanlar) DOKUNMA. Layout değişmez
  // (yalnız slot.product set edilir) → recalculate gerekmez.
  const filled = clone(useCatalogStore.getState().formas);
  let n = 0;
  for (const f of filled) {
    for (const p of f.pages) {
      for (const s of p.slots) {
        if (s.role === 'product' && !s.hidden) s.product = placeholderProduct(n++);
      }
    }
  }
  useCatalogStore.setState({ formas: filled });

  // Önizleme modu: "Boş Hücre" / "Serbest Alan" placeholder'larını + seçim/izolasyon chrome'unu
  // gizler (uygulamanın hazır flag'i). Temiz, editörsüz bir önizleme bırakır.
  useUIStore.getState().setPreviewMode(true);
}
