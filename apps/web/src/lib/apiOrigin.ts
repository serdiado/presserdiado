// API origin'i ve DB'den gelen göreli görsel anahtarını mutlak URL'e çeviren saf yardımcı.
//
// NEDEN AYRI DOSYA: bunlar eskiden upload.ts içindeydi, ama upload.ts `./api` (axios örneği,
// auth interceptor'ları ile) import ediyor. normalizeLegacyAppearance gibi MODÜL YÜKLEME
// anında çalışan kod toAbsoluteUrl'i çağırdığında dairesel import zinciri oluşuyor ve
// "Cannot access '__vite_ssr_import_0__' before initialization" (TDZ) hatası veriyordu —
// regresyon testinde yakalandı. Burada hiçbir ağ/istemci bağımlılığı YOKTUR, yalnızca env
// okunur; bu yüzden herhangi bir yükleme sırasında güvenle çağrılabilir.
// upload.ts bu ikisini geriye dönük uyumluluk için yeniden dışa aktarır.

export const apiOrigin = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1').replace(
  /\/api\/v\d+\/?$/,
  '',
);

/** DB'den gelen göreli imageKey'i (/uploads/...) <img src> için mutlak URL'e çevirir. */
export function toAbsoluteUrl(key: string): string {
  if (/^https?:\/\//.test(key)) return key;
  return apiOrigin + key;
}
