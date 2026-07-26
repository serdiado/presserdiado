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

/**
 * Bizim yükleme yolumuzu (/uploads/...) gösteren bir adresi GÜNCEL API origin'ine bağlar.
 *
 * NEDEN: Adresler dışarıdan gelebiliyor ve içlerinde YAZILDIKLARI ANIN origin'i gömülü
 * oluyor. Gerçek olay: kullanıcı broşür Excel'ini yerel geliştirme ortamında hazırlamış,
 * "Görsel" sütununda `http://localhost:3001/uploads/...` yazıyordu. Canlıda bu adres
 * çözülemediği için Excel'den yerleştirilen tüm ürünler kırık görsel olarak çıkıyordu
 * (proje kaydedilince SKU senkronu doğru adresi koyduğu için "kaydedince düzeliyor"du).
 * Aynı sorun kod-içi preset JSON'larında da vardı; oradaki çözüm buraya taşındı.
 *
 * - `<herhangi-origin>/uploads/...` → origin GÜNCEL API origin'iyle değiştirilir
 * - `/uploads/...`                  → mutlaklaştırılır
 * - bize ait olmayan mutlak adres   → dokunulmaz (kasten verilmiş dış CDN adresi)
 * - çözülemeyen değer (çıplak ad)   → null (çağıran başka bir kaynağa düşmeli)
 */
export function reoriginUploadUrl(url: string | undefined | null): string | null {
  const deger = url?.trim();
  if (!deger) return null;

  const gomulu = /^https?:\/\/[^/]+(\/uploads\/.+)$/.exec(deger);
  if (gomulu) return apiOrigin + gomulu[1];

  if (deger.startsWith('/uploads/')) return apiOrigin + deger;
  if (/^https?:\/\//i.test(deger)) return deger;

  return null;
}
