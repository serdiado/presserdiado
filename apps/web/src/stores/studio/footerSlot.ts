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

// ─── resolve / write funnel'ları (footer-farkındalığı TEK YER) ──────────────────
// Funnel'lar (catalog.updateSlotModuleData/applyBannerMutation/clear/fractions, history.findActiveSlot/
// restoreModuleData, ContextualBar/CellPanel resolver) bunları çağırır → hiçbirine footer-spesifik
// alan erişimi (footerModule / 'footer-slot-' prefix) sızmaz.

interface PageLike {
  pageNumber: number;
  slots: StudioSlot[];
}

/**
 * Bir slotId'nin moduleData'sını + sayfa numarasını çöz (okuma/snapshot). Footer-slot ise
 * globalSettings.footerModule'den (default-if-absent); değilse page.slots'tan. Bulunamazsa null.
 */
export function resolveModuleSlot(
  slotId: string,
  pages: PageLike[],
  globalSettings: { footerModule?: unknown },
): { pageNumber: number; moduleData: unknown } | null {
  if (isFooterSlotId(slotId)) {
    return { pageNumber: footerPageNumber(slotId), moduleData: resolveFooterModule(globalSettings) };
  }
  for (const p of pages) {
    const slot = p.slots.find((s) => s.id === slotId);
    if (slot) return { pageNumber: p.pageNumber, moduleData: slot.moduleData };
  }
  return null;
}

/**
 * Footer modül yazımı (deepMerge ile). `merge` çağırandan ENJEKTE edilir (defaults.deepMerge'i
 * footerSlot'a import etmek cycle yaratır: defaults → footerSlot → defaults). Yeni globalSettings döner.
 */
export function mergeFooterModule<GS extends { footerModule?: unknown }>(
  globalSettings: GS,
  updates: Record<string, unknown>,
  merge: (a: Record<string, unknown>, b: Record<string, unknown>) => Record<string, unknown>,
): GS {
  const current = resolveFooterModule(globalSettings) as unknown as Record<string, unknown>;
  return { ...globalSettings, footerModule: merge(current, updates) };
}

/** Footer modülünü tamamen değiştir (izolasyon undo/redo restore'u — yönlendirme/snapshot ATLAR). */
export function setFooterModule<GS extends { footerModule?: unknown }>(
  globalSettings: GS,
  md: unknown,
): GS {
  return { ...globalSettings, footerModule: md };
}
