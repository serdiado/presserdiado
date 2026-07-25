// Cell-level "property-scoped uniform" — TEK KAYNAK run-temizle commit'i (Fold 2).
// "property sil + commit" mantığı tek yerde: hem Hızlı Bar box-mode dispatch'i hem Sağ Panel onClearRun
// AYNI helper'ı çağırır → kopya/drift yok. Atomiklik ÇAĞIRANDA (withHistoryBatch container patch ile sarar).

import { useCatalogStore } from '@/stores/studio';
import { clearRunProperty, type RunProperty } from '../modules/richText';
import { resolveModuleSlot } from '@/stores/studio/footerSlot';

function findSlot(slotId: string) {
  for (const p of useCatalogStore.getState().getActivePages()) {
    const slot = p.slots.find((s) => s.id === slotId);
    if (slot) return { slot, pageNumber: p.pageNumber };
  }
  return null;
}

/** Run-bearing yüzeyin saklanan HTML'inden `property`'yi TÜM run'lardan siler + commit eder.
 *  product → `slot.product.name` VEYA `.price` (cellIds ile ayrışır); module → ilgili `cell.text`(ler).
 *  clearRunProperty = pure strip.
 *
 *  product yüzeyinde İKİ run-bearing alan var (ad + fiyat) ve ikisi de `Surface`='product'. Hedef alanı
 *  `cellIds` belirler — yeni bir Surface değeri EKLENMEZ (registry/TextSettingCtx zaten cellId taşıyor).
 *  cellIds boş/eksikse 'name'e düşer → mevcut ad çağrıları (`[]` geçiyor) davranış değiştirmez. */
export function clearRunForSurface(
  surface: 'product' | 'module',
  slotId: string,
  cellIds: string[],
  property: RunProperty,
): void {
  const catalog = useCatalogStore.getState();

  if (surface === 'product') {
    // Ürün adı/fiyatı daima page.slots'ta (footer asla product değil) → findSlot yeterli.
    const found = findSlot(slotId);
    if (!found?.slot.product) return;
    // Alan ayrımı ŞART: aksi halde fiyattaki cell-level bir ayar ürün ADI'nın run'larını siler.
    const field = cellIds.includes('price') ? 'price' : 'name';
    catalog.updateSlotProduct(found.pageNumber, slotId, {
      [field]: clearRunProperty(found.slot.product[field] ?? '', property),
    });
    return;
  }

  // module — footer-aware (resolveModuleSlot: footer-slot → globalSettings.footerModule).
  // findSlot (page.slots walk) footer-slot'u bulamıyor → run strip no-op olurdu → cell-level override
  // hayatta kalan run inline-style'ı ezemezdi. Tek yol TÜM run-capable property'leri kapsar.
  const resolved = resolveModuleSlot(slotId, catalog.getActivePages(), catalog.globalSettings);
  const md = resolved?.moduleData as { cells?: { id: string; text?: string }[] } | null;
  if (!md?.cells) return;
  const cells = md.cells.map((c) =>
    cellIds.includes(c.id) ? { ...c, text: clearRunProperty(c.text ?? '', property) } : c,
  );
  catalog.updateSlotModuleData(resolved!.pageNumber, slotId, { cells });
}
