// Banner/tablo ızgarası — SAF yapısal motor (satır/sütun ekle-sil + merge).
// Store/UI bağımlılığı YOK (yalnız BannerCellData tipi + saf fraction helper'ları) → cycle yok,
// Vitest'lenebilir. cells düz row-major dizi: idx = row*cols + col; konum implicit.
//
// SAFLIK SÖZLEŞMESİ (kritik): Girdideki HİÇBİR hücre nesnesi mutate EDİLMEZ. newCells'e konan her
// hücre ya taze makeCell ya da mevcut hücrenin spread klonudur — asla doğrudan referans. Span/hidden/
// mergedInto değişiklikleri mutasyonla değil spread-override ile ({ ...cell, colSpan: cs+1 }). Aksi
// halde aliaslı nesne mutasyonu store state / undo snapshot'ını bozar → Ctrl+Z kırılır.

import type { BannerCellData } from './types';
import { insertFraction, removeFraction } from './fractions';

export interface GridState {
  cells: BannerCellData[];
  rows: number;
  cols: number;
  colFractions?: number[];
  rowFractions?: number[];
}

const ID_PREFIX = 'banner-inst-';

/** Mevcut `banner-inst-N` eklerinin en büyüğü (parse edilemeyenler atlanır). Yoksa -1. */
function maxSuffix(cells: BannerCellData[]): number {
  let max = -1;
  for (const c of cells) {
    if (!c.id.startsWith(ID_PREFIX)) continue;
    const n = parseInt(c.id.slice(ID_PREFIX.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max;
}

/** Tek seferlik benzersiz id (mevcutlarla çakışmaz). mergedInto referansları için kritik. */
export function nextCellId(cells: BannerCellData[]): string {
  const used = new Set(cells.map((c) => c.id));
  let n = maxSuffix(cells) + 1;
  let id = `${ID_PREFIX}${n}`;
  while (used.has(id)) id = `${ID_PREFIX}${++n}`;
  return id;
}

/** Çoklu ekleme için benzersiz id üreteci (mevcutlar + üretilenler arasında çakışmasız). */
function makeIdGen(cells: BannerCellData[]): () => string {
  const used = new Set(cells.map((c) => c.id));
  let n = maxSuffix(cells) + 1;
  return () => {
    let id = `${ID_PREFIX}${n++}`;
    while (used.has(id)) id = `${ID_PREFIX}${n++}`;
    used.add(id);
    return id;
  };
}

/**
 * Kanonik boş banner hücresi — TEK KAYNAK. module-registry bannerInit + makeCell buradan beslenir
 * (ikisi drift etmez). id hariç tüm alanlar sabit: varsayılan font/padding, nötr bgColor (beyaz),
 * varsayılan border. Yeni hücre ASLA komşudan stil miras ALMAZ (item 8 — zemin/çerçeve sızıntısı yok).
 */
export function defaultBannerCell(id: string): BannerCellData {
  return {
    id,
    text: '',
    colSpan: 1,
    rowSpan: 1,
    hidden: false,
    mergedInto: null,
    font: {
      fontFamily: 'Inter',
      fontWeight: '700',
      fontSize: 14,
      lineHeight: 1.2,
      letterSpacing: 0,
      textAlign: 'center',
      verticalAlign: 'middle',
      textTransform: 'none',
      textDecoration: 'none',
      color: '#1e293b',
      opacity: 100,
      decimalScale: 100,
    },
    padding: { t: 0, r: 0, b: 0, l: 0, linked: true },
    bgColor: { type: 'solid', color: '#ffffff', opacity: 100 },
    border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: '#e2e8f0', o: 100 }, style: 'solid' },
    image: null,
  };
}

/** Taze hücre = kanonik varsayılan + benzersiz id. Stil mirası YOK (item 8). İçerik boş, span 1, merge'siz. */
export function makeCell(id: string): BannerCellData {
  return defaultBannerCell(id);
}

export interface MergeBox {
  id: string;
  r: number;
  c: number;
  cs: number;
  rs: number;
}

/** Anchor'lar: mergedInto==null && (colSpan>1 || rowSpan>1). Konum row-major idx'ten. */
export function getMergeBoxes(cells: BannerCellData[], cols: number): MergeBox[] {
  const boxes: MergeBox[] = [];
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (cell.mergedInto == null && (cell.colSpan > 1 || cell.rowSpan > 1)) {
      boxes.push({
        id: cell.id,
        r: Math.floor(i / cols),
        c: i % cols,
        cs: cell.colSpan,
        rs: cell.rowSpan,
      });
    }
  }
  return boxes;
}

/**
 * Merge tutarlılık güvenlik ağı + dangling-önleme. Tam yeniden-türetir:
 *  1) anchor box'larını grid sınırına clamp et; 1×1'e çökeni at (artık geçerli anchor değil).
 *  2) her geçerli anchor'ın box'ındaki anchor-olmayan gözeleri hidden+mergedInto yap.
 *  3) "anchor yok" = "X artık span>1 geçerli bir anchor değil": mergedInto=X olan göze, X geçerli
 *     anchor değilse VEYA göze X'in box'ı dışındaysa → dissolve (hidden:false, mergedInto:null, span 1).
 * Çıktıdaki her hücre yeni nesne (spread). Girdi mutate edilmez.
 */
export function normalizeMerges(s: GridState): GridState {
  const { cells, rows, cols } = s;
  const boxes = getMergeBoxes(cells, cols)
    .map((b) => ({
      ...b,
      cs: Math.max(1, Math.min(b.cs, cols - b.c)),
      rs: Math.max(1, Math.min(b.rs, rows - b.r)),
    }))
    .filter((b) => b.cs > 1 || b.rs > 1);

  const anchorSpanByIndex = new Map<number, { cs: number; rs: number }>();
  const coverAnchorByIndex = new Array<string | null>(cells.length).fill(null);
  for (const b of boxes) {
    const anchorIdx = b.r * cols + b.c;
    anchorSpanByIndex.set(anchorIdx, { cs: b.cs, rs: b.rs });
    for (let rr = b.r; rr < b.r + b.rs; rr++) {
      for (let cc = b.c; cc < b.c + b.cs; cc++) {
        const idx = rr * cols + cc;
        if (idx === anchorIdx) continue;
        coverAnchorByIndex[idx] = b.id;
      }
    }
  }

  const next = cells.map((cell, idx) => {
    const span = anchorSpanByIndex.get(idx);
    if (span) {
      return { ...cell, colSpan: span.cs, rowSpan: span.rs, hidden: false, mergedInto: null };
    }
    const anchorId = coverAnchorByIndex[idx];
    if (anchorId != null) {
      return { ...cell, colSpan: 1, rowSpan: 1, hidden: true, mergedInto: anchorId };
    }
    return { ...cell, colSpan: 1, rowSpan: 1, hidden: false, mergedInto: null };
  });

  return { ...s, cells: next };
}

/** Sütun ekle: yeni sütunun indeksi atCol (0..cols). Per-satır insert → row-major doğru remap. */
export function insertColumn(s: GridState, atCol: number): GridState {
  const { cells, rows, cols } = s;
  const at = Math.max(0, Math.min(cols, atCol));
  const gen = makeIdGen(cells);
  const newCols = cols + 1;
  const newCells = new Array<BannerCellData>(rows * newCols);
  for (let r = 0; r < rows; r++) {
    for (let nc = 0; nc < newCols; nc++) {
      const dst = r * newCols + nc;
      if (nc < at) newCells[dst] = { ...cells[r * cols + nc] };
      else if (nc === at) newCells[dst] = makeCell(gen());
      else newCells[dst] = { ...cells[r * cols + (nc - 1)] };
    }
  }
  // Merge yatay genişletme: insert box'ı içeriden deliyorsa anchor colSpan+1 (normalize hidden'ı koyar).
  for (const b of getMergeBoxes(cells, cols)) {
    if (b.c < at && at <= b.c + b.cs - 1) {
      const aIdx = newCells.findIndex((c) => c.id === b.id);
      if (aIdx >= 0) newCells[aIdx] = { ...newCells[aIdx], colSpan: newCells[aIdx].colSpan + 1 };
    }
  }
  return normalizeMerges({
    cells: newCells,
    rows,
    cols: newCols,
    colFractions: insertFraction(s.colFractions, at, 1),
    rowFractions: s.rowFractions,
  });
}

/** Sütun sil (cols>1 guard). Survivor col!==atCol; srcCol = nc<atCol ? nc : nc+1. */
export function deleteColumn(s: GridState, atCol: number): GridState {
  const { cells, rows, cols } = s;
  if (cols <= 1) return normalizeMerges({ ...s, cells: cells.map((c) => ({ ...c })) });
  const at = Math.max(0, Math.min(cols - 1, atCol));
  const newCols = cols - 1;
  const newCells = new Array<BannerCellData>(rows * newCols);
  for (let r = 0; r < rows; r++) {
    for (let nc = 0; nc < newCols; nc++) {
      const srcCol = nc < at ? nc : nc + 1;
      newCells[r * newCols + nc] = { ...cells[r * cols + srcCol] };
    }
  }
  // Merge: anchor sütunu silindiyse (b.c===at) anchor cell yok → üyeler normalize'da dissolve.
  // Anchor kaldı ama atCol box içindeyse colSpan-1.
  for (const b of getMergeBoxes(cells, cols)) {
    if (b.c === at) continue;
    if (b.c < at && at <= b.c + b.cs - 1) {
      const aIdx = newCells.findIndex((c) => c.id === b.id);
      if (aIdx >= 0)
        newCells[aIdx] = { ...newCells[aIdx], colSpan: Math.max(1, newCells[aIdx].colSpan - 1) };
    }
  }
  return normalizeMerges({
    cells: newCells,
    rows,
    cols: newCols,
    colFractions: removeFraction(s.colFractions, at),
    rowFractions: s.rowFractions,
  });
}

/** Satır ekle: yeni satırın indeksi atRow (0..rows). Sütun-ekseninin birebir aynası. */
export function insertRow(s: GridState, atRow: number): GridState {
  const { cells, rows, cols } = s;
  const at = Math.max(0, Math.min(rows, atRow));
  const gen = makeIdGen(cells);
  const head = cells.slice(0, at * cols).map((c) => ({ ...c }));
  const tail = cells.slice(at * cols).map((c) => ({ ...c }));
  const rowCells = Array.from({ length: cols }, () => makeCell(gen()));
  const newCells = [...head, ...rowCells, ...tail];
  // Merge dikey genişletme: insert box'ı içeriden deliyorsa anchor rowSpan+1.
  for (const b of getMergeBoxes(cells, cols)) {
    if (b.r < at && at <= b.r + b.rs - 1) {
      const aIdx = newCells.findIndex((c) => c.id === b.id);
      if (aIdx >= 0) newCells[aIdx] = { ...newCells[aIdx], rowSpan: newCells[aIdx].rowSpan + 1 };
    }
  }
  return normalizeMerges({
    cells: newCells,
    rows: rows + 1,
    cols,
    colFractions: s.colFractions,
    rowFractions: insertFraction(s.rowFractions, at, 1),
  });
}

/** Satır sil (rows>1 guard). Sütun-silmenin satır-ekseni aynası. */
export function deleteRow(s: GridState, atRow: number): GridState {
  const { cells, rows, cols } = s;
  if (rows <= 1) return normalizeMerges({ ...s, cells: cells.map((c) => ({ ...c })) });
  const at = Math.max(0, Math.min(rows - 1, atRow));
  const newCells = [...cells.slice(0, at * cols), ...cells.slice((at + 1) * cols)].map((c) => ({
    ...c,
  }));
  for (const b of getMergeBoxes(cells, cols)) {
    if (b.r === at) continue; // anchor satırı silindi → üyeler dissolve (normalize)
    if (b.r < at && at <= b.r + b.rs - 1) {
      const aIdx = newCells.findIndex((c) => c.id === b.id);
      if (aIdx >= 0)
        newCells[aIdx] = { ...newCells[aIdx], rowSpan: Math.max(1, newCells[aIdx].rowSpan - 1) };
    }
  }
  return normalizeMerges({
    cells: newCells,
    rows: rows - 1,
    cols,
    colFractions: s.colFractions,
    rowFractions: removeFraction(s.rowFractions, at),
  });
}

/** Hücre birleştir: bounding-box, anchor=sol-üst, kutu-içi hidden+mergedInto. */
export function mergeCells(s: GridState, cellIds: string[]): GridState {
  const { cells, cols } = s;
  const idSet = new Set(cellIds);
  const positions = cells
    .map((c, i) => ({ id: c.id, i }))
    .filter((p) => idSet.has(p.id))
    .map((p) => ({ row: Math.floor(p.i / cols), col: p.i % cols }));
  if (positions.length < 2) return normalizeMerges({ ...s, cells: cells.map((c) => ({ ...c })) });

  const minRow = Math.min(...positions.map((p) => p.row));
  const maxRow = Math.max(...positions.map((p) => p.row));
  const minCol = Math.min(...positions.map((p) => p.col));
  const maxCol = Math.max(...positions.map((p) => p.col));
  const masterId = cells[minRow * cols + minCol].id;

  const newCells = cells.map((cell, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    if (cell.id === masterId)
      return {
        ...cell,
        colSpan: maxCol - minCol + 1,
        rowSpan: maxRow - minRow + 1,
        hidden: false,
        mergedInto: null,
      };
    if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol)
      return { ...cell, colSpan: 1, rowSpan: 1, hidden: true, mergedInto: masterId };
    return { ...cell };
  });
  return normalizeMerges({ ...s, cells: newCells });
}

/** Hücre ayır: anchor + üyeleri (mergedInto===anchorId) tamamen dissolve. */
export function splitCell(s: GridState, anchorId: string): GridState {
  const newCells = s.cells.map((cell) => {
    if (cell.id === anchorId)
      return { ...cell, colSpan: 1, rowSpan: 1, hidden: false, mergedInto: null };
    if (cell.mergedInto === anchorId)
      return { ...cell, colSpan: 1, rowSpan: 1, hidden: false, mergedInto: null };
    return { ...cell };
  });
  return normalizeMerges({ ...s, cells: newCells });
}

/** Sayısal yol: hedefe dek tail'de insert/delete döngüsü (merge-aware + fraction-senkron). */
export function resizeGridTo(s: GridState, rows: number, cols: number): GridState {
  const tCols = Math.max(1, cols);
  const tRows = Math.max(1, rows);
  let cur = s;
  while (cur.cols < tCols) cur = insertColumn(cur, cur.cols);
  while (cur.cols > tCols) cur = deleteColumn(cur, cur.cols - 1);
  while (cur.rows < tRows) cur = insertRow(cur, cur.rows);
  while (cur.rows > tRows) cur = deleteRow(cur, cur.rows - 1);
  return cur;
}
