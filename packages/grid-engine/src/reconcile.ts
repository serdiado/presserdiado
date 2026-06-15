// Merkezi grid reconciliation çekirdeği.
// Bir sayfanın slot dizisini hedef grid'e (rows×cols) atomik olarak uyumlar:
// geometri normalizasyonu (sığmayanı unmerge), büyütme (boş slot ekle), küçültme
// (politika: ürün→overflow, modül/birleşik→unmerge). İçerik ASLA kaybolmaz,
// işlem ASLA bloke etmez. Tek atomik grid-değiştirme mantığı buradan geçer.

import type { ProductInfo, StudioSlot } from '@matbaapro/shared';

/** Görünür (non-hidden) slotların kapladığı toplam hücre alanı. */
function visibleArea(slots: StudioSlot[]): number {
  return slots
    .filter((s) => !s.hidden)
    .reduce((sum, s) => sum + s.colSpan * s.rowSpan, 0);
}

/**
 * Anchor-içerik kuralı — TEK-KAYNAK. Birleşik (veya banner alanı) bir slotu açar:
 * anchor 1×1'e iner, içeriği (product/role/moduleData/customSettings) korunur;
 * kapsanan hücreler (mergedInto === anchorId) görünür + boş 1×1 olur.
 *
 * Hem manuel "birleştirmeyi çöz" (store: unmergeSlot) hem grid-reconcile bu
 * fonksiyonu çağırır — kopya-taklit yok, kural tek yerde tanımlı.
 *
 * Diziyi yerinde günceller ama slot NESNELERİNİ mutasyona uğratmaz (referansları
 * yeni nesnelerle değiştirir) → çağıran shallow-copy bir dizi verse bile orijinal
 * state güvende (immutable-safe).
 */
export function applyUnmerge(slots: StudioSlot[], anchorId: string): void {
  const anchorIdx = slots.findIndex((s) => s.id === anchorId);
  if (anchorIdx === -1) return;
  slots[anchorIdx] = { ...slots[anchorIdx], colSpan: 1, rowSpan: 1 };
  for (let i = 0; i < slots.length; i++) {
    if (slots[i].mergedInto === anchorId) {
      slots[i] = { ...slots[i], hidden: false, mergedInto: null, product: null };
    }
  }
}

/** Tamamen boş, atılabilir 1×1 ürün slotu mu? (içerik/birleşme/modül yok) */
function isExpendable(s: StudioSlot): boolean {
  return (
    !s.hidden &&
    !s.mergedInto &&
    !s.product &&
    !s.moduleData &&
    !s.isCustom &&
    (s.role ?? 'product') === 'product' &&
    s.colSpan === 1 &&
    s.rowSpan === 1
  );
}

export interface ReconcileGridResult {
  /** Hedefe uyumlanmış yeni slot dizisi. */
  slots: StudioSlot[];
  /** Hedefe sığmadığı için bekleme havuzuna gönderilecek ürünler (kanonik sıra). */
  overflowProducts: ProductInfo[];
}

/**
 * Bir sayfanın slotlarını hedef grid'e uyumlar. Saf fonksiyon: girdiyi mutasyona
 * uğratmaz, yeni dizi + overflow listesi döner.
 *
 * Sıra:
 *  1) Normalize — colSpan>cols veya rowSpan>rows olan her slot unmerge edilir
 *     (içerik anchor'da korunur).
 *  2) Büyütme — alan < hedef ise eksik kadar boş 1×1 ürün slotu eklenir.
 *  3) Küçültme — alan > hedef iken kuyruktan azalt: boş 1×1 pop; birleşik/gizli
 *     hücre → unmerge; 1×1 ürün → ürün overflow'a + slot atılır; 1×1 modül/serbest
 *     → içerik kaybedilemez, bu kenar durumda küçültme durur (tasarım bozulmaz).
 */
export function reconcileGrid(
  inputSlots: StudioSlot[],
  grid: { rows: number; cols: number },
  pageNumber: number,
): ReconcileGridResult {
  const slots = inputSlots.map((s) => ({ ...s }));
  const overflowProducts: ProductInfo[] = [];
  const cols = Math.max(1, grid.cols);
  const rows = Math.max(1, grid.rows);
  const target = rows * cols;

  // 1) Geometri normalizasyonu — sığmayan span'leri aç (tek-kaynak applyUnmerge).
  for (const s of slots) {
    if (s.hidden) continue;
    if (s.colSpan > cols || s.rowSpan > rows) {
      applyUnmerge(slots, s.id);
    }
  }

  // 2) Büyütme — eksik alanı boş 1×1 ürün slotlarıyla doldur.
  let area = visibleArea(slots);
  if (area < target) {
    const missing = target - area;
    const startIdx = slots.length + 1;
    for (let i = 0; i < missing; i++) {
      slots.push({
        id: `page-${pageNumber}-slot-${startIdx + i}`,
        colSpan: 1,
        rowSpan: 1,
        product: null,
        hidden: false,
        mergedInto: null,
        isCustom: false,
        role: 'product',
      });
    }
    return { slots, overflowProducts };
  }

  // 3) Küçültme — kuyruktan azalt; içerik politikaya göre korunur.
  let guard = slots.length * 4 + 16; // sonsuz döngü emniyeti
  while (area > target && slots.length > 0 && guard-- > 0) {
    const last = slots[slots.length - 1];

    // Boş, atılabilir 1×1 → doğrudan at.
    if (isExpendable(last)) {
      slots.pop();
      area = visibleArea(slots);
      continue;
    }

    // Gizli (kapsanan) kuyruk hücresi → anchor'ını aç, hücre boşalsın.
    if (last.hidden) {
      if (last.mergedInto) {
        applyUnmerge(slots, last.mergedInto);
      } else {
        slots.pop(); // sahipsiz gizli hücre (olmamalı) — güvenli at.
      }
      area = visibleArea(slots);
      continue;
    }

    // Görünür birleşik (span>1) → aç; içerik anchor'da kalır, hücreler boşalır.
    if (last.colSpan > 1 || last.rowSpan > 1) {
      applyUnmerge(slots, last.id);
      area = visibleArea(slots);
      continue;
    }

    // Görünür 1×1 ürün → ürünü overflow'a (kanonik sıra için unshift), slotu at.
    if (last.role !== 'free' && !last.moduleData) {
      if (last.product) overflowProducts.unshift(last.product);
      slots.pop();
      area = visibleArea(slots);
      continue;
    }

    // Görünür 1×1 modül/serbest → içerik kaybedilemez. Bu kenar durumda küçültmeyi
    // durdur (kalan modül hücreleri korunur; tasarım geçici olarak hedeften büyük
    // kalır, kullanıcı düzeltir). Bloke/uyarı yok.
    break;
  }

  return { slots, overflowProducts };
}
