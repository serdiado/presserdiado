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

/**
 * active iken: chrome içindeki (native kontroller HARİÇ) mousedown'ların
 * preventDefault'ı ile contentEditable focus + seçimini korur.
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
