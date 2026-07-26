// Katalog kategorileri ↔ quote/order option alanları + gösterim sabitleri.
// Tek kaynak: katalog snake_case kategori anahtarları burada camelCase quote alanlarına eşlenir.

import type { PrintOptionsValue } from './types';

// Katalog kategori (snake_case) → PrintOptionsValue alanı (camelCase).
export const CATEGORY_TO_OPTION_KEY: Record<string, keyof PrintOptionsValue> = {
  size: 'size',
  fold: 'fold',
  paper_type: 'paperType',
  paper_weight: 'paperWeight',
  color_mode: 'colorMode',
  coating: 'coating',
  binding: 'binding',
};

// Kategori başlıkları (TR).
export const CATEGORY_LABELS: Record<string, string> = {
  size: 'Ebat',
  fold: 'Kırım',
  paper_type: 'Kağıt',
  paper_weight: 'Gramaj',
  color_mode: 'Renk',
  coating: 'Kaplama',
  binding: 'Cilt',
};

// Selektörde gösterim sırası.
export const CATEGORY_ORDER: string[] = [
  'size',
  'fold',
  'paper_type',
  'paper_weight',
  'color_mode',
  'coating',
  'binding',
];

// Tasarımı etkileyen (affectsDesign) kategoriler stüdyoda kilitlenir — ebat/kırım canvas'tan gelir.
export const STUDIO_LOCKED_CATEGORIES: string[] = ['size', 'fold'];

// Kilitli alan tooltip metni.
export const DESIGN_LOCKED_NOTE =
  'Ebat ve kırım tasarımdan gelir; değiştirmek için yeni bir tasarım başlatın.';

// Pilot varsayılan seçimler (ebat/kırım hariç — onlar aktif şablondan türetilir).
// Katalog seed anahtarlarıyla hizalı (apps/api/src/db/seed.ts). binding kategorisi hiç
// seed edilmiyor (broşürde cilt yok) — varsayılanı da yok, PrintOptionsSelector zaten
// boş kategoriyi render etmiyor.
export const DEFAULT_OPTIONS: PrintOptionsValue = {
  paperType: 'kuse',
  paperWeight: '128',
  colorMode: '4-4',
  coating: 'yok',
};

// Varsayılan sipariş adedi (web/sihirbaz + stüdyo başlangıcı).
// BROCHURE_QUANTITY_CHOICES'ın ilk kademesiyle aynı olmak ZORUNDA: adet artık her yerde
// sabit kademelerden seçiliyor, listede olmayan bir varsayılan (eskiden 100'dü) <select>'te
// hiçbir seçenekle eşleşmez ve fiyat kademesiyle de tutmaz.
export const DEFAULT_QUANTITY = 500;

// Broşür adet seçenekleri — sabit liste, turmatsan'ın düzensiz adet kademeleri yerine
// Presserdiado'nun kendi kararı. Birim-fiyat + adet-indirimi modeliyle çalışır
// (pricing_rules.quantity=NULL); bkz. apps/api/src/db/seed.ts QUANTITY_TIERS.
//
// TEK KAYNAK @matbaapro/shared'da: sunucu da aynı listeye karşı doğrulama yapıyor
// (order.service.ts). Burada yalnızca yeniden dışa aktarılıyor ki mevcut importlar
// (vitrin, sihirbaz, stüdyo sipariş paneli) değişmeden çalışsın.
export { BROCHURE_QUANTITY_CHOICES } from '@matbaapro/shared';
