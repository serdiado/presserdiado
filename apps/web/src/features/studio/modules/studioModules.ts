// Kütüphane: kod-içi sistem modül ÖRNEKLERİ (presetlerdeki studioPresets.ts'in
// kardeşi). TİP ≠ ÖRNEK — buradaki kayıtlar ModuleRegistry tiplerinin DOLU
// örnekleridir (boş tip değil). İleride admin/DB'den gelmesi istenirse yalnızca
// listStudioModules() içi değişir; UI bu fonksiyondan okur.
//
// Aşama 6 — PLACEHOLDER'lar: aşağıdaki 9 örnek (6 banner + 3 ürün-sunuş) basit
// iskeletlerdir. Gerçek görsel tasarımlar Serdiado'nun stüdyoda tasarlayıp "Modül
// Kopyala" ile export ettiği JSON'larla DEĞİŞTİRİLECEK. Şimdiki amaç: kütüphane
// dolu görünsün, kartlar sürüklenebilir + render edilebilir olsun.

import type { BorderData, SpacingData, TypographyData } from '@matbaapro/shared';
import type { StudioModule } from './types';

// Placeholder banner hücresi için paylaşılan varsayılanlar (boilerplate'i azaltır).
const PH_FONT: TypographyData = {
  fontFamily: 'Inter',
  fontWeight: '800',
  fontSize: 22,
  lineHeight: 1.2,
  letterSpacing: 0.5,
  textAlign: 'center',
  verticalAlign: 'middle',
  textTransform: 'uppercase',
  textDecoration: 'none',
  color: '#ffffff',
  opacity: 100,
  decimalScale: 100,
};
const PH_PADDING: SpacingData = { t: 8, r: 8, b: 8, l: 8, linked: true };
const PH_BORDER: BorderData = {
  t: 0,
  r: 0,
  b: 0,
  l: 0,
  linked: true,
  color: { c: '#e2e8f0', o: 100 },
  style: 'solid',
};

/**
 * Tek hücreli placeholder banner üretici (FreeStudioModule, type:'banner').
 * Gerçek tasarım export'la gelince bu çağrılar düz JSON objeleriyle değiştirilecek.
 */
function phBanner(
  id: string,
  name: string,
  description: string,
  bg: string,
  text: string,
  fontOverride: Partial<TypographyData> = {},
): StudioModule {
  return {
    id,
    name,
    description,
    slotRole: 'free',
    type: 'banner',
    moduleData: {
      type: 'banner',
      rows: 1,
      cols: 1,
      bgColor: { type: 'solid', color: bg, opacity: 100 },
      containerBorder: { color: { c: '#e2e8f0', o: 100 }, width: 0 },
      radius: { tl: 0, tr: 0, bl: 0, br: 0, linked: true },
      shadow: { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0, active: false },
      cells: [
        {
          id: `${id}-c0`,
          text,
          colSpan: 1,
          rowSpan: 1,
          hidden: false,
          mergedInto: null,
          font: { ...PH_FONT, ...fontOverride },
          padding: PH_PADDING,
          bgColor: { type: 'solid', color: bg, opacity: 100 },
          border: PH_BORDER,
          image: null,
        },
      ],
    },
    source: 'system',
  };
}

const MODULES: StudioModule[] = [
  // ── Banner placeholder'ları (6) — FreeStudioModule, type:'banner' ──
  {
    id: 'module-banner-marka',
    name: 'Marka Bandı',
    description: 'Koyu zeminli, marka adı + slogan içeren basit üst bant (tohum).',
    slotRole: 'free',
    type: 'banner',
    moduleData: {
      type: 'banner',
      rows: 1,
      cols: 2,
      bgColor: { type: 'solid', color: '#0f172a', opacity: 100 },
      containerBorder: { color: { c: '#0f172a', o: 100 }, width: 0 },
      radius: { tl: 0, tr: 0, bl: 0, br: 0, linked: true },
      shadow: { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0, active: false },
      cells: [
        {
          id: 'seed-marka-0',
          text: 'MARKA',
          colSpan: 1,
          rowSpan: 1,
          hidden: false,
          mergedInto: null,
          font: {
            fontFamily: 'Inter',
            fontWeight: '800',
            fontSize: 26,
            lineHeight: 1.2,
            letterSpacing: 1,
            textAlign: 'center',
            verticalAlign: 'middle',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: '#ffffff',
            opacity: 100,
            decimalScale: 100,
          },
          padding: { t: 8, r: 8, b: 8, l: 8, linked: true },
          bgColor: { type: 'solid', color: '#0f172a', opacity: 100 },
          border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: '#e2e8f0', o: 100 }, style: 'solid' },
          image: null,
          imageMode: 'contain',
          imagePosX: 0,
          imagePosY: 0,
          imageScale: 100,
        },
        {
          id: 'seed-marka-1',
          text: 'Kalite ve güven',
          colSpan: 1,
          rowSpan: 1,
          hidden: false,
          mergedInto: null,
          font: {
            fontFamily: 'Inter',
            fontWeight: '500',
            fontSize: 14,
            lineHeight: 1.2,
            letterSpacing: 0,
            textAlign: 'center',
            verticalAlign: 'middle',
            textTransform: 'none',
            textDecoration: 'none',
            color: '#f59e0b',
            opacity: 100,
            decimalScale: 100,
          },
          padding: { t: 8, r: 8, b: 8, l: 8, linked: true },
          bgColor: { type: 'solid', color: '#0f172a', opacity: 100 },
          border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: '#e2e8f0', o: 100 }, style: 'solid' },
          image: null,
          imageMode: 'contain',
          imagePosX: 0,
          imagePosY: 0,
          imageScale: 100,
        },
      ],
    },
    source: 'system',
  },
  phBanner(
    'module-banner-kampanya',
    'Kampanya Bandı',
    'Kırmızı zeminli büyük indirim duyuru bandı (placeholder).',
    '#dc2626',
    'BÜYÜK İNDİRİM',
    { fontSize: 26 },
  ),
  phBanner(
    'module-banner-donem',
    'Dönem Fırsatı',
    'Mavi zeminli haftalık fırsat bandı (placeholder).',
    '#1d4ed8',
    'Haftanın Fırsatları',
    { textTransform: 'none', fontWeight: '700', fontSize: 20 },
  ),
  phBanner(
    'module-banner-duyuru',
    'İnce Duyuru',
    'Açık zeminli ince uyarı/duyuru bandı (placeholder).',
    '#f1f5f9',
    'Stoklarla sınırlıdır',
    { color: '#475569', fontWeight: '400', fontSize: 13, textTransform: 'none', letterSpacing: 0 },
  ),
  phBanner(
    'module-banner-logo',
    'Logo Alanı',
    'Beyaz zeminli logo + slogan yer tutucu bandı (placeholder).',
    '#ffffff',
    'LOGONUZ',
    { color: '#0f172a', fontSize: 22 },
  ),
  phBanner(
    'module-banner-fiyat-vurgu',
    'Fiyat Vurgu',
    'Sarı zeminli büyük fiyat vurgu bandı (placeholder).',
    '#facc15',
    '₺99,90',
    { color: '#0f172a', fontSize: 30, textTransform: 'none' },
  ),

  // ── Ürün-sunuş placeholder'ları (3) — ProductStudioModule, type:'product-presentation' ──
  {
    id: 'module-ornek-vurgu',
    name: 'Örnek Vurgu Sunumu',
    description: 'Ürün hücresine açık sarı zemin veren minimal sunuş (tohum).',
    slotRole: 'product',
    type: 'product-presentation',
    customSettings: {
      colors: {
        cellBg: { type: 'solid', color: '#fef3c7', opacity: 100 },
      },
    },
    source: 'system',
  },
  {
    id: 'module-urun-koyu',
    name: 'Koyu Sunum',
    description: 'Ürün hücresine koyu zemin + açık başlık veren sunuş (placeholder).',
    slotRole: 'product',
    type: 'product-presentation',
    customSettings: {
      colors: {
        cellBg: { type: 'solid', color: '#0f172a', opacity: 100 },
      },
      fonts: {
        productName: { color: '#ffffff' },
      },
    },
    source: 'system',
  },
  {
    id: 'module-urun-kampanya',
    name: 'Kampanya Sunumu',
    description: 'Ürün hücresine açık kırmızı zemin + kırmızı fiyat kutusu (placeholder).',
    slotRole: 'product',
    type: 'product-presentation',
    customSettings: {
      colors: {
        cellBg: { type: 'solid', color: '#fee2e2', opacity: 100 },
        priceBg: { type: 'solid', color: '#dc2626', opacity: 100 },
      },
    },
    source: 'system',
  },
];

/** Sistem modüllerini döndürür. UI yalnızca bunu çağırmalı (DB'ye taşıma noktası). */
export function listStudioModules(): StudioModule[] {
  return MODULES;
}
