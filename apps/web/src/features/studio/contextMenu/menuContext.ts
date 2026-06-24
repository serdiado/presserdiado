// Sağ tık menüsü — seçim→bağlam çözümleyici (TEK KAYNAK). ContextualBar:244-286 dispatch'inin SAF
// extract'i: aynı seçim→dal kararını verir → hızlı bar ile sağ tık menüsü ıraksamaz (doc §4 dil ortaklığı).
// Saf modül: store/UI'a RUNTIME bağımlılığı YOK (yalnız footerSlot saf primitifleri + tip importları;
// alias '@' KULLANMAZ → vitest.config alias taşımadığından testler relative çözer). menuRegistry bu
// bağlamı tüketir; descriptor görünürlükleri ctx üstünde SAF predikat (clipboard erişimi ctx'e indirgenir).

import type { CatalogPage, CatalogSettings, StudioSlot } from '@matbaapro/shared';
import type { SelectionState, TextElementType } from '../../../stores/studio/ui.store';
import { isFooterSlotId, footerPageNumber, resolveModuleSlot } from '../../../stores/studio/footerSlot';

// Doc 8 dal → MenuContext kind'leri (8 dal, daha az kind üstünde flag-görünümü; ContextualBar branch'leriyle hizalı):
// slot (Dal 1/2/3/4 — role/hasProduct/merged flag'leri) · footerSel (Dal 5) · bannerCell (Dal 6) ·
// pageBg (Dal 7) · textElement (ContextualBar TextMode/BadgeMode — menüde dal değil, none-gibi) · none.
// (Dal 8 metin-edit registry'ye HİÇ girmez — resolver üretmez VE descriptor da yoktur; metin imleci
//  aktifken tarayıcının native clipboard menüsüne devredilir [Yol A]. Bkz. modules/bannerContextMenu.ts.)
export type MenuContext =
  | {
      kind: 'slot';
      pageNumber: number;
      slotId: string;
      role: 'product' | 'free';
      hasProduct: boolean;
      canMerge: boolean;
      canUnmerge: boolean;
      isCustom: boolean;
      hasCopiedSlotStyle: boolean;
    }
  | { kind: 'footerSel'; pageNumber: number; isCustom: boolean; isHidden: boolean }
  | { kind: 'bannerCell'; slotId: string; cellIds: string[]; isMerged: boolean }
  | { kind: 'textElement'; slotId: string; elementType: TextElementType }
  | { kind: 'pageBg'; pageNumber: number; hasCopiedBg: boolean }
  | { kind: 'none' };

export interface MenuContextDeps {
  selection: SelectionState;
  pages: CatalogPage[];
  globalSettings: CatalogSettings;
  /** copiedSlotSettings !== null — ctx'e indirgenir → predikat saf kalır (store okumaz). */
  copiedSlotStyle: boolean;
  /** copiedBackground !== null. */
  copiedBg: boolean;
  /**
   * Sağ-tıklanan slot (menü). Verilmezse selection.ids[0] (ContextualBar deseni: SlotMode slotIds[0]).
   * Çoklu seçimde merge ANCHOR'u (mergeSelected targetSlotId) sağ-tıklanan hücre olmalı → eski menü
   * davranışıyla parite (eski menü contextMenu.slot.id = sağ-tıklanan kullanırdı).
   */
  targetSlotId?: string;
}

export function resolveMenuContext(d: MenuContextDeps): MenuContext {
  const { selection, pages, globalSettings, copiedSlotStyle, copiedBg } = d;

  if (selection.type === 'slot' && selection.ids.length > 0) {
    // Menü sağ-tıklanan slotu hedef alır; ContextualBar targetSlotId vermez → ids[0] (bar deseni).
    const slotId = d.targetSlotId ?? selection.ids[0];
    // Footer host-slot page.slots'ta DEĞİL → ContextualBar:247 ile aynı dal (footer-seçim = Dal 5).
    if (isFooterSlotId(slotId)) {
      const pn = footerPageNumber(slotId);
      const page = pages.find((p) => p.pageNumber === pn);
      // "custom" tek kaynağı = footerOverride VARLIĞI (footerMode değil — footer-host-slot sözleşmesi).
      return {
        kind: 'footerSel',
        pageNumber: pn,
        isCustom: !!page?.footerOverride,
        isHidden: page?.footerMode === 'hidden',
      };
    }
    const page = pages.find((p) => p.slots.some((s) => s.id === slotId));
    const slot: StudioSlot | undefined = page?.slots.find((s) => s.id === slotId);
    if (!page || !slot) return { kind: 'none' };
    return {
      kind: 'slot',
      pageNumber: page.pageNumber,
      slotId,
      role: slot.role === 'free' ? 'free' : 'product',
      hasProduct: !!slot.product,
      // "önce seç" sonrası selection.ids = selectedSlotIds (Page.tsx:75-76 ile aynı hesap).
      canMerge: selection.ids.length > 1 && selection.ids.includes(slotId),
      canUnmerge: slot.colSpan > 1 || slot.rowSpan > 1,
      isCustom: !!slot.isCustom,
      hasCopiedSlotStyle: copiedSlotStyle,
    };
  }

  if (selection.type === 'bannerCell' && selection.parentId) {
    // Footer-farkındalığı resolveModuleSlot'ta (footer-slot → globalSettings.footerModule).
    const resolved = resolveModuleSlot(selection.parentId, pages, globalSettings);
    const md = resolved?.moduleData as
      | { cells?: { id: string; colSpan?: number; rowSpan?: number }[] }
      | null
      | undefined;
    if (md && Array.isArray(md.cells)) {
      const anchor = md.cells.find((c) => selection.ids.includes(c.id));
      const isMerged = !!anchor && ((anchor.colSpan ?? 1) > 1 || (anchor.rowSpan ?? 1) > 1);
      return { kind: 'bannerCell', slotId: selection.parentId, cellIds: selection.ids, isMerged };
    }
    return { kind: 'none' };
  }

  if (selection.type === 'textElement' && selection.parentId) {
    const slot = pages.flatMap((p) => p.slots).find((s) => s.id === selection.parentId);
    if (slot) {
      return {
        kind: 'textElement',
        slotId: selection.parentId,
        elementType: selection.textElementType ?? 'name',
      };
    }
    return { kind: 'none' };
  }

  if (selection.type === 'pageBackground' && selection.ids.length > 0) {
    const pn = Number(selection.ids[0]);
    if (!Number.isNaN(pn) && pages.some((p) => p.pageNumber === pn)) {
      return { kind: 'pageBg', pageNumber: pn, hasCopiedBg: copiedBg };
    }
    return { kind: 'none' };
  }

  return { kind: 'none' };
}

// Sağ-tık menüsü "önce seç" guard'ı: slot "slot olarak" zaten seçili mi? handleContextMenu bununla
// karar verir — değilse slot'u seçer (sonra resolver kind:'slot' türetir). selectedSlotIds'e BAKMA:
// metin-edit (textElement) sırasında setSelectedTextElement selection.type'ı 'textElement' yapar ama
// selectedSlotIds'i BAYAT [slotId] bırakır → eski selectedSlotIds-guard yanlışça "seçili" sanıp toggle'ı
// atlardı → resolver kind:'textElement' → boş registry menüsü (ürün adı/fiyat düzenlerken resme/slota
// sağ-tıkta menü açılmazdı). type-tabanlı guard bunu kapatır; çoklu-seçim merge anchor'ı korunur.
export function isSlotMenuSelectionActive(selection: SelectionState, slotId: string): boolean {
  return selection.type === 'slot' && selection.ids.includes(slotId);
}
