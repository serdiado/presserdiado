// Katalog seed — broşür product_type + print_options + pricing_rules (pilot).
// Idempotent: tekrar çalıştırıldığında duplikasyon olmaz (brochure'a ait print_options
// ve pricing_rules silinip yeniden yazılır; product_type slug ile upsert edilir).
//   çalıştırma: npm run db:seed
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { productTypes, printOptions, pricingRules } from './schema/index.js';

const PRODUCT_TYPE_SLUG = 'brochure';

type OptionSeed = {
  category: typeof printOptions.$inferInsert['category'];
  key: string;
  label: string;
  affectsDesign?: boolean;
  metadata?: Record<string, unknown>;
};

// Key'ler studio değerleriyle hizalı (pricing.config.json + wizard.config.json).
const OPTION_SEEDS: OptionSeed[] = [
  // size — tasarımı etkiler (affectsDesign)
  { category: 'size', key: 'A3', label: 'A3', affectsDesign: true, metadata: { widthMm: 297, heightMm: 420, unit: 'mm' } },
  { category: 'size', key: 'A4', label: 'A4', affectsDesign: true, metadata: { widthMm: 210, heightMm: 297, unit: 'mm' } },
  { category: 'size', key: 'A5', label: 'A5', affectsDesign: true, metadata: { widthMm: 148, heightMm: 210, unit: 'mm' } },
  { category: 'size', key: 'A6', label: 'A6', affectsDesign: true, metadata: { widthMm: 105, heightMm: 148, unit: 'mm' } },
  // fold — tasarımı etkiler (affectsDesign)
  { category: 'fold', key: 'none', label: 'Kırım Yok', affectsDesign: true, metadata: { pageCount: 2 } },
  { category: 'fold', key: 'half-fold', label: 'Tek Kırım', affectsDesign: true, metadata: { pageCount: 4 } },
  { category: 'fold', key: 'roll-fold', label: 'Çift Kırım', affectsDesign: true, metadata: { pageCount: 6 } },
  { category: 'fold', key: 'z-fold', label: 'Z Kırım', affectsDesign: true, metadata: { pageCount: 6 } },
  { category: 'fold', key: 'triple-fold', label: 'Üç Kırım', affectsDesign: true, metadata: { pageCount: 8 } },
  { category: 'fold', key: 'accordion-fold', label: 'Akerdiyon', affectsDesign: true, metadata: { pageCount: 8 } },
  { category: 'fold', key: 'map-fold', label: 'Harita', affectsDesign: true, metadata: { pageCount: 6 } },
  // paper_type
  { category: 'paper_type', key: 'kuse-parlak', label: 'Kuşe Parlak' },
  { category: 'paper_type', key: 'kuse-mat', label: 'Kuşe Mat' },
  { category: 'paper_type', key: '1-hamur', label: '1. Hamur' },
  { category: 'paper_type', key: 'bristol', label: 'Bristol' },
  { category: 'paper_type', key: 'geri-donusum', label: 'Geri Dönüşüm' },
  // paper_weight
  { category: 'paper_weight', key: '90', label: '90 gr' },
  { category: 'paper_weight', key: '115', label: '115 gr' },
  { category: 'paper_weight', key: '135', label: '135 gr' },
  { category: 'paper_weight', key: '170', label: '170 gr' },
  { category: 'paper_weight', key: '250', label: '250 gr' },
  { category: 'paper_weight', key: '350', label: '350 gr' },
  // color_mode
  { category: 'color_mode', key: '1-0', label: 'Siyah Tek Yön (1+0)' },
  { category: 'color_mode', key: '1-1', label: 'Siyah Çift Yön (1+1)' },
  { category: 'color_mode', key: '4-0', label: 'Renkli Tek Yön (4+0)' },
  { category: 'color_mode', key: '4-4', label: 'Renkli Çift Yön (4+4)' },
  // coating
  { category: 'coating', key: 'yok', label: 'Kaplama Yok' },
  { category: 'coating', key: 'selefon-mat', label: 'Mat Selefon' },
  { category: 'coating', key: 'selefon-parlak', label: 'Parlak Selefon' },
  { category: 'coating', key: 'uv-lake', label: 'UV Lak' },
  { category: 'coating', key: 'soft-touch', label: 'Soft Touch' },
  // binding
  { category: 'binding', key: 'yok', label: 'Cilt Yok' },
  { category: 'binding', key: 'tel-dikis', label: 'Tel Dikiş' },
  { category: 'binding', key: 'spiral', label: 'Spiral' },
  { category: 'binding', key: 'ciltli', label: 'Ciltli' },
];

// Adet indirim kademeleri — belge şekli ({min, discountPct}). pilotta tüm kurallarda ortak.
const QUANTITY_TIERS = [
  { min: 1, discountPct: 0 },
  { min: 100, discountPct: 8 },
  { min: 500, discountPct: 15 },
  { min: 1000, discountPct: 22 },
  { min: 5000, discountPct: 30 },
  { min: 10000, discountPct: 38 },
];

// Kombinasyon kuralları — NULL alan "bu kritere bakma" demek; servis en spesifik eşleşeni seçer.
type RuleSeed = Partial<Pick<typeof pricingRules.$inferInsert,
  'sizeKey' | 'paperTypeKey' | 'paperWeightKey' | 'colorModeKey' | 'coatingKey' | 'bindingKey'>> & {
  basePrice: string;
  setupFee?: string;
};
const PRICING_RULE_SEEDS: RuleSeed[] = [
  // Karar: aracı kurum modeli + dijital baskı → kalıp/hazırlık ücreti YOK. setupFee
  // kolonu ileride kullanılmak üzere şemada kalır ama pilotta tüm kurallarda 0.
  { basePrice: '3.00', setupFee: '0' }, // catch-all (tüm kriterler NULL)
  { sizeKey: 'A5', basePrice: '1.80' },
  { sizeKey: 'A4', basePrice: '2.50' },
  { sizeKey: 'A3', basePrice: '3.80' },
  { sizeKey: 'A3', paperTypeKey: 'bristol', basePrice: '4.50' }, // 2-kriterli spesifik kural
];

async function seed() {
  // 1) product_type (brochure) — slug ile upsert; varsa studio kolonlarına dokunma.
  let productType = await db.query.productTypes.findFirst({
    where: eq(productTypes.slug, PRODUCT_TYPE_SLUG),
  });

  if (!productType) {
    const id = randomUUID();
    await db.insert(productTypes).values({
      id,
      name: 'Broşür',
      slug: PRODUCT_TYPE_SLUG,
      category: 'brochure',
      dimensions: { widthMm: 297, heightMm: 420, folds: 1, pagesPerForma: 4 },
      bleedMm: '3.0',
      defaultGrid: { cols: 4, rows: 4 },
      configSchema: { steps: [] },
      active: true,
      sortOrder: 0,
    });
    productType = await db.query.productTypes.findFirst({
      where: eq(productTypes.slug, PRODUCT_TYPE_SLUG),
    });
    console.log(`  + product_type oluşturuldu: ${PRODUCT_TYPE_SLUG}`);
  } else {
    console.log(`  = product_type mevcut, korunuyor: ${PRODUCT_TYPE_SLUG}`);
  }
  const productTypeId = productType!.id;

  // 2) print_options — sil + yeniden yaz (idempotent). sortOrder kategori içinde artan.
  await db.delete(printOptions).where(eq(printOptions.productTypeId, productTypeId));
  const perCategoryOrder = new Map<string, number>();
  const optionRows = OPTION_SEEDS.map((o) => {
    const order = perCategoryOrder.get(o.category) ?? 0;
    perCategoryOrder.set(o.category, order + 1);
    return {
      id: randomUUID(),
      productTypeId,
      category: o.category,
      key: o.key,
      label: o.label,
      affectsDesign: o.affectsDesign ?? false,
      metadata: o.metadata ?? null,
      isActive: true,
      sortOrder: order,
    };
  });
  await db.insert(printOptions).values(optionRows);

  // 3) pricing_rules — sil + yeniden yaz (idempotent).
  await db.delete(pricingRules).where(eq(pricingRules.productTypeId, productTypeId));
  const ruleRows = PRICING_RULE_SEEDS.map((r) => ({
    id: randomUUID(),
    productTypeId,
    sizeKey: r.sizeKey ?? null,
    paperTypeKey: r.paperTypeKey ?? null,
    paperWeightKey: r.paperWeightKey ?? null,
    colorModeKey: r.colorModeKey ?? null,
    coatingKey: r.coatingKey ?? null,
    bindingKey: r.bindingKey ?? null,
    basePrice: r.basePrice,
    setupFee: r.setupFee ?? '0',
    quantityTiers: QUANTITY_TIERS,
    taxRate: '20.00',
    isActive: true,
  }));
  await db.insert(pricingRules).values(ruleRows);

  console.log(`  ✓ print_options: ${optionRows.length} satır`);
  console.log(`  ✓ pricing_rules: ${ruleRows.length} satır`);
  console.log('Seed tamamlandı.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed hatası:', err);
    process.exit(1);
  });
