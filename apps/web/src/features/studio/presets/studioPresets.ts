// Hazır şablonlar (B1) — kod-içi sabitler. İleride admin/DB'den gelmesi
// istenirse yalnızca listStudioPresets() içi değişir; UI bu fonksiyondan okur.
//
// Bir StudioPreset = stil (CatalogSettings override'ları, defaultGrid + footer dahil)
// + boş banner alanları. applyPreset bunu varsayılan ayarlar üzerine merge eder (replace).

import type {
  CatalogPage,
  CatalogSettings,
  DeepPartial,
  StudioPreset,
  StudioPresetArchetype,
} from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';
import afpackTema from './data/afpack-tema.json';

function clone<T>(value: T): T {
  const sc = (globalThis as { structuredClone?: <V>(v: V) => V }).structuredClone;
  return sc ? sc(value) : (JSON.parse(JSON.stringify(value)) as T);
}

const PRESETS: StudioPreset[] = [
  {
    // Gerçek sistem teması (rol-bazlı arketip): stüdyoda tasarlanıp "Preset Kopyala" ile dışa
    // aktarıldı (docs/Tema/Af-Pack_Tema1.json → src/.../presets/data/afpack-tema.json). JSON import
    // literal tipleri genişlettiğinden union'lara uymaz → as unknown as ile cast; kimlik ezilir.
    ...(afpackTema as unknown as StudioPreset),
    id: 'preset-afpack-tema',
    name: 'AfPack Tema',
    description: 'AfPack tek-kırım broşür teması — kapak/iç/arka arketipleri (gölge, modüller, footer dahil).',
    thumbnail: '/presets/preset-afpack-tema.jpg',
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
 * Bir sayfayı rol-bazlı arketibe çevirir: ürünü çıkarılmış KOMPLE sayfa snapshot'ı.
 * Stil/birleşme/modül/zemin/header/footer korunur; ürün ve `imageSettings` (ürün-kırpması,
 * içeriğe özgü) DIŞARIDA bırakılır. Grid = sayfanın gridSettings'i, yoksa global defaultGrid.
 */
function captureArchetype(
  page: CatalogPage,
  defaultGrid: { rows: number; cols: number },
): StudioPresetArchetype {
  return {
    grid: {
      rows: page.gridSettings?.rows ?? defaultGrid.rows,
      cols: page.gridSettings?.cols ?? defaultGrid.cols,
    },
    slots: page.slots.map((s) => {
      const c = clone(s);
      c.product = null;
      delete c.imageSettings;
      return c;
    }),
    background: page.background ? clone(page.background) : undefined,
    headerData: page.headerData ? clone(page.headerData) : undefined,
    footerMode: page.footerMode,
    footerOverride: page.footerOverride ? clone(page.footerOverride) : undefined,
    footerText: page.footerText,
    footerLogo: page.footerLogo,
  };
}

/**
 * Geliştirici aracı: mevcut tuval durumunu bir StudioPreset objesine dönüştürür
 * (applyPreset'in tersi). Ürün/havuz/içerik DAHİL EDİLMEZ. Rol-bazlı arketip formatı:
 * cover (ilk sayfa) + inner (pageNumber 2, ≥3 sayfa) + backCover (son sayfa). Stil + grid +
 * özel slotlar + modüller + zemin + footer KOMPLE taşınır (gölge dahil; bkz. mimari belge).
 */
export function exportPresetFromState(): StudioPreset {
  const { globalSettings, formas } = useCatalogStore.getState();

  // Geçici görsel-edit alanlarını ayıkla (projectSerializer konvansiyonu).
  const settings = stripTransientSettings(globalSettings);

  const dg = globalSettings.defaultGrid;
  const pages = formas
    .flatMap((f) => f.pages)
    .slice()
    .sort((a, b) => a.pageNumber - b.pageNumber);

  const cover = pages[0] ? captureArchetype(pages[0], dg) : undefined;
  const backCover = pages.length >= 2 ? captureArchetype(pages[pages.length - 1], dg) : undefined;
  const inner = pages.length >= 3 ? captureArchetype(pages[1], dg) : undefined;

  return {
    id: `preset-${Date.now()}`,
    name: 'Yeni Şablon',
    settings,
    ...(cover ? { cover } : {}),
    ...(inner ? { inner } : {}),
    ...(backCover ? { backCover } : {}),
  };
}
