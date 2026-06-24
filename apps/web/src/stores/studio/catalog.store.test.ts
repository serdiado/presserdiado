import { describe, it, expect, beforeEach } from 'vitest';
import type { StudioForma } from '@matbaapro/shared';
import { useCatalogStore } from './catalog.store';
import { useHistoryStore } from './history.store';
import { clone, deepEqual, initialGlobalSettings } from './defaults';
import { defaultFooterModule } from './footerSlot';

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

// clearSlotToPool: tek "boşalt/temizle" action'ı (eski clearSlot + moveSlotToTempPool birleşti).
// REGRESYON sözleşmesi: ürün YOK EDİLMEZ → tempProductPool'a gider; slot ürün hücresi olarak kalır.
describe('clearSlotToPool', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
    useCatalogStore.setState({ tempProductPool: [] });
  });

  function setupProductSlot() {
    useCatalogStore.setState({
      activeFormaId: 1,
      tempProductPool: [],
      formas: [
        {
          id: 1,
          name: 'f',
          pageMergeGroups: [],
          pages: [
            {
              id: 'p1',
              pageNumber: 1,
              footerMode: 'global',
              slots: [
                {
                  id: 'slot-1',
                  colSpan: 1,
                  rowSpan: 1,
                  hidden: false,
                  mergedInto: null,
                  role: 'product',
                  product: { sku: 'SKU1', name: 'Ürün 1' },
                },
              ],
            },
          ],
        },
      ] as unknown as StudioForma[],
    });
  }

  const slot1 = () => useCatalogStore.getState().getActivePages()[0].slots[0];
  const pool = () => useCatalogStore.getState().tempProductPool;

  it('ürünü havuza atar — YOK ETMEZ; slot boşalır, ürün hücresi kalır', () => {
    setupProductSlot();
    useCatalogStore.getState().clearSlotToPool(1, 'slot-1');

    // Slot boşaldı ama hâlâ ürün hücresi (role korunur)
    expect(slot1().product).toBeNull();
    expect(slot1().role).toBe('product');

    // Ürün YOK OLMADI → havuzda, origin işaretleriyle (geri-getir için)
    expect(pool()).toHaveLength(1);
    expect(pool()[0].sku).toBe('SKU1');
    expect(pool()[0].originalPage).toBe(1);
    expect(pool()[0].originalSlotId).toBe('slot-1');
  });

  it('tek undo adımı; Ctrl+Z ürünü slota geri getirir, havuzu boşaltır', () => {
    setupProductSlot();
    const before = useHistoryStore.getState().past.length;

    useCatalogStore.getState().clearSlotToPool(1, 'slot-1');
    expect(useHistoryStore.getState().past.length).toBe(before + 1);

    useHistoryStore.getState().undo();
    expect(slot1().product?.sku).toBe('SKU1');
    expect(pool()).toHaveLength(0);
  });
});

// resetFooterToDefault: footer'ı FABRİKA varsayılanına döndürür (defaultFooterModule +
// initialGlobalSettings.footer). NOT: revert/global'e dönüş DEĞİL — page scope custom KALIR.
describe('resetFooterToDefault', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
  });

  it("scope='global': footerModule + height fabrika default'una döner; undo geri alır", () => {
    // Bozulmuş global footer (cols + height default'tan farklı)
    useCatalogStore.setState({
      globalSettings: {
        ...clone(initialGlobalSettings),
        footerModule: { ...defaultFooterModule(), cols: 3 },
        footer: { heightMm: 40 },
      },
    });

    useCatalogStore.getState().resetFooterToDefault('global');

    const gs = useCatalogStore.getState().globalSettings;
    expect(deepEqual(gs.footerModule, defaultFooterModule())).toBe(true);
    expect(gs.footer.heightMm).toBe(initialGlobalSettings.footer.heightMm);

    // Undo bozuk durumu geri getirir
    useHistoryStore.getState().undo();
    const after = useCatalogStore.getState().globalSettings;
    expect((after.footerModule as { cols: number }).cols).toBe(3);
    expect(after.footer.heightMm).toBe(40);
  });

  it("scope=pageNumber: custom footer default'a döner, footerMode='custom' KALIR; undo geri alır", () => {
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
              footerMode: 'custom',
              footerOverride: { module: { ...defaultFooterModule(), cols: 3 }, heightMm: 40 },
              slots: [],
            },
          ],
        },
      ] as unknown as StudioForma[],
    });

    useCatalogStore.getState().resetFooterToDefault(1);

    const page = useCatalogStore.getState().getActivePages()[0];
    expect(page.footerMode).toBe('custom'); // custom KALIR (revert değil)
    expect(deepEqual(page.footerOverride!.module, defaultFooterModule())).toBe(true);
    expect(page.footerOverride!.heightMm).toBe(initialGlobalSettings.footer.heightMm);

    // Undo bozuk custom durumu geri getirir
    useHistoryStore.getState().undo();
    const reverted = useCatalogStore.getState().getActivePages()[0];
    expect((reverted.footerOverride!.module as { cols: number }).cols).toBe(3);
    expect(reverted.footerOverride!.heightMm).toBe(40);
  });
});

// setSlotModule A-fix regresyon: ürünlü slotta modül eklerken ürün YOK EDİLMEZ → havuza gider.
// Latent bug: slot.product = null (havuza yazılmadan) → kalıcı kayıp. Fix: havuza-at-önce.
describe('setSlotModule — A-fix (ürün havuza, kaybolmaz)', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
    useCatalogStore.setState({ tempProductPool: [] });
    useCatalogStore.setState({
      activeFormaId: 1,
      tempProductPool: [],
      formas: [
        {
          id: 1,
          name: 'f',
          pageMergeGroups: [],
          pages: [
            {
              id: 'p1',
              pageNumber: 1,
              footerMode: 'global',
              slots: [
                {
                  id: 'slot-1',
                  colSpan: 1,
                  rowSpan: 1,
                  hidden: false,
                  mergedInto: null,
                  role: 'product',
                  product: { sku: 'SKU1', name: 'Ürün 1' },
                },
              ],
            },
          ],
        },
      ] as unknown as StudioForma[],
    });
  });

  const slot1 = () => useCatalogStore.getState().getActivePages()[0].slots[0];
  const pool = () => useCatalogStore.getState().tempProductPool;

  it('ürünlü slot → setSlotModule → ürün havuzda, slot free+banner, ürün YOK OLMADI', () => {
    useCatalogStore.getState().setSlotModule(1, 'slot-1', 'banner');

    expect(slot1().role).toBe('free');
    expect(slot1().moduleType).toBe('banner');
    expect(slot1().product).toBeNull();

    expect(pool()).toHaveLength(1);
    expect(pool()[0].sku).toBe('SKU1');
    expect(pool()[0].originalPage).toBe(1);
    expect(pool()[0].originalSlotId).toBe('slot-1');
  });

  it('tek undo adımı: Ctrl+Z → ürün slota döner, havuz boşalır', () => {
    const before = useHistoryStore.getState().past.length;
    useCatalogStore.getState().setSlotModule(1, 'slot-1', 'banner');
    expect(useHistoryStore.getState().past.length).toBe(before + 1);

    useHistoryStore.getState().undo();
    expect(slot1().product?.sku).toBe('SKU1');
    expect(slot1().role).toBe('product');
    expect(pool()).toHaveLength(0);
  });

  it('zaten serbest slot → ürün zaten null, havuz ETKİLENMEZ', () => {
    useCatalogStore.setState((s) => ({
      ...s,
      formas: s.formas.map((f) => ({
        ...f,
        pages: f.pages.map((p) => ({
          ...p,
          slots: p.slots.map((sl) => ({ ...sl, role: 'free' as const, product: null })),
        })),
      })),
    }));
    useCatalogStore.getState().setSlotModule(1, 'slot-1', 'banner');
    expect(pool()).toHaveLength(0);
  });
});
