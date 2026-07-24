// Sıralı seçim sihirbazı — turmatsan "hazır paket" ürünleri (kartvizit pilotu).
// FlyerAlarm deseni: üstte numaralı sekmeler, her adımda kart seçenekleri, karta
// tıklayınca seçilip sonraki adıma geçilir. Öne atlama kilitli; geri dönüp bir adımı
// değiştirmek sonraki adımları sıfırlar. Adım i yalnız önceki adımlarla kısıtlanır.

import { useEffect, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import {
  reachableForStep,
  setStepSelection,
  firstUnsetStep,
  matchingVariants,
  type FacetDef,
  type FacetSelection,
  type FacetValue,
  type VariantRow,
} from './variantFacets';

interface VariantWizardProps {
  variants: VariantRow[];
  facets: FacetDef[];
  selection: FacetSelection;
  onSelectionChange: (next: FacetSelection) => void;
}

function displayValue(val: FacetValue | null, suffix?: string): string {
  if (val === null) return 'Standart';
  return `${val}${suffix ?? ''}`;
}

export function VariantWizard({ variants, facets, selection, onSelectionChange }: VariantWizardProps) {
  const orderedKeys = facets.map((f) => f.key);
  const firstUnset = firstUnsetStep(selection, orderedKeys);
  const resolved =
    matchingVariants(variants, selection).length === 1
      ? matchingVariants(variants, selection)[0]
      : null;

  // Aktif adım (yalnız UI durumu). Başlangıçta ilk seçilmemiş adım.
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(Math.min(firstUnset, facets.length - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facets.length]);

  // Erişilebilir en ileri adım: çözülmüşse hepsi, değilse ilk seçilmemişe kadar.
  const maxStep = resolved ? facets.length - 1 : firstUnset;

  const pick = (index: number, value: FacetValue | null) => {
    onSelectionChange(setStepSelection(selection, orderedKeys, index, value));
    setStep(Math.min(index + 1, facets.length - 1));
  };

  // Bir adımın gösterilecek seçili değeri: doğrudan seçim ya da (çözülünce) zorlanan değer.
  const valueAt = (key: string): FacetValue | null | undefined => {
    if (key in selection) return selection[key];
    if (resolved) return resolved.attrs[key] ?? null;
    return undefined;
  };

  const activeFacet = facets[step];
  const options = reachableForStep(variants, selection, orderedKeys, step);
  const activeValue = valueAt(activeFacet.key);

  return (
    <div>
      {/* Numaralı sekme çubuğu */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 -mx-6 px-6 pb-px">
        {facets.map((f, i) => {
          const locked = i > maxStep;
          const done = valueAt(f.key) !== undefined;
          const active = i === step;
          return (
            <button
              key={f.key}
              type="button"
              disabled={locked}
              onClick={() => !locked && setStep(i)}
              className={[
                'shrink-0 px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5',
                active
                  ? 'border-blue-600 text-blue-700'
                  : locked
                    ? 'border-transparent text-slate-300 cursor-not-allowed'
                    : 'border-transparent text-slate-500 hover:text-slate-800',
              ].join(' ')}
            >
              <span
                className={[
                  'w-4 h-4 rounded-full grid place-items-center text-[9px] shrink-0',
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500',
                ].join(' ')}
              >
                {done ? <Check size={10} strokeWidth={3} /> : locked ? <Lock size={9} /> : i + 1}
              </span>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Aktif adım — kart seçenekleri */}
      <div className="pt-5">
        <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-3">
          {step + 1}. {activeFacet.label}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {options.map((val) => {
            const isSel = activeValue === val;
            return (
              <button
                key={JSON.stringify(val)}
                type="button"
                onClick={() => pick(step, val)}
                className={[
                  'relative text-left px-3.5 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                  isSel
                    ? 'border-blue-600 bg-blue-50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
                ].join(' ')}
              >
                {isSel && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white grid place-items-center">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
                {displayValue(val, activeFacet.suffix)}
              </button>
            );
          })}
        </div>
        {options.length === 0 && (
          <p className="text-xs text-slate-400">Bu adım için seçenek yok.</p>
        )}
      </div>
    </div>
  );
}
