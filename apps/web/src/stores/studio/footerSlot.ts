// Footer host-slot — footer-farkındalığı TEK KAYNAK. Footer, tam bir GridModule barındıran bir
// host'tur; modül `globalSettings.footerModule`'de (page.slots DIŞINDA) yaşar → recalculateLayout/
// reconcileGrid/_fillSlotsFromPool üç süreci footer'a yapısal olarak görünmez (iterasyon yalnız
// page.slots/role==='product'). Bu dosya: footer-slot id şeması + default-if-absent guard +
// sentezlenmiş StudioSlot. Saf — store/UI'a bağımlı değil (cycle yok); catalog + history store
// ve render bundan beslenir (funnel'lara if-isFooter dalı SIZMAZ).

import type { StudioSlot } from '@matbaapro/shared';
import { defaultBannerCell } from '../../features/studio/modules/gridMutate';
import type { BannerModuleData } from '../../features/studio/modules/types';

const FOOTER_SLOT_PREFIX = 'footer-slot-';

/** Per-sayfa benzersiz stabil footer-slot id (cellDomId scope'u için zorunlu → DOM çakışması yok). */
export const footerSlotId = (pageNumber: number): string => `${FOOTER_SLOT_PREFIX}${pageNumber}`;

/** Bir slotId footer host-slot'una mı ait? (funnel'lar resolveSlot/writeSlot içinde bunu sorar.) */
export const isFooterSlotId = (id: string): boolean => id.startsWith(FOOTER_SLOT_PREFIX);

/** footer-slot id'den sayfa numarası. */
export const footerPageNumber = (id: string): number =>
  parseInt(id.slice(FOOTER_SLOT_PREFIX.length), 10);

/** Footer için makul başlangıç GridModule (tek-satır, 5 sütun). bannerInit deseni, defaultBannerCell tabanlı. */
export function defaultFooterModule(): BannerModuleData {
  return {
    type: 'banner',
    rows: 1,
    cols: 5,
    cells: Array.from({ length: 5 }, (_, i) => defaultBannerCell(`footer-inst-${i}`)),
    bgColor: { type: 'solid', color: '#ffffff', opacity: 0 },
    containerBorder: { color: { c: '#e2e8f0', o: 0 }, width: 0 },
    radius: { tl: 0, tr: 0, bl: 0, br: 0, linked: true },
    shadow: { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0, active: false },
  };
}

/**
 * Default-if-absent guard: eski projeler / ilk init `footerModule` taşımayabilir → render çökmesin
 * diye default GridModule'e düşer. (Eski footer içeriğinin gerçek dönüşümü Evre 2.)
 */
export function resolveFooterModule(globalSettings: { footerModule?: unknown }): BannerModuleData {
  const fm = globalSettings.footerModule;
  return fm && typeof fm === 'object' ? (fm as BannerModuleData) : defaultFooterModule();
}

/**
 * Render/edit anında sentezlenmiş footer StudioSlot sarmalı. Geçici taşıyıcı; kaynak-gerçek
 * `globalSettings.footerModule`. role:'free' → isIsolatableModule geçer (predikat genişletme gerekmez).
 */
export function synthFooterSlot(
  pageNumber: number,
  globalSettings: { footerModule?: unknown },
): StudioSlot {
  return {
    id: footerSlotId(pageNumber),
    colSpan: 1,
    rowSpan: 1,
    product: null,
    hidden: false,
    mergedInto: null,
    role: 'free',
    moduleType: 'banner',
    moduleData: resolveFooterModule(globalSettings),
  };
}
