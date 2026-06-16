// Kütüphane: kod-içi sistem modül ÖRNEKLERİ (presetlerdeki studioPresets.ts'in
// kardeşi). TİP ≠ ÖRNEK — buradaki kayıtlar ModuleRegistry tiplerinin DOLU
// örnekleridir (boş tip değil). İleride admin/DB'den gelmesi istenirse yalnızca
// listStudioModules() içi değişir; UI bu fonksiyondan okur.
//
// Not (içerik üretimi): dolu banner/ürün-sunuş örnekleri elle yazılmaz — dev
// "Modül Kopyala" aracıyla (Aşama 5) tuvalden export edilip buraya yapıştırılır.
// Aşağıdaki tek örnek, tip sözleşmesini doğrulayan minimal tohumdur (Aşama 1).

import type { StudioModule } from './types';

const MODULES: StudioModule[] = [
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
];

/** Sistem modüllerini döndürür. UI yalnızca bunu çağırmalı (DB'ye taşıma noktası). */
export function listStudioModules(): StudioModule[] {
  return MODULES;
}