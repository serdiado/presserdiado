// Varyant-facet motoru — turmatsan gibi "hazır paket" ürünlerinde bağımlı seçiciler.
// Fiyat/altyapı bilmez: yalnız varyant×özellik matrisinden ulaşılabilir değerleri ve
// çözülen varyant kodunu türetir. "Bristol seçilince 560g görünmesin" bu filtreden çıkar.

export type FacetValue = string | number;

export interface FacetDef {
  key: string;
  label: string;
  suffix?: string; // ör. gramaj için " gr"
}

export interface VariantRow {
  code: string;
  label: string;
  attrs: Record<string, FacetValue | null>;
}

// Kullanıcının aktif seçtiği facet değerleri. Anahtar yoksa "seçilmedi" demektir.
// Değer null olabilir (ör. gramajı olmayan malzeme → "—").
export type FacetSelection = Record<string, FacetValue | null>;

// configSchema.ui.facets tipi güvensiz geldiği için burada normalize edilir.
export function readFacetDefs(configSchema: unknown): FacetDef[] {
  const ui = (configSchema as { ui?: { facets?: unknown } } | null)?.ui;
  const facets = ui?.facets;
  if (!Array.isArray(facets)) return [];
  return facets.filter(
    (f): f is FacetDef => !!f && typeof (f as FacetDef).key === 'string',
  );
}

// Verilen seçimdeki (belirtilen key HARİÇ) tüm facet'lere uyan varyantlar.
function matching(
  variants: VariantRow[],
  selection: FacetSelection,
  exceptKey?: string,
): VariantRow[] {
  const entries = Object.entries(selection).filter(([k]) => k !== exceptKey);
  return variants.filter((v) => entries.every(([k, val]) => v.attrs[k] === val));
}

// Bir facet için, diğer seçimlerle birlikte hâlâ var olan değerler (ilk-görülme sırasıyla).
export function reachableValues(
  variants: VariantRow[],
  selection: FacetSelection,
  facetKey: string,
): (FacetValue | null)[] {
  const pool = matching(variants, selection, facetKey);
  const seen = new Set<string>();
  const out: (FacetValue | null)[] = [];
  for (const v of pool) {
    const val = v.attrs[facetKey] ?? null;
    const id = JSON.stringify(val);
    if (!seen.has(id)) {
      seen.add(id);
      out.push(val);
    }
  }
  return out;
}

// Tüm aktif seçimlere uyan varyantlar (sayaç + çözüm için).
export function matchingVariants(
  variants: VariantRow[],
  selection: FacetSelection,
): VariantRow[] {
  return matching(variants, selection);
}

// Seçim tek varyanta indiyse onun kodu, aksi halde null.
export function resolveCode(
  variants: VariantRow[],
  selection: FacetSelection,
): string | null {
  const m = matching(variants, selection);
  return m.length === 1 ? m[0].code : null;
}

// ---- Sıralı (wizard) model -----------------------------------------------------------
// FlyerAlarm mantığı: adım i YALNIZCA kendinden ÖNCEKİ adımlarla kısıtlanır (simetrik değil).
// Böylece "gramaj seçince malzeme daralması" olmaz; geri dönüp bir adımı değiştirmek
// sonraki adımları sıfırlar.

// Seçimin yalnız 0..index-1 adımlarını içeren ön-eki.
export function prefixSelection(
  selection: FacetSelection,
  orderedKeys: string[],
  index: number,
): FacetSelection {
  const prefix: FacetSelection = {};
  for (let j = 0; j < index; j++) {
    const k = orderedKeys[j];
    if (k in selection) prefix[k] = selection[k];
  }
  return prefix;
}

// Adım i'nin seçenekleri: yalnız önceki adımlara uyan varyantlardan türetilir.
export function reachableForStep(
  variants: VariantRow[],
  selection: FacetSelection,
  orderedKeys: string[],
  index: number,
): (FacetValue | null)[] {
  const prefix = prefixSelection(selection, orderedKeys, index);
  return reachableValues(variants, prefix, orderedKeys[index]);
}

// Adım i'ye değer ata + i+1..N adımlarını temizle (geri-dönüş sıfırlaması).
export function setStepSelection(
  selection: FacetSelection,
  orderedKeys: string[],
  index: number,
  value: FacetValue | null,
): FacetSelection {
  const next = prefixSelection(selection, orderedKeys, index);
  next[orderedKeys[index]] = value;
  return next;
}

// İlk seçilmemiş adımın indeksi (hepsi seçiliyse orderedKeys.length).
export function firstUnsetStep(selection: FacetSelection, orderedKeys: string[]): number {
  for (let i = 0; i < orderedKeys.length; i++) {
    if (!(orderedKeys[i] in selection)) return i;
  }
  return orderedKeys.length;
}
