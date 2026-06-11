// Ortak baskı-sipariş tipleri. PrintOptionsSelector (S5 stüdyo + S6 web) bunları paylaşır.
// Backend sözleşmesiyle birebir: katalog (GET /catalog/.../options) ve quote (POST /pricing/quote).

// Quote/order body'sinde kullanılan camelCase seçim alanları. Katalog kategori anahtarları
// (snake_case) constants.ts'teki CATEGORY_TO_OPTION_KEY ile buraya eşlenir.
export interface PrintOptionsValue {
  size?: string;
  fold?: string; // tasarımı etkiler, fiyatı etkilemez — yine de order_items'a dondurulur
  paperType?: string;
  paperWeight?: string;
  colorMode?: string;
  coating?: string;
  binding?: string;
}

// GET /catalog/product-types/:key/options dönüşündeki tek seçenek.
export interface CatalogOption {
  key: string;
  label: string;
  affectsDesign: boolean;
  metadata: unknown;
  sortOrder: number;
}

export interface CatalogOptions {
  productType: { key: string; name: string };
  // Anahtar = kategori (snake_case): size, fold, paper_type, paper_weight, color_mode, coating, binding
  options: Record<string, CatalogOption[]>;
}

// POST /pricing/quote dönüşü — backend PriceQuote ile birebir (parasal alanlar string).
export interface PriceQuote {
  productTypeKey: string;
  productTypeId: string;
  quantity: number;
  matchedRuleId: string;
  currency: string;
  unitPrice: string;
  lineTotal: string;
  setupFee: string;
  subtotal: string;
  discountPct: number;
  discountTotal: string;
  taxRate: number;
  taxTotal: string;
  grandTotal: string;
}

const TRY_FORMATTER = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
});

// Backend parasal değerleri string döner; güvenli parse + TRY biçimleme.
export function formatTRY(value: string | number | null | undefined): string {
  const n = typeof value === 'number' ? value : parseFloat(value ?? '');
  return TRY_FORMATTER.format(Number.isFinite(n) ? n : 0);
}
