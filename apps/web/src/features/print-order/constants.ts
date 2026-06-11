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
// Katalog seed anahtarlarıyla hizalı (apps/api/src/db/seed.ts).
export const DEFAULT_OPTIONS: PrintOptionsValue = {
  paperType: 'kuse-mat',
  paperWeight: '135',
  colorMode: '4-4',
  coating: 'yok',
  binding: 'yok',
};
