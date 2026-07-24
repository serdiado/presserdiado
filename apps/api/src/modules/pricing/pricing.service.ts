// Paylaşılan fiyatlandırma katmanı — tek kaynak. Katalogtan (pricing_rules) okur,
// fiyatı backend'de hesaplar. Frontend tutarına asla güvenilmez: sipariş oluşturmada
// verifyClientTotal ile yeniden hesaplanıp doğrulanır (S3).
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { productTypes, pricingRules, printOptions } from '../../db/schema/index.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';

export interface PrintOptionSelection {
  size?: string;
  fold?: string; // tasarımı etkiler ama fiyatı etkilemez (pricing_rules'ta fold kolonu yok)
  paperType?: string;
  paperWeight?: string;
  colorMode?: string;
  coating?: string;
  binding?: string;
}

export interface QuoteInput {
  productTypeKey: string;
  quantity: number;
  options?: PrintOptionSelection;
}

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

interface QuantityTier {
  min: number;
  discountPct: number;
}

// pricing_rules kolonu -> istek option alanı eşlemesi (fiyatı etkileyen kriterler).
const RULE_MATCH_COLUMNS = [
  ['sizeKey', 'size'],
  ['paperTypeKey', 'paperType'],
  ['paperWeightKey', 'paperWeight'],
  ['colorModeKey', 'colorMode'],
  ['coatingKey', 'coating'],
  ['bindingKey', 'binding'],
] as const;

// print_options.category (snake_case) <-> istek option alanı (camelCase) eşlemesi.
// Web tarafındaki CATEGORY_TO_OPTION_KEY'in (apps/web/.../print-order/constants.ts) aynası —
// çapraz-eksen bağımlılık doğrulaması (requires/excludes) için gerekli.
const CATEGORY_TO_FIELD: Record<string, keyof PrintOptionSelection> = {
  size: 'size',
  fold: 'fold',
  paper_type: 'paperType',
  paper_weight: 'paperWeight',
  color_mode: 'colorMode',
  coating: 'coating',
  binding: 'binding',
};
const FIELD_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_TO_FIELD).map(([cat, field]) => [field, cat]),
) as Record<keyof PrintOptionSelection, string>;

interface DependencyMeta {
  requires?: Record<string, string>;
  excludes?: Record<string, string>;
}

// Çapraz-eksen bağımlılığı (ör. broşürde "Renk: Tek Yön" yalnız Kırım=Yok iken geçerli).
// Aynı requires/excludes metadata'sı PrintOptionsSelector'da UI filtresi olarak da kullanılır
// (apps/web/.../print-order/PrintOptionsSelector.tsx) — UI zaten bu kombinasyonları sunmuyor,
// ama backend tek gerçek kaynak olduğundan (frontend'e güvenilmez) burada da zorunlu kılınır.
function assertOptionDependencies(
  optionRows: Array<{ category: string; key: string; label: string; metadata: unknown }>,
  options: PrintOptionSelection,
): void {
  for (const [field, selectedKey] of Object.entries(options) as [keyof PrintOptionSelection, string | undefined][]) {
    if (!selectedKey) continue;
    const category = FIELD_TO_CATEGORY[field];
    const row = optionRows.find((r) => r.category === category && r.key === selectedKey);
    const meta = row?.metadata as DependencyMeta | null | undefined;
    if (!meta) continue;
    if (meta.requires) {
      for (const [reqCategory, reqValue] of Object.entries(meta.requires)) {
        const reqField = CATEGORY_TO_FIELD[reqCategory];
        if (reqField && options[reqField] !== reqValue) {
          throw new ValidationError(
            `Geçersiz kombinasyon: "${row!.label}" yalnız ${reqCategory}=${reqValue} iken seçilebilir`,
          );
        }
      }
    }
    if (meta.excludes) {
      for (const [exCategory, exValue] of Object.entries(meta.excludes)) {
        const exField = CATEGORY_TO_FIELD[exCategory];
        if (exField && options[exField] === exValue) {
          throw new ValidationError(
            `Geçersiz kombinasyon: "${row!.label}", ${exCategory}=${exValue} iken seçilemez`,
          );
        }
      }
    }
  }
}

const toCents = (value: string): number => Math.round(parseFloat(value) * 100);
const fromCents = (cents: number): string => (cents / 100).toFixed(2);

function resolveDiscountPct(tiers: QuantityTier[], quantity: number): number {
  let pct = 0;
  for (const tier of tiers) {
    if (quantity >= tier.min && tier.discountPct > pct) pct = tier.discountPct;
  }
  return pct;
}

export const pricingService = {
  async calculateQuote(input: QuoteInput): Promise<PriceQuote> {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      throw new ValidationError('Adet en az 1 olmalı');
    }
    const options = input.options ?? {};

    const productType = await db.query.productTypes.findFirst({
      where: and(eq(productTypes.slug, input.productTypeKey), eq(productTypes.active, true)),
    });
    if (!productType) {
      throw new NotFoundError(`Ürün tipi bulunamadı: ${input.productTypeKey}`);
    }

    const optionRows = await db
      .select({
        category: printOptions.category,
        key: printOptions.key,
        label: printOptions.label,
        metadata: printOptions.metadata,
      })
      .from(printOptions)
      .where(and(eq(printOptions.productTypeId, productType.id), eq(printOptions.isActive, true)));
    assertOptionDependencies(optionRows, options);

    const rules = await db
      .select()
      .from(pricingRules)
      .where(and(eq(pricingRules.productTypeId, productType.id), eq(pricingRules.isActive, true)));

    // En spesifik eşleşen kuralı seç: NULL olmayan her kriter isteğe uymalı;
    // skor = NULL olmayan kriter sayısı. Eşitlikte deterministik (ilk eklenen / en eski).
    // PAKET kuralı (quantity dolu): yalnız tam o adette eşleşir ve kriter sayılır —
    // aynı komboda paket kuralı, birim-fiyat (wildcard) kuralından daha spesifiktir.
    let best: typeof rules[number] | null = null;
    let bestScore = -1;
    for (const rule of rules) {
      let score = 0;
      let matches = true;
      if (rule.quantity != null) {
        if (rule.quantity !== input.quantity) continue;
        score += 1;
      }
      for (const [ruleCol, optKey] of RULE_MATCH_COLUMNS) {
        const ruleVal = rule[ruleCol];
        if (ruleVal == null) continue; // wildcard
        score += 1;
        if (ruleVal !== options[optKey]) {
          matches = false;
          break;
        }
      }
      if (!matches) continue;
      const isMoreSpecific = score > bestScore;
      const isOlderTie =
        score === bestScore && best != null && rule.createdAt < best.createdAt;
      if (isMoreSpecific || isOlderTie) {
        best = rule;
        bestScore = score;
      }
    }

    if (!best) {
      throw new ValidationError('Bu kombinasyon için fiyat kuralı bulunamadı');
    }

    const basePriceCents = toCents(best.basePrice);
    const setupFeeCents = toCents(best.setupFee);
    // Paket kuralında basePrice paketin TOPLAM fiyatıdır; birim-fiyat kuralında adet başıdır.
    const isPackageRule = best.quantity != null;
    const lineSubtotalCents = isPackageRule ? basePriceCents : basePriceCents * input.quantity;
    const unitPriceCents = isPackageRule
      ? Math.round(basePriceCents / input.quantity)
      : basePriceCents;

    // Adet indirimi paket kuralına uygulanmaz (paket fiyatı zaten adete özel).
    const tiers = isPackageRule ? [] : ((best.quantityTiers as QuantityTier[] | null) ?? []);
    const discountPct = resolveDiscountPct(tiers, input.quantity);
    const discountCents = Math.round((lineSubtotalCents * discountPct) / 100);

    const subtotalCents = lineSubtotalCents + setupFeeCents;
    const taxBaseCents = subtotalCents - discountCents;
    const taxRate = parseFloat(best.taxRate);
    const taxCents = Math.round((taxBaseCents * taxRate) / 100);
    const grandTotalCents = taxBaseCents + taxCents;

    return {
      productTypeKey: input.productTypeKey,
      productTypeId: productType.id,
      quantity: input.quantity,
      matchedRuleId: best.id,
      currency: 'TRY',
      unitPrice: fromCents(unitPriceCents),
      lineTotal: fromCents(lineSubtotalCents),
      setupFee: fromCents(setupFeeCents),
      subtotal: fromCents(subtotalCents),
      discountPct,
      discountTotal: fromCents(discountCents),
      taxRate,
      taxTotal: fromCents(taxCents),
      grandTotal: fromCents(grandTotalCents),
    };
  },

  // Sipariş oluşturmada (S3) kullanılır: tutar backend'de yeniden hesaplanır, frontend'den
  // gelen grandTotal ile karşılaştırılır; uyuşmazsa reddedilir. Doğrulanan quote döner.
  async verifyClientTotal(input: QuoteInput, clientGrandTotal: string | number): Promise<PriceQuote> {
    const quote = await this.calculateQuote(input);
    const clientCents = toCents(String(clientGrandTotal));
    const serverCents = toCents(quote.grandTotal);
    if (clientCents !== serverCents) {
      throw new ValidationError(
        `Fiyat doğrulaması başarısız: beklenen ${quote.grandTotal}, gelen ${clientGrandTotal}`,
      );
    }
    return quote;
  },
};
