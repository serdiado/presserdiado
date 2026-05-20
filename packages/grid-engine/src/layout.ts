// Layout engine for the rich studio data model.
// Recomputes grid positions (CSS grid line indices) and global product numbering
// across all formas/pages, accounting for colSpan/rowSpan and hidden slots.

import type { StudioForma, StudioSlot } from '@matbaapro/shared';

export interface DefaultGrid {
  rows: number;
  cols: number;
}

function clone<T>(value: T): T {
  const sc = (globalThis as { structuredClone?: <V>(v: V) => V }).structuredClone;
  return sc ? sc(value) : (JSON.parse(JSON.stringify(value)) as T);
}

/**
 * Recompute slot positions and global product numbers for the entire document.
 * Returns a new array of formas; does not mutate the input.
 *
 * Algorithm:
 *   - For each page, walk slots in order. Each slot is placed in the next
 *     available cell that fits its colSpan x rowSpan rectangle.
 *   - Hidden slots (merged-into another) are skipped.
 *   - After placement, slots are numbered globally across all pages (sorted
 *     by pageNumber) so each visible product slot gets a unique sequence.
 */
export function recalculateLayout(
  formas: StudioForma[],
  defaultGrid: DefaultGrid,
): StudioForma[] {
  const next = clone(formas);

  for (const forma of next) {
    for (const page of forma.pages) {
      const totalCols = page.gridSettings?.cols ?? defaultGrid.cols;
      const occupied: boolean[][] = [];
      let cursorRow = 0;
      let cursorCol = 0;

      for (const slot of page.slots) {
        if (slot.hidden) {
          slot.gridPosition = undefined;
          slot.globalNumber = undefined;
          continue;
        }

        let placed = false;
        let placedRow = cursorRow;
        let placedCol = cursorCol;

        while (!placed) {
          if (!occupied[cursorRow]) occupied[cursorRow] = [];

          if (!occupied[cursorRow][cursorCol]) {
            const fits = canFit(
              occupied,
              cursorRow,
              cursorCol,
              slot.colSpan,
              slot.rowSpan,
              totalCols,
            );
            if (fits) {
              markOccupied(
                occupied,
                cursorRow,
                cursorCol,
                slot.colSpan,
                slot.rowSpan,
              );
              placedRow = cursorRow;
              placedCol = cursorCol;
              placed = true;
            }
          }

          if (!placed) {
            cursorCol += 1;
            if (cursorCol >= totalCols) {
              cursorCol = 0;
              cursorRow += 1;
            }
          }
        }

        slot.gridPosition = {
          colStart: placedCol + 1,
          rowStart: placedRow + 1,
        };
      }
    }
  }

  // Global numbering across all pages, sorted by logical page number.
  const allPages = next
    .flatMap((f) => f.pages)
    .sort((a, b) => a.pageNumber - b.pageNumber);

  let counter = 1;
  for (const page of allPages) {
    for (const slot of page.slots) {
      if (!slot.hidden && slot.role === 'product') {
        slot.globalNumber = counter++;
      } else {
        slot.globalNumber = undefined;
      }
    }
  }

  return next;
}

function canFit(
  occupied: boolean[][],
  row: number,
  col: number,
  colSpan: number,
  rowSpan: number,
  totalCols: number,
): boolean {
  if (col + colSpan > totalCols) return false;
  for (let r = 0; r < rowSpan; r++) {
    if (!occupied[row + r]) occupied[row + r] = [];
    for (let c = 0; c < colSpan; c++) {
      if (occupied[row + r][col + c]) return false;
    }
  }
  return true;
}

function markOccupied(
  occupied: boolean[][],
  row: number,
  col: number,
  colSpan: number,
  rowSpan: number,
): void {
  for (let r = 0; r < rowSpan; r++) {
    if (!occupied[row + r]) occupied[row + r] = [];
    for (let c = 0; c < colSpan; c++) {
      occupied[row + r][col + c] = true;
    }
  }
}

/**
 * Validate that a set of selected studio slots forms a contiguous rectangle
 * (accounting for colSpan/rowSpan). Returns the merged colSpan/rowSpan or null.
 */
export function validateMergeSelection(
  slots: StudioSlot[],
): { colSpan: number; rowSpan: number; topLeftId: string } | null {
  if (slots.length < 2) return null;

  const positioned = slots.filter((s) => s.gridPosition && !s.hidden);
  if (positioned.length !== slots.length) return null;

  let minCol = Infinity;
  let minRow = Infinity;
  let maxCol = -Infinity;
  let maxRow = -Infinity;
  let totalArea = 0;

  for (const s of positioned) {
    const pos = s.gridPosition!;
    minCol = Math.min(minCol, pos.colStart);
    minRow = Math.min(minRow, pos.rowStart);
    maxCol = Math.max(maxCol, pos.colStart + s.colSpan - 1);
    maxRow = Math.max(maxRow, pos.rowStart + s.rowSpan - 1);
    totalArea += s.colSpan * s.rowSpan;
  }

  const colSpan = maxCol - minCol + 1;
  const rowSpan = maxRow - minRow + 1;
  if (colSpan * rowSpan !== totalArea) return null;

  const topLeft = positioned.find(
    (s) =>
      s.gridPosition!.colStart === minCol && s.gridPosition!.rowStart === minRow,
  );
  if (!topLeft) return null;

  return { colSpan, rowSpan, topLeftId: topLeft.id };
}

/**
 * Compute the slot count for a page based on its grid settings.
 */
export function slotsPerPage(grid: DefaultGrid): number {
  return grid.rows * grid.cols;
}
