import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore } from './history.store';

// withHistoryBatch "ilk-yazım yakalar" modeli: cell-level container patch + run-strip = TEK undo adımı.
// Ürün (global saveState) ve banner (iso pushIsolationSnapshot) KENDİ mekanizmalarıyla self-route eder.

describe('withHistoryBatch — atomik undo (ilk-yazım yakalar)', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory(); // past/future/lastSavedTime/isoSession reset
  });

  it('global: batch içinde iki saveState → TEK snapshot (past +1)', () => {
    const before = useHistoryStore.getState().past.length;
    useHistoryStore.getState().withHistoryBatch(() => {
      useHistoryStore.getState().saveState(); // İLK → forced çeker (pre-mutation orijinali)
      useHistoryStore.getState().saveState(); // sonraki → bastırılır
    });
    expect(useHistoryStore.getState().past.length).toBe(before + 1);
    expect(useHistoryStore.getState().batching).toBe(false);
    expect(useHistoryStore.getState().batchPending).toBe(false);
  });

  it('global: batch tek saveState de TEK snapshot (forced, cooldown bypass)', () => {
    const before = useHistoryStore.getState().past.length;
    useHistoryStore.getState().withHistoryBatch(() => {
      useHistoryStore.getState().saveState();
    });
    expect(useHistoryStore.getState().past.length).toBe(before + 1);
  });

  it('iso: batch içinde iki pushIso → TEK local snapshot (localPast +1); global past kirlenmez', () => {
    useHistoryStore.getState().beginIsolation('slot-x');
    const localBefore = useHistoryStore.getState().isoSession!.localPast.length;
    const globalBefore = useHistoryStore.getState().past.length;
    useHistoryStore.getState().withHistoryBatch(() => {
      useHistoryStore.getState().pushIsolationSnapshot(); // İLK → forced local
      useHistoryStore.getState().pushIsolationSnapshot(); // sonraki → bastırılır
    });
    expect(useHistoryStore.getState().isoSession!.localPast.length).toBe(localBefore + 1);
    expect(useHistoryStore.getState().past.length).toBe(globalBefore); // iso global'i kirletmez
  });

  it('non-batch davranış korunur: batch dışı saveState normal push', () => {
    const before = useHistoryStore.getState().past.length;
    useHistoryStore.getState().saveState(true);
    expect(useHistoryStore.getState().past.length).toBe(before + 1);
    expect(useHistoryStore.getState().batchPending).toBe(false);
  });
});
