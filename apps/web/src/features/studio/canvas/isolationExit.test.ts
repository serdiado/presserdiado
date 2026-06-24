import { describe, it, expect, beforeEach } from 'vitest';
import { shouldExitIsolationOnPointer } from './isolationExit';

// Madde 10 regresyonu: düzenleme (izolasyon) modundayken SAĞ TIK düzenlemeyi İPTAL ETMEMELİ.
// Yüklem saf (DOM closest) → çıkış kararını tek yerde kilitler.
describe('shouldExitIsolationOnPointer', () => {
  const ISO = 'footer-slot-1';
  let root: HTMLElement;
  let moduleEl: HTMLElement;
  let productEl: HTMLElement;
  let chromeEl: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    root.id = 'studio-canvas-root';

    moduleEl = document.createElement('div'); // izole modül kabı
    moduleEl.id = `slot-${ISO}`;
    moduleEl.appendChild(document.createElement('span')); // modül içi bir eleman

    productEl = document.createElement('div'); // kanvasta ama modül DIŞI (ürün slotu)

    root.appendChild(moduleEl);
    root.appendChild(productEl);
    document.body.appendChild(root);

    chromeEl = document.createElement('div'); // kanvas-root DIŞI (krom: panel/menü/bar)
    document.body.appendChild(chromeEl);
  });

  it('SOL tık + modül DIŞI + kanvasta → çıkış (true)', () => {
    expect(shouldExitIsolationOnPointer(0, productEl, ISO)).toBe(true);
  });

  it('SAĞ tık (button=2) → çıkış YOK (false) — düzenleme KORUNUR (madde 10)', () => {
    expect(shouldExitIsolationOnPointer(2, productEl, ISO)).toBe(false);
  });

  it('izole modül İÇİ tık → çıkış YOK (false)', () => {
    const inner = moduleEl.firstElementChild as HTMLElement;
    expect(shouldExitIsolationOnPointer(0, inner, ISO)).toBe(false);
  });

  it('krom (kanvas-root dışı) tık → çıkış YOK (false)', () => {
    expect(shouldExitIsolationOnPointer(0, chromeEl, ISO)).toBe(false);
  });

  it('hedef yok → çıkış YOK (false)', () => {
    expect(shouldExitIsolationOnPointer(0, null, ISO)).toBe(false);
  });
});
