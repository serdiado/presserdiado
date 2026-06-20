// Cell-level "property-scoped uniform" — TEK KAYNAK run-temizle commit'i (Fold 2).
// "property sil + commit" mantığı tek yerde: hem Hızlı Bar box-mode dispatch'i hem Sağ Panel onClearRun
// AYNI helper'ı çağırır → kopya/drift yok. Atomiklik ÇAĞIRANDA (withHistoryBatch container patch ile sarar).

import { useCatalogStore } from '@/stores/studio';
import { clearRunProperty, type RunProperty } from '../modules/richText';

function findSlot(slotId: string) {
  for (const p of useCatalogStore.getState().getActivePages()) {
    const slot = p.slots.find((s) => s.id === slotId);
    if (slot) return { slot, pageNumber: p.pageNumber };
  }
  return null;
}

/** Run-bearing yüzeyin saklanan HTML'inden `property`'yi TÜM run'lardan siler + commit eder.
 *  product → `slot.product.name`; module → ilgili `cell.text`(ler). clearRunProperty = pure strip. */
export function clearRunForSurface(
  surface: 'product' | 'module',
  slotId: string,
  cellIds: string[],
  property: RunProperty,
): void {
  const catalog = useCatalogStore.getState();
  const found = findSlot(slotId);
  if (!found) return;
  const { slot, pageNumber } = found;

  if (surface === 'product') {
    if (!slot.product) return;
    catalog.updateSlotProduct(pageNumber, slotId, {
      name: clearRunProperty(slot.product.name ?? '', property),
    });
    return;
  }

  const md = slot.moduleData as { cells?: { id: string; text?: string }[] } | null;
  if (!md?.cells) return;
  const cells = md.cells.map((c) =>
    cellIds.includes(c.id) ? { ...c, text: clearRunProperty(c.text ?? '', property) } : c,
  );
  catalog.updateSlotModuleData(pageNumber, slotId, { cells });
}
