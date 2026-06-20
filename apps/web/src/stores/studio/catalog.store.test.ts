import { describe, it, expect, beforeEach } from 'vitest';
import type { StudioForma } from '@matbaapro/shared';
import { useCatalogStore } from './catalog.store';
import { useHistoryStore } from './history.store';

// 2.3 — clearBannerCells: seçili hücrelerde İÇERİĞİ (text+image) temizler,
// YAPI (colSpan/rowSpan/hidden/mergedInto) + STİL (font/padding/bgColor/border) korunur.

const STYLE = {
  font: { color: '#112233', fontSize: 14 },
  padding: { t: 1, r: 2, b: 3, l: 4, linked: false },
  bgColor: { type: 'solid', color: '#ff0000', opacity: 100 },
  border: { t: 1, r: 0, b: 0, l: 0, color: '#000000', style: 'solid' },
};

function cell(id: string, over: Record<string, unknown> = {}) {
  return {
    id,
    text: '',
    colSpan: 1,
    rowSpan: 1,
    hidden: false,
    mergedInto: null,
    image: null,
    imageMode: 'contain',
    imagePosX: 0,
    imagePosY: 0,
    imageScale: 100,
    ...STYLE,
    ...over,
  };
}

function setupBanner(cells: Record<string, unknown>[]) {
  useCatalogStore.setState({
    activeFormaId: 1,
    formas: [
      {
        id: 1,
        name: 'f',
        pageMergeGroups: [],
        pages: [
          {
            id: 'p1',
            pageNumber: 1,
            customFooter: null,
            slots: [
              {
                id: 'slot-1',
                colSpan: 1,
                rowSpan: 1,
                hidden: false,
                mergedInto: null,
                role: 'free',
                moduleData: { type: 'banner', rows: 2, cols: 2, cells },
              },
            ],
          },
        ],
      },
    ] as unknown as StudioForma[],
  });
}

function liveCells(): Record<string, unknown>[] {
  const slot = useCatalogStore.getState().getActivePages()[0].slots[0];
  return (slot.moduleData as { cells: Record<string, unknown>[] }).cells;
}
const byId = (id: string) => liveCells().find((c) => c.id === id)!;

describe('clearBannerCells', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
  });

  it('seçili hücrede içeriği temizler; stil ve konum sıfırlanır', () => {
    setupBanner([
      cell('c1', { text: '<b>hi</b>', image: 'data:img', imagePosX: 50, imageScale: 200 }),
      cell('c2', { text: 'keep' }),
    ]);

    useCatalogStore.getState().clearBannerCells('slot-1', ['c1']);

    const c1 = byId('c1');
    expect(c1.text).toBe('');
    expect(c1.image).toBeNull();
    expect(c1.imagePosX).toBe(0);
    expect(c1.imageScale).toBe(100);
    expect(c1.imageMode).toBe('contain');
    // Stil KORUNUR
    expect(c1.font).toEqual(STYLE.font);
    expect(c1.bgColor).toEqual(STYLE.bgColor);
    expect(c1.border).toEqual(STYLE.border);
    expect(c1.padding).toEqual(STYLE.padding);
    // Seçilmeyen hücre dokunulmaz
    expect(byId('c2').text).toBe('keep');
  });

  it('merge anchor: içerik temizlenir, birleşik yapı durur', () => {
    setupBanner([
      cell('a', { text: 'x', colSpan: 2, rowSpan: 1 }),
      cell('b', { hidden: true, mergedInto: 'a' }),
    ]);

    useCatalogStore.getState().clearBannerCells('slot-1', ['a']);

    const a = byId('a');
    expect(a.text).toBe('');
    expect(a.colSpan).toBe(2); // YAPI korunur
    expect(a.rowSpan).toBe(1);
    const b = byId('b');
    expect(b.hidden).toBe(true);
    expect(b.mergedInto).toBe('a');
  });

  it('zaten boş hücrelerde no-op: history adımı oluşturmaz', () => {
    setupBanner([cell('c1'), cell('c2')]);
    const before = useHistoryStore.getState().past.length;

    useCatalogStore.getState().clearBannerCells('slot-1', ['c1', 'c2']);

    expect(useHistoryStore.getState().past.length).toBe(before);
  });

  it('atomik: tek undo adımı; Ctrl+Z içeriği geri getirir', () => {
    setupBanner([cell('c1', { text: 'orig' })]);
    const before = useHistoryStore.getState().past.length;

    useCatalogStore.getState().clearBannerCells('slot-1', ['c1']);

    expect(useHistoryStore.getState().past.length).toBe(before + 1);
    expect(byId('c1').text).toBe('');

    useHistoryStore.getState().undo();
    expect(byId('c1').text).toBe('orig');
  });

  it('boş seçim / bilinmeyen slot → güvenli no-op', () => {
    setupBanner([cell('c1', { text: 'x' })]);
    useCatalogStore.getState().clearBannerCells('slot-1', []);
    expect(byId('c1').text).toBe('x');
    useCatalogStore.getState().clearBannerCells('yok', ['c1']);
    expect(byId('c1').text).toBe('x');
  });
});
