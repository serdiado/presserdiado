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
