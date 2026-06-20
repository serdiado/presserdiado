import { describe, it, expect } from 'vitest';
import type { ProductInfo, StudioForma, StudioSlot } from '@matbaapro/shared';
import { reconcileGrid, recalculateLayout } from '@matbaapro/grid-engine';

// Item 4 revize — KONUM-TABANLI kenar-kaldırma. reconcile artık gridPosition okuyor → fixture'lar
// konumlu (1-indexli colStart/rowStart). grid-engine'in kendi vitest'i yok → web host'unda public
// reconcileGrid API'si üzerinden (@matbaapro/grid-engine dist'ten → testten önce engine build).

let idc = 0;
const mkId = () => `s${idc++}`;
const prod = (sku: string) => ({ sku } as unknown as ProductInfo);

function single(colStart: number, rowStart: number, over: Partial<StudioSlot> = {}): StudioSlot {
  return {
    id: mkId(), colSpan: 1, rowSpan: 1, product: null, hidden: false, mergedInto: null,
    role: 'product', gridPosition: { colStart, rowStart }, ...over,
  };
}
/** Anchor (cs×rs) @ (colStart,rowStart) + (cs*rs−1) gizli token (konumsuz). */
function merge(
  colStart: number, rowStart: number, cs: number, rs: number, anchorOver: Partial<StudioSlot> = {},
): StudioSlot[] {
  const id = mkId();
  const anchor: StudioSlot = {
    id, colSpan: cs, rowSpan: rs, product: null, hidden: false, mergedInto: null,
    role: 'product', gridPosition: { colStart, rowStart }, ...anchorOver,
  };
  const tokens: StudioSlot[] = [];
  for (let k = 0; k < cs * rs - 1; k++) {
    tokens.push({ id: mkId(), colSpan: 1, rowSpan: 1, product: null, hidden: true, mergedInto: id, role: 'product' });
  }
  return [anchor, ...tokens];
}

const vArea = (slots: StudioSlot[]) =>
  slots.filter((s) => !s.hidden).reduce((a, s) => a + s.colSpan * s.rowSpan, 0);

const tokensOf = (slots: StudioSlot[], id: string) =>
  slots.filter((s) => s.mergedInto === id && s.hidden).length;

function assertNoDangling(slots: StudioSlot[]) {
  const anchors = new Map(
    slots.filter((s) => !s.hidden && (s.colSpan > 1 || s.rowSpan > 1)).map((s) => [s.id, s]),
  );
  for (const s of slots) {
    if (s.mergedInto != null) expect(anchors.has(s.mergedInto), `dangling: ${s.mergedInto}`).toBe(true);
  }
  for (const [id, a] of anchors) {
    expect(tokensOf(slots, id), `token (${id})`).toBe(a.colSpan * a.rowSpan - 1);
  }
}

/** recalculateLayout reflow (gridPosition + globalNumber yeniden hesaplanır). */
function reflow(slots: StudioSlot[], rows: number, cols: number): StudioSlot[] {
  const forma = {
    id: 1, name: 'f',
    pages: [{
      id: 'p1', pageNumber: 1, slots, footerText: '', footerLogo: null,
      footerMode: 'global', customFooter: null, gridSettings: { rows, cols },
    }],
    pageMergeGroups: [],
  } as unknown as StudioForma;
  return recalculateLayout([forma], { rows, cols })[0].pages[0].slots;
}

describe('reconcileGrid — konum-tabanlı kenar-kaldırma', () => {
  it('LINCHPIN: sağ-kenar merge tam kaldırılan sütun kadar daralır + reflow\'da aşağı atılmaz', () => {
    // 5×1: single@col1 + merge@cols2-5 (cs4). cols 5→3 → en sağ 2 sütun (4,5) gider → cs 4→2.
    const m = merge(2, 1, 4, 1);
    const slots = [single(1, 1), ...m];
    const { slots: out } = reconcileGrid(slots, { rows: 1, cols: 3 }, 1);
    const anchor = out.find((s) => s.id === m[0].id)!;
    expect(anchor.colSpan).toBe(2); // ne fazla ne az: 4 − (5−3) = 2
    expect(anchor.rowSpan).toBe(1);
    expect(tokensOf(out, anchor.id)).toBe(1); // invariant cs*rs−1 = 1
    assertNoDangling(out);
    // reflow → sığar, aşağı itilmez (rowStart=1, sağ kenar ≤ 3).
    const laid = reflow(out, 1, 3);
    const a2 = laid.find((s) => s.id === anchor.id)!;
    expect(a2.gridPosition!.rowStart).toBe(1);
    expect(a2.gridPosition!.colStart + a2.colSpan - 1).toBeLessThanOrEqual(3);
  });

  it('kenarda-olmayan sığan merge dokunulmaz', () => {
    // 4×1: merge@cols1-2 (cs2) + single@col3 + single@col4. cols 4→3 → merge içeride, dokunulmaz.
    const m = merge(1, 1, 2, 1);
    const slots = [...m, single(3, 1), single(4, 1)];
    const { slots: out } = reconcileGrid(slots, { rows: 1, cols: 3 }, 1);
    const anchor = out.find((s) => s.id === m[0].id)!;
    expect(anchor.colSpan).toBe(2); // dokunulmadı
    assertNoDangling(out);
  });

  it('kenardaki modülsüz tek-slot gider → ürün overflow\'a', () => {
    const edge = single(4, 1, { product: prod('px') });
    const slots = [single(1, 1), single(2, 1), single(3, 1), edge];
    const { slots: out, overflowProducts } = reconcileGrid(slots, { rows: 1, cols: 3 }, 1);
    expect(out.find((s) => s.id === edge.id)).toBeUndefined();
    expect(overflowProducts.map((p) => p.sku)).toContain('px');
  });

  it('dikey-kenar merge (cs=1, rs>1) — modülsüz tümden gider, modüllü 1×1 korunur', () => {
    // modülsüz: col4'te dikey merge (rows1-3) → cs1=4>3 tümden dışarıda → sil.
    const vm = merge(4, 1, 1, 3);
    const o1 = reconcileGrid([single(1, 1), single(2, 1), single(3, 1), ...vm], { rows: 3, cols: 3 }, 1);
    expect(o1.slots.find((s) => s.id === vm[0].id)).toBeUndefined();
    expect(o1.slots.some((s) => s.mergedInto === vm[0].id)).toBe(false); // token'lar da gitti
    // modüllü: aynı ama moduleData → 1×1 korunur.
    const vmod = merge(4, 1, 1, 3, { moduleData: { type: 'banner' } });
    const o2 = reconcileGrid([single(1, 1), single(2, 1), single(3, 1), ...vmod], { rows: 3, cols: 3 }, 1);
    const a = o2.slots.find((s) => s.id === vmod[0].id)!;
    expect(a.colSpan).toBe(1);
    expect(a.rowSpan).toBe(1);
    expect(a.moduleData).toBeTruthy();
    assertNoDangling(o2.slots);
  });

  it('satır simetrik — alt-kenar dikey merge rowSpan−1; rowStart>newRows siler', () => {
    // 1×4: merge@rows1-4 (col1, rs4) ... rows 4→2 → bottom 4>2 → rs 4→2.
    const m = merge(1, 1, 1, 4);
    const { slots: out } = reconcileGrid([...m], { rows: 2, cols: 1 }, 1);
    const a = out.find((s) => s.id === m[0].id)!;
    expect(a.rowSpan).toBe(2);
    expect(tokensOf(out, a.id)).toBe(1);
    assertNoDangling(out);
  });

  it('modül merge straddle → span−1, moduleData korunur', () => {
    const md = { type: 'banner' };
    const m = merge(2, 1, 3, 1, { moduleData: md }); // cols2-4
    const { slots: out } = reconcileGrid([single(1, 1), ...m], { rows: 1, cols: 3 }, 1);
    const a = out.find((s) => s.id === m[0].id)!;
    expect(a.colSpan).toBe(2); // 3 → (3−2+1)=2
    expect(a.moduleData).toBe(md);
    assertNoDangling(out);
  });

  it('FOLD2: korunan modül sığmazsa silinmez; reflow ek satıra koyar (içerik clip edilmez)', () => {
    // 2×2 tamamen dolu (modül 2×2). cols 2→1, rows 2 → modül 2×2 straddle cols → 1×2; rows fit.
    // Sonra başka senaryo: tümden-dışarıda modül korunur + reflow konumlanır (undefined değil).
    const mod = merge(2, 1, 1, 2, { moduleData: { type: 'banner' } }); // col2 dikey, cols 2→1 → dışarıda
    const { slots: out } = reconcileGrid([single(1, 1), single(1, 2), ...mod], { rows: 2, cols: 1 }, 1);
    const a = out.find((s) => s.id === mod[0].id)!;
    expect(a.moduleData).toBeTruthy(); // SİLİNMEDİ
    expect(a.colSpan).toBe(1);
    expect(a.rowSpan).toBe(1);
    // reflow → modüle konum atanır (kayıp/clip yok), grid hedeften büyük kalabilir.
    const laid = reflow(out, 2, 1);
    const a2 = laid.find((s) => s.id === mod[0].id)!;
    expect(a2.gridPosition).toBeTruthy();
  });

  it('merge\'siz regresyon — dışarıdaki ürünler overflow\'a, içeridekiler kalır', () => {
    const slots: StudioSlot[] = [];
    for (let r = 1; r <= 4; r++) for (let c = 1; c <= 4; c++) slots.push(single(c, r, { product: prod(`p${r}${c}`) }));
    const { slots: out, overflowProducts } = reconcileGrid(slots, { rows: 2, cols: 2 }, 1);
    expect(out.filter((s) => !s.hidden).length).toBe(4); // col1-2 × row1-2
    expect(overflowProducts.length).toBe(12);
    expect(vArea(out)).toBe(4);
  });

  it('büyütme — merge korunur, boş 1×1 eklenir', () => {
    const m = merge(1, 1, 2, 2, { moduleData: { type: 'banner' } });
    const { slots: out } = reconcileGrid([...m], { rows: 4, cols: 4 }, 1);
    const a = out.find((s) => s.id === m[0].id)!;
    expect(a.colSpan).toBe(2);
    expect(a.rowSpan).toBe(2);
    expect(vArea(out)).toBe(16);
    assertNoDangling(out);
  });

  it('gridPosition-yok fallback — DOKUNMA (daraltma/silme yok)', () => {
    const noPos = single(1, 1, { colSpan: 5, gridPosition: undefined });
    const { slots: out } = reconcileGrid([noPos], { rows: 1, cols: 3 }, 1);
    const a = out.find((s) => s.id === noPos.id)!;
    expect(a.colSpan).toBe(5); // konum yok → dokunulmadı
  });
});
