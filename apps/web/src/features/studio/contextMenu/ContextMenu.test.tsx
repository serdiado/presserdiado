// Render-commit regresyonu: registry menüsünden bir aksiyon tıklanınca (run + onClose aynı discrete-event
// handler'ında, onClose portal'lı ContextMenu'yü UNMOUNT eder) dış-store'a (zustand) abone bileşenler
// ANINDA re-render olmalı — F5 gerekmemeli. Eski inline menüde handler Page'e aitti (hayatta kalır) →
// sorun yoktu; yeni menüde handler ContextMenu'ye ait (unmount olur). Bu test o farkı yakalar.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useState, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { StudioForma } from '@matbaapro/shared';
import { useCatalogStore } from '../../../stores/studio/catalog.store';
import { useHistoryStore } from '../../../stores/studio/history.store';
import { ContextMenu } from './ContextMenu';
import type { MenuContext } from './menuContext';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function setupStore() {
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
            customFooter: null,
            slots: [
              {
                id: 's1',
                colSpan: 1,
                rowSpan: 1,
                product: { sku: 'X', name: 'Ürün' },
                hidden: false,
                mergedInto: null,
                isCustom: false,
                role: 'product',
              },
            ],
          },
        ],
      },
    ] as unknown as StudioForma[],
  });
}

const slotCtx: MenuContext = {
  kind: 'slot',
  pageNumber: 1,
  slotId: 's1',
  role: 'product',
  hasProduct: true,
  canMerge: false,
  canUnmerge: false,
  isCustom: false,
  hasCopiedSlotStyle: false,
};

// Abone bileşen — havuz uzunluğunu REAKTİF okur (Page/Slot'un grid'i formas'tan okuması gibi).
function Probe() {
  const len = useCatalogStore((s) => s.tempProductPool.length);
  return <span data-testid="pool">{len}</span>;
}

// Page deseni: menü açık; aksiyon → run(ctx) + onClose() (setOpen(false) → ContextMenu UNMOUNT).
function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <Probe />
      {open && <ContextMenu ctx={slotCtx} x={0} y={0} onClose={() => setOpen(false)} />}
    </div>
  );
}

// GERÇEK Page'e birebir: AYNI bileşen hem grid'i (store-abone) gösterir HEM menüyü açar/kapar.
// (Harness'ta abone ayrı bir alt bileşendi; burada Page gibi tek bileşen.)
function PageLike() {
  const hasProduct = useCatalogStore((s) => !!s.formas[0]?.pages?.[0]?.slots?.[0]?.product);
  const [open, setOpen] = useState(true);
  return (
    <div>
      <span data-testid="has-product">{hasProduct ? 'VAR' : 'YOK'}</span>
      {open && <ContextMenu ctx={slotCtx} x={0} y={0} onClose={() => setOpen(false)} />}
    </div>
  );
}

describe('ContextMenu — aksiyon reaktivitesi (render-commit regresyonu)', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    setupStore();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('"Hücreyi Boşalt" → abone bileşen ANINDA güncellenir (re-render tetiklenir, F5 gerekmez)', () => {
    act(() => {
      root.render(<Harness />);
    });

    expect(document.querySelector('[data-testid="pool"]')?.textContent).toBe('0');

    const btn = Array.from(document.querySelectorAll('#context-menu-container button')).find((b) =>
      b.textContent?.includes('Hücreyi Boşalt'),
    ) as HTMLButtonElement | undefined;
    expect(btn, '"Hücreyi Boşalt" butonu portal\'da bulunmalı').toBeTruthy();

    // act DIŞINDA gerçek discrete-event sekansı: React 18 discrete event'i SENKRON flush etmeli
    // (eski inline menüde anında olduğu gibi). act sarmalı her şeyi flush edip bug'ı maskelerdi.
    btn!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    btn!.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    btn!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Store doğru güncellenmeli (ürün havuza)
    expect(useCatalogStore.getState().tempProductPool.length).toBe(1);
    // KRİTİK: abone bileşen SENKRON re-render OLMALI — aksiyon + menü-unmount aynı handler'da olsa bile.
    expect(document.querySelector('[data-testid="pool"]')?.textContent).toBe('1');
  });

  it('GERÇEK Page şekli: menüyü AÇAN bileşen = grid aboneSİ → "Hücreyi Boşalt" anında yansır', () => {
    act(() => {
      root.render(<PageLike />);
    });

    expect(document.querySelector('[data-testid="has-product"]')?.textContent).toBe('VAR');

    const btn = Array.from(document.querySelectorAll('#context-menu-container button')).find((b) =>
      b.textContent?.includes('Hücreyi Boşalt'),
    ) as HTMLButtonElement | undefined;
    expect(btn).toBeTruthy();

    btn!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    btn!.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    btn!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(useCatalogStore.getState().formas[0].pages[0].slots[0].product).toBeNull();
    // Menüyü açan bileşenin KENDİSİ aboneyken de senkron güncellenmeli.
    expect(document.querySelector('[data-testid="has-product"]')?.textContent).toBe('YOK');
  });
});
