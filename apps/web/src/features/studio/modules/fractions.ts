// Banner kolon/satır oranları (fr) — saf yardımcılar.
// Store/UI bağımlılığı YOK → import döngüsü riski yok. BannerSection, CellPanel,
// BannerSettingsPanel ve ContextualBar buradan beslenir (tek-kaynak).

/** Her fraction'ın asgari payı (fr). Sürükle/sayısal clamp bunu kullanır. */
export const FRACTION_MIN = 0.1;

/** Banner ızgara satır/sütun sayısı clamp sınırları (tek-kaynak — üç panel buradan okur). */
export const BANNER_DIM_MIN = 1;
export const BANNER_DIM_MAX = 20;

/**
 * Diziyi hedef uzunluğa uydurur; mevcut özel oranları KORUR (tam-sıfırlama yok):
 * eksikse tail'e 1 ekler, fazlaysa tail'den keser.
 */
export function padTruncate(arr: number[], count: number): number[] {
  if (arr.length === count) return arr;
  if (arr.length < count) return [...arr, ...Array(count - arr.length).fill(1)];
  return arr.slice(0, count);
}

/**
 * Render/okuma için: yoksa eşit-bölü, varsa uzunluğa uydurulmuş dizi.
 * (Sonuç asla store'a yazılmaz — eski modül dokunulmadıkça undefined kalır.)
 */
export function materializeFractions(arr: number[] | undefined, count: number): number[] {
  return Array.isArray(arr) ? padTruncate(arr, count) : Array(count).fill(1);
}

/**
 * Pozisyonel ekleme (gridMutate insert sütun/satır): `at` konumuna `value` ekler.
 * Eski modül dokunulmaz → tanımsızsa undefined kalır. `at` aralık dışıysa clamp'lenir.
 */
export function insertFraction(
  arr: number[] | undefined,
  at: number,
  value = 1,
): number[] | undefined {
  if (!Array.isArray(arr)) return undefined;
  const i = Math.max(0, Math.min(arr.length, at));
  return [...arr.slice(0, i), value, ...arr.slice(i)];
}

/**
 * Pozisyonel çıkarma (gridMutate delete sütun/satır): `at` indeksini çıkarır.
 * Tanımsızsa undefined kalır; `at` aralık dışıysa dizi aynen klonlanır.
 */
export function removeFraction(
  arr: number[] | undefined,
  at: number,
): number[] | undefined {
  if (!Array.isArray(arr)) return undefined;
  if (at < 0 || at >= arr.length) return [...arr];
  return [...arr.slice(0, at), ...arr.slice(at + 1)];
}
