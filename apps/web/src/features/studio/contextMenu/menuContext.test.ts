import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CatalogPage, CatalogSettings, StudioSlot } from '@matbaapro/shared';
import type { SelectionState } from '../../../stores/studio/ui.store';
import {
  resolveMenuContext,
  isSlotMenuSelectionActive,
  isBannerCellMenuSelectionActive,
  type MenuContext,
  type MenuContextDeps,
} from './menuContext';
import { MENU_ACTIONS, MENU_DANGER_ALLOWLIST, buildMenu, type MenuAction } from './menuRegistry';
import { useUIStore } from '../../../stores/studio/ui.store';
import { useCatalogStore } from '../../../stores/studio/catalog.store';

// ── Fixture yardımcıları ────────────────────────────────────────────────────
const GS = {} as CatalogSettings; // resolver footer-DIŞI dallarda globalSettings'e dokunmaz

function slot(over: Partial<StudioSlot> = {}): StudioSlot {
  return {
    id: 's1', colSpan: 1, rowSpan: 1, product: null, hidden: false,
    mergedInto: null, isCustom: false, role: 'product', ...over,
  } as unknown as StudioSlot;
}
function page(slots: StudioSlot[], over: Partial<CatalogPage> = {}): CatalogPage {
  return {
    id: 'p1', pageNumber: 1, slots, footerText: '', footerLogo: null,
    footerMode: 'global', customFooter: null, ...over,
  } as unknown as CatalogPage;
}
const sel = (over: Partial<SelectionState>): SelectionState => ({ type: 'none', ids: [], ...over });
function deps(selection: SelectionState, pages: CatalogPage[], extra: Partial<MenuContextDeps> = {}): MenuContextDeps {
  return { selection, pages, globalSettings: GS, copiedSlotStyle: false, copiedBg: false, ...extra };
}

// ── resolveMenuContext: seçim → MenuContext kind (ContextualBar:244-286 extract'i) ──
describe('resolveMenuContext', () => {
  it('ürünlü slot → kind:slot, hasProduct, role:product', () => {
    const p = page([slot({ id: 's1', product: { sku: 'X' } as never })]);
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['s1'] }), [p]));
    expect(ctx).toMatchObject({
      kind: 'slot', pageNumber: 1, slotId: 's1', role: 'product',
      hasProduct: true, canMerge: false, canUnmerge: false,
    });
  });

  it('boş ürün slot → hasProduct:false', () => {
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['s1'] }), [page([slot({ id: 's1' })])]));
    expect(ctx.kind === 'slot' && ctx.hasProduct).toBe(false);
  });

  it('serbest slot → role:free', () => {
    const p = page([slot({ id: 's1', role: 'free', moduleData: { type: 'banner', cells: [] } as never })]);
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['s1'] }), [p]));
    expect(ctx.kind === 'slot' && ctx.role).toBe('free');
  });

  it('birleşik slot (span>1) → canUnmerge:true', () => {
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['s1'] }), [page([slot({ id: 's1', colSpan: 2 })])]));
    expect(ctx.kind === 'slot' && ctx.canUnmerge).toBe(true);
  });

  it('çoklu seçim → canMerge:true', () => {
    const p = page([slot({ id: 's1' }), slot({ id: 's2' })]);
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['s1', 's2'] }), [p]));
    expect(ctx.kind === 'slot' && ctx.canMerge).toBe(true);
  });

  it('targetSlotId verilince slotId = sağ-tıklanan (çoklu seçimde merge anchor paritesi)', () => {
    const p = page([slot({ id: 's1' }), slot({ id: 's2' })]);
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['s1', 's2'] }), [p], { targetSlotId: 's2' }));
    expect(ctx.kind === 'slot' && ctx.slotId).toBe('s2'); // ids[0]=s1 DEĞİL → sağ-tıklanan s2
    expect(ctx.kind === 'slot' && ctx.canMerge).toBe(true);
  });

  it('targetSlotId verilmezse slotId = ids[0] (ContextualBar deseni — bar değişmez)', () => {
    const p = page([slot({ id: 's1' }), slot({ id: 's2' })]);
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['s1', 's2'] }), [p]));
    expect(ctx.kind === 'slot' && ctx.slotId).toBe('s1');
  });

  it('hasCopiedSlotStyle ctx üstünden taşınır', () => {
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['s1'] }), [page([slot({ id: 's1' })])], { copiedSlotStyle: true }));
    expect(ctx.kind === 'slot' && ctx.hasCopiedSlotStyle).toBe(true);
  });

  it('footer-slot-id → kind:footerSel, isCustom override VARLIĞINDAN', () => {
    const p = page([], { pageNumber: 2, footerMode: 'custom', footerOverride: { module: {}, heightMm: 18 } as never });
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['footer-slot-2'] }), [p]));
    expect(ctx).toMatchObject({ kind: 'footerSel', pageNumber: 2, isCustom: true, isHidden: false });
  });

  it('footer hidden → isHidden:true', () => {
    const p = page([], { pageNumber: 1, footerMode: 'hidden' });
    const ctx = resolveMenuContext(deps(sel({ type: 'slot', ids: ['footer-slot-1'] }), [p]));
    expect(ctx.kind === 'footerSel' && ctx.isHidden).toBe(true);
  });

  it('bannerCell → kind:bannerCell, isMerged anchor span', () => {
    const p = page([slot({ id: 'm1', role: 'free', moduleData: { type: 'banner', cells: [{ id: 'c1', colSpan: 2, rowSpan: 1 }] } as never })]);
    const ctx = resolveMenuContext(deps(sel({ type: 'bannerCell', ids: ['c1'], parentId: 'm1' }), [p]));
    expect(ctx).toMatchObject({ kind: 'bannerCell', slotId: 'm1', isMerged: true });
  });

  it('bannerCell targetCellId → anchorRow/anchorCol = flat-index ÷ cols (lokal #banner-ctx-menu sr/sc paritesi)', () => {
    const cells = Array.from({ length: 6 }, (_, i) => ({ id: `c${i}` }));
    const p = page([slot({ id: 'm1', role: 'free', moduleData: { type: 'banner', rows: 2, cols: 4, cells } as never })]);
    const ctx = resolveMenuContext(deps(sel({ type: 'bannerCell', ids: ['c5'], parentId: 'm1' }), [p], { targetCellId: 'c5' }));
    // c5 → idx 5 → row floor(5/4)=1, col 5%4=1
    expect(ctx).toMatchObject({ kind: 'bannerCell', anchorCellId: 'c5', anchorRow: 1, anchorCol: 1, rows: 2, cols: 4, isMerged: false });
  });

  it('bannerCell isMerged anchor-tabanlı (targetCellId birleşik hücreyi gösterince true)', () => {
    const cells = [{ id: 'c0' }, { id: 'c1', colSpan: 2 }];
    const p = page([slot({ id: 'm1', role: 'free', moduleData: { type: 'banner', rows: 1, cols: 4, cells } as never })]);
    const merged = resolveMenuContext(deps(sel({ type: 'bannerCell', ids: ['c1'], parentId: 'm1' }), [p], { targetCellId: 'c1' }));
    const plain = resolveMenuContext(deps(sel({ type: 'bannerCell', ids: ['c0'], parentId: 'm1' }), [p], { targetCellId: 'c0' }));
    expect(merged.kind === 'bannerCell' && merged.isMerged).toBe(true);
    expect(plain.kind === 'bannerCell' && plain.isMerged).toBe(false);
  });

  it('bannerCell cellIds = seçim (çoklu lasso) korunur', () => {
    const cells = [{ id: 'c0' }, { id: 'c1' }];
    const p = page([slot({ id: 'm1', role: 'free', moduleData: { type: 'banner', rows: 1, cols: 2, cells } as never })]);
    const ctx = resolveMenuContext(deps(sel({ type: 'bannerCell', ids: ['c0', 'c1'], parentId: 'm1' }), [p], { targetCellId: 'c0' }));
    expect(ctx.kind === 'bannerCell' && ctx.cellIds).toEqual(['c0', 'c1']);
  });

  it('pageBackground → kind:pageBg, hasCopiedBg', () => {
    const ctx = resolveMenuContext(deps(sel({ type: 'pageBackground', ids: ['1'] }), [page([])], { copiedBg: true }));
    expect(ctx).toMatchObject({ kind: 'pageBg', pageNumber: 1, hasCopiedBg: true });
  });

  it('textElement → kind:textElement (menüde dal değil ama ContextualBar için korunur)', () => {
    const p = page([slot({ id: 's1' })]);
    const ctx = resolveMenuContext(deps(sel({ type: 'textElement', ids: ['s1-name'], parentId: 's1', textElementType: 'name' }), [p]));
    expect(ctx).toMatchObject({ kind: 'textElement', slotId: 's1', elementType: 'name' });
  });

  it('slot bulunamadı → none', () => {
    expect(resolveMenuContext(deps(sel({ type: 'slot', ids: ['yok'] }), [page([])])).kind).toBe('none');
  });

  it('boş seçim → none', () => {
    expect(resolveMenuContext(deps(sel({}), [page([])])).kind).toBe('none');
  });
});

// ── isSlotMenuSelectionActive: "önce seç" guard'ı (bayat selectedSlotIds bug'ı) ──
describe('isSlotMenuSelectionActive', () => {
  it('slot seçili + bu slot ids içinde → true (toggle atlanır, çoklu-seçim korunur)', () => {
    expect(isSlotMenuSelectionActive(sel({ type: 'slot', ids: ['s1'] }), 's1')).toBe(true);
    expect(isSlotMenuSelectionActive(sel({ type: 'slot', ids: ['s1', 's2'] }), 's2')).toBe(true);
  });

  it('slot seçili ama farklı slot → false (sağ-tıklanan seçilecek)', () => {
    expect(isSlotMenuSelectionActive(sel({ type: 'slot', ids: ['s1'] }), 's2')).toBe(false);
  });

  it('textElement seçimi (ad/fiyat edit) → false — selectedSlotIds BAYAT olsa da slot yeniden seçilir', () => {
    const s = sel({ type: 'textElement', ids: ['s1-name'], parentId: 's1', textElementType: 'name' });
    expect(isSlotMenuSelectionActive(s, 's1')).toBe(false); // type slot DEĞİL → guard düşmez → toggle çalışır
  });

  it('pageBackground / none → false', () => {
    expect(isSlotMenuSelectionActive(sel({ type: 'pageBackground', ids: ['1'] }), 's1')).toBe(false);
    expect(isSlotMenuSelectionActive(sel({}), 's1')).toBe(false);
  });
});

// ── isBannerCellMenuSelectionActive: Dal 6 "önce seç" guard'ı (çoklu-seçim korunur) ──
describe('isBannerCellMenuSelectionActive', () => {
  it('bannerCell + aynı parent + cell ids içinde → true (sağ-tıkta seçim DARALTILMAZ → Birleştir korunur)', () => {
    expect(isBannerCellMenuSelectionActive(sel({ type: 'bannerCell', ids: ['c1', 'c2'], parentId: 'm1' }), 'm1', 'c2')).toBe(true);
  });

  it('farklı cell → false (sağ-tıklanan hücre seçilecek)', () => {
    expect(isBannerCellMenuSelectionActive(sel({ type: 'bannerCell', ids: ['c1'], parentId: 'm1' }), 'm1', 'c2')).toBe(false);
  });

  it('farklı parent (başka modül) → false', () => {
    expect(isBannerCellMenuSelectionActive(sel({ type: 'bannerCell', ids: ['c1'], parentId: 'm1' }), 'm2', 'c1')).toBe(false);
  });

  it('slot / none seçimi → false', () => {
    expect(isBannerCellMenuSelectionActive(sel({ type: 'slot', ids: ['c1'] }), 'm1', 'c1')).toBe(false);
    expect(isBannerCellMenuSelectionActive(sel({}), 'm1', 'c1')).toBe(false);
  });
});

// ── buildMenu: filtre + §2 grup sırası (fixture descriptor'larla) ────────────
describe('buildMenu', () => {
  const fixtures: MenuAction[] = [
    { id: 'a-g2', label: () => 'A', group: 2, visible: () => true, run: () => {} },
    { id: 'b-g1', label: () => 'B', group: 1, visible: () => true, run: () => {} },
    { id: 'c-g3', label: () => 'C', group: 3, visible: () => false, run: () => {} },
    { id: 'd-g4', label: () => 'D', group: 4, visible: () => true, run: () => {} },
  ];

  it('grupları 1→4 sırada döner, yalnız DOLU/görünür (divider yeri buradan türer)', () => {
    const groups = buildMenu({ kind: 'none' }, fixtures);
    expect(groups.map((g) => g.group)).toEqual([1, 2, 4]); // g3 görünmez → atlanır
    expect(groups[0].items.map((i) => i.id)).toEqual(['b-g1']);
    expect(groups.map((g) => g.dividerBefore)).toEqual([false, false, true]); // §2: G1+G2 bitişik; G4 blok sınırı
  });

  it('hiç görünür yoksa boş dizi (menü açılmaz)', () => {
    const hidden: MenuAction[] = [{ id: 'x', label: () => 'x', group: 1, visible: () => false, run: () => {} }];
    expect(buildMenu({ kind: 'none' }, hidden)).toEqual([]);
  });
});

// ── MENU_ACTIONS (gerçek pilot registry) — dal başına görünür kalemler ───────
describe('MENU_ACTIONS — pilot dallar (parite)', () => {
  const slotCtx = (over: Partial<Extract<MenuContext, { kind: 'slot' }>> = {}): MenuContext => ({
    kind: 'slot', pageNumber: 1, slotId: 's1', role: 'product',
    hasProduct: false, canMerge: false, canUnmerge: false, isCustom: false, hasCopiedSlotStyle: false, ...over,
  });
  const ids = (ctx: MenuContext) => buildMenu(ctx).flatMap((g) => g.items.map((i) => i.id));

  it('ürünlü slot: Boşalt (grup 4) + Stil Kopyala; Yapıştır yok (kopyasız), Ürün Hücresi yok (ürün rolü)', () => {
    const got = ids(slotCtx({ hasProduct: true }));
    expect(got).toContain('slot-bosalt');
    expect(got).toContain('slot-stil-kopyala');
    expect(got).not.toContain('slot-stil-yapistir');
    expect(got).not.toContain('slot-urun-hucresi');
  });

  it('boş ürün slot: Modül Ekle + Ürün Ekle (grup 1) + Stil Kopyala (grup 3); Boşalt yok, Serbest Alan Yap YOK', () => {
    const got = ids(slotCtx()); // role:'product', hasProduct:false, canUnmerge:false
    expect(got).toContain('slot-modul-ekle');
    expect(got).toContain('slot-urun');
    expect(got).toContain('slot-stil-kopyala');
    expect(got).not.toContain('slot-bosalt');
    expect(got).not.toContain('slot-urun-hucresi');
  });

  it('serbest slot: Ürün Hücresi Yap var, Boşalt yok', () => {
    const got = ids(slotCtx({ role: 'free' }));
    expect(got).toContain('slot-urun-hucresi');
    expect(got).not.toContain('slot-bosalt');
  });

  it('birleşik slot: Hücreleri Ayır + (Fix 1) Modül Ekle & Ürün — birleşik = normal yetenek', () => {
    const got = ids(slotCtx({ canUnmerge: true }));
    expect(got).toContain('slot-ayir');
    expect(got).toContain('slot-modul-ekle'); // !canUnmerge kalktı → birleşikte de görünür
    expect(got).toContain('slot-urun');
  });

  it('çoklu seçim: Hücreleri Birleştir var', () => {
    expect(ids(slotCtx({ canMerge: true }))).toContain('slot-birlestir');
  });

  it('Özel/Genel: ürün slotunda görünür (grup 2), serbest slotta gizli; etiket isCustom toggle', () => {
    expect(ids(slotCtx())).toContain('slot-ozel-genel'); // role:'product'
    expect(ids(slotCtx({ role: 'free' }))).not.toContain('slot-ozel-genel'); // Dal 4 — modüllü zaten özel
    const a = MENU_ACTIONS.find((x) => x.id === 'slot-ozel-genel')!;
    expect(a.group).toBe(2);
    expect(a.label(slotCtx({ isCustom: false }))).toBe('Özel Ayar Yap');
    expect(a.label(slotCtx({ isCustom: true }))).toBe('Genele Dön');
  });

  it('slot-ozel-genel run → toggleSlotCustomSettings(!isCustom)', () => {
    const spy = vi.spyOn(useCatalogStore.getState(), 'toggleSlotCustomSettings').mockImplementation(() => {});
    const a = MENU_ACTIONS.find((x) => x.id === 'slot-ozel-genel')!;
    a.run(slotCtx({ isCustom: false }));
    expect(spy).toHaveBeenLastCalledWith(true); // genel → özel yap
    a.run(slotCtx({ isCustom: true }));
    expect(spy).toHaveBeenLastCalledWith(false); // özel → genele dön
    spy.mockRestore();
  });

  it('pageBg + kopyalı: iki stil aksiyonu', () => {
    expect(ids({ kind: 'pageBg', pageNumber: 1, hasCopiedBg: true })).toEqual(['bg-stil-kopyala', 'bg-stil-yapistir']);
  });

  it('textElement / none: menüde dal YOK (boş)', () => {
    expect(buildMenu({ kind: 'textElement', slotId: 's1', elementType: 'name' })).toEqual([]);
    expect(buildMenu({ kind: 'none' })).toEqual([]);
  });

  it('§2 sıra+divider: birleşik+ürünlü+kopyalı → 1→2→3→4; divider yalnız G3,G4 önünde (G1+G2 bitişik)', () => {
    const groups = buildMenu(slotCtx({ hasProduct: true, canUnmerge: true, hasCopiedSlotStyle: true }));
    expect(groups.map((g) => g.group)).toEqual([1, 2, 3, 4]); // Oluştur → Dönüştür → Stil → Yıkıcı
    expect(groups.map((g) => g.dividerBefore)).toEqual([false, false, true, true]); // §2: G1↔G2 divider YOK
  });
});

// ── İnvariant testleri (§2/§3 kod düzeyinde zorlama) ─────────────────────────
describe('registry invariantları (§2/§3)', () => {
  it('§3: danger:true ⊆ MENU_DANGER_ALLOWLIST; Dal 5 sonrası HÂLÂ hiç kırmızı yok (Sıfırla nötr — Ctrl+Z)', () => {
    for (const a of MENU_ACTIONS) {
      if (a.danger) expect(MENU_DANGER_ALLOWLIST.has(a.id)).toBe(true);
    }
    expect(MENU_ACTIONS.filter((a) => a.danger)).toHaveLength(0); // KORUNUR: footer-sifirla danger ALMADI
  });

  it('§2: her group ∈ {1,2,3,4}', () => {
    for (const a of MENU_ACTIONS) expect([1, 2, 3, 4]).toContain(a.group);
  });

  it('id benzersiz', () => {
    const all = MENU_ACTIONS.map((a) => a.id);
    expect(new Set(all).size).toBe(all.length);
  });
});

// ── Dal 5 — footer-seçim (kind:'footerSel') ──────────────────────────────────
describe('Dal 5 — footer-seçim', () => {
  const fctx = (over: Partial<Extract<MenuContext, { kind: 'footerSel' }>> = {}): MenuContext =>
    ({ kind: 'footerSel', pageNumber: 1, isCustom: false, isHidden: false, ...over });
  const ids = (ctx: MenuContext) => buildMenu(ctx).flatMap((g) => g.items.map((i) => i.id));
  const lbl = (ctx: MenuContext, id: string) =>
    buildMenu(ctx).flatMap((g) => g.items).find((a) => a.id === id)!.label(ctx);

  it('global footer: Özel Ayar Yap (g2) + Varsayılana Sıfırla (g4); gruplar [2,4], TEK divider (§2 blok)', () => {
    const ctx = fctx();
    const groups = buildMenu(ctx);
    expect(ids(ctx)).toEqual(['footer-ozel-genel', 'footer-sifirla']);
    expect(groups.map((g) => g.group)).toEqual([2, 4]);
    expect(groups.map((g) => g.dividerBefore)).toEqual([false, true]); // g3 boş atlanır → tek divider g4 önünde
    expect(lbl(ctx, 'footer-ozel-genel')).toBe('Özel Ayar Yap');
  });

  it('custom footer: toggle "Genele Dön"', () => {
    expect(lbl(fctx({ isCustom: true }), 'footer-ozel-genel')).toBe('Genele Dön');
  });

  it('gizli footer: kalem YOK (boş menü — savunma)', () => {
    expect(buildMenu(fctx({ isHidden: true }))).toEqual([]);
  });

  it('footer-sifirla NÖTR (danger değil — Ctrl+Z var)', () => {
    const sifirla = buildMenu(fctx()).flatMap((g) => g.items).find((a) => a.id === 'footer-sifirla');
    expect(sifirla?.danger).toBeFalsy();
  });
});

// footer-sifirla run() ONAY gate: global sıfırlama onaysız resetFooterToDefault('global') ÇAĞIRMAZ —
// önce ui.store.pendingConfirm doldurulur (StudioPage'deki ConfirmDialog onu çizer). custom doğrudan.
describe('footer-sifirla run — global onay gate', () => {
  const sifirla = MENU_ACTIONS.find((a) => a.id === 'footer-sifirla')!;
  beforeEach(() => useUIStore.getState().cancelConfirm()); // temiz pending

  it('custom footer → onaysız (pendingConfirm null kalır)', () => {
    sifirla.run({ kind: 'footerSel', pageNumber: 1, isCustom: true, isHidden: false });
    expect(useUIStore.getState().pendingConfirm).toBeNull();
  });

  it('global footer → ONAY gate: pendingConfirm SET (doğrudan reset YOK)', () => {
    sifirla.run({ kind: 'footerSel', pageNumber: 1, isCustom: false, isHidden: false });
    const pc = useUIStore.getState().pendingConfirm;
    expect(pc).not.toBeNull();
    expect(pc?.confirmLabel).toBe('Varsayılana Sıfırla');
    expect(typeof pc?.onConfirm).toBe('function'); // onaylanınca resetFooterToDefault('global') çağrılır
  });
});

// ── Dal 6 — banner/footer cell-edit (kind:'bannerCell') ──────────────────────
describe('Dal 6 — banner/footer hücre menüsü', () => {
  const bc = (over: Partial<Extract<MenuContext, { kind: 'bannerCell' }>> = {}): MenuContext => ({
    kind: 'bannerCell', slotId: 'm1', cellIds: ['c1'], isMerged: false,
    anchorCellId: 'c1', anchorRow: 1, anchorCol: 1, rows: 4, cols: 4, ...over,
  });
  const ids = (ctx: MenuContext) => buildMenu(ctx).flatMap((g) => g.items.map((i) => i.id));

  it('tek/birleşmemiş hücre: 4 ekle + satır/sütun sil + İçeriği Temizle; Birleştir/Ayır YOK; gruplar [1,4] tek divider', () => {
    const ctx = bc();
    expect(ids(ctx)).toEqual([
      'cell-row-above', 'cell-row-below', 'cell-col-left', 'cell-col-right',
      'cell-satir-sil', 'cell-sutun-sil', 'cell-sil',
    ]);
    const groups = buildMenu(ctx);
    expect(groups.map((g) => g.group)).toEqual([1, 4]); // g2 boş (ne çoklu ne birleşik) → atlanır
    expect(groups.map((g) => g.dividerBefore)).toEqual([false, true]); // tek divider, g4 bloğu önünde
  });

  it('çoklu seçim (cellIds≥2): Hücreleri Birleştir görünür (Ayır değil); gruplar [1,2,4], g1+g2 bitişik', () => {
    const ctx = bc({ cellIds: ['c1', 'c2'] });
    expect(ids(ctx)).toContain('cell-birlestir');
    expect(ids(ctx)).not.toContain('cell-ayir');
    expect(buildMenu(ctx).map((g) => g.group)).toEqual([1, 2, 4]);
    expect(buildMenu(ctx).map((g) => g.dividerBefore)).toEqual([false, false, true]); // §2: G1↔G2 divider YOK
  });

  it('birleşik hücre (isMerged): Hücreleri Ayır görünür; tekken Birleştir görünmez', () => {
    expect(ids(bc({ isMerged: true }))).toContain('cell-ayir');
    expect(ids(bc({ isMerged: true }))).not.toContain('cell-birlestir'); // cellIds=['c1'] tek → Birleştir yok
  });

  it('son satır (rows=1): "Satırı sil" GİZLİ (disabled DEĞİL); "Sütunu sil" durur', () => {
    expect(ids(bc({ rows: 1 }))).not.toContain('cell-satir-sil');
    expect(ids(bc({ rows: 1 }))).toContain('cell-sutun-sil');
  });

  it('son sütun (cols=1): "Sütunu sil" GİZLİ', () => {
    expect(ids(bc({ cols: 1 }))).not.toContain('cell-sutun-sil');
  });

  it('1x1 grid: yalnız 4 ekle + İçeriği Temizle (yapısal sil kalemleri gizli)', () => {
    expect(ids(bc({ rows: 1, cols: 1 }))).toEqual([
      'cell-row-above', 'cell-row-below', 'cell-col-left', 'cell-col-right', 'cell-sil',
    ]);
  });

  it('İçeriği Temizle her zaman görünür, etiket "İçeriği Temizle", NÖTR (danger değil)', () => {
    const sil = MENU_ACTIONS.find((a) => a.id === 'cell-sil')!;
    expect(sil.label(bc())).toBe('İçeriği Temizle');
    expect(sil.danger).toBeFalsy();
  });
});

// Dal 6 run() — lokal #banner-ctx-menu ile action+param BİREBİR (insert/delete anchor sr/sc; merge/clear cellIds).
describe('Dal 6 run — action paritesi', () => {
  const act = (id: string) => MENU_ACTIONS.find((a) => a.id === id)!;
  const ctx = (over: Partial<Extract<MenuContext, { kind: 'bannerCell' }>> = {}): MenuContext => ({
    kind: 'bannerCell', slotId: 'm1', cellIds: ['c1', 'c2'], isMerged: true,
    anchorCellId: 'c1', anchorRow: 1, anchorCol: 2, rows: 4, cols: 4, ...over,
  });

  it('Üste/Alta satır → insertBannerRow(slotId, anchorRow / anchorRow+1)', () => {
    const spy = vi.spyOn(useCatalogStore.getState(), 'insertBannerRow').mockImplementation(() => {});
    act('cell-row-above').run(ctx());
    act('cell-row-below').run(ctx());
    expect(spy).toHaveBeenNthCalledWith(1, 'm1', 1);
    expect(spy).toHaveBeenNthCalledWith(2, 'm1', 2);
    spy.mockRestore();
  });

  it('Sola/Sağa sütun → insertBannerColumn(slotId, anchorCol / anchorCol+1)', () => {
    const spy = vi.spyOn(useCatalogStore.getState(), 'insertBannerColumn').mockImplementation(() => {});
    act('cell-col-left').run(ctx());
    act('cell-col-right').run(ctx());
    expect(spy).toHaveBeenNthCalledWith(1, 'm1', 2);
    expect(spy).toHaveBeenNthCalledWith(2, 'm1', 3);
    spy.mockRestore();
  });

  it('Satırı/Sütunu sil → deleteBannerRow/Column(slotId, anchorRow/anchorCol)', () => {
    const sr = vi.spyOn(useCatalogStore.getState(), 'deleteBannerRow').mockImplementation(() => {});
    const sc = vi.spyOn(useCatalogStore.getState(), 'deleteBannerColumn').mockImplementation(() => {});
    act('cell-satir-sil').run(ctx());
    act('cell-sutun-sil').run(ctx());
    expect(sr).toHaveBeenCalledWith('m1', 1);
    expect(sc).toHaveBeenCalledWith('m1', 2);
    sr.mockRestore();
    sc.mockRestore();
  });

  it('Birleştir → mergeBannerCells(slotId, cellIds); Ayır → splitBannerCell(slotId, anchorCellId)', () => {
    const m = vi.spyOn(useCatalogStore.getState(), 'mergeBannerCells').mockImplementation(() => {});
    const s = vi.spyOn(useCatalogStore.getState(), 'splitBannerCell').mockImplementation(() => {});
    act('cell-birlestir').run(ctx());
    act('cell-ayir').run(ctx());
    expect(m).toHaveBeenCalledWith('m1', ['c1', 'c2']);
    expect(s).toHaveBeenCalledWith('m1', 'c1'); // anchorCellId (sağ-tıklanan), seçimin ilki değil
    m.mockRestore();
    s.mockRestore();
  });

  it('İçeriği Temizle → clearBannerCells(slotId, cellIds) — seçili tüm hücreler', () => {
    const spy = vi.spyOn(useCatalogStore.getState(), 'clearBannerCells').mockImplementation(() => {});
    act('cell-sil').run(ctx());
    expect(spy).toHaveBeenCalledWith('m1', ['c1', 'c2']);
    spy.mockRestore();
  });
});

// Yüzey-spesifik stil panosu (kullanıcı kararı): etiketler Zemin/Hücre Stili; her yüzey YALNIZ kendi
// panosunu gösterir → "zemin kopyaladım, hücrede 'stil yapıştır' çıkıyor" muğlaklığı/bug'ı kapanır.
describe('yüzey-spesifik stil panosu', () => {
  const slotMenuCtx = (extra: Partial<MenuContextDeps> = {}): MenuContext =>
    resolveMenuContext(deps(sel({ type: 'slot', ids: ['s1'] }), [page([slot({ id: 's1' })])], extra));
  const bgMenuCtx = (extra: Partial<MenuContextDeps> = {}): MenuContext =>
    resolveMenuContext(deps(sel({ type: 'pageBackground', ids: ['1'] }), [page([])], extra));
  const ids = (ctx: MenuContext) => buildMenu(ctx).flatMap((g) => g.items.map((i) => i.id));

  it('etiketler yüzeye göre: Hücre Stili / Zemin Stili', () => {
    const sc = slotMenuCtx({ copiedSlotStyle: true });
    const bc = bgMenuCtx({ copiedBg: true });
    const lbl = (ctx: MenuContext, id: string) =>
      buildMenu(ctx).flatMap((g) => g.items).find((a) => a.id === id)!.label(ctx);
    expect(lbl(sc, 'slot-stil-kopyala')).toBe('Hücre Stili Kopyala');
    expect(lbl(sc, 'slot-stil-yapistir')).toBe('Hücre Stili Yapıştır');
    expect(lbl(bc, 'bg-stil-kopyala')).toBe('Zemin Stili Kopyala');
    expect(lbl(bc, 'bg-stil-yapistir')).toBe('Zemin Stili Yapıştır');
  });

  it('YALNIZ zemin kopyalı → HÜCRE menüsünde "Hücre Stili Yapıştır" YOK; ZEMİN menüsünde "Zemin Stili Yapıştır" VAR', () => {
    expect(ids(slotMenuCtx({ copiedBg: true, copiedSlotStyle: false }))).not.toContain('slot-stil-yapistir');
    expect(ids(bgMenuCtx({ copiedBg: true, copiedSlotStyle: false }))).toContain('bg-stil-yapistir');
  });

  it('YALNIZ hücre kopyalı → ZEMİN menüsünde "Zemin Stili Yapıştır" YOK; HÜCRE menüsünde "Hücre Stili Yapıştır" VAR', () => {
    expect(ids(bgMenuCtx({ copiedBg: false, copiedSlotStyle: true }))).not.toContain('bg-stil-yapistir');
    expect(ids(slotMenuCtx({ copiedBg: false, copiedSlotStyle: true }))).toContain('slot-stil-yapistir');
  });
});
