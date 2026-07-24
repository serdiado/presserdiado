// Katalog seed — broşür product_type + print_options + pricing_rules (pilot).
// Idempotent: tekrar çalıştırıldığında duplikasyon olmaz (brochure'a ait print_options
// ve pricing_rules silinip yeniden yazılır; product_type slug ile upsert edilir).
//   çalıştırma: npm run db:seed
//
// Kağıt/gramaj/renk/kaplama turmatsan broşür verisinden (docs/vitrin/turmatsan/brosur.json);
// ebat/kırım Presserdiado'nun kendi seçimi (stüdyo grid motoruyla hizalı); adet kademeleri
// Presserdiado'nun kendi seçimi. Ayrıntılı türetme notu: docs/vitrin/TODO_vitrin.md.
//
// Kâr marjı KODA GÖMÜLMEZ — docs/vitrin/pricing.config.json → brochureMarginMultiplier'dan
// okunur (turmatsan toptan referansının üzerine uygulanır). Değiştirmek için o dosyayı
// düzenleyip seed'i tekrar çalıştır.
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { productTypes, printOptions, pricingRules } from './schema/index.js';

const PRODUCT_TYPE_SLUG = 'brochure';

const HERE = dirname(fileURLToPath(import.meta.url));
const VITRIN_DIR = resolve(HERE, '../../../../docs/vitrin');
const PRICING_CONFIG: { brochureMarginMultiplier: number } = JSON.parse(
  readFileSync(resolve(VITRIN_DIR, 'pricing.config.json'), 'utf8'),
);

type OptionSeed = {
  category: typeof printOptions.$inferInsert['category'];
  key: string;
  label: string;
  affectsDesign?: boolean;
  metadata?: Record<string, unknown>;
};

// Key'ler studio değerleriyle hizalı (pricing.config.json + wizard.config.json).
const OPTION_SEEDS: OptionSeed[] = [
  // size — tasarımı etkiler (affectsDesign). Presserdiado'nun kendi ebat seti + A7 (çeşitlilik).
  { category: 'size', key: 'A3', label: 'A3', affectsDesign: true, metadata: { widthMm: 297, heightMm: 420, unit: 'mm' } },
  { category: 'size', key: 'A4', label: 'A4', affectsDesign: true, metadata: { widthMm: 210, heightMm: 297, unit: 'mm' } },
  { category: 'size', key: 'A5', label: 'A5', affectsDesign: true, metadata: { widthMm: 148, heightMm: 210, unit: 'mm' } },
  { category: 'size', key: 'A6', label: 'A6', affectsDesign: true, metadata: { widthMm: 105, heightMm: 148, unit: 'mm' } },
  { category: 'size', key: 'A7', label: 'A7', affectsDesign: true, metadata: { widthMm: 74, heightMm: 105, unit: 'mm' } },
  // fold — tasarımı etkiler (affectsDesign). Presserdiado'nun kendi seti, değişmedi.
  { category: 'fold', key: 'none', label: 'Kırım Yok', affectsDesign: true, metadata: { pageCount: 2 } },
  { category: 'fold', key: 'half-fold', label: 'Tek Kırım', affectsDesign: true, metadata: { pageCount: 4 } },
  { category: 'fold', key: 'roll-fold', label: 'Çift Kırım', affectsDesign: true, metadata: { pageCount: 6 } },
  { category: 'fold', key: 'z-fold', label: 'Z Kırım', affectsDesign: true, metadata: { pageCount: 6 } },
  { category: 'fold', key: 'triple-fold', label: 'Üç Kırım', affectsDesign: true, metadata: { pageCount: 8 } },
  { category: 'fold', key: 'accordion-fold', label: 'Akerdiyon', affectsDesign: true, metadata: { pageCount: 8 } },
  { category: 'fold', key: 'map-fold', label: 'Harita', affectsDesign: true, metadata: { pageCount: 6 } },
  // paper_type — turmatsan broşürü tamamen kuşe; tek değer (ileride çeşitlenirse genişler).
  { category: 'paper_type', key: 'kuse', label: 'Kuşe' },
  // paper_weight — turmatsan'ın 3 hattı: Standart/Pro/Selefonlu.
  { category: 'paper_weight', key: '115', label: '115 gr' },
  { category: 'paper_weight', key: '128', label: '128 gr' },
  { category: 'paper_weight', key: '200', label: '200 gr' },
  // color_mode — turmatsan broşürde siyah-beyaz seçeneği yok, tamamı renkli. "Tek yön" yalnız
  // kırımsızken (metadata.requires), "çift yön" yalnız kırım varken (metadata.excludes)
  // seçilebilir — PrintOptionsSelector bu metadata'yı okuyup listeyi daraltır.
  { category: 'color_mode', key: '4-0', label: 'Renkli Tek Yön', metadata: { requires: { fold: 'none' } } },
  { category: 'color_mode', key: '4-4', label: 'Renkli Çift Yön', metadata: { excludes: { fold: 'none' } } },
  // coating — turmatsan'ın sunduğu 2 kaplama + kaplamasız.
  { category: 'coating', key: 'yok', label: 'Kaplama Yok' },
  { category: 'coating', key: 'selefon-mat', label: 'Mat Selefon' },
  { category: 'coating', key: 'selefon-parlak', label: 'Parlak Selefon' },
  // binding — broşürde cilt yok (kullanıcı kararı); kategori boş bırakılır, PrintOptionsSelector
  // boş kategoriyi hiç render etmez (kilitli davranışın en basit hali: seçenek sunulmaz).
];

// ---- Fiyat formülü ---------------------------------------------------------------------
// Turmatsan'ın toptan verisinden (docs/vitrin/turmatsan/brosur.json) 3 gerçek referans:
//   115gr kaplamasız, A4, 1000 adet = 1,50 TL/adet   (1CA4)
//   128gr kaplamasız, A4, 1000 adet = 2,00 TL/adet   (PRO1A4)
//   200gr + parlak selefon, A4, 1000 adet = 2,90 TL/adet (CBS7)
// Turmatsan'da OLMAYAN kombinasyonlar (200gr kaplamasız, 115/128gr+selefon, tüm mat selefon,
// tüm tek-yön, A7/A6/A3 çoğu) kullanıcı isteğiyle ("matbaada ne olması gerekiyorsa öyle
// düzenle") aşağıdaki türetilmiş çarpanlarla dolduruldu; üçü de gerçek referans noktasına
// (200gr+parlak/A4/1000) geri kalibre edilip doğrulandı.

// A4/1000 adet kaplamasız taban — bunlar turmatsan'ın TOPTAN (maliyet) fiyatı, satış fiyatı
// DEĞİL. 200gr turmatsan'da satılmıyor — 115→128 artışının (%33) ölçülü devamıyla türetildi.
// Kâr marjı bu sabitlerin üzerine ayrıca ve açıkça uygulanır (bkz. PRICING_RULE_SEEDS döngüsü
// → PRICING_CONFIG.brochureMarginMultiplier) — burada gömülü DEĞİL.
const A4_BASE_BY_WEIGHT_COST: Record<string, number> = { '115': 1.50, '128': 2.00, '200': 2.60 };

// Kaplama çarpanı: parlak, 200gr'ın gerçek turmatsan fiyatına (2,90) göre kalibre edildi
// (2,60×1,12=2,91 ✓). Mat, parlak'tan hafif pahalı (yaygın matbaa örüntüsü — düşük talep/kurulum).
const COATING_MULT: Record<string, number> = { yok: 1.0, 'selefon-parlak': 1.12, 'selefon-mat': 1.14 };

// Baskı yönü çarpanı: tek yön, çift yöne göre bir mürekkep pasosu eksik olduğundan ucuz.
// Turmatsan'ın gerçek El İlanı (tek yön, benzer gramaj) / Broşür (çift yön) oranı (~0,73)
// referans alınarak %20 belirlendi.
const SIDES_MULT: Record<string, number> = { '4-0': 0.80, '4-4': 1.0 };

// Ebat alanı (mm²) — ISO gerçek ölçüler.
const AREA_MM2: Record<string, number> = { A7: 7770, A6: 15540, A5: 31080, A4: 62370, A3: 124740 };

// Ebat çarpanı: alan oranına göre ama küçük ebatlarda SABİT maliyet tabanı (pres/işçilik) payı
// var — salt orana göre daha pahalı çıkar. Turmatsan'ın kendi A7/A5 fiyat oranları (alan
// oranından hep yüksek) ile doğrulandı; A4 üstünde (A3) turmatsan'da tam saf alan oranı (2×)
// çıktığı için oradan itibaren birebir orantı kullanılır.
function sizeMultiplier(sizeKey: string): number {
  const ratio = AREA_MM2[sizeKey] / AREA_MM2.A4;
  return ratio > 1 ? ratio : 0.75 * ratio + 0.25;
}

// 500 adetlik taban üzerinden kademeli indirim. Turmatsan Standart hattının gerçek
// 1000/2000/5000/10000 adet birim-fiyat oranlarından türetildi (sırasıyla ~%9/%21/%39/%41
// indirime denk gelecek şekilde 500-adet tabanına göre yeniden ölçeklendi); 500 adet
// matbaacılıkta tipik "küçük parti" primiyle (taban zaten bu primi içeriyor) 0 indirimli kalır.
const QUANTITY_TIERS = [
  { min: 1, discountPct: 0 },
  { min: 500, discountPct: 0 },
  { min: 1000, discountPct: 9 },
  { min: 2000, discountPct: 21 },
  { min: 5000, discountPct: 39 },
  { min: 10000, discountPct: 41 },
];

// 500-adet taban primi: yukarıdaki A4/1000-adet referansları 1000 adede göre kalibre edildi;
// basePrice DB'de "500 adetteki birim fiyat" olarak saklanıp QUANTITY_TIERS'in min:1000 kademesi
// bunu gerçek 1000-adet referansına geri indiriyor (bkz. yorum: 1,10 × %9 indirim ≈ 1,00).
const BATCH_BASE_MULT = 1.10;

type RuleSeed = Partial<Pick<typeof pricingRules.$inferInsert,
  'sizeKey' | 'paperWeightKey' | 'colorModeKey' | 'coatingKey'>> & {
  basePrice: string;
};

// Tüm kombinasyonlar (5 ebat × 3 gramaj × 3 kaplama × 2 renk = 90 kural) formülden üretilir —
// el yazımı 90 sayı yerine tek doğrulanabilir kaynak. paperTypeKey/bindingKey bilinçli NULL
// (tek paper_type değeri var, binding kategorisi hiç yok — ayrım gereksiz).
// Maliyet (A4_BASE_BY_WEIGHT_COST) ile satış fiyatı burada AYRILIYOR: kâr marjı
// (PRICING_CONFIG.brochureMarginMultiplier) maliyetin üzerine açıkça çarpanla uygulanıyor.
const PRICING_RULE_SEEDS: RuleSeed[] = [];
for (const sizeKey of Object.keys(AREA_MM2)) {
  for (const [weightKey, weightCost] of Object.entries(A4_BASE_BY_WEIGHT_COST)) {
    for (const [coatingKey, coatingMult] of Object.entries(COATING_MULT)) {
      for (const [colorModeKey, sidesMult] of Object.entries(SIDES_MULT)) {
        const cost = weightCost * coatingMult * sizeMultiplier(sizeKey) * sidesMult * BATCH_BASE_MULT;
        const price = cost * PRICING_CONFIG.brochureMarginMultiplier;
        PRICING_RULE_SEEDS.push({
          sizeKey,
          paperWeightKey: weightKey,
          coatingKey,
          colorModeKey,
          basePrice: price.toFixed(2),
        });
      }
    }
  }
}

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
    paperTypeKey: null,
    paperWeightKey: r.paperWeightKey ?? null,
    colorModeKey: r.colorModeKey ?? null,
    coatingKey: r.coatingKey ?? null,
    bindingKey: null,
    quantity: null,
    basePrice: r.basePrice,
    setupFee: '0',
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
