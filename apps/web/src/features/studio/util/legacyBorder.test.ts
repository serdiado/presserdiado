// Regresyon: kayıtlı ESKİ projeler stüdyoda açılırken çökmemeli.
//
// GERÇEK OLAY: Görünüm ayarları BorderData'ya taşındığında yalnızca kod-içi preset/modül
// JSON'ları normalize edildi; veritabanındaki projeler dönüştürülmedi. Sonuç: eski projelerde
// globalSettings.colors.cellBorder hâlâ ColorOpacity ({c,o}) kalıyordu, borderDataToCss
// b.color'ı bulamayıp "Cannot read properties of undefined (reading 'o')" ile patlıyor ve TÜM
// stüdyo ErrorBoundary'ye düşüyordu. Ölçüm: kullanıcının 11 projesinin 10'u etkileniyordu ve
// bu projeler canlıya taşınmıştı.
//
// İki savunma hattı test edilir:
//   1) normalizeLegacyAppearance eski şekli doğru BorderData'ya çevirir (asıl düzeltme),
//   2) style yardımcıları yine de eksik veri görürse çökmez (emniyet kemeri).
import { describe, it, expect } from 'vitest';
import { normalizeLegacyAppearance } from '../modules/normalizeLegacyAppearance';
import { borderDataToCss, colorOpacityToCss } from './style';
import type { BorderData } from '@matbaapro/shared';

/** Canlıda çöken projeden alınmış gerçek şekil (5b7fd472). */
const eskiProje = {
  version: 1,
  catalog: {
    globalSettings: {
      borderWidth: 1,
      priceBorderWidth: 0,
      colors: {
        cellBg: { c: '#ffffff', o: 100 },
        cellBorder: { c: '#e2e8f0', o: 100 },
        priceBg: { c: '#facc15', o: 100 },
        priceBorder: { c: '#ffffff', o: 100 },
      },
    },
  },
};

describe('eski proje kenarlık göçü', () => {
  it('cellBorder/priceBorder ColorOpacity → BorderData olur, genişlik kardeş alandan gelir', () => {
    const n = normalizeLegacyAppearance(eskiProje) as typeof eskiProje & {
      catalog: { globalSettings: { colors: { cellBorder: BorderData; priceBorder: BorderData } } };
    };
    const { cellBorder, priceBorder } = n.catalog.globalSettings.colors;

    expect(cellBorder.color).toEqual({ c: '#e2e8f0', o: 100 });
    expect([cellBorder.t, cellBorder.r, cellBorder.b, cellBorder.l]).toEqual([1, 1, 1, 1]);
    expect(cellBorder.style).toBe('solid');

    // priceBorderWidth 0 idi — kenarlık görünmez olmalı ama şekil geçerli kalmalı.
    expect(priceBorder.color).toEqual({ c: '#ffffff', o: 100 });
    expect([priceBorder.t, priceBorder.r, priceBorder.b, priceBorder.l]).toEqual([0, 0, 0, 0]);
  });

  it('normalize edilmiş veri borderDataToCss ile ÇÖKMEDEN işlenir', () => {
    const n = normalizeLegacyAppearance(eskiProje) as typeof eskiProje & {
      catalog: { globalSettings: { colors: { cellBorder: BorderData } } };
    };
    const css = borderDataToCss(n.catalog.globalSettings.colors.cellBorder);
    expect(css.borderTopWidth).toBe('1px');
    expect(css.borderColor).toBe('#e2e8f0');
  });

  it('idempotent: yeni şekildeki veri ikinci normalize ile bozulmaz', () => {
    const birKez = normalizeLegacyAppearance(eskiProje);
    const ikiKez = normalizeLegacyAppearance(birKez);
    expect(ikiKez).toEqual(birKez);
  });
});

describe('style yardımcıları emniyet kemeri', () => {
  it('colorOpacityToCss undefined ile çökmez', () => {
    expect(() => colorOpacityToCss(undefined)).not.toThrow();
    expect(colorOpacityToCss(undefined)).toBe('transparent');
  });

  it('borderDataToCss undefined ile çökmez', () => {
    expect(() => borderDataToCss(undefined)).not.toThrow();
    const css = borderDataToCss(undefined);
    expect(css.borderTopWidth).toBe('0px');
    expect(css.borderColor).toBe('transparent');
  });

  it('borderDataToCss normalize EDİLMEMİŞ eski şekille bile çökmez', () => {
    // Bu tam olarak canlıda patlayan çağrıydı: BorderData yerine ColorOpacity geçti.
    const eskiSekil = { c: '#e2e8f0', o: 100 } as unknown as BorderData;
    expect(() => borderDataToCss(eskiSekil)).not.toThrow();
    expect(borderDataToCss(eskiSekil).borderTopWidth).toBe('0px');
  });
});
