// Dev aracı: mevcut tuval seçimini StudioModule olarak dışa aktarır (applyStudioModule'ün
// tersi; exportPresetFromState'in kardeşi). Çıktı studioModules.ts'e yapıştırılır.
//
// AYRI dosya — studioModules.ts'e KONULMAZ: catalog.store, studioModules.ts'ten
// listStudioModules import ediyor; bu dosya '@/stores/studio'yi import ettiği için
// studioModules.ts'e koyarsak catalog.store → studioModules → catalog.store döngüsü
// oluşur. Bu dosya yalnız UI'dan (TopBar) çağrılır → döngü yok.

import type { CatalogSettings } from '@matbaapro/shared';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { stripTransientSettings } from '../presets/studioPresets';
import type { AnyModuleData, StudioModule } from './types';

/**
 * Seçili slotu StudioModule'e çevirir. Rolüne göre dallanır:
 *  - role==='free' + moduleData → FreeStudioModule (banner içeriği)
 *  - isCustom + customSettings → ProductStudioModule (özel slot stili)
 *  - aksi halde null (geçersiz seçim — çağıran toast gösterir).
 * Ürün/havuz/içerik (product) DAHİL EDİLMEZ — yalnız modül tanımı.
 */
export function exportModuleFromState(): StudioModule | null {
  const { formas, activeFormaId } = useCatalogStore.getState();
  const { selectedSlotIds } = useUIStore.getState();
  if (selectedSlotIds.length === 0) return null;

  const slotId = selectedSlotIds[0];
  const forma = formas.find((f) => f.id === activeFormaId);
  const slot = forma?.pages.flatMap((p) => p.slots).find((s) => s.id === slotId);
  if (!slot) return null;

  if (slot.role === 'free' && slot.moduleData) {
    const moduleData = slot.moduleData as AnyModuleData;
    return {
      id: `module-${Date.now()}`,
      name: 'Yeni Modül',
      slotRole: 'free',
      type: moduleData.type,
      moduleData,
      source: 'system',
    };
  }

  if (slot.isCustom && slot.customSettings) {
    return {
      id: `module-${Date.now()}`,
      name: 'Yeni Modül',
      slotRole: 'product',
      type: 'product-presentation',
      // Geçici görsel-edit alanlarını ayıkla (export ↔ apply tutarlılığı için).
      customSettings: stripTransientSettings(slot.customSettings as CatalogSettings),
      source: 'system',
    };
  }

  return null;
}
