// Fiyatın TEK render kanalı.
//
// AYRI MODÜL OLMASININ SEBEBİ: `richText.ts` zaten `util/style.ts`'ten `hexToRgba` alıyor →
// projeksiyonu style.ts'e koymak style ↔ richText döngüsü yaratırdı. Bu modül ikisinden de
// okur, hiçbiri buradan okumaz (temiz DAG).

import { isRichTextHtml } from '../modules/richText';
import { splitPrice } from './style';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Fiyat hem "otomatik kuruş üst-karakteri" (düz metin) hem run-level zengin metin (kullanıcının elle
 * biçimlendirmesi) taşıyabildiği için ikisi BİRBİRİNİ DIŞLAYAN dallar olarak çözülür — asla üst üste
 * binmezler:
 *
 *   - HTML → kullanıcı biçimi KAZANIR, otomatik projeksiyon hiç çalışmaz.
 *   - düz  → `splitPrice` ile bölünüp otomatik `<sup>`'a sarılır (eski iki-span davranışının eşleniği).
 *
 * Her iki dalda nihai DOM aynı: tek `<sup>`, tek CSS kanalı (`--sup-scale`/`--sup-offset`), tek
 * `decimalScale` anlamı. Store DÜZ METİN kalır (kullanıcı ilk biçimi uygulayana dek) → Excel import,
 * ürün havuzu ve geriye uyum bedava gelir; tüm biçim temizlenirse otomatik davranış geri döner.
 *
 * `splitPrice` DAVRANIŞI AYNEN KORUNUR (nokta→virgül, 2-hane padEnd) — bilinen kusurları dahil;
 * değiştirmek mevcut tüm katalogların görünümünü kaydırır. Bu fonksiyon onu yalnızca sarmalar.
 * SAF: DOM'a dokunmaz, idempotenttir (HTML girdi aynen döner).
 */
export function priceToDisplayHtml(price: unknown): string {
  const raw = String(price ?? '');
  if (isRichTextHtml(raw)) return raw;
  const { main, decimal } = splitPrice(raw);
  return `${escapeHtml(main)},<sup>${escapeHtml(decimal)}</sup>`;
}
