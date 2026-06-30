import { describe, it, expect, beforeEach } from 'vitest';
import type { StudioForma, StudioSlot } from '@matbaapro/shared';
import { Template1 } from '@matbaapro/shared';
import { recalculateLayout } from '@matbaapro/grid-engine';
import { useCatalogStore, productSlotsInOrder } from './catalog.store';
import { useHistoryStore } from './history.store';
import { useUIStore } from './ui.store';
import { clone, deepEqual, initialGlobalSettings, buildFormasForTemplate } from './defaults';
import { defaultFooterModule } from './footerSlot';
import { rowToProduct } from '../../features/studio/panels/parseProductRow';

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

// mergeSelected — anchor içerik kuralı: anchor (sağ-tıklanan) içeriği korunur; diğerleri elden çıkar.
// İlke: ürün asla yok edilmez (havuza), modül yok edilebilir (sessizce silinir). Survivor (geometrik
// sol-üst) anchor'ın TÜM içeriğini benimser → modül+ürün'de eski "boş hücre" bug'ı kapanır.
describe('mergeSelected — anchor içerik kuralı (modül/ürün)', () => {
  const MODULE = { type: 'banner', cells: [{ id: 'c1' }] };

  function setupMerge(slots: Partial<StudioSlot>[]) {
    useHistoryStore.getState().clearHistory();
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
              slots: slots.map((s, i) => ({
                id: `s${i + 1}`,
                colSpan: 1,
                rowSpan: 1,
                hidden: false,
                mergedInto: null,
                role: 'product',
                product: null,
                ...s,
              })),
            },
          ],
        },
      ] as unknown as StudioForma[],
    });
  }

  const moduleSlot = (over: Partial<StudioSlot> = {}): Partial<StudioSlot> => ({
    role: 'free', moduleType: 'banner', moduleData: MODULE, isCustom: true, product: null, ...over,
  });
  const productSlot = (sku: string, over: Partial<StudioSlot> = {}): Partial<StudioSlot> => ({
    role: 'product', product: { sku, name: sku } as never, ...over,
  });

  const byId = (id: string) =>
    useCatalogStore.getState().getActivePages()[0].slots.find((s) => s.id === id)!;
  const pool = () => useCatalogStore.getState().tempProductPool;
  const select = (ids: string[]) => useUIStore.setState({ selectedSlotIds: ids });

  it('anchor MODÜL + diğer ÜRÜN (anchor sol-üst): birleşik = modül; ürün havuza, kaybolmaz', () => {
    setupMerge([moduleSlot(), productSlot('P2')]); // s1 modül (sol-üst + anchor), s2 ürün
    select(['s1', 's2']);
    useCatalogStore.getState().mergeSelected(1, 's1');

    expect(byId('s1').role).toBe('free');
    expect(byId('s1').moduleType).toBe('banner');
    expect(byId('s1').moduleData).toBeTruthy();
    expect(byId('s1').product).toBeNull();
    expect(byId('s1').colSpan).toBe(2);

    expect(pool()).toHaveLength(1);
    expect(pool()[0].sku).toBe('P2');
    expect(pool()[0].originalSlotId).toBe('s2');
  });

  it('anchor MODÜL + diğer ÜRÜN (anchor SOL-ÜST DEĞİL): survivor anchor modülünü benimser; ürün havuza [bug senaryosu]', () => {
    setupMerge([productSlot('P1'), moduleSlot()]); // s1 ürün (sol-üst = survivor), s2 modül (anchor)
    select(['s1', 's2']);
    useCatalogStore.getState().mergeSelected(1, 's2'); // anchor = s2 = modül

    expect(byId('s1').role).toBe('free'); // survivor s1 modülü benimsedi (boş çıkmaz)
    expect(byId('s1').moduleType).toBe('banner');
    expect(byId('s1').moduleData).toBeTruthy();
    expect(byId('s1').product).toBeNull();

    expect(pool()).toHaveLength(1); // survivor'ın eski ürünü kaybolmadı
    expect(pool()[0].sku).toBe('P1');
  });

  it('anchor ÜRÜN + diğer MODÜL: birleşik = ürün; modül havuza GİTMEZ (sessizce silinir)', () => {
    setupMerge([productSlot('P1'), moduleSlot()]); // s1 ürün (anchor + survivor), s2 modül
    select(['s1', 's2']);
    useCatalogStore.getState().mergeSelected(1, 's1');

    expect(byId('s1').role).toBe('product');
    expect(byId('s1').product?.sku).toBe('P1');
    expect(byId('s1').moduleType).toBeNull();

    expect(pool()).toHaveLength(0); // modül havuza gitmez; anchor ürünü korunur
  });

  it('anchor ÜRÜN + diğer MODÜL → unmerge: modül DİRİLMEZ (temiz boş ürün hücresi)', () => {
    setupMerge([productSlot('P1'), moduleSlot()]);
    select(['s1', 's2']);
    useCatalogStore.getState().mergeSelected(1, 's1');
    useCatalogStore.getState().unmergeSlot(1, 's1');

    expect(byId('s1').product?.sku).toBe('P1');
    expect(byId('s2').hidden).toBeFalsy();
    expect(byId('s2').role).toBe('product'); // modül değil
    expect(byId('s2').moduleType).toBeNull(); // dirilmedi
    expect(byId('s2').product).toBeNull(); // temiz boş hücre
  });

  it('çoklu: anchor ÜRÜN + ürün + modül → birleşik anchor ürünü; diğer ürün havuza, modül silinir', () => {
    setupMerge([productSlot('P1'), productSlot('P2'), moduleSlot()]); // s1 anchor, s2 ürün, s3 modül
    select(['s1', 's2', 's3']);
    useCatalogStore.getState().mergeSelected(1, 's1');

    expect(byId('s1').role).toBe('product');
    expect(byId('s1').product?.sku).toBe('P1');
    expect(byId('s1').colSpan).toBe(3);

    expect(pool()).toHaveLength(1); // yalnız P2 (modül havuza gitmez, P1 anchor korunur)
    expect(pool()[0].sku).toBe('P2');
  });

  it('regresyon ÜRÜN+ÜRÜN: anchor ürünü korunur, diğer havuza (mevcut davranış bozulmadı)', () => {
    setupMerge([productSlot('P1'), productSlot('P2')]);
    select(['s1', 's2']);
    useCatalogStore.getState().mergeSelected(1, 's1');

    expect(byId('s1').product?.sku).toBe('P1');
    expect(pool()).toHaveLength(1);
    expect(pool()[0].sku).toBe('P2');
  });

  it('atomik: birleştirme TEK history adımı; undo modül+ürünü tam geri alır', () => {
    setupMerge([moduleSlot(), productSlot('P2')]);
    select(['s1', 's2']);
    const before = useHistoryStore.getState().past.length;
    useCatalogStore.getState().mergeSelected(1, 's1');
    expect(useHistoryStore.getState().past.length).toBe(before + 1);

    useHistoryStore.getState().undo();
    expect(byId('s1').colSpan).toBe(1);
    expect(byId('s1').moduleType).toBe('banner'); // modül geri
    expect(byId('s2').product?.sku).toBe('P2'); // ürün slotta geri
    expect(pool()).toHaveLength(0); // havuz boş
  });
});

// captureProductToPool davranışı (saf helper, public action üzerinden): aynı SKU havuzda varsa
// TEKİLLEŞİR + yeni origin-tag ile başa gelir. (Helper export'suz — appendOverflowToTempPool gibi.)
describe('captureProductToPool — dedup + origin-tag (clearSlotToPool yoluyla)', () => {
  it('havuzda aynı SKU varsa tekilleşir; yeni origin-tag ile başa', () => {
    useHistoryStore.getState().clearHistory();
    useCatalogStore.setState({
      activeFormaId: 1,
      tempProductPool: [{ sku: 'P1', name: 'eski' } as never], // origin'siz eski kopya
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
                  product: { sku: 'P1', name: 'yeni' },
                },
              ],
            },
          ],
        },
      ] as unknown as StudioForma[],
    });
    useCatalogStore.getState().clearSlotToPool(1, 'slot-1');

    const pool = useCatalogStore.getState().tempProductPool;
    expect(pool).toHaveLength(1); // dedup: iki değil bir
    expect(pool[0].sku).toBe('P1');
    expect(pool[0].originalPage).toBe(1); // yeni origin-tag
    expect(pool[0].originalSlotId).toBe('slot-1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESYON: POS = ekrandaki slot numarası (globalNumber). Kök-neden, _fillSlotsFromPool'un
// yerleştirmeyi ham dizi sırasıyla (imposition) kurmasıydı; oysa globalNumber pageNumber'a
// göre atanır. Bu testler ikisinin birebir kalmasını KİLİTLER (refaktörde sessizce bozulmasın).
// ─────────────────────────────────────────────────────────────────────────────
describe('ürün yerleşimi — POS = globalNumber (slot no)', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
  });

  // Template1 sayfa dizisi imposition sırasında: pageNumber [5,6,1,2,3,4] (templates.ts).
  // buildFormasForTemplate bunu Forma1=[5,6,1], Forma2=[2,3,4] korur → dizi sırası ≠ pageNumber.
  const GRID = { rows: 4, cols: 4 };
  function setupTemplate1() {
    const formas = recalculateLayout(buildFormasForTemplate(Template1), GRID);
    useCatalogStore.setState({
      activeFormaId: 1,
      activeTab: 'outer',
      formas,
      globalSettings: { ...initialGlobalSettings, defaultGrid: GRID },
      productPool: [],
      tempProductPool: [],
    });
  }
  const slotByGlobal = (n: number): StudioSlot | undefined => {
    for (const f of useCatalogStore.getState().formas)
      for (const p of f.pages) for (const s of p.slots) if (s.globalNumber === n) return s;
    return undefined;
  };

  it('sözleşme: productSlotsInOrder sırası globalNumber ile birebir (1..N)', () => {
    const formas = recalculateLayout(buildFormasForTemplate(Template1), GRID);
    const nums = productSlotsInOrder(formas).map((s) => s.globalNumber);
    expect(nums).toEqual(Array.from({ length: nums.length }, (_, i) => i + 1));
  });

  it('POS, ekrandaki slot no (globalNumber) hücresine yerleşir — imposition sırasına DEĞİL', () => {
    setupTemplate1();
    useCatalogStore.getState().setProductPool([
      { id: 'P1', sku: 'P1', name: 'Ürün 1', price: '1', raw: { POS: 1 } },
      { id: 'P17', sku: 'P17', name: 'Ürün 17', price: '17', raw: { POS: 17 } },
      { id: 'P96', sku: 'P96', name: 'Ürün 96', price: '96', raw: { POS: 96 } },
    ]);
    useCatalogStore.getState().autoFillSlots();

    expect(slotByGlobal(1)?.product?.sku).toBe('P1');
    expect(slotByGlobal(17)?.product?.sku).toBe('P17');
    expect(slotByGlobal(96)?.product?.sku).toBe('P96');
    // POS 1 → sayfa 1'in ilk slotu (globalNumber 1), en soldaki imposition sayfası (page 5) DEĞİL.
    expect(slotByGlobal(1)?.id).toBe('page-1-slot-1');
    const page5First = useCatalogStore
      .getState()
      .formas.flatMap((f) => f.pages)
      .find((p) => p.pageNumber === 5)!.slots[0];
    expect(page5First.product).toBeNull(); // eski hatada POS 1 buraya düşüyordu
  });

  it('POS > slot sayısı → tempProductPool (overflow), sessizce kaybolmaz', () => {
    setupTemplate1();
    useCatalogStore.getState().setProductPool([
      { id: 'X', sku: 'X', name: 'X', price: '1', raw: { POS: 999 } },
    ]);
    useCatalogStore.getState().autoFillSlots();
    expect(useCatalogStore.getState().tempProductPool.some((p) => p.sku === 'X')).toBe(true);
  });
});

describe('parseProductRow — kilitli konum düzeni (POS·SKU·Ad·Fiyat·Görsel)', () => {
  it('sütunları SIRAYLA okur, başlık adına bakmaz', () => {
    const p = rowToProduct(['3', '213N', 'Tavuk Göğsü', '3,99', 'http://x/y.png'], 0);
    expect(p.sku).toBe('213N');
    expect(p.name).toBe('Tavuk Göğsü');
    expect(p.price).toBe('3,99');
    expect(p.image).toBe('http://x/y.png');
    expect((p.raw as { POS: string }).POS).toBe('3');
  });

  it('sayısal POS hücresi de çalışır (number → string)', () => {
    const p = rowToProduct([5, 'SKU5', 'Ürün', '10', ''], 0);
    expect((p.raw as { POS: string }).POS).toBe('5');
    expect(p.image).toBe('');
  });
});
