// Footer host-slot — footer-farkındalığı TEK KAYNAK. Footer, tam bir GridModule barındıran bir
// host'tur; modül `globalSettings.footerModule`'de (page.slots DIŞINDA) yaşar → recalculateLayout/
// reconcileGrid/_fillSlotsFromPool üç süreci footer'a yapısal olarak görünmez (iterasyon yalnız
// page.slots/role==='product'). Bu dosya: footer-slot id şeması + default-if-absent guard +
// sentezlenmiş StudioSlot + per-sayfa override routing. Saf — store/UI'a bağımlı değil (cycle yok);
// catalog + history store ve render bundan beslenir (funnel'lara if-isFooter dalı SIZMAZ).
//
// Evre 2a per-sayfa: "custom" tek semantik kaynağı = `page.footerOverride != null` (VARLIK,
// footerMode değil). Tüm çözümleme/yazma/yükseklik yolları override-varlığını okur → override yokken
// (2a-i: her zaman) global'e düşer → bugünkü global davranış birebir. footerMode yalnız 'hidden'.

import type { StudioSlot, CatalogPage, CatalogSettings } from '@matbaapro/shared';
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

type FooterOverride = { module: unknown; heightMm: number };

/** "custom" tek semantik kaynağı: per-sayfa override VARLIĞI (footerMode değil). */
function footerOverrideOf(page: CatalogPage | undefined): FooterOverride | null {
  return page?.footerOverride ?? null;
}

/** Yazım hedefi: override varsa per-sayfa, yoksa global. 2a-i'de daima 'global'. */
export function footerWriteTarget(page: CatalogPage | undefined): 'global' | 'page' {
  return footerOverrideOf(page) ? 'page' : 'global';
}

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
 * Footer modülünü çöz: per-sayfa override VARSA onu, yoksa global `footerModule` (default-if-absent).
 * Default-if-absent guard: eski projeler / ilk init `footerModule` taşımayabilir → render çökmesin.
 * 2a-i: hiçbir sayfada override yok → daima global dal → bugünkü sonuç birebir.
 */
export function resolveFooterModule(
  page: CatalogPage | undefined,
  globalSettings: { footerModule?: unknown },
): BannerModuleData {
  const ov = footerOverrideOf(page);
  if (ov && ov.module && typeof ov.module === 'object') return ov.module as BannerModuleData;
  const fm = globalSettings.footerModule;
  return fm && typeof fm === 'object' ? (fm as BannerModuleData) : defaultFooterModule();
}

/**
 * Footer bölge yüksekliği (mm). Precedence: override → (legacy) custom + customFooter → global.footer.
 * 2a-i: override yok → Page.tsx'in bugünkü `activeFooter?.heightMm ?? 18` ifadesiyle BYTE-IDENTICAL
 * (legacy customFooter yalnız OKUNUR; 2c'de customFooter ile birlikte legacy dal silinir).
 */
export function resolveFooterHeight(
  page: CatalogPage | undefined,
  globalSettings: CatalogSettings,
): number {
  const ov = footerOverrideOf(page);
  if (ov) return ov.heightMm;
  const activeFooter = page?.footerMode === 'custom' ? page.customFooter : globalSettings.footer;
  return activeFooter?.heightMm ?? 18;
}

/**
 * Render/edit anında sentezlenmiş footer StudioSlot sarmalı. Geçici taşıyıcı; kaynak-gerçek
 * override VARSA `page.footerOverride.module`, yoksa `globalSettings.footerModule`.
 * role:'free' → isIsolatableModule geçer (predikat genişletme gerekmez).
 */
export function synthFooterSlot(
  pageNumber: number,
  pages: CatalogPage[],
  globalSettings: { footerModule?: unknown },
): StudioSlot {
  const page = pages.find((p) => p.pageNumber === pageNumber);
  return {
    id: footerSlotId(pageNumber),
    colSpan: 1,
    rowSpan: 1,
    product: null,
    hidden: false,
    mergedInto: null,
    role: 'free',
    moduleType: 'banner',
    moduleData: resolveFooterModule(page, globalSettings),
  };
}

// ─── resolve / write funnel'ları (footer-farkındalığı TEK YER) ──────────────────
// Funnel'lar (catalog.updateSlotModuleData/applyBannerMutation/clear/fractions, history.findActiveSlot/
// restoreModuleData, ContextualBar/CellPanel resolver) bunları çağırır → hiçbirine footer-spesifik
// alan erişimi (footerModule / footerOverride / 'footer-slot-' prefix) sızmaz.

/**
 * Bir slotId'nin moduleData'sını + sayfa numarasını çöz (okuma/snapshot). Footer-slot ise sayfayı
 * bulup override/global route eder; değilse page.slots'tan. Bulunamazsa null. İmza DEĞİŞMEZ →
 * çağıranlar (catalog/ContextualBar/CellPanel/BannerSettingsPanel/cellApply) dokunulmaz.
 */
export function resolveModuleSlot(
  slotId: string,
  pages: CatalogPage[],
  globalSettings: { footerModule?: unknown },
): { pageNumber: number; moduleData: unknown } | null {
  if (isFooterSlotId(slotId)) {
    const pn = footerPageNumber(slotId);
    const page = pages.find((p) => p.pageNumber === pn);
    return { pageNumber: pn, moduleData: resolveFooterModule(page, globalSettings) };
  }
  for (const p of pages) {
    const slot = p.slots.find((s) => s.id === slotId);
    if (slot) return { pageNumber: p.pageNumber, moduleData: slot.moduleData };
  }
  return null;
}

/**
 * GLOBAL hedef footer modül yazımı (deepMerge ile). `merge` çağırandan ENJEKTE edilir
 * (defaults.deepMerge'i footerSlot'a import etmek cycle yaratır). Yeni globalSettings döner.
 */
export function mergeFooterModule<GS extends { footerModule?: unknown }>(
  globalSettings: GS,
  updates: Record<string, unknown>,
  merge: (a: Record<string, unknown>, b: Record<string, unknown>) => Record<string, unknown>,
): GS {
  const current = resolveFooterModule(undefined, globalSettings) as unknown as Record<string, unknown>;
  return { ...globalSettings, footerModule: merge(current, updates) };
}

/** GLOBAL hedef footer modülünü tamamen değiştir (izolasyon undo/redo restore — yönlendirme/snapshot ATLAR). */
export function setFooterModule<GS extends { footerModule?: unknown }>(
  globalSettings: GS,
  md: unknown,
): GS {
  return { ...globalSettings, footerModule: md };
}

/**
 * PER-SAYFA hedef footer modül yazımı (override.module deepMerge). 2a-i'de DORMANT (footerWriteTarget
 * daima 'global') — yol hazır, 2a-ii fork'u tetikler. Yeni CatalogPage döner.
 */
export function mergePageFooterModule(
  page: CatalogPage,
  updates: Record<string, unknown>,
  merge: (a: Record<string, unknown>, b: Record<string, unknown>) => Record<string, unknown>,
): CatalogPage {
  const current = resolveFooterModule(page, {}) as unknown as Record<string, unknown>;
  const heightMm = page.footerOverride?.heightMm ?? resolveFooterHeightFallback(page);
  return { ...page, footerOverride: { module: merge(current, updates), heightMm } };
}

/** PER-SAYFA hedef footer modülünü tamamen değiştir (izolasyon restore). 2a-i'de DORMANT. */
export function setPageFooterModule(page: CatalogPage, md: unknown): CatalogPage {
  const heightMm = page.footerOverride?.heightMm ?? resolveFooterHeightFallback(page);
  return { ...page, footerOverride: { module: md, heightMm } };
}

/** Page-writer'lar override yoksa (teorik) yükseklik seed'i — legacy/global precedence (globalSettings'siz). */
function resolveFooterHeightFallback(page: CatalogPage): number {
  return (page.footerMode === 'custom' ? page.customFooter?.heightMm : undefined) ?? 18;
}
