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

// Vitrin satış modu — product_types.sale_mode ile birebir.
export type SaleMode = 'design' | 'upload' | 'quote';

// configSchema.ui — seed'in yazdığı web UI ipuçları (kategori etiketi, adet birimi, sunum).
// presentation: 'picker' = sade kart seçici (hazır paketler), 'wizard' = sıralı sihirbaz (matris).
export interface ProductTypeUiHints {
  optionLabels?: Record<string, string>;
  quantityUnit?: string;
  presentation?: 'picker' | 'wizard';
}

// GET /catalog/product-types dönüşündeki ürün tipi (options endpoint'i de aynısını döner).
export interface CatalogProductType {
  key: string;
  name: string;
  category: string | null;
  description: string | null;
  saleMode: SaleMode;
  dimensions: unknown;
  configSchema: unknown;
  sortOrder: number;
}

export interface CatalogOptions {
  productType: CatalogProductType;
  // Anahtar = kategori (snake_case): size, fold, paper_type, paper_weight, color_mode, coating, binding
  options: Record<string, CatalogOption[]>;
}

// GET /catalog/product-types/:key/packages — paket kuralı. basePrice/taxRate yalnız kart
// fiyat etiketi içindir; bağlayıcı fiyat yine /pricing/quote'tan gelir.
export interface CatalogPackage {
  quantity: number;
  sizeKey: string | null;
  paperTypeKey: string | null;
  paperWeightKey: string | null;
  colorModeKey: string | null;
  coatingKey: string | null;
  bindingKey: string | null;
  basePrice: string;
  taxRate: string;
}

// Kart seçici için: paket taban fiyatından KDV-dahil etiket fiyatı.
export function packagePriceInclTax(pkg: CatalogPackage): number {
  const base = parseFloat(pkg.basePrice);
  const rate = parseFloat(pkg.taxRate);
  if (!Number.isFinite(base)) return 0;
  return base * (1 + (Number.isFinite(rate) ? rate : 0) / 100);
}

// configSchema içinden ui ipuçlarını güvenli çıkar.
export function uiHintsOf(productType: CatalogProductType | null | undefined): ProductTypeUiHints {
  const schema = productType?.configSchema as { ui?: ProductTypeUiHints } | null | undefined;
  return schema?.ui ?? {};
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
