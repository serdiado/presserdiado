// Sözleşme: adet kademeleri İSTEMCİ VE SUNUCU için tek kaynaktan gelir ve varsayılan adet
// bu listenin içinde olmak zorundadır.
//
// NEDEN: adet artık her yerde sabit bir <select>'ten seçiliyor. Varsayılan liste dışında
// kalırsa (eskiden 100'dü, liste 500'den başlıyordu) iki sessiz arıza oluşur:
//  1) <select> hiçbir seçenekle eşleşmez; tarayıcı ilk seçeneği GÖSTERİR ama store'daki
//     değer değişmez — müşteri "500" görüp 100 adet sipariş eder.
//  2) Sunucu artık kademe dışı adedi reddettiği için (order.service.ts) sipariş 400 alır.
// Liste web ve API'de ayrı ayrı tanımlanırsa zamanla ayrışır; bu yüzden @matbaapro/shared'da
// tek yerde duruyor ve buradan yeniden dışa aktarılıyor.
import { describe, it, expect } from 'vitest';
import { BROCHURE_QUANTITY_CHOICES as PAYLASILAN } from '@matbaapro/shared';
import { BROCHURE_QUANTITY_CHOICES, DEFAULT_QUANTITY } from './constants';

describe('broşür adet kademeleri', () => {
  it('shared paketiyle AYNI listedir (yeniden dışa aktarım kopya değil)', () => {
    // Sunucu doğrulaması da bu listeyi kullanıyor — ayrışırsa istemcinin sunduğu bir adet
    // API tarafından reddedilir.
    expect(BROCHURE_QUANTITY_CHOICES).toBe(PAYLASILAN);
  });

  it('varsayılan adet listenin içindedir', () => {
    expect(BROCHURE_QUANTITY_CHOICES).toContain(DEFAULT_QUANTITY);
  });

  it('varsayılan, listenin en küçük kademesidir (pilotta minimum sipariş 500)', () => {
    expect(DEFAULT_QUANTITY).toBe(Math.min(...BROCHURE_QUANTITY_CHOICES));
  });

  it('liste artan sırada ve tekrarsızdır (<select> sırası anlamlı olsun)', () => {
    const sirali = [...BROCHURE_QUANTITY_CHOICES].sort((a, b) => a - b);
    expect(BROCHURE_QUANTITY_CHOICES).toEqual(sirali);
    expect(new Set(BROCHURE_QUANTITY_CHOICES).size).toBe(BROCHURE_QUANTITY_CHOICES.length);
  });

  it('tüm kademeler pozitif tam sayıdır', () => {
    for (const q of BROCHURE_QUANTITY_CHOICES) {
      expect(Number.isInteger(q)).toBe(true);
      expect(q).toBeGreaterThan(0);
    }
  });
});
