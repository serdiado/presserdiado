import type { Slot } from '@matbaapro/shared';
import {
  MAX_GRID_COLS,
  MAX_GRID_ROWS,
  MIN_GRID_COLS,
  MIN_GRID_ROWS,
} from '@matbaapro/shared';

export * from './layout.js';

export interface GridConfig {
  cols: number;
  rows: number;
}

export interface GridCell {
  col: number;
  row: number;
}

export interface GridRect {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

/**
 * Validate grid dimensions are within allowed bounds.
 */
export function validateGrid(config: GridConfig): boolean {
  return (
    config.cols >= MIN_GRID_COLS &&
    config.cols <= MAX_GRID_COLS &&
    config.rows >= MIN_GRID_ROWS &&
    config.rows <= MAX_GRID_ROWS &&
    Number.isInteger(config.cols) &&
    Number.isInteger(config.rows)
  );
}

/**
 * Generate default slots for a grid configuration.
 */
export function generateSlots(
  pageId: string,
  grid: GridConfig,
  idPrefix: string = 'slot',
): Slot[] {
  const slots: Slot[] = [];
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      slots.push({
        id: `${idPrefix}-${pageId}-${row}-${col}`,
        gridPosition: { col, row, colSpan: 1, rowSpan: 1 },
        role: 'global',
        content: null,
        styleOverride: null,
      });
    }
  }
  return slots;
}

/**
 * Check if a set of cells forms a contiguous rectangle.
 */
export function isContiguousRect(cells: GridCell[]): GridRect | null {
  if (cells.length === 0) return null;

  const minCol = Math.min(...cells.map((c) => c.col));
  const maxCol = Math.max(...cells.map((c) => c.col));
  const minRow = Math.min(...cells.map((c) => c.row));
  const maxRow = Math.max(...cells.map((c) => c.row));

  const colSpan = maxCol - minCol + 1;
  const rowSpan = maxRow - minRow + 1;

  if (colSpan * rowSpan !== cells.length) return null;

  // Verify every cell in the rectangle is present
  const cellSet = new Set(cells.map((c) => `${c.col},${c.row}`));
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (!cellSet.has(`${c},${r}`)) return null;
    }
  }

  return { col: minCol, row: minRow, colSpan, rowSpan };
}

/**
 * Build an occupancy map from existing slots.
 * Returns a 2D array where each cell holds the slot ID occupying it, or null.
 */
export function buildOccupancyMap(
  grid: GridConfig,
  slots: Slot[],
): (string | null)[][] {
  const map: (string | null)[][] = Array.from({ length: grid.rows }, () =>
    Array(grid.cols).fill(null),
  );

  for (const slot of slots) {
    const { col, row, colSpan, rowSpan } = slot.gridPosition;
    for (let r = row; r < row + rowSpan && r < grid.rows; r++) {
      for (let c = col; c < col + colSpan && c < grid.cols; c++) {
        map[r][c] = slot.id;
      }
    }
  }

  return map;
}

/**
 * Find all empty cells in a grid given existing slots.
 */
export function findEmptyCells(grid: GridConfig, slots: Slot[]): GridCell[] {
  const map = buildOccupancyMap(grid, slots);
  const empty: GridCell[] = [];

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      if (map[row][col] === null) {
        empty.push({ col, row });
      }
    }
  }

  return empty;
}

/**
 * Calculate pixel dimensions for a slot given page dimensions.
 */
export function slotPixelRect(
  slot: Slot,
  grid: GridConfig,
  pageWidth: number,
  pageHeight: number,
  footerHeightPct: number = 0,
): { x: number; y: number; width: number; height: number } {
  const usableHeight = pageHeight * (1 - footerHeightPct / 100);
  const cellWidth = pageWidth / grid.cols;
  const cellHeight = usableHeight / grid.rows;

  return {
    x: slot.gridPosition.col * cellWidth,
    y: slot.gridPosition.row * cellHeight,
    width: slot.gridPosition.colSpan * cellWidth,
    height: slot.gridPosition.rowSpan * cellHeight,
  };
}
