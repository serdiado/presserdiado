// Sözleşme: thumbnail yakalamadan önce, uzunluğu DEĞİŞTİREN text-transform dönüşümleri
// klonda düzleştirilmeli.
//
// GERÇEK OLAY (canlıda ölçüldü): Almanca bir broşürün dipnotundaki tek kelime
// "ausschließlich" (14 karakter) `text-transform: uppercase` ile "AUSSCHLIESSLICH"
// (15 karakter — ß büyük harfte SS olur) hâline geliyordu. html2canvas-pro dönüşmüş
// uzunluğu ORİJİNAL metin düğümüne Range ile uygulayınca şu hatayı fırlatıyordu:
//   IndexSizeError: Failed to execute 'setEnd' on 'Range': The offset 15 is larger
//   than the node's length (14).
// Bu, yakalamanın tamamını çökertiyor ve projenin hiç önizlemesi oluşmuyordu (kullanıcı
// panelinde boş kart). Tek bir Almanca kelime tüm broşürün thumbnail'ini öldürüyordu.
import { describe, it, expect } from 'vitest';
import { duzlestirTextTransform } from './thumbnailCapture';

/** Verilen metni `text-transform` uygulanmış bir <span> içinde tutan kök döndürür. */
function agacKur(metin: string, textTransform: string) {
  const kok = document.createElement('div');
  const span = document.createElement('span');
  span.style.textTransform = textTransform;
  span.textContent = metin;
  kok.appendChild(span);
  return kok;
}

/** Orijinal + birebir klon çifti üretir (html2canvas'ın onclone'da verdiği yapı). */
function ciftKur(metin: string, textTransform: string) {
  const orijinal = agacKur(metin, textTransform);
  document.body.appendChild(orijinal); // computed style ORİJİNALDEN okunuyor
  return { orijinal, klon: orijinal.cloneNode(true) as HTMLElement };
}

describe('duzlestirTextTransform — uzunluk değiştiren uppercase çökmesi', () => {
  it('ß içeren metni klonda düzleştirir ve text-transform:none yapar', () => {
    const { orijinal, klon } = ciftKur('ausschließlich', 'uppercase');

    duzlestirTextTransform(orijinal, klon);

    const klonSpan = klon.querySelector('span')!;
    expect(klonSpan.textContent).toBe('AUSSCHLIESSLICH');
    expect(klonSpan.style.textTransform).toBe('none');
    // Kritik: uzunluk artık tutuyor — Range taşması bu yüzden oluşmuyor.
    expect(klonSpan.textContent!.length).toBe(15);
  });

  it('orijinal ağaca DOKUNMAZ (ekrandaki tasarım bozulmamalı)', () => {
    const { orijinal, klon } = ciftKur('ausschließlich', 'uppercase');

    duzlestirTextTransform(orijinal, klon);

    const orjSpan = orijinal.querySelector('span')!;
    expect(orjSpan.textContent).toBe('ausschließlich');
    expect(orjSpan.style.textTransform).toBe('uppercase');
  });

  it('uzunluğu DEĞİŞMEYEN uppercase metne dokunmaz (gereksiz müdahale yok)', () => {
    const { orijinal, klon } = ciftKur('Tomaten Ketchup', 'uppercase');

    duzlestirTextTransform(orijinal, klon);

    const klonSpan = klon.querySelector('span')!;
    expect(klonSpan.textContent).toBe('Tomaten Ketchup');
    expect(klonSpan.style.textTransform).toBe('uppercase');
  });

  it('text-transform yoksa hiçbir şey yapmaz', () => {
    const { orijinal, klon } = ciftKur('ausschließlich', 'none');

    duzlestirTextTransform(orijinal, klon);

    expect(klon.querySelector('span')!.textContent).toBe('ausschließlich');
  });

  it('Türkçe karakterlerde uzunluk korunur, dolayısıyla dokunulmaz', () => {
    // Kullanıcının proje adlarında bilinçli test ettiği karakterler — bunlar uzunluk
    // değiştirmediği için sorun kaynağı DEĞİL; regresyonda yanlış pozitif olmasın.
    const { orijinal, klon } = ciftKur('üÜçÇöÖşŞğĞ', 'uppercase');

    duzlestirTextTransform(orijinal, klon);

    expect(klon.querySelector('span')!.style.textTransform).toBe('uppercase');
  });

  it('birden çok metin düğümünde yalnızca sorunlu olanı düzeltir', () => {
    const kok = document.createElement('div');
    for (const m of ['Weißbier', 'Normal Metin', 'groß']) {
      const s = document.createElement('span');
      s.style.textTransform = 'uppercase';
      s.textContent = m;
      kok.appendChild(s);
    }
    document.body.appendChild(kok);
    const klon = kok.cloneNode(true) as HTMLElement;

    duzlestirTextTransform(kok, klon);

    const spanlar = [...klon.querySelectorAll('span')];
    expect(spanlar.map((s) => s.textContent)).toEqual(['WEISSBIER', 'Normal Metin', 'GROSS']);
    expect(spanlar.map((s) => s.style.textTransform)).toEqual(['none', 'uppercase', 'none']);
  });
});
