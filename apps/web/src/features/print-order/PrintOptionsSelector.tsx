// Ortak baskı-özellik seçim bileşeni — saf sunum + seçim. Sipariş/fatura BİLMEZ.
// Katalogtan beslenir, fiyatı prop olarak alır. S5 (stüdyo) ve S6 (web) aynı bileşeni kullanır.

import { useEffect } from 'react';
import { Lock } from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_TO_OPTION_KEY,
  DESIGN_LOCKED_NOTE,
} from './constants';
import {
  formatTRY,
  type CatalogOptions,
  type PriceQuote,
  type PrintOptionsValue,
} from './types';

// Çapraz-eksen bağımlılığı: seed'in option.metadata'sına yazdığı requires/excludes kuralı
// (ör. broşürde "Renk: Tek Yön" yalnız Kırım=Yok iken görünür). Kategori adı → o kategorinin
// PrintOptionsValue karşılığı CATEGORY_TO_OPTION_KEY üzerinden çözülür; genel amaçlı, tek bir
// ürüne özel değil — ileride başka eksen çiftleri için de aynı metadata şekli kullanılabilir.
interface DependencyMeta {
  requires?: Record<string, string>;
  excludes?: Record<string, string>;
}

function isOptionAllowed(metadata: unknown, currentValue: PrintOptionsValue): boolean {
  const meta = metadata as DependencyMeta | null | undefined;
  if (!meta) return true;
  const valueOf = (categoryKey: string) => {
    const optionKey = CATEGORY_TO_OPTION_KEY[categoryKey] ?? (categoryKey as keyof PrintOptionsValue);
    return currentValue[optionKey];
  };
  if (meta.requires) {
    for (const [cat, requiredVal] of Object.entries(meta.requires)) {
      if (valueOf(cat) !== requiredVal) return false;
    }
  }
  if (meta.excludes) {
    for (const [cat, excludedVal] of Object.entries(meta.excludes)) {
      if (valueOf(cat) === excludedVal) return false;
    }
  }
  return true;
}

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
  // Paket-fiyatlı ürünler: adet serbest sayı yerine bu listeden seçilir (turmatsan kataloğu).
  quantityChoices?: number[];
  // Adet birimi etiketi (ör. "cilt") — paket ürünlerinde koçan/kutu bazlı satış için.
  quantityUnit?: string;
  // Kategori başlığı override'ları (configSchema.ui.optionLabels) — CATEGORY_LABELS üstüne biner.
  categoryLabels?: Record<string, string>;
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
  quantityChoices,
  quantityUnit,
  categoryLabels,
}: PrintOptionsSelectorProps) {
  const set = (optionKey: keyof PrintOptionsValue, next: string) =>
    onChange({ ...value, [optionKey]: next });
  const labels = { ...CATEGORY_LABELS, ...(categoryLabels ?? {}) };
  const unit = quantityUnit ?? 'adet';

  // Çapraz-eksen bağımlılığı: bir kategori başka bir kategorinin seçimine göre daralınca
  // (ör. Kırım değişince Renk listesi), o kategoride artık geçersiz kalan seçim otomatik
  // olarak yeni listenin ilk geçerli değerine düşer — kullanıcı "seçilemez bir kombinasyonda"
  // kilitli kalmaz.
  useEffect(() => {
    for (const category of CATEGORY_ORDER) {
      const list = options.options[category];
      if (!list || list.length === 0) continue;
      const optionKey = CATEGORY_TO_OPTION_KEY[category];
      const current = value[optionKey];
      const allowed = list.filter((o) => isOptionAllowed(o.metadata, value));
      if (allowed.length === 0) continue;
      if (current == null || !allowed.some((o) => o.key === current)) {
        set(optionKey, allowed[0].key);
        return; // tek seferde bir düzeltme; sonraki render'da diğer kategoriler tekrar kontrol edilir
      }
    }
    // set/value fonksiyonel olarak options+value'dan türediği için yalnız bunlara bağlıyoruz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, value]);

  return (
    <div className="space-y-3">
      {/* Adet — paket ürünlerinde geçerli paketlerden seçim, aksi halde serbest sayı. */}
      <label className="block">
        <span className="text-xs font-semibold text-text-secondary">
          Adet{quantityUnit && quantityUnit !== 'adet' ? ` (${quantityUnit})` : ''}
        </span>
        {quantityChoices && quantityChoices.length > 0 ? (
          <select
            value={quantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value))}
            className="w-full mt-1 text-sm border border-border-strong rounded px-2 py-1.5 bg-surface-panel outline-none focus:border-border-strong"
          >
            {quantityChoices.map((q) => (
              <option key={q} value={q}>
                {q.toLocaleString('tr-TR')} {unit}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            min={1}
            max={100000}
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full mt-1 text-sm border border-border-strong rounded px-2 py-1.5 outline-none focus:border-border-strong bg-surface-panel"
          />
        )}
      </label>

      {/* Kategori seçimleri */}
      {CATEGORY_ORDER.map((category) => {
        const rawList = options.options[category];
        if (!rawList || rawList.length === 0) return null;
        // Çapraz-eksen bağımlılığı: başka bir kategorinin mevcut seçimine göre daraltılmış liste.
        const list = rawList.filter((o) => isOptionAllowed(o.metadata, value));
        if (list.length === 0) return null;

        const optionKey = CATEGORY_TO_OPTION_KEY[category];
        const locked = lockedCategories.includes(category);
        const current = value[optionKey];
        const selectedLabel = list.find((o) => o.key === current)?.label ?? current ?? '—';

        return (
          <label key={category} className="block">
            <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
              {labels[category] ?? category}
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
