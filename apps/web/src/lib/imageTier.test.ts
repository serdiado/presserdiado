// Görsel katmanı sözleşmesi + EN KRİTİK REGRESYON: katman adresi kaydedilen veriye SIZMAMALI.
//
// Neden bu kadar önemli: üretim PDF'i projects.canvas_data'dan basılıyor ve dondurma
// idempotent — bir kez yazıldıktan sonra yeniden render edilmiyor. Düşük çözünürlüklü bir
// adres store'a sızarsa veritabanına, oradan matbaaya gider ve hata baskıya kadar hiçbir
// yerde görünmez. Bu testler o sızıntının önündeki bariyeri kilitler.
import { describe, it, expect } from 'vitest';
import { tierUrl } from './imageTier';
import { apiOrigin } from './apiOrigin';

describe('tierUrl — katman türetme', () => {
  const orijinal = apiOrigin + '/uploads/kullanici/abc_urun.png';

  it("'screen' katmanı /uploads/ yolunu /img/screen/ yapar", () => {
    expect(tierUrl(orijinal, 'screen')).toBe(apiOrigin + '/img/screen/kullanici/abc_urun.png');
  });

  it("'original' katmanı adrese HİÇ dokunmaz", () => {
    expect(tierUrl(orijinal, 'original')).toBe(orijinal);
  });

  it('bize ait olmayan adresler (dış CDN, /presets/) değiştirilmez', () => {
    expect(tierUrl('https://cdn.ornek.com/a.png', 'screen')).toBe('https://cdn.ornek.com/a.png');
    expect(tierUrl('/presets/preset-afpack-tema.jpg', 'screen')).toBe(
      '/presets/preset-afpack-tema.jpg',
    );
  });

  it('boş/undefined değer boş dizeye düşer (render güvenli)', () => {
    expect(tierUrl(undefined, 'screen')).toBe('');
    expect(tierUrl(null, 'screen')).toBe('');
    expect(tierUrl('', 'original')).toBe('');
  });

  it('türetme AŞAĞI doğrudur: saklanan adres her zaman orijinali gösterir', () => {
    // 'screen' çıktısını tekrar 'original' istemek eski adrese DÖNMEZ — bu yüzden katmanlı
    // adres asla saklanmamalı. Test, bu tek yönlülüğü açıkça belgeliyor.
    const ekran = tierUrl(orijinal, 'screen');
    expect(tierUrl(ekran, 'original')).toBe(ekran);
    expect(tierUrl(ekran, 'original')).not.toBe(orijinal);
  });
});

describe('REGRESYON: kaydedilen proje verisinde katman adresi bulunamaz', () => {
  it('serializeStudioState çıktısı /img/ içermemeli', async () => {
    const { serializeStudioState } = await import(
      '@/features/studio/lib/projectSerializer'
    );
    const veri = JSON.stringify(serializeStudioState());
    expect(veri).not.toContain('/img/screen/');
    expect(veri).not.toContain('/img/');
  });
});
