// Dal 8 genişletme (Yol A) — ürün adı/fiyat sağ-tık kararı. SAF yüklem (DOM closest; React importu YOK)
// → birim test edilebilir. Precedent: isolationExit.ts (aynı desen — sağ-tık kararı saf yükleme çıkarılır).
//
// true  → metin imleci aktif ve sağ-tık AKTİF düzenlenebilir metin (contentEditable) içinde → Slot
//         stopPropagation çağırır (üst registry/Page menüsünü keser) + return; preventDefault YOK →
//         tarayıcının native clipboard menüsü çıkar (Kes/Kopyala/Yapıştır). Custom menü/clipboard kodu YOK.
// false → metin-edit modunda değil VEYA sağ-tık metin dışında (ör. resim) → mevcut registry slot menüsü.
//
// Banner'dan fark: Slot tek onContextMenu (per-cell değil) → "imleç bu metinde mi" DOM-target'tan
// saptanır (banner'daki editingCellId === cell.id flag'i yerine). Bu yüzden bannerContextMenu.ts'ten ayrı.
export function isRightClickInActiveTextEdit(
  editingText: 'name' | 'price' | null,
  target: HTMLElement | null,
): boolean {
  if (editingText === null) return false;
  if (!target) return false;
  return !!target.closest('[contenteditable="true"]');
}
