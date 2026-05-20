// Fiyat hesaplama mantığı — config tabanlı formül.
// Tüm metrikler pricing.config.json'dan beslenir.

import rawConfig from './pricing.config.json';

export interface PriceFieldOption {
  id: string;
  title: string;
  multiplier?: number;
  fixedPerPiece?: number;
}

export interface PriceFieldNumber {
  key: string;
  label: string;
  type: 'number';
  min: number;
  max: number;
  step: number;
  default: number;
  suffix?: string;
}

export interface PriceFieldSelect {
  key: string;
  label: string;
  type: 'select';
  default: string;
  options: PriceFieldOption[];
}

export type PriceField = PriceFieldNumber | PriceFieldSelect;

export interface QuantityTier {
  min: number;
  discount: number;
}

export interface PricingConfig {
  currency: string;
  currencySymbol: string;
  base: {
    pricePerPagePerPieceMm2: number;
    minimumOrderPrice: number;
  };
  fields: PriceField[];
  quantityTiers: QuantityTier[];
  vatRate: number;
  shippingFlat: number;
}

export const pricingConfig = rawConfig as PricingConfig;

export interface PriceInputs {
  quantity: number;
  pageCount: number;
  pageAreaMm2: number; // tek sayfa alanı (kapalı ölçü mm²)
  fieldValues: Record<string, string>; // select alanlarının id'leri
}

export interface PriceBreakdown {
  baseSubtotal: number;
  multiplierFactor: number;
  perPieceFixed: number;
  tierDiscount: number;
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  unitPrice: number;
  appliedTier: QuantityTier;
}

function findTier(qty: number, tiers: QuantityTier[]): QuantityTier {
  const sorted = [...tiers].sort((a, b) => b.min - a.min);
  return sorted.find((t) => qty >= t.min) ?? { min: 0, discount: 0 };
}

export function calculatePrice(input: PriceInputs): PriceBreakdown {
  const cfg = pricingConfig;
  const { quantity, pageCount, pageAreaMm2, fieldValues } = input;

  // Birim ham: alan × birim fiyat × sayfa
  const perPageRaw = pageAreaMm2 * cfg.base.pricePerPagePerPieceMm2;
  const baseSubtotal = perPageRaw * pageCount * quantity;

  // Multiplier'lar (kağıt, renk, kaplama, vs.)
  let multiplierFactor = 1;
  let perPieceFixed = 0;
  for (const f of cfg.fields) {
    if (f.type !== 'select') continue;
    const chosenId = fieldValues[f.key] ?? f.default;
    const opt = f.options.find((o) => o.id === chosenId);
    if (!opt) continue;
    if (typeof opt.multiplier === 'number') multiplierFactor *= opt.multiplier;
    if (typeof opt.fixedPerPiece === 'number') perPieceFixed += opt.fixedPerPiece;
  }

  const fixedTotal = perPieceFixed * quantity;
  const beforeTier = baseSubtotal * multiplierFactor + fixedTotal;

  const tier = findTier(quantity, cfg.quantityTiers);
  const tierDiscount = beforeTier * tier.discount;

  let subtotal = beforeTier - tierDiscount;
  if (subtotal < cfg.base.minimumOrderPrice) subtotal = cfg.base.minimumOrderPrice;

  const vat = subtotal * cfg.vatRate;
  const shipping = cfg.shippingFlat;
  const total = subtotal + vat + shipping;
  const unitPrice = quantity > 0 ? total / quantity : 0;

  return {
    baseSubtotal,
    multiplierFactor,
    perPieceFixed: fixedTotal,
    tierDiscount,
    subtotal,
    vat,
    shipping,
    total,
    unitPrice,
    appliedTier: tier,
  };
}

export function formatCurrency(amount: number): string {
  return `${pricingConfig.currencySymbol}${amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
