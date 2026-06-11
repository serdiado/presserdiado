// Ortak baskı-özellik seçim bileşeni — saf sunum + seçim. Sipariş/fatura BİLMEZ.
// Katalogtan beslenir, fiyatı prop olarak alır. S5 (stüdyo) ve S6 (web) aynı bileşeni kullanır.

import { Lock } from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_TO_OPTION_KEY,
  DESIGN_LOCKED_NOTE,
} from './constants';
import { formatTRY, type CatalogOptions, type PriceQuote, type PrintOptionsValue } from './types';

interface PrintOptionsSelectorProps {
  options: CatalogOptions;
  value: PrintOptionsValue;
  onChange: (next: PrintOptionsValue) => void;
  quantity: number;
  onQuantityChange: (n: number) => void;
  lockedCategories?: string[];
  quote?: PriceQuote | null;
  quoteLoading?: boolean;
  quoteError?: string | null;
}

export function PrintOptionsSelector({
  options,
  value,
  onChange,
  quantity,
  onQuantityChange,
  lockedCategories = [],
  quote,
  quoteLoading,
  quoteError,
}: PrintOptionsSelectorProps) {
  const set = (optionKey: keyof PrintOptionsValue, next: string) =>
    onChange({ ...value, [optionKey]: next });

  return (
    <div className="space-y-3">
      {/* Adet */}
      <label className="block">
        <span className="text-xs font-semibold text-text-secondary">Adet</span>
        <input
          type="number"
          min={1}
          max={100000}
          value={quantity}
          onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full mt-1 text-sm border border-border-strong rounded px-2 py-1.5 outline-none focus:border-border-strong bg-surface-panel"
        />
      </label>

      {/* Kategori seçimleri */}
      {CATEGORY_ORDER.map((category) => {
        const list = options.options[category];
        if (!list || list.length === 0) return null;

        const optionKey = CATEGORY_TO_OPTION_KEY[category];
        const locked = lockedCategories.includes(category);
        const current = value[optionKey];
        const selectedLabel = list.find((o) => o.key === current)?.label ?? current ?? '—';

        return (
          <label key={category} className="block">
            <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
              {CATEGORY_LABELS[category] ?? category}
              {locked && <Lock size={11} className="text-text-muted" />}
            </span>

            {locked ? (
              <div
                title={DESIGN_LOCKED_NOTE}
                className="w-full mt-1 text-xs border border-border-default rounded px-2 py-1.5 bg-surface-subtle text-text-muted flex items-center justify-between cursor-not-allowed select-none"
              >
                <span>{selectedLabel}</span>
                <Lock size={12} className="text-text-muted shrink-0" />
              </div>
            ) : (
              <select
                value={current ?? ''}
                onChange={(e) => set(optionKey, e.target.value)}
                className="w-full mt-1 text-xs border border-border-strong rounded px-2 py-1.5 bg-surface-panel outline-none focus:border-border-strong"
              >
                {list.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </label>
        );
      })}

      {/* Fiyat özeti */}
      <div className="border-t border-border-default pt-3 space-y-1.5">
        {quoteError ? (
          <p className="text-xs text-danger">{quoteError}</p>
        ) : (
          <>
            <SummaryRow label="Ara Toplam" value={formatTRY(quote?.subtotal)} muted />
            {quote && quote.discountPct > 0 && (
              <SummaryRow
                label={`Adet İndirimi (-%${quote.discountPct})`}
                value={`−${formatTRY(quote.discountTotal)}`}
                muted
              />
            )}
            <SummaryRow
              label={`KDV (%${quote ? Math.round(quote.taxRate) : 0})`}
              value={formatTRY(quote?.taxTotal)}
              muted
            />
            <div className="border-t border-border-strong pt-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">Toplam</span>
              <span className="text-sm font-semibold text-text-primary">
                {quoteLoading && !quote ? '…' : formatTRY(quote?.grandTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>Birim Fiyat</span>
              <span className="font-semibold">{formatTRY(quote?.unitPrice)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between text-xs ${
        muted ? 'text-text-muted' : 'text-text-secondary'
      }`}
    >
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
