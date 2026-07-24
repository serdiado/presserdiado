// Turmatsan katalog seed'i — docs/vitrin/turmatsan/*.json (Faz 1 verisi) → product_types +
// print_options + pricing_rules. Fiyat modeli: PAKET kuralları (pricing_rules.quantity dolu,
// basePrice = paket TOPLAM satış fiyatı). Satış fiyatı docs/vitrin/pricing.config.json
// kurallarıyla üretilir (retailFirst / marj / yuvarlama) — rakam koda gömülmez.
//
// Idempotent: ürün slug ile upsert edilir; ürüne ait print_options + pricing_rules silinip
// yeniden yazılır. 'brochure' slug'ına DOKUNULMAZ (stüdyo pilotu ayrı yaşar).
//   çalıştırma: npm run db:seed:turmatsan
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { productTypes, printOptions, pricingRules } from './schema/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const VITRIN_DIR = resolve(HERE, '../../../../docs/vitrin');

interface PricingConfig {
  retailFirst: boolean;
  marginDefault: number;
  roundUpToTRY: number;
  taxRatePct: number;
}

const cfg: PricingConfig = JSON.parse(
  readFileSync(resolve(VITRIN_DIR, 'pricing.config.json'), 'utf8'),
);

function readTm(file: string): any {
  return JSON.parse(readFileSync(resolve(VITRIN_DIR, 'turmatsan', file), 'utf8'));
}

const roundUpTo = (value: number, step: number) => Math.ceil(value / step) * step;

// Satış fiyatı: retailFirst + retail varsa perakende referansı; yoksa toptan × marj (yukarı yuvarla).
function salePrice(wholesale: number | null | undefined, retail?: number | null): number | null {
  if (cfg.retailFirst && retail != null) return retail;
  if (wholesale == null) return retail ?? null;
  return roundUpTo(wholesale * cfg.marginDefault, cfg.roundUpToTRY);
}

type OptionRow = {
  category: typeof printOptions.$inferInsert['category'];
  key: string;
  label: string;
  metadata?: Record<string, unknown> | null;
};
type RuleRow = {
  sizeKey?: string | null;
  paperTypeKey?: string | null;
  quantity: number;
  priceTRY: number;
};
// facets = vitrin bağımlı-seçici tanımı (configSchema.ui.facets'e yazılır); opsiyonel.
type FacetDef = { key: string; label: string; suffix?: string };
type Built = { options: OptionRow[]; rules: RuleRow[]; facets?: FacetDef[] };

interface ProductDef {
  slug: string;
  name: string;
  category: string;
  saleMode: 'upload' | 'quote';
  description: string;
  sortOrder: number;
  dimensions: Record<string, unknown>;
  // configSchema.ui — web tarafı UI ipuçları.
  // presentation: 'picker' = sade kart seçici (hazır paketler), 'wizard' = sıralı sihirbaz (matris).
  ui?: {
    optionLabels?: Record<string, string>;
    quantityUnit?: string;
    presentation?: 'picker' | 'wizard';
  };
  build?: () => Built;
}

// Turmatsan kartvizit segmentleri (üye fiyat listesindeki gruplama).
const KARTVIZIT_GROUPS: Record<string, string[]> = {
  EKO: ['NK', 'NKA', 'NSK', 'MNA', 'CYP', 'CYM'],
  LAK: ['KL', 'CYML4', 'O-COK', 'S-COK', 'O-SEK', 'EKO-SEK', 'S-SEK', 'A-SEK', 'AC-SEK', 'TANK'],
  'VİP': ['AY', 'GY', 'VIP'],
  FAN: ['FAN', 'F-SEK'],
};
const kartvizitGroupOf = (code: string): string =>
  Object.entries(KARTVIZIT_GROUPS).find(([, codes]) => codes.includes(code))?.[0] ?? 'Diğer';

const procLabel = (v: any) =>
  [v.material, ...(v.processes ?? []), v.sides ? (v.sides === 'tek' ? 'Tek Yön' : v.sides === 'çift' ? 'Çift Yön' : v.sides) : null]
    .filter(Boolean)
    .join(' · ');

// ---- Ürün tanımları ------------------------------------------------------------------

const PRODUCTS: ProductDef[] = [
  {
    slug: 'kartvizit',
    name: 'Kartvizit',
    category: 'kartvizit',
    saleMode: 'upload',
    description: '82×52 mm, 1000 adet, çok renkli. Bristol/Kuşe/Sıvama gövde; selefon, lak, yaldız ve özel kesim seçenekleri.',
    sortOrder: 10,
    dimensions: { widthMm: 82, heightMm: 52 },
    // Sade kart seçici: Turmatsan'ın hazır paketleri gruplu kartlar olarak (sihirbaz değil).
    ui: { presentation: 'picker', quantityUnit: 'adet' },
    build: () => {
      const data = readTm('kartvizit.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price == null) continue;
        const key = String(v.code).toLowerCase();
        options.push({
          category: 'paper_type',
          key,
          label: `${v.name} — ${procLabel(v)}`,
          // group = kart grid segmenti (EKO/LAK/VİP/FAN).
          metadata: { group: kartvizitGroupOf(v.code) },
        });
        rules.push({ paperTypeKey: key, quantity: v.quantity ?? 1000, priceTRY: price });
      }
      return { options, rules };
    },
  },
  {
    slug: 'el-ilani-afis',
    name: 'El İlanı / Afiş',
    category: 'el-ilani',
    saleMode: 'upload',
    description: '105 gr kuşe, tek yön çok renkli. El ilanı 4 ebat, afiş 2 ebat; adet kademeli paket fiyatları.',
    sortOrder: 20,
    dimensions: { widthMm: 190, heightMm: 272 },
    ui: { optionLabels: { size: 'Ebat' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('el-ilani-afis.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      const seen = new Set<string>();
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price == null) continue;
        const key = String(v.size).replace(/\s|cm/g, '');
        if (!seen.has(key)) {
          seen.add(key);
          const kind = String(v.code).startsWith('AF') ? 'Afiş' : 'El İlanı';
          options.push({ category: 'size', key, label: `${kind} ${v.size}` });
        }
        rules.push({ sizeKey: key, quantity: v.quantity, priceTRY: price });
      }
      return { options, rules };
    },
  },
  {
    slug: 'etiket',
    name: 'Etiket',
    category: 'etiket',
    saleMode: 'upload',
    description: '90 gr kuşe çıkartma, 1000 adet. Küçük boy (52-53 mm) selefonlu/yaldızlı/özel kesim ve büyük boy seçenekler.',
    sortOrder: 30,
    dimensions: { widthMm: 53, heightMm: 83 },
    ui: { optionLabels: { paper_type: 'Etiket Tipi' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('etiket.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price == null) continue;
        const key = String(v.code).toLowerCase();
        options.push({ category: 'paper_type', key, label: `${v.size} — ${procLabel(v)}` });
        rules.push({ paperTypeKey: key, quantity: v.quantity ?? 1000, priceTRY: price });
      }
      return { options, rules };
    },
  },
  {
    slug: 'antetli-kagit',
    name: 'Antetli Kağıt',
    category: 'antetli',
    saleMode: 'upload',
    description: '90 gr 1. hamur, tek yön çok renkli. A5 ve A4; adet kademeli paket fiyatları.',
    sortOrder: 40,
    dimensions: { widthMm: 210, heightMm: 297 },
    ui: { optionLabels: { size: 'Ebat' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('antetli-kagit.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      const seen = new Set<string>();
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price == null) continue;
        const key = String(v.size).replace(/\s|cm/g, '');
        if (!seen.has(key)) {
          seen.add(key);
          const iso = key === '15x21' ? 'A5' : 'A4';
          options.push({ category: 'size', key, label: `${iso} · ${v.size}` });
        }
        rules.push({ sizeKey: key, quantity: v.quantity, priceTRY: price });
      }
      return { options, rules };
    },
  },
  {
    slug: 'zarf',
    name: 'Zarf',
    category: 'zarf',
    saleMode: 'upload',
    description: '110 gr; diplomat (10.5×24) ve torba (24×32) zarf. Fiyat taban + ilave parti yapısından paketlere açılmıştır.',
    sortOrder: 50,
    dimensions: { widthMm: 240, heightMm: 105 },
    ui: { optionLabels: { paper_type: 'Zarf Tipi' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('zarf.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const key = String(v.code).toLowerCase();
        options.push({ category: 'paper_type', key, label: `${v.name} · ${v.size}` });
        // Taban paket + "ilave her N adet" birim fiyatından 5 kademe paket üret.
        // Genişletilmiş paketlerde perakende referansı yok → tutarlılık için hepsi marj-bazlı.
        const step = v.quantity as number; // 1000 (Z1/Z2) veya 500 (Z3)
        const perExtra = (v.wholesalePerExtra1000TRY ?? v.wholesalePerExtra500TRY) as number;
        for (let k = 0; k < 5; k++) {
          const wholesaleTotal = (v.wholesaleTRY as number) + perExtra * k;
          const price = salePrice(wholesaleTotal, null);
          if (price == null) continue;
          rules.push({ paperTypeKey: key, quantity: step * (k + 1), priceTRY: price });
        }
      }
      return { options, rules };
    },
  },
  {
    slug: 'sunum-dosyasi',
    name: 'Sunum Dosyası',
    category: 'dosya',
    saleMode: 'upload',
    description: 'Kapalı hali 22.5×31 cm, 350-400 gr kuşe. Selefon/lak seçenekleri; kulakçık yapıştırma dahil. Avukat dosyası seçeneği mevcut.',
    sortOrder: 60,
    dimensions: { widthMm: 225, heightMm: 310 },
    ui: { optionLabels: { paper_type: 'Dosya Tipi' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('sunum-dosyasi.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      // MND500/MND gibi adet-türevi kodları tek seçenekte topla (mnd → 500 ve 1000 paketleri).
      const groupOf = (code: string) => code.toLowerCase().replace(/(500|1000)$/, '');
      const labels = new Map<string, string>();
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price == null) continue;
        const key = groupOf(String(v.code));
        if (!labels.has(key)) {
          labels.set(key, `${v.name.replace(/ \((500|1000) adet\)/i, '')} — ${v.material}`);
          options.push({ category: 'paper_type', key, label: labels.get(key)! });
        }
        rules.push({ paperTypeKey: key, quantity: v.quantity, priceTRY: price });
      }
      return { options, rules };
    },
  },
  {
    slug: 'magnet',
    name: 'Magnet',
    category: 'magnet',
    saleMode: 'upload',
    description: '46×68 mm, 60 mikron, renkli, parlak selefonlu. Özel veya oval kesim; 10.000 adette indirimli birim fiyat.',
    sortOrder: 70,
    dimensions: { widthMm: 46, heightMm: 68 },
    ui: { optionLabels: { paper_type: 'Kesim' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('magnet.json');
      const options: OptionRow[] = [
        { category: 'paper_type', key: 'mag1', label: 'Özel Kesim · 46×68 mm' },
        { category: 'paper_type', key: 'mag2', label: 'Oval Kesim · 46×68 mm' },
      ];
      const rules: RuleRow[] = [];
      const byCode = new Map(data.variants.map((v: any) => [v.code, v]));
      for (const key of ['mag1', 'mag2'] as const) {
        const base: any = byCode.get(key.toUpperCase());
        const bulk: any = byCode.get(`10+${key.toUpperCase()}`);
        const basePrice = salePrice(base.wholesaleTRY, base.retailRefTRY);
        if (basePrice != null) rules.push({ paperTypeKey: key, quantity: 1000, priceTRY: basePrice });
        // 10+ kodu 10.000 adette BİN-adet-başı toptan fiyattır → paket toplamı ×10.
        const bulkPrice = salePrice(bulk.wholesaleTRY * 10, null);
        if (bulkPrice != null) rules.push({ paperTypeKey: key, quantity: 10000, priceTRY: bulkPrice });
      }
      // MAG3 (özel ebat, cm² birim fiyat) katalog dışı — teklif/temsilci konusu.
      return { options, rules };
    },
  },
  {
    slug: 'bloknot',
    name: 'Bloknot',
    category: 'bloknot',
    saleMode: 'upload',
    description: '80 gr 1. hamur iç yaprak, 50 yaprak/cilt. Spiralli, kapaklı (Amerikan cilt), kapaksız ve küp bloknot seçenekleri. Adet = cilt sayısıdır (küp bloknotta kutu adedi).',
    sortOrder: 80,
    dimensions: { widthMm: 94, heightMm: 133 },
    ui: { optionLabels: { paper_type: 'Bloknot Tipi' }, quantityUnit: 'cilt' },
    build: () => {
      const data = readTm('bloknot.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const key = String(v.code).toLowerCase();
        options.push({
          category: 'paper_type',
          key,
          label: `${v.cilt} · ${v.size}${v.kapak ? ` · Kapak: ${v.kapak}` : ''}`,
        });
        for (const [qty, wholesale] of [[500, v.cilt500], [1000, v.cilt1000]] as const) {
          const price = salePrice(wholesale, null);
          if (price != null) rules.push({ paperTypeKey: key, quantity: qty, priceTRY: price });
        }
      }
      // Küp bloknot (kutu bazlı; iç yapraklar 78×78 mm, kutu adedi = sipariş adedi).
      for (const boyut of ['250', '500']) {
        const key = `kup-${boyut}`;
        options.push({ category: 'paper_type', key, label: `Küp Bloknot · ${boyut}'lük kutu · 78×78 mm` });
        for (const kv of data.kupBloknot.variants.filter((x: any) => x.code.includes(`-${boyut}-`))) {
          const price = salePrice(kv.wholesaleTRY, null);
          if (price != null) rules.push({ paperTypeKey: key, quantity: kv.quantity, priceTRY: price });
        }
      }
      return { options, rules };
    },
  },
  {
    slug: 'makbuz',
    name: 'Makbuz',
    category: 'makbuz',
    saleMode: 'upload',
    description: '54 gr kendinden kopyalı (karbonsuz), 1 asıl 1 suret, 50 yaprak/cilt. Tek renk veya renkli; adet = cilt (koçan) sayısıdır.',
    sortOrder: 90,
    dimensions: { widthMm: 140, heightMm: 200 },
    ui: { optionLabels: { paper_type: 'Makbuz Tipi' }, quantityUnit: 'cilt' },
    build: () => {
      const data = readTm('makbuz.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price == null) continue;
        const key = String(v.code).toLowerCase();
        options.push({ category: 'paper_type', key, label: `${v.name} · ${v.size} · ${v.quantity} cilt` });
        rules.push({ paperTypeKey: key, quantity: v.quantity, priceTRY: price });
      }
      return { options, rules };
    },
  },
  {
    slug: 'oto-paspas',
    name: 'Oto Paspas',
    category: 'oto-paspas',
    saleMode: 'upload',
    description: '34×49 cm, 85 gr kraft, tek renk baskı. Oto servis ve galeriler için kağıt paspas.',
    sortOrder: 100,
    dimensions: { widthMm: 340, heightMm: 490 },
    ui: { quantityUnit: 'adet' },
    build: () => {
      const data = readTm('oto-paspas.json');
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price != null) rules.push({ quantity: v.quantity, priceTRY: price });
      }
      return { options: [], rules };
    },
  },
  {
    slug: 'karton-canta',
    name: 'Karton Çanta',
    category: 'canta',
    saleMode: 'upload',
    description: '210 gr Amerikan Bristol (veya 200 gr kraft), selefonlu. 4 boy; lak/gofre gibi ekstralar sipariş notunda belirtilir.',
    sortOrder: 110,
    dimensions: { widthMm: 250, heightMm: 370 },
    ui: { optionLabels: { paper_type: 'Çanta Boyu' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('karton-canta.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const key = String(v.code).toLowerCase().replace('-', '');
        const kraft = String(v.code).includes('KRAFT') ? ' (Kraft Tek Renk)' : '';
        options.push({ category: 'paper_type', key, label: `${v.size}${kraft}` });
        for (const [qty, wholesale] of [[500, v.wholesale500], [1000, v.wholesale1000]] as const) {
          const price = salePrice(wholesale, null);
          if (price != null) rules.push({ paperTypeKey: key, quantity: qty, priceTRY: price });
        }
      }
      return { options, rules };
    },
  },
  {
    slug: 'kutu',
    name: 'Ürün Kutusu',
    category: 'kutu',
    saleMode: 'upload',
    description: '350 gr Amerikan Bristol, mat selefonlu, 1000 adet. En-boy ölçünüze uyan kutu tipini seçin; bıçak, kesim ve yan yapıştırma dahildir.',
    sortOrder: 120,
    dimensions: { widthMm: 172, heightMm: 214 },
    ui: { optionLabels: { size: 'Kutu Ölçüsü' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('kutu.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price == null) continue;
        const key = String(v.code).toLowerCase();
        options.push({ category: 'size', key, label: v.size });
        rules.push({ sizeKey: key, quantity: v.quantity ?? 1000, priceTRY: price });
      }
      return { options, rules };
    },
  },
  {
    slug: 'amerikan-servis',
    name: 'Amerikan Servis',
    category: 'servis',
    saleMode: 'upload',
    description: 'Restoran/kafe servis altlığı, tek yön renkli. 3 ebat/kağıt seçeneği; parti bazlı paket fiyatları.',
    sortOrder: 130,
    dimensions: { widthMm: 310, heightMm: 440 },
    ui: { optionLabels: { paper_type: 'Ebat / Kağıt' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('amerikan-servis.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const key = String(v.code).toLowerCase();
        options.push({ category: 'paper_type', key, label: `${v.size} · ${v.material}` });
        const step = v.quantity as number; // 2000
        for (let k = 0; k < 3; k++) {
          const wholesaleTotal = (v.wholesaleTRY as number) + (v.wholesalePerExtra2000TRY as number) * k;
          const price = salePrice(wholesaleTotal, null);
          if (price != null) rules.push({ paperTypeKey: key, quantity: step * (k + 1), priceTRY: price });
        }
      }
      return { options, rules };
    },
  },
  {
    slug: 'kapi-aski-brosur',
    name: 'Kapı Askı Broşürü',
    category: 'kapi-aski',
    saleMode: 'upload',
    description: 'Kapı koluna asılan kesimli tanıtım broşürü, çift yön renkli, 1000 adet. 3 malzeme/ebat seçeneği.',
    sortOrder: 140,
    dimensions: { widthMm: 105, heightMm: 240 },
    ui: { optionLabels: { paper_type: 'Tip' }, quantityUnit: 'adet' },
    build: () => {
      const data = readTm('kapi-aski-brosur.json');
      const options: OptionRow[] = [];
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price == null) continue;
        const key = String(v.code).toLowerCase();
        options.push({ category: 'paper_type', key, label: `${v.size} · ${procLabel(v)}` });
        rules.push({ paperTypeKey: key, quantity: v.quantity ?? 1000, priceTRY: price });
      }
      return { options, rules };
    },
  },
  {
    slug: 'notluk',
    name: 'Notluk',
    category: 'notluk',
    saleMode: 'upload',
    description: '7.8×14 cm cep notluğu, 70 yaprak. İç 110 gr 1. hamur renkli, dış 350 gr Amerikan Bristol mat selefon.',
    sortOrder: 150,
    dimensions: { widthMm: 78, heightMm: 140 },
    ui: { quantityUnit: 'adet' },
    build: () => {
      const data = readTm('notluk.json');
      const rules: RuleRow[] = [];
      for (const v of data.variants) {
        const price = salePrice(v.wholesaleTRY, v.retailRefTRY);
        if (price != null) rules.push({ quantity: v.quantity, priceTRY: price });
      }
      return { options: [], rules };
    },
  },
  // ---- Teklif usulü (quote) — yalnız ürün satırı; seçenek/fiyat kuralı yok. ----
  {
    slug: 'katalog',
    name: 'Katalog',
    category: 'katalog',
    saleMode: 'quote',
    description: 'Özel üretim katalog: kapak/iç kağıt, sayfa sayısı, ebat ve cilt (tel/sırt/iplik dikiş, Amerikan cilt) ihtiyaca göre. Teklif alın.',
    sortOrder: 200,
    dimensions: { widthMm: 210, heightMm: 297 },
  },
  {
    slug: 'dergi',
    name: 'Dergi',
    category: 'dergi',
    saleMode: 'quote',
    description: 'Dergi baskısı: sayfa sayısı, ebat, kağıt ve kapak uygulamaları (selefon/lak) ihtiyaca göre. Teklif alın.',
    sortOrder: 210,
    dimensions: { widthMm: 210, heightMm: 297 },
  },
  {
    slug: 'insert',
    name: 'İnsert',
    category: 'insert',
    saleMode: 'quote',
    description: 'Market/kampanya inserti. Ebat, sayfa ve adet ihtiyaca göre; fiyat teklifle netleşir.',
    sortOrder: 220,
    dimensions: { widthMm: 210, heightMm: 297 },
  },
  {
    slug: 'imsakiye',
    name: 'İmsakiye',
    category: 'imsakiye',
    saleMode: 'quote',
    description: 'Ramazan dönemine özel üretim imsakiye. Ebat, kağıt ve tasarım isteğe göre; teklif alın.',
    sortOrder: 230,
    dimensions: { widthMm: 210, heightMm: 297 },
  },
  {
    slug: 'takvim',
    name: 'Takvim',
    category: 'takvim',
    saleMode: 'quote',
    description: 'Yıl sonu dönemine özel karton takvim (4-6 yaprak modeller). Teklif alın.',
    sortOrder: 240,
    dimensions: { widthMm: 330, heightMm: 480 },
  },
];

// ---- Seed ----------------------------------------------------------------------------

async function upsertProduct(def: ProductDef, facets?: FacetDef[]): Promise<string> {
  const existing = await db.query.productTypes.findFirst({
    where: eq(productTypes.slug, def.slug),
  });
  const configSchema = { ui: { ...(def.ui ?? {}), ...(facets ? { facets } : {}) } };
  if (existing) {
    await db
      .update(productTypes)
      .set({
        name: def.name,
        category: def.category,
        saleMode: def.saleMode,
        description: def.description,
        sortOrder: def.sortOrder,
        dimensions: def.dimensions,
        configSchema,
        active: true,
      })
      .where(eq(productTypes.id, existing.id));
    return existing.id;
  }
  const id = randomUUID();
  await db.insert(productTypes).values({
    id,
    name: def.name,
    slug: def.slug,
    category: def.category,
    saleMode: def.saleMode,
    description: def.description,
    dimensions: def.dimensions,
    bleedMm: '3.0',
    defaultGrid: { cols: 4, rows: 4 },
    configSchema,
    active: true,
    sortOrder: def.sortOrder,
  });
  return id;
}

async function seed() {
  let totalOptions = 0;
  let totalRules = 0;

  // Legacy temizlik: schema.sql bootstrap satırı 'a3-roll-fold-6p' vitrine sızmasın.
  // Silinemez (eski projeler/siparişler FK ile bağlı) — pasifleştirilir; hiçbir akış
  // bu slug ile katalog sorgusu atmıyor (hepsi 'brochure' anahtarını kullanır).
  await db
    .update(productTypes)
    .set({ active: false })
    .where(eq(productTypes.slug, 'a3-roll-fold-6p'));

  for (const def of PRODUCTS) {
    if (def.slug === 'brochure') throw new Error('brochure bu seed\'in kapsamı dışındadır');
    const built = def.build?.() ?? { options: [], rules: [] };
    const productTypeId = await upsertProduct(def, built.facets);

    // Ürüne ait seçenek + kural setini sil ve yeniden yaz (idempotent).
    await db.delete(printOptions).where(eq(printOptions.productTypeId, productTypeId));
    await db.delete(pricingRules).where(eq(pricingRules.productTypeId, productTypeId));

    if (built.options.length > 0) {
      const perCategoryOrder = new Map<string, number>();
      await db.insert(printOptions).values(
        built.options.map((o) => {
          const order = perCategoryOrder.get(o.category) ?? 0;
          perCategoryOrder.set(o.category, order + 1);
          return {
            id: randomUUID(),
            productTypeId,
            category: o.category,
            key: o.key,
            label: o.label,
            affectsDesign: false, // upload ürünlerinde stüdyo yok; ebat dahil hepsi serbest seçim
            metadata: o.metadata ?? null,
            isActive: true,
            sortOrder: order,
          };
        }),
      );
    }

    if (built.rules.length > 0) {
      await db.insert(pricingRules).values(
        built.rules.map((r) => ({
          id: randomUUID(),
          productTypeId,
          sizeKey: r.sizeKey ?? null,
          paperTypeKey: r.paperTypeKey ?? null,
          paperWeightKey: null,
          colorModeKey: null,
          coatingKey: null,
          bindingKey: null,
          quantity: r.quantity,
          basePrice: r.priceTRY.toFixed(2),
          setupFee: '0',
          quantityTiers: null,
          taxRate: cfg.taxRatePct.toFixed(2),
          isActive: true,
        })),
      );
    }

    totalOptions += built.options.length;
    totalRules += built.rules.length;
    console.log(
      `  ✓ ${def.slug} (${def.saleMode}) — ${built.options.length} seçenek, ${built.rules.length} paket kuralı`,
    );
  }

  console.log(`\nToplam: ${PRODUCTS.length} ürün, ${totalOptions} seçenek, ${totalRules} paket kuralı.`);
  console.log('Turmatsan seed tamamlandı. (brochure dokunulmadı)');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Turmatsan seed hatası:', err);
    process.exit(1);
  });
