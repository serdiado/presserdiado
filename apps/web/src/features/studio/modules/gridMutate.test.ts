import { describe, it, expect } from 'vitest';
import type { BannerCellData } from './types';
import {
  type GridState,
  makeCell,
  nextCellId,
  getMergeBoxes,
  normalizeMerges,
  insertColumn,
  deleteColumn,
  insertRow,
  deleteRow,
  mergeCells,
  splitCell,
  resizeGridTo,
} from './gridMutate';

// ─── yardımcılar ──────────────────────────────────────────────────────────────

/** rows×cols grid; her göze ayırt edici text (`c{idx}`). withFr → colFr [1,2,..], rowFr [1,2,..]. */
function makeGrid(rows: number, cols: number, withFr = false): GridState {
  const cells: BannerCellData[] = [];
  for (let i = 0; i < rows * cols; i++) {
    const c = makeCell(`banner-inst-${i}`);
    c.text = `c${i}`;
    cells.push(c);
  }
  const s: GridState = { cells, rows, cols };
  if (withFr) {
    s.colFractions = Array.from({ length: cols }, (_, i) => i + 1);
    s.rowFractions = Array.from({ length: rows }, (_, i) => i + 1);
  }
  return s;
}

const at = (s: GridState, r: number, c: number) => s.cells[r * s.cols + c];

/** anchor(span>1) yap: master + kapsanan gözeler hidden+mergedInto. Saf — yeni state döner. */
function applyMerge(s: GridState, minR: number, minC: number, maxR: number, maxC: number): GridState {
  const masterId = at(s, minR, minC).id;
  const cells = s.cells.map((cell, i) => {
    const r = Math.floor(i / s.cols);
    const c = i % s.cols;
    if (cell.id === masterId)
      return { ...cell, colSpan: maxC - minC + 1, rowSpan: maxR - minR + 1, hidden: false, mergedInto: null };
    if (r >= minR && r <= maxR && c >= minC && c <= maxC)
      return { ...cell, colSpan: 1, rowSpan: 1, hidden: true, mergedInto: masterId };
    return cell;
  });
  return { ...s, cells };
}

/** dangling invariant: mergedInto=X olan her göze, X geçerli (span>1) anchor'ın box'ında. */
function assertNoDangling(s: GridState) {
  const boxes = getMergeBoxes(s.cells, s.cols);
  const boxById = new Map(boxes.map((b) => [b.id, b]));
  s.cells.forEach((cell, i) => {
    if (cell.mergedInto == null) return;
    const b = boxById.get(cell.mergedInto);
    expect(b, `mergedInto=${cell.mergedInto} geçerli anchor olmalı`).toBeTruthy();
    if (!b) return;
    const r = Math.floor(i / s.cols);
    const c = i % s.cols;
    expect(r >= b.r && r < b.r + b.rs && c >= b.c && c < b.c + b.cs).toBe(true);
  });
}

// ─── (a) sütun insert/delete remap doğruluğu (item 10) ──────────────────────────

describe('sütun insert/delete remap (item 10 fix)', () => {
  it('insertColumn: içerik doğru (row,newCol)da kalır, yeni sütun boş', () => {
    const s = makeGrid(2, 3); // c0 c1 c2 / c3 c4 c5
    const r = insertColumn(s, 1);
    expect(r.cols).toBe(4);
    expect(r.cells.length).toBe(8);
    expect([at(r, 0, 0).text, at(r, 0, 1).text, at(r, 0, 2).text, at(r, 0, 3).text]).toEqual(['c0', '', 'c1', 'c2']);
    expect([at(r, 1, 0).text, at(r, 1, 1).text, at(r, 1, 2).text, at(r, 1, 3).text]).toEqual(['c3', '', 'c4', 'c5']);
  });

  it('insertColumn at=0 (en sola) ve at=cols (en sağa)', () => {
    const s = makeGrid(2, 3);
    const left = insertColumn(s, 0);
    expect([at(left, 0, 0).text, at(left, 0, 1).text]).toEqual(['', 'c0']);
    const right = insertColumn(s, 3);
    expect([at(right, 0, 2).text, at(right, 0, 3).text]).toEqual(['c2', '']);
  });

  it('deleteColumn: atCol gider, kalan içerik doğru kayar', () => {
    const s = makeGrid(2, 3);
    const r = deleteColumn(s, 1);
    expect(r.cols).toBe(2);
    expect(r.cells.length).toBe(4);
    expect([at(r, 0, 0).text, at(r, 0, 1).text]).toEqual(['c0', 'c2']);
    expect([at(r, 1, 0).text, at(r, 1, 1).text]).toEqual(['c3', 'c5']);
  });

  it('deleteColumn cols=1 guard → no-op', () => {
    const s = makeGrid(2, 1);
    const r = deleteColumn(s, 0);
    expect(r.cols).toBe(1);
    expect(r.cells.length).toBe(2);
  });

  it('item 8: eklenen hücre nötr — komşunun zemin/çerçevesini ALMAZ', () => {
    const s = makeGrid(2, 3);
    // komşu hücrelere belirgin stil ver (kırmızı zemin + kalın çerçeve)
    s.cells = s.cells.map((c) => ({
      ...c,
      bgColor: { type: 'solid', color: '#ff0000', opacity: 100 },
      border: { t: 4, r: 4, b: 4, l: 4, linked: true, color: { c: '#000000', o: 100 }, style: 'solid' },
    }));
    const colNew = insertColumn(s, 1);
    expect(colNew.cells[1].bgColor).toEqual({ type: 'solid', color: '#ffffff', opacity: 100 });
    expect(colNew.cells[1].border.t).toBe(0);
    const rowNew = insertRow(s, 1);
    expect(rowNew.cells[3].bgColor).toEqual({ type: 'solid', color: '#ffffff', opacity: 100 });
    expect(rowNew.cells[3].border.t).toBe(0);
  });
});

// ─── (b) satır insert/delete ────────────────────────────────────────────────────

describe('satır insert/delete', () => {
  it('insertRow orta: blok korunur, yeni satır boş', () => {
    const s = makeGrid(3, 2); // c0 c1 / c2 c3 / c4 c5
    const r = insertRow(s, 1);
    expect(r.rows).toBe(4);
    expect([at(r, 0, 0).text, at(r, 0, 1).text]).toEqual(['c0', 'c1']);
    expect([at(r, 1, 0).text, at(r, 1, 1).text]).toEqual(['', '']);
    expect([at(r, 2, 0).text, at(r, 2, 1).text]).toEqual(['c2', 'c3']);
    expect([at(r, 3, 0).text, at(r, 3, 1).text]).toEqual(['c4', 'c5']);
  });

  it('insertRow tail (at=rows)', () => {
    const s = makeGrid(2, 2);
    const r = insertRow(s, 2);
    expect(r.rows).toBe(3);
    expect([at(r, 2, 0).text, at(r, 2, 1).text]).toEqual(['', '']);
  });

  it('deleteRow: blok çıkar, kalan kayar', () => {
    const s = makeGrid(3, 2);
    const r = deleteRow(s, 1);
    expect(r.rows).toBe(2);
    expect([at(r, 0, 0).text, at(r, 1, 0).text]).toEqual(['c0', 'c4']);
  });

  it('deleteRow rows=1 guard → no-op', () => {
    const s = makeGrid(1, 2);
    const r = deleteRow(s, 0);
    expect(r.rows).toBe(1);
  });
});

// ─── (c) saflık — girdi mutate edilmez ──────────────────────────────────────────

describe('saflık (girdi mutate edilmez)', () => {
  const ops: Array<[string, (s: GridState) => GridState]> = [
    ['insertColumn', (s) => insertColumn(s, 1)],
    ['deleteColumn', (s) => deleteColumn(s, 1)],
    ['insertRow', (s) => insertRow(s, 1)],
    ['deleteRow', (s) => deleteRow(s, 1)],
    ['mergeCells', (s) => mergeCells(s, [at(s, 0, 0).id, at(s, 1, 1).id])],
    ['splitCell', (s) => splitCell(applyMerge(s, 0, 0, 1, 1), at(s, 0, 0).id)],
    ['normalizeMerges', (s) => normalizeMerges(s)],
    ['resizeGridTo', (s) => resizeGridTo(s, 4, 5)],
  ];

  for (const [name, op] of ops) {
    it(`${name} girdiyi değiştirmez`, () => {
      const s = applyMerge(makeGrid(3, 3, true), 0, 0, 1, 1); // merge + fractions
      const snapshot = structuredClone(s);
      op(s);
      expect(s).toEqual(snapshot);
    });
  }
});

// ─── (d) merge genişleme — İKİ EKSEN ────────────────────────────────────────────

describe('merge genişleme (iki eksen)', () => {
  it('insertColumn yatay merge içinden → colSpan+1, yeni göze hidden+mergedInto', () => {
    // 2×3, merge (0,1)-(0,2) → anchor idx1 colSpan2
    const s = applyMerge(makeGrid(2, 3), 0, 1, 0, 2);
    const anchorId = at(s, 0, 1).id;
    const r = insertColumn(s, 2); // box c=1,cs=2 → 1<2<=2 deler
    expect(r.cols).toBe(4);
    const anchor = r.cells.find((c) => c.id === anchorId)!;
    expect(anchor.colSpan).toBe(3);
    expect(anchor.mergedInto).toBeNull();
    // eklenen göze (0,2) box içinde → hidden
    expect(at(r, 0, 2).hidden).toBe(true);
    expect(at(r, 0, 2).mergedInto).toBe(anchorId);
    assertNoDangling(r);
  });

  it('insertColumn kenardan → span değişmez, yeni göze normal', () => {
    const s = applyMerge(makeGrid(2, 3), 0, 1, 0, 2);
    const anchorId = at(s, 0, 1).id;
    const r = insertColumn(s, 1); // at=c → sol kenar, delmez
    const anchor = r.cells.find((c) => c.id === anchorId)!;
    expect(anchor.colSpan).toBe(2);
    // eklenen sütun (0,1) merge'in solunda → normal
    expect(at(r, 0, 1).hidden).toBe(false);
    expect(at(r, 0, 1).mergedInto).toBeNull();
    assertNoDangling(r);
  });

  it('insertRow dikey merge içinden → rowSpan+1, yeni göze hidden', () => {
    // 3×2 dikey merge (0,0)-(1,0) anchor idx0 rowSpan2
    const s = applyMerge(makeGrid(3, 2), 0, 0, 1, 0);
    const anchorId = at(s, 0, 0).id;
    const r = insertRow(s, 1); // box r=0,rs=2 → 0<1<=1 deler
    expect(r.rows).toBe(4);
    const anchor = r.cells.find((c) => c.id === anchorId)!;
    expect(anchor.rowSpan).toBe(3);
    expect(at(r, 1, 0).hidden).toBe(true);
    expect(at(r, 1, 0).mergedInto).toBe(anchorId);
    assertNoDangling(r);
  });
});

// ─── (e) merge küçülme & 1×1 dissolve — iki eksen ───────────────────────────────

describe('merge küçülme & dissolve', () => {
  it('deleteColumn merge içinden → colSpan-1; 1×1 → dissolve', () => {
    const s = applyMerge(makeGrid(2, 3), 0, 1, 0, 2); // colSpan2
    const anchorId = at(s, 0, 1).id;
    const r = deleteColumn(s, 2); // box c=1,cs=2, 1<2<=2 → küçült; 2→1 → dissolve
    expect(r.cols).toBe(2);
    const anchor = r.cells.find((c) => c.id === anchorId)!;
    expect(anchor.colSpan).toBe(1);
    expect(anchor.rowSpan).toBe(1);
    expect(anchor.mergedInto).toBeNull();
    assertNoDangling(r);
  });

  it('deleteRow dikey merge içinden → rowSpan-1; 1×1 → dissolve', () => {
    const s = applyMerge(makeGrid(3, 2), 0, 0, 1, 0); // rowSpan2
    const anchorId = at(s, 0, 0).id;
    const r = deleteRow(s, 1);
    expect(r.rows).toBe(2);
    const anchor = r.cells.find((c) => c.id === anchorId)!;
    expect(anchor.rowSpan).toBe(1);
    expect(anchor.colSpan).toBe(1);
    assertNoDangling(r);
  });

  it('3 genişlikten 1 sil → colSpan 2 kalır (dissolve yok)', () => {
    const s = applyMerge(makeGrid(2, 4), 0, 1, 0, 3); // colSpan3 (1,2,3)
    const anchorId = at(s, 0, 1).id;
    const r = deleteColumn(s, 3);
    const anchor = r.cells.find((c) => c.id === anchorId)!;
    expect(anchor.colSpan).toBe(2);
    expect(anchor.mergedInto).toBeNull();
    assertNoDangling(r);
  });
});

// ─── (f) anchor silme → üyeler dissolve ─────────────────────────────────────────

describe('anchor silme → dissolve', () => {
  it('deleteColumn anchor sütununu silince üyeler dissolve', () => {
    const s = applyMerge(makeGrid(2, 3), 0, 1, 0, 2); // anchor col1
    const r = deleteColumn(s, 1); // anchor sütunu
    expect(r.cols).toBe(2);
    // kalan eski-üye (eski col2) artık normal, dangling yok
    r.cells.forEach((c) => expect(c.mergedInto).toBeNull());
    assertNoDangling(r);
  });

  it('deleteRow anchor satırını silince üyeler dissolve', () => {
    const s = applyMerge(makeGrid(3, 2), 0, 0, 1, 0); // anchor row0
    const r = deleteRow(s, 0);
    r.cells.forEach((c) => expect(c.mergedInto).toBeNull());
    assertNoDangling(r);
  });
});

// ─── (g) dangling-yokluğu — rastgele dizi ───────────────────────────────────────

describe('dangling-yokluğu (fuzz)', () => {
  it('rastgele insert/delete dizisi sonrası invariant korunur', () => {
    let s = applyMerge(makeGrid(4, 4), 1, 1, 2, 2); // ortada 2×2 merge
    s = applyMerge(s, 0, 0, 0, 1); // üstte 1×2 yatay merge
    const seq: Array<(g: GridState) => GridState> = [
      (g) => insertColumn(g, 2),
      (g) => deleteRow(g, 0),
      (g) => insertRow(g, 1),
      (g) => deleteColumn(g, 1),
      (g) => insertColumn(g, 0),
      (g) => deleteColumn(g, g.cols - 1),
      (g) => insertRow(g, g.rows),
      (g) => deleteRow(g, 1),
    ];
    for (const op of seq) {
      s = op(s);
      expect(s.cells.length).toBe(s.rows * s.cols);
      assertNoDangling(s);
    }
  });
});

// ─── (h) fraction senkronu ──────────────────────────────────────────────────────

describe('fraction senkronu', () => {
  it('insertColumn → colFractions o konuma değer ekler, uzunluk=cols', () => {
    const s = makeGrid(2, 3, true); // colFr [1,2,3]
    const r = insertColumn(s, 1);
    expect(r.colFractions).toEqual([1, 1, 2, 3]);
    expect(r.colFractions!.length).toBe(r.cols);
    expect(r.rowFractions).toEqual([1, 2]); // dokunulmaz
  });

  it('deleteColumn → colFractions o indeksi çıkarır', () => {
    const s = makeGrid(2, 3, true);
    const r = deleteColumn(s, 0);
    expect(r.colFractions).toEqual([2, 3]);
    expect(r.colFractions!.length).toBe(r.cols);
  });

  it('insert/deleteRow → rowFractions senkron', () => {
    const s = makeGrid(3, 2, true); // rowFr [1,2,3]
    expect(insertRow(s, 1).rowFractions).toEqual([1, 1, 2, 3]);
    expect(deleteRow(s, 2).rowFractions).toEqual([1, 2]);
  });

  it('fraction tanımsız → undefined kalır (eski modül)', () => {
    const s = makeGrid(2, 3); // fraction yok
    const r = insertColumn(s, 1);
    expect(r.colFractions).toBeUndefined();
    expect(r.rowFractions).toBeUndefined();
  });
});

// ─── (i) mergeCells / splitCell ─────────────────────────────────────────────────

describe('mergeCells / splitCell', () => {
  it('mergeCells dikdörtgen-dışı seçim → bounding-box dolar (normalize)', () => {
    const s = makeGrid(3, 3);
    // sadece köşeler seçili → box tüm 3×3'ü kapsamalı
    const r = mergeCells(s, [at(s, 0, 0).id, at(s, 2, 2).id]);
    const anchor = at(r, 0, 0);
    expect(anchor.colSpan).toBe(3);
    expect(anchor.rowSpan).toBe(3);
    // kalan 8 göze hidden+mergedInto=anchor
    r.cells.slice(1).forEach((c) => {
      expect(c.hidden).toBe(true);
      expect(c.mergedInto).toBe(anchor.id);
    });
    assertNoDangling(r);
  });

  it('mergeCells <2 seçim → no-op', () => {
    const s = makeGrid(2, 2);
    const r = mergeCells(s, [at(s, 0, 0).id]);
    r.cells.forEach((c) => {
      expect(c.colSpan).toBe(1);
      expect(c.mergedInto).toBeNull();
    });
  });

  it('splitCell tam dissolve', () => {
    const merged = mergeCells(makeGrid(3, 3), [at(makeGrid(3, 3), 0, 0).id, at(makeGrid(3, 3), 1, 1).id]);
    const anchorId = merged.cells.find((c) => c.colSpan > 1)!.id;
    const r = splitCell(merged, anchorId);
    r.cells.forEach((c) => {
      expect(c.colSpan).toBe(1);
      expect(c.rowSpan).toBe(1);
      expect(c.hidden).toBe(false);
      expect(c.mergedInto).toBeNull();
    });
  });
});

// ─── (j) resizeGridTo ───────────────────────────────────────────────────────────

describe('resizeGridTo', () => {
  it('büyüt: boyut + mevcut içerik tail konumda korunur', () => {
    const s = makeGrid(2, 2); // c0 c1 / c2 c3
    const r = resizeGridTo(s, 3, 4);
    expect(r.rows).toBe(3);
    expect(r.cols).toBe(4);
    expect(r.cells.length).toBe(12);
    expect([at(r, 0, 0).text, at(r, 0, 1).text]).toEqual(['c0', 'c1']);
    expect([at(r, 1, 0).text, at(r, 1, 1).text]).toEqual(['c2', 'c3']);
  });

  it('küçült: tail kesilir', () => {
    const s = makeGrid(3, 4);
    const r = resizeGridTo(s, 2, 2);
    expect(r.rows).toBe(2);
    expect(r.cols).toBe(2);
    expect(r.cells.length).toBe(4);
    expect([at(r, 0, 0).text, at(r, 0, 1).text]).toEqual(['c0', 'c1']);
  });

  it('merge-aware büyüt: merge korunur, fraction senkron', () => {
    const s = applyMerge(makeGrid(2, 2, true), 0, 0, 0, 1); // yatay merge
    const r = resizeGridTo(s, 3, 3);
    expect(r.cols).toBe(3);
    expect(r.colFractions!.length).toBe(3);
    expect(r.rowFractions!.length).toBe(3);
    assertNoDangling(r);
  });
});

// ─── primitive'ler ──────────────────────────────────────────────────────────────

describe('primitive yardımcılar', () => {
  it('nextCellId mevcut max suffix +1, çakışmasız', () => {
    const cells = [makeCell('banner-inst-0'), makeCell('banner-inst-5')];
    expect(nextCellId(cells)).toBe('banner-inst-6');
  });

  it('nextCellId parse-edilemez id ile güvenli', () => {
    const cells = [makeCell('banner-inst-x'), makeCell('custom-id')];
    expect(nextCellId(cells)).toBe('banner-inst-0');
  });

  it('makeCell kanonik varsayılan (stil mirası YOK), içerik boş', () => {
    const c = makeCell('new');
    // nötr bgColor + varsayılan border + varsayılan font — komşudan miras değil (item 8)
    expect(c.bgColor).toEqual({ type: 'solid', color: '#ffffff', opacity: 100 });
    expect(c.border).toEqual({ t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: '#e2e8f0', o: 100 }, style: 'solid' });
    expect(c.padding).toEqual({ t: 0, r: 0, b: 0, l: 0, linked: true });
    expect(c.text).toBe('');
    expect(c.colSpan).toBe(1);
    expect(c.hidden).toBe(false);
    expect(c.mergedInto).toBeNull();
  });

  it('normalizeMerges dangling mergedInto → dissolve', () => {
    const s = makeGrid(2, 2);
    // elle bozuk: hücreye olmayan anchor a bağla
    s.cells[1] = { ...s.cells[1], hidden: true, mergedInto: 'yok-anchor' };
    const r = normalizeMerges(s);
    expect(r.cells[1].hidden).toBe(false);
    expect(r.cells[1].mergedInto).toBeNull();
  });

  it('normalizeMerges grid-dışı span → clamp', () => {
    const s = makeGrid(2, 2);
    s.cells[0] = { ...s.cells[0], colSpan: 5, rowSpan: 1 }; // 5 > cols
    const r = normalizeMerges(s);
    // clamp 2'ye → anchor box (0,0)-(0,1); (0,1) hidden
    expect(r.cells[0].colSpan).toBe(2);
    expect(at(r, 0, 1).hidden).toBe(true);
    assertNoDangling(r);
  });
});
