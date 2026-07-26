// Regresyon: Excel'den yerleştirmede ürün görselinin ADRESİ nasıl seçiliyor?
//
// GERÇEK OLAY (canlıda gözlendi): Excel'in "Görsel" sütunundaki değer olduğu gibi <img src>
// yapılıyordu. Değer "217C.png" gibi ÇIPLAK bir dosya adı olduğunda tarayıcı onu web
// origin'ine göre çözüyor (serdiado.com.tr/217C.png) ama dosyalar api.<domain> altında
// duruyor → 404 → "Excel ile yerleştir dediğimde resimlerin hiçbiri çıkmıyor, kırık link".
// Projeyi kaydedip yeniden açınca syncProductImagesFromLibrary SKU'dan doğru adresi
// koyduğu için düzeliyordu — kullanıcının tarif ettiği tam davranış buydu.
//
// Beklenen kural (catalog.store.ts _fillSlotsFromPool):
//   http(s)://...   → olduğu gibi kullan (kasten verilmiş dış adres)
//   /uploads/...    → API origin'iyle mutlaklaştır (web origin'i DEĞİL)
//   çıplak ad       → KULLANMA, SKU eşleşmesindeki kütüphane adresine düş
import { describe, it, expect, beforeEach } from 'vitest';
import type { StudioSlot } from '@matbaapro/shared';
import { Template1 } from '@matbaapro/shared';
import { recalculateLayout } from '@matbaapro/grid-engine';
import { useCatalogStore } from './catalog.store';
import { useHistoryStore } from './history.store';
import { initialGlobalSettings, buildFormasForTemplate } from './defaults';
import { apiOrigin } from '@/lib/apiOrigin';

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
  image: string | undefined,
  kutuphane: Record<string, string>,
  sku = 'P1',
) {
  setup();
  useCatalogStore.getState().setProductPool([
    { id: 'P1', sku, name: 'Ürün 1', price: '1', image, raw: { POS: 1 } },
  ]);
  useCatalogStore.getState().autoFillSlots(kutuphane);
  return slotByGlobal(1)?.product?.image;
}

describe('Excel yerleştirmede görsel adresi çözümü', () => {
  beforeEach(setup);

  it('çıplak dosya adı KULLANILMAZ, SKU eşleşmesindeki kütüphane adresi tercih edilir', () => {
    const kutuphaneAdresi = '/uploads/kullanici/abc_217C.png';
    const sonuc = yerlestirVeOku('217C.png', { P1: kutuphaneAdresi });

    expect(sonuc).toBe(kutuphaneAdresi);
    expect(sonuc).not.toBe('217C.png');
  });

  it('mutlak http(s) adresi olduğu gibi korunur', () => {
    const disAdres = 'https://cdn.ornek.com/foto/urun.png';
    const sonuc = yerlestirVeOku(disAdres, { P1: '/uploads/kullanici/baska.png' });

    expect(sonuc).toBe(disAdres);
  });

  it('/uploads/ ile başlayan değer API origin ile mutlaklaştırılır', () => {
    const sonuc = yerlestirVeOku('/uploads/kullanici/x_UPL.png', {});

    expect(sonuc).toBe(apiOrigin + '/uploads/kullanici/x_UPL.png');
    expect(sonuc?.startsWith('/uploads/')).toBe(false); // göreli bırakılırsa web origin'ine gider
  });

  it('Excel görseli yoksa kütüphane adresi kullanılır', () => {
    const kutuphaneAdresi = '/uploads/kullanici/y_BOS.png';
    const sonuc = yerlestirVeOku(undefined, { P1: kutuphaneAdresi });

    expect(sonuc).toBe(kutuphaneAdresi);
  });

  it('ne Excel görseli ne kütüphane eşleşmesi varsa görsel atanmaz', () => {
    expect(yerlestirVeOku(undefined, {})).toBeUndefined();
  });

  // Canlıda gözlenen asıl arıza: Excel'de SKU " 213sp ", kütüphanede "213SP" yazılıydı.
  // Yerleştirme ham anahtarla aradığı için eşleşme tutmuyor, hücreler görselsiz kalıyordu;
  // proje kaydedilince normalizeSku KULLANAN senkron devreye girip görselleri getiriyordu.
  it('SKU yazımı farklı olsa da (boşluk/küçük harf) kütüphane görseli eşleşir', () => {
    const kutuphaneAdresi = '/uploads/kullanici/abc_213SP.png';
    // Kütüphane anahtarı ProductManagement'ta normalizeSku ile kurulur → "213SP".
    const sonuc = yerlestirVeOku('217C.png', { '213SP': kutuphaneAdresi }, ' 213sp ');

    expect(sonuc).toBe(kutuphaneAdresi);
  });
});
