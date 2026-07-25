import { describe, it, expect } from 'vitest';
import { priceToDisplayHtml } from './priceDisplay';

describe('priceToDisplayHtml — fiyatın tek render kanalı', () => {
  it('düz metin → otomatik kuruş <sup> projeksiyonu (eski iki-span davranışının eşleniği)', () => {
    expect(priceToDisplayHtml('12,90')).toBe('12,<sup>90</sup>');
    expect(priceToDisplayHtml('12.9')).toBe('12,<sup>90</sup>'); // DB havuzu '12.9' formatı
    expect(priceToDisplayHtml('7,99')).toBe('7,<sup>99</sup>');
    expect(priceToDisplayHtml('1299')).toBe('1299,<sup>00</sup>'); // virgülsüz → ,00
    expect(priceToDisplayHtml('')).toBe('0,<sup>00</sup>');
    expect(priceToDisplayHtml(null)).toBe('0,<sup>00</sup>');
    expect(priceToDisplayHtml(undefined)).toBe('0,<sup>00</sup>');
  });

  it('HTML → kullanıcı biçimi kazanır, otomatik projeksiyon ÇALIŞMAZ (idempotent)', () => {
    // Kendi çıktısını tekrar yerse aynen dönmeli — üst üste binme imkânsız.
    expect(priceToDisplayHtml('12,<sup>90</sup>')).toBe('12,<sup>90</sup>');
    expect(priceToDisplayHtml('<span style="font-weight:700">12</span>,<sup>90</sup>')).toBe(
      '<span style="font-weight:700">12</span>,<sup>90</sup>',
    );
    // rgba'lı renk run'ı: splitPrice'a girseydi ilk '.'/',' bozar, fiyat yok olurdu.
    const rgba = '<span style="color: rgba(255, 0, 0, 0.5)">12,99</span>';
    expect(priceToDisplayHtml(rgba)).toBe(rgba);
  });

  it('düz metinde HTML-anlamlı karakterler kaçışlanır (innerHTML kırılma önlemi)', () => {
    // isRichTextHtml'in tanımadığı (= legacy düz metin) ama '<'/'&' içeren değerler.
    expect(priceToDisplayHtml('Größe <M>')).toBe('Größe &lt;M&gt;,<sup>00</sup>');
    expect(priceToDisplayHtml('1 & 2')).toBe('1 &amp; 2,<sup>00</sup>');
    // NOT: 'Ücretsiz' gibi sayısal olmayan metne splitPrice ',00' ekler — MEVCUT davranış,
    // bilinçli korunuyor (değiştirmek tüm katalogların görünümünü kaydırır).
    expect(priceToDisplayHtml('Ücretsiz')).toBe('Ücretsiz,<sup>00</sup>');
  });
});
