import { describe, it, expect, beforeEach } from 'vitest';
import { isRightClickInActiveTextEdit } from './textEditNativeMenu';

// Dal 8 genişletme: ürün adı/fiyat metin imleci aktif + sağ-tık AKTİF contentEditable içinde →
// native tarayıcı menüsü (true). isolationExit.test.ts deseni: saf yüklem, DOM closest fixture'ı.
describe('isRightClickInActiveTextEdit', () => {
  let editable: HTMLElement; // aktif düzenlenebilir metin (contenteditable=true)
  let inactive: HTMLElement; // contenteditable=false (düzenlenmiyor)
  let plain: HTMLElement; // metin-dışı (ör. ürün resmi)

  beforeEach(() => {
    document.body.innerHTML = '';
    editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    editable.appendChild(document.createElement('span')); // metin içi bir düğüm

    inactive = document.createElement('div');
    inactive.setAttribute('contenteditable', 'false');

    plain = document.createElement('img');

    document.body.append(editable, inactive, plain);
  });

  it('editingText=null → false (metin-edit modunda değil; CE içinde olsa bile registry)', () => {
    expect(isRightClickInActiveTextEdit(null, editable.firstElementChild as HTMLElement)).toBe(false);
  });

  it("editingText='name' + sağ-tık aktif CE içinde → true (native menü)", () => {
    expect(isRightClickInActiveTextEdit('name', editable)).toBe(true);
    expect(isRightClickInActiveTextEdit('name', editable.firstElementChild as HTMLElement)).toBe(true);
  });

  it("editingText='price' + sağ-tık aktif CE içinde → true (native menü)", () => {
    expect(isRightClickInActiveTextEdit('price', editable)).toBe(true);
  });

  it("editingText='name' + sağ-tık metin DIŞI (resim) → false (registry menüsü)", () => {
    expect(isRightClickInActiveTextEdit('name', plain)).toBe(false);
  });

  it('contenteditable=false hedef → false (aktif düzenleme değil)', () => {
    expect(isRightClickInActiveTextEdit('name', inactive)).toBe(false);
  });

  it('hedef yok → false', () => {
    expect(isRightClickInActiveTextEdit('name', null)).toBe(false);
  });
});
