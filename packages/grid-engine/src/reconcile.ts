// Merkezi grid reconciliation çekirdeği.
// Bir sayfanın slot dizisini hedef grid'e (rows×cols) atomik olarak uyumlar:
// KONUM-TABANLI kenar-kaldırma (en sağ sütun / en alt satır; modülsüz→sil/overflow,
// merge→span−1, modül→korunur) + büyütme (boş slot ekle). İçerik ASLA kaybolmaz,
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

/**
 * Anchor span'ini hedef değere indirir + fazla kapsanan token'ı (oldArea − newArea) diziden siler.
 * TOKEN INVARIANT: yalnız bu anchor'ın gizli token'larına (mergedInto===anchorId && hidden), tam
 * sayıda dokunur → kalan token = newCs*newRs−1. İçerik (moduleData/product/role/customSettings)
 * anchor'da KORUNUR. Dizi yerinde; slot nesneleri değiştirilmez (referans değişimi → immutable-safe).
 */
function setSpanAndTrimTokens(
  slots: StudioSlot[],
  anchorId: string,
  newCs: number,
  newRs: number,
): void {
  const ai = slots.findIndex((s) => s.id === anchorId);
  if (ai === -1) return;
  const a = slots[ai];
  if (a.colSpan === newCs && a.rowSpan === newRs) return;
  let toDelete = a.colSpan * a.rowSpan - newCs * newRs;
  slots[ai] = { ...a, colSpan: newCs, rowSpan: newRs };
  for (let i = slots.length - 1; i >= 0 && toDelete > 0; i--) {
    const s = slots[i];
    if (s.mergedInto === anchorId && s.hidden) {
      slots.splice(i, 1);
      toDelete -= 1;
    }
  }
}

/** Anchor'ı + tüm kapsanan token'larını diziden çıkarır; ürünü (varsa) overflow'a ekler (kanonik sıra). */
function removeAnchorAndTokens(
  slots: StudioSlot[],
  anchorId: string,
  overflow: ProductInfo[],
): void {
  const a = slots.find((s) => s.id === anchorId);
  if (a?.product) overflow.push(a.product);
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i].id === anchorId || slots[i].mergedInto === anchorId) slots.splice(i, 1);
  }
}

export interface ReconcileGridResult {
  /** Hedefe uyumlanmış yeni slot dizisi. */
  slots: StudioSlot[];
  /** Hedefe sığmadığı için bekleme havuzuna gönderilecek ürünler (kanonik sıra). */
  overflowProducts: ProductInfo[];
}

/**
 * Bir sayfanın slotlarını hedef grid'e uyumlar. Saf fonksiyon: girdiyi mutasyona uğratmaz,
 * yeni dizi + overflow listesi döner.
 *
 * Sıra:
 *  1) KONUM-TABANLI KENAR-KALDIRMA (küçültme) — input gridPosition'dan, tek pass: yeni grid DIŞI
 *     sütun/satırdaki slotlar kaldırılır/daraltılır (en sağ sütun / en alt satır). Eski boyut
 *     gerekmez. Modülsüz → sil (ürün→overflow); modül → korunur (daralır/1×1, reflow taşır).
 *  2) Büyütme — alan < hedef ise eksik kadar boş 1×1 ürün slotu eklenir.
 *  recalculateLayout SONRA reflow eder; daraltılmış merge'ler artık sığar (aşağı itilmez).
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

  // 1) Kenar-kaldırma — görünür slotların SNAPSHOT'ı (her slot bağımsız; mutasyon yalnız kendi
  //    anchor token'ını etkiler → sıra önemsiz). Konum 1-indexli (colStart/rowStart).
  for (const s of slots.filter((x) => !x.hidden)) {
    const gp = s.gridPosition;
    // gridPosition-yok FALLBACK (savunma): konum bilinmiyorsa DOKUNMA (içeride say) → daraltma/silme
    // yapılmaz. Pratikte recalculateLayout her zaman önce koştuğundan görünür slotlar konum taşır.
    if (!gp) continue;
    const cs1 = gp.colStart;
    const rs1 = gp.rowStart;
    const right = cs1 + s.colSpan - 1;
    const bottom = rs1 + s.rowSpan - 1;

    // Tümden dışarıda (sol-üst köşesi bile bir eksende yeni grid dışında).
    if (cs1 > cols || rs1 > rows) {
      if (s.moduleData) {
        setSpanAndTrimTokens(slots, s.id, 1, 1); // modül 1×1 KORUNUR → reflow taşır
      } else {
        removeAnchorAndTokens(slots, s.id, overflowProducts); // modülsüz sil
      }
      continue;
    }
    // İçeride → dokunma.
    if (right <= cols && bottom <= rows) continue;
    // Straddle → kenarı aşan ekseni doğrudan yeni sınıra indir (çok-sütun/satır TEK adımda).
    const newCs = right > cols ? cols - cs1 + 1 : s.colSpan;
    const newRs = bottom > rows ? rows - rs1 + 1 : s.rowSpan;
    setSpanAndTrimTokens(slots, s.id, newCs, newRs);
  }

  // 2) Büyütme — eksik alanı boş 1×1 ürün slotlarıyla doldur (KORUNUR).
  const area = visibleArea(slots);
  if (area < target) {
    const startIdx = slots.length + 1;
    for (let i = 0; i < target - area; i++) {
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
  }
  // Not: kenar-kaldırma sonrası alan tam newRows*newCols olur (korunan modül fazlası hariç) → ayrı
  // area-shrink döngüsü gerekmez. Sığmayan korunan modülü recalculateLayout ek satıra yerleştirir
  // (maxRows guard, içerik CLIP edilmez); küçülme doğal olarak orada durur (STOP eşdeğeri).
  return { slots, overflowProducts };
}
