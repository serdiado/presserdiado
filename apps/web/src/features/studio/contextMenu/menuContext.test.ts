import { describe, it, expect } from 'vitest';
import type { CatalogPage, CatalogSettings, StudioSlot } from '@matbaapro/shared';
import type { SelectionState } from '../../../stores/studio/ui.store';
import { resolveMenuContext, type MenuContext, type MenuContextDeps } from './menuContext';
import { MENU_ACTIONS, MENU_DANGER_ALLOWLIST, buildMenu, type MenuAction } from './menuRegistry';

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

  it('birleşik slot: Hücreyi Dağıt var', () => {
    expect(ids(slotCtx({ canUnmerge: true }))).toContain('slot-ayir');
  });

  it('çoklu seçim: Hücreleri Birleştir var', () => {
    expect(ids(slotCtx({ canMerge: true }))).toContain('slot-birlestir');
  });

  it('pageBg + kopyalı: iki stil aksiyonu', () => {
    expect(ids({ kind: 'pageBg', pageNumber: 1, hasCopiedBg: true })).toEqual(['bg-stil-kopyala', 'bg-stil-yapistir']);
  });

  it('footerSel / textElement / none: pilotta menü YOK (boş)', () => {
    expect(buildMenu({ kind: 'footerSel', pageNumber: 1, isCustom: false, isHidden: false })).toEqual([]);
    expect(buildMenu({ kind: 'textElement', slotId: 's1', elementType: 'name' })).toEqual([]);
    expect(buildMenu({ kind: 'none' })).toEqual([]);
  });

  it('§2 sıra: ürünlü+birleşik+kopyalı slotta gruplar 2→3→4', () => {
    const groups = buildMenu(slotCtx({ hasProduct: true, canUnmerge: true, hasCopiedSlotStyle: true }));
    expect(groups.map((g) => g.group)).toEqual([2, 3, 4]); // Dönüştür → Stil → Yıkıcı
  });
});

// ── İnvariant testleri (§2/§3 kod düzeyinde zorlama) ─────────────────────────
describe('registry invariantları (§2/§3)', () => {
  it('§3: danger:true yalnız MENU_DANGER_ALLOWLIST id; pilotta HİÇ danger yok (Boşalt nötr)', () => {
    for (const a of MENU_ACTIONS) {
      if (a.danger) expect(MENU_DANGER_ALLOWLIST.has(a.id)).toBe(true);
    }
    expect(MENU_ACTIONS.filter((a) => a.danger)).toHaveLength(0);
  });

  it('§2: her group ∈ {1,2,3,4}', () => {
    for (const a of MENU_ACTIONS) expect([1, 2, 3, 4]).toContain(a.group);
  });

  it('id benzersiz', () => {
    const all = MENU_ACTIONS.map((a) => a.id);
    expect(new Set(all).size).toBe(all.length);
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
