// Görsel katmanı: aynı görselin ekran (küçük) ya da orijinal (baskı) sürümünü seçer.
//
// ⚠ EN ÖNEMLİ KURAL — SONUCU HİÇBİR YERE YAZMAYIN.
// tierUrl SADECE JSX içinde, render anında çağrılır. Dönen değer asla:
//   - zustand store'a,
//   - localStorage'a,
//   - projects.canvas_data'ya (projectSerializer),
//   - export.service'in Puppeteer'a enjekte ettiği catalogState'e
// yazılmamalıdır.
//
// GEREKÇE: Üretim PDF'i projects.canvas_data'dan basılıyor (order-pdf.service) ve dondurma
// idempotent — bir kez yazıldıktan sonra yeniden render edilmiyor. Düşük çözünürlüklü bir URL
// store'a sızarsa veritabanına, oradan da matbaaya gider ve hata baskıya kadar hiçbir yerde
// görünmez. Bu yüzden katman bir GÖRÜNTÜLEME kararıdır, veri değil.
//
// Türetme her zaman AŞAĞI doğrudur: saklanan adres her zaman orijinali gösterir, küçük sürüm
// ondan hesaplanır. Bu sayede kayıtlı projelerde veri göçü gerekmez.

export type ImageTier = 'screen' | 'original';

/**
 * @param url  Saklanan (orijinali gösteren) mutlak veya göreli adres.
 * @param tier 'screen' → küçük türev, 'original' → dokunulmaz.
 */
export function tierUrl(url: string | undefined | null, tier: ImageTier): string {
  if (!url) return '';
  if (tier === 'original') return url;
  // Bizim yüklediğimiz dosyalar dışındakilere (Excel'den gelen dış adresler, /presets/...)
  // dokunulmaz — onların türevi yok.
  if (!url.includes('/uploads/')) return url;
  return url.replace('/uploads/', '/img/screen/');
}
