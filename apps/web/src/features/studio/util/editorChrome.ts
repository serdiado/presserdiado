// Editör "chrome" (Hızlı Bar + portal popup) ile etkileşimde metin editörünün
// focus + DOM seçimini KORUYAN paylaşılan primitive.
//
// Sorun: contentEditable text-edit'teyken Hızlı Bar'daki odaklanamayan trigger'a
// (veya popup içi react-colorful div'lerine) mousedown → editör blur olur
// (relatedTarget=null), hücre-düzen düşer, seçim ölür. relatedTarget tabanlı guard
// bu durumda körleşir (odaklanamayan hedefte relatedTarget hep null).
//
// Kök desen (rich-text toolbar kanonik): chrome mousedown'ında preventDefault →
// tarayıcı focus/selection kaymasını yapmaz → editör blur OLMAZ → çıkış olmaz,
// seçim sağ kalır. onClick etkilenmez (picker yine açılır, swatch yine uygular).
//
// Tek document dinleyicisi; #contextual-bar / [data-color-picker-popup] altındaki
// HER buton/swatch otomatik korunur (per-araç muafiyet gerekmez). Footer/ürün
// run-level yüzeyleri aynı hook'u `active = !!editingCellId` ile çağırıp miras alır.

import { useEffect } from 'react';

/** Editör chrome'u: Hızlı Bar kökü + portal renk popup'ı. */
const CHROME_SELECTOR = '#contextual-bar, [data-color-picker-popup]';

/** Native odak-gerektiren kontroller — bunlar normal odaklanmalı (cell-level
 *  font-size input'u, select'ler, opacity range slider'ı vs.). preventDefault'lanmaz. */
const FOCUSABLE_CONTROL_SELECTOR = 'input, select, textarea, [contenteditable="true"]';

// ── Metin-sürükleme (text-drag) jest-kökeni izleyici — tek kaynak, yüzey-agnostik ──
// Sorun: ad/hücre düzenlenirken mousedown editable içinde başlayıp mouseup kutu DIŞINDA biten "drag-out"
// jestinde, `click` ortak-ata (slot kartı / canvas) üzerinde ateşler → toggleSlotSelection/clearSelection
// → bar metin modundan düşer (edit korunsa da). Çözüm: jest editable'da BAŞLADIYSA işaretle; slot/canvas
// onClick bunu görüp seçim değişimini atlar (taze dış-tık etkilenmez — o editable dışında başlar).
let dragGestureOrigin = false;

/** Bekleyen drag-jesti var mı? Okur + TÜKETİR (reset). Slot/Canvas onClick çağırır: true ise
 *  drag-out jesti (text-edit drag VEYA banner lasso) → seçim/deselect bastır. */
export function consumeDragGesture(): boolean {
  const v = dragGestureOrigin;
  dragGestureOrigin = false;
  return v;
}

/** Açık drag-jesti işareti — `[data-rt-editable]` DIŞINDA başlayan jestler için (banner lasso).
 *  BannerSection handleMouseUp gerçek lasso tamamlanınca çağırır. */
export function markDragGesture(): void {
  dragGestureOrigin = true;
}

/** Always-on jest-köken izleyici: HER mousedown'da flag'i `[data-rt-editable]` içinde mi
 *  başladığına göre set/reset eder → tek-kaynak flag-kaydı + her-mousedown reset garantisi
 *  (staleness yok: in-bounds lasso'nun bıraktığı mark sonraki mousedown'da sıfırlanır).
 *  Studio canvas'ta KOŞULSUZ tek bir kez mount edilir (Canvas). */
export function useDragGestureTracking(): void {
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      dragGestureOrigin = !!(t && typeof t.closest === 'function' && t.closest('[data-rt-editable]'));
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);
}

/**
 * active iken: chrome içindeki (native kontroller HARİÇ) mousedown'ların
 * preventDefault'ı ile contentEditable focus + seçimini korur.
 * (Jest-köken kaydı artık always-on useDragGestureTracking'de — tek-kaynak flag.)
 */
export function usePreserveEditorSelectionOnChrome(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || typeof t.closest !== 'function') return;
      if (!t.closest(CHROME_SELECTOR)) return;
      // Native odak-gerektiren kontroller normal odaklansın (run-seçimine ihtiyaçları yok).
      if (t.closest(FOCUSABLE_CONTROL_SELECTOR)) return;
      // Editör focus/seçimini koru → blur yok → hücre-düzen düşmez.
      e.preventDefault();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [active]);
}
