// Hazır şablonlar (B1) — kod-içi sabitler. İleride admin/DB'den gelmesi
// istenirse yalnızca listStudioPresets() içi değişir; UI bu fonksiyondan okur.
//
// Bir StudioPreset = stil (CatalogSettings override'ları, defaultGrid + footer dahil)
// + boş banner alanları. applyPreset bunu varsayılan ayarlar üzerine merge eder (replace).

import type { CatalogSettings, DeepPartial, StudioPreset } from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';

const PRESETS: StudioPreset[] = [
  {
    id: 'preset-klasik-market',
    name: 'Klasik Market',
    description: '4×4 ızgara, kırmızı fiyat kutusu — standart market broşürü.',
    thumbnail: '/presets/preset-klasik-market.jpg',
    settings: {
      defaultGrid: { rows: 4, cols: 4 },
      colors: {
        cellBg: { type: 'solid', color: '#ffffff', opacity: 100 },
        cellBorder: { c: '#e2e8f0', o: 100 },
        priceBg: { type: 'solid', color: '#e60000', opacity: 100 },
        priceBorder: { c: '#ffffff', o: 100 },
      },
      radiuses: {
        cell: { tl: 0, tr: 0, bl: 0, br: 0, linked: true },
        price: { tl: 0, tr: 0, bl: 0, br: 0, linked: true },
      },
    },
  },
  {
    id: 'preset-modern-vitrin',
    name: 'Modern Vitrin',
    description: '3×4 ızgara, koyu hücre + yuvarlatılmış köşe, üstte boş banner alanı.',
    thumbnail: '/presets/preset-modern-vitrin.jpg',
    settings: {
      defaultGrid: { rows: 3, cols: 4 },
      colors: {
        cellBg: { type: 'solid', color: '#0f172a', opacity: 100 },
        cellBorder: { c: '#1e293b', o: 100 },
        priceBg: { type: 'solid', color: '#f59e0b', opacity: 100 },
        priceBorder: { c: '#0f172a', o: 100 },
      },
      radiuses: {
        cell: { tl: 12, tr: 12, bl: 12, br: 12, linked: true },
        price: { tl: 8, tr: 8, bl: 8, br: 8, linked: true },
      },
      fonts: {
        productName: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, color: '#f8fafc' },
        price: { fontFamily: 'Inter', fontWeight: '800', fontSize: 20, color: '#0f172a' },
      },
    },
    // İlk sayfanın üst satırı tam-genişlik boş banner alanı (cols=4 → colSpan 4).
    bannerAreas: [{ pageNumber: 1, slotIndex: 0, colSpan: 4, rowSpan: 1 }],
  },
  {
    id: 'preset-yogun-liste',
    name: 'Yoğun Liste',
    description: '5×4 sıkışık ızgara, küçük boşluklar — çok ürünlü liste sayfaları.',
    thumbnail: '/presets/preset-yogun-liste.jpg',
    settings: {
      defaultGrid: { rows: 5, cols: 4 },
      gridGap: 1,
      spacings: { cell: { t: 4, r: 4, b: 4, l: 4 } },
      colors: {
        cellBg: { type: 'solid', color: '#ffffff', opacity: 100 },
        cellBorder: { c: '#cbd5e1', o: 100 },
        priceBg: { type: 'solid', color: '#dc2626', opacity: 100 },
        priceBorder: { c: '#ffffff', o: 100 },
      },
      fonts: {
        productName: { fontFamily: 'Inter', fontWeight: '600', fontSize: 8, color: '#1e293b' },
        price: { fontFamily: 'Inter', fontWeight: '700', fontSize: 15, color: '#ffffff' },
      },
    },
  },
];

/** Hazır şablonları döndürür. UI yalnızca bunu çağırmalı (DB'ye taşıma noktası). */
export function listStudioPresets(): StudioPreset[] {
  return PRESETS;
}

/**
 * Geçici görsel-edit alanlarını (her oturumda sıfırlanan) ayıklar — şablona dahil edilmez.
 * Hem export hem de "özelleştirme tespiti" karşılaştırması bunu kullanır.
 */
export function stripTransientSettings(s: CatalogSettings): DeepPartial<CatalogSettings> {
  const copy = { ...s } as Record<string, unknown>;
  delete copy.imageScale;
  delete copy.imagePosX;
  delete copy.imagePosY;
  delete copy.imageEditMode;
  return copy as DeepPartial<CatalogSettings>;
}

/**
 * Geliştirici aracı: mevcut tuval durumunu bir StudioPreset objesine dönüştürür
 * (applyPreset'in tersi). Ürün/havuz/içerik DAHİL EDİLMEZ — yalnızca tema + grid +
 * boş banner alanları. Çıktı studioPresets.ts'e yapıştırılır.
 */
export function exportPresetFromState(): StudioPreset {
  const { globalSettings, formas } = useCatalogStore.getState();

  // Geçici görsel-edit alanlarını ayıkla (projectSerializer konvansiyonu).
  const settings = stripTransientSettings(globalSettings);

  const bannerAreas = formas
    .flatMap((f) => f.pages)
    .flatMap((p) =>
      p.slots
        .map((s, slotIndex) => ({ s, slotIndex }))
        .filter(({ s }) => s.role === 'free')
        .map(({ s, slotIndex }) => ({
          pageNumber: p.pageNumber,
          slotIndex,
          colSpan: s.colSpan,
          rowSpan: s.rowSpan,
        })),
    );

  // Sayfa zeminleri — pageNumber bazlı, seyrek (yalnız background tanımlı sayfalar).
  // background OLDUĞU GİBİ taşınır (value/imageUrl/imageSize/imagePosition/imageOpacity/
  // overlay dahil); stripTransientSettings BURADA uygulanmaz (o yalnız globalSettings'in
  // hücre-görsel edit alanları için). Referans kopuşu: dönen preset TopBar'da
  // JSON.stringify ile panoya yazılıyor (handleExportPreset) → canlı sayfayla obje bağı
  // kopuyor, ekstra clone gerekmez. (Apply tarafında serileştirme yok → orada clone zorunlu.)
  const pageBackgrounds = formas
    .flatMap((f) => f.pages)
    .flatMap((p) =>
      p.background ? [{ pageNumber: p.pageNumber, background: p.background }] : [],
    );

  return {
    id: `preset-${Date.now()}`,
    name: 'Yeni Şablon',
    settings,
    ...(bannerAreas.length ? { bannerAreas } : {}),
    ...(pageBackgrounds.length ? { pageBackgrounds } : {}),
  };
}
