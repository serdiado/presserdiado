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
 * resizeGrid (rows/cols değişimi) senkronu için: yoksa undefined bırak (geriye uyum),
 * varsa uzunluğa uydur. updates objesine yalnız undefined olmadığında eklenmeli.
 */
export function resizeFractions(
  arr: number[] | undefined,
  count: number,
): number[] | undefined {
  return Array.isArray(arr) ? padTruncate(arr, count) : undefined;
}
