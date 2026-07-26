// Sözleşme: Excel'den yerleştirmede ürün görselinin TEK KAYNAĞI SKU'dur.
//
// GERÇEK OLAY (canlıda gözlendi): Excel'in "Görsel" sütunundaki değer <img src> yapılıyordu.
// Kullanıcı broşür Excel'ini yerel ortamda hazırladığı için o sütunda
// `http://localhost:3001/uploads/...` gömülüydü; canlıda bu adres çözülemediğinden TÜM
// ürünler kırık görselle yerleşiyordu. Proje kaydedilince syncProductImagesFromLibrary
// (yalnızca SKU ile eşleştirir) doğru adresi koyduğu için "kaydedince düzeliyor" görünüyordu.
//
// Karar: Excel'deki görsel değeri ORTAMA BAĞLI ve taşınabilir olmadığı için tamamen yok
// sayılır. SKU sistemin gerçek referansıdır — resimler kütüphaneye SKU adıyla yükleniyor
// (guessSkuFromFileName) ve senkron da SKU kullanıyor. Böylece yerleştirme ile kaydetme
// sonrası davranış birebir aynı olur.
import { describe, it, expect, beforeEach } from 'vitest';
import type { StudioSlot } from '@matbaapro/shared';
import { Template1 } from '@matbaapro/shared';
import { recalculateLayout } from '@matbaapro/grid-engine';
import { useCatalogStore } from './catalog.store';
import { useHistoryStore } from './history.store';
import { initialGlobalSettings, buildFormasForTemplate } from './defaults';

const GRID = { rows: 4, cols: 4 };

function setup() {
  useHistoryStore.getState().clearHistory();
  useCatalogStore.setState({
    activeFormaId: 1,
    activeTab: 'outer',
    formas: recalculateLayout(buildFormasForTemplate(Template1), GRID),
    globalSettings: { ...initialGlobalSettings, defaultGrid: GRID },
    productPool: [],
    tempProductPool: [],
  });
}

const slotByGlobal = (n: number): StudioSlot | undefined => {
  for (const f of useCatalogStore.getState().formas)
    for (const p of f.pages) for (const s of p.slots) if (s.globalNumber === n) return s;
  return undefined;
};

/** POS=1 olan tek ürünlük havuz kurar ve yerleştirir; slot 1'in görsel adresini döndürür. */
function yerlestirVeOku(
  excelGorseli: string | undefined,
  kutuphane: Record<string, string>,
  sku = 'P1',
) {
  setup();
  useCatalogStore.getState().setProductPool([
    { id: 'P1', sku, name: 'Ürün 1', price: '1', image: excelGorseli, raw: { POS: 1 } },
  ]);
  useCatalogStore.getState().autoFillSlots(kutuphane);
  return slotByGlobal(1)?.product?.image;
}

describe('Excel yerleştirme — görselin tek kaynağı SKU', () => {
  beforeEach(setup);

  it('kütüphanede SKU eşleşmesi varsa o adres kullanılır', () => {
    const kutuphaneAdresi = 'https://api.ornek.com/uploads/kullanici/abc_213SP.png';
    expect(yerlestirVeOku(undefined, { P1: kutuphaneAdresi })).toBe(kutuphaneAdresi);
  });

  it('SKU yazımı farklı olsa da (boşluk/küçük harf) eşleşme tutar', () => {
    const kutuphaneAdresi = 'https://api.ornek.com/uploads/kullanici/abc_213SP.png';
    expect(yerlestirVeOku(undefined, { '213SP': kutuphaneAdresi }, ' 213sp ')).toBe(
      kutuphaneAdresi,
    );
  });

  // Aşağıdaki üç senaryo canlıdaki arızanın tam karşılığı: Excel ne yazarsa yazsın,
  // kütüphane eşleşmesi neyse o kullanılmalı.
  it('Excel içindeki localhost adresi YOK SAYILIR, kütüphane adresi kazanır', () => {
    const kutuphaneAdresi = 'https://api.ornek.com/uploads/kullanici/abc_213SP.png';
    const sonuc = yerlestirVeOku(
      'http://localhost:3001/uploads/kullanici/eski_213SP.png',
      { P1: kutuphaneAdresi },
    );
    expect(sonuc).toBe(kutuphaneAdresi);
    expect(sonuc).not.toContain('localhost');
  });

  it('Excel içindeki çıplak dosya adı YOK SAYILIR', () => {
    const kutuphaneAdresi = 'https://api.ornek.com/uploads/kullanici/abc_213SP.png';
    expect(yerlestirVeOku('217C.png', { P1: kutuphaneAdresi })).toBe(kutuphaneAdresi);
  });

  it('Excel içindeki dış CDN adresi de YOK SAYILIR (tek kaynak kuralı)', () => {
    const kutuphaneAdresi = 'https://api.ornek.com/uploads/kullanici/abc_213SP.png';
    expect(yerlestirVeOku('https://cdn.baska.com/foto.png', { P1: kutuphaneAdresi })).toBe(
      kutuphaneAdresi,
    );
  });

  it('kütüphanede eşleşme yoksa görsel atanmaz — Excel değeri yedek olarak KULLANILMAZ', () => {
    // Kritik: burada eskiden Excel değeri devreye girip kırık görsel üretiyordu.
    expect(yerlestirVeOku('http://localhost:3001/uploads/x/y.png', {})).toBeUndefined();
    expect(yerlestirVeOku('217C.png', {})).toBeUndefined();
  });
});
