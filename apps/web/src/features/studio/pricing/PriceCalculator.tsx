// Studio'da sağ alt floating fiyat hesabı.
// Aktif şablon'dan sayfa sayısı + sayfa alanını çekip, kullanıcı seçimleriyle
// pricing.config.json formülünü uygular.

import { useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/studio';
import {
  calculatePrice,
  formatCurrency,
  pricingConfig,
  type PriceFieldSelect,
} from './pricing';

function buildDefaultValues(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of pricingConfig.fields) {
    if (f.type === 'select') out[f.key] = f.default;
  }
  return out;
}

export function PriceCalculator() {
  const template = useCatalogStore((s) => s.activeTemplate);

  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(() => {
    const f = pricingConfig.fields.find((x) => x.key === 'quantity');
    return f && f.type === 'number' ? f.default : 100;
  });
  const [values, setValues] = useState<Record<string, string>>(buildDefaultValues);

  const pageAreaMm2 = template.openWidthMm * template.openHeightMm / template.pageCount;
  // pageAreaMm2 = açık genişlik × yükseklik / sayfa sayısı = kapalı sayfa alanı

  const breakdown = useMemo(
    () =>
      calculatePrice({
        quantity,
        pageCount: template.pageCount,
        pageAreaMm2,
        fieldValues: values,
      }),
    [quantity, template.pageCount, pageAreaMm2, values],
  );

  const set = (key: string, val: string) =>
    setValues((p) => ({ ...p, [key]: val }));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[1100] bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2"
      >
        💰 Fiyat Hesabı{' '}
        <span className="text-xs font-normal opacity-80">
          {formatCurrency(breakdown.total)}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[1100] w-80 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          💰 Fiyat Hesabı
        </h3>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-700 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="px-4 py-3 space-y-3 overflow-auto flex-1">
        <div className="bg-slate-50 rounded p-2 text-[10px] text-slate-600 leading-snug">
          <strong className="text-slate-800">{template.name}</strong>
          <br />
          {template.pageCount} sayfa × {(pageAreaMm2 / 100).toFixed(0)} cm²/sayfa
        </div>

        <label className="block">
          <span className="text-xs font-bold text-slate-700">Adet</span>
          <input
            type="number"
            min={1}
            max={100000}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full mt-1 text-sm border border-slate-300 rounded px-2 py-1.5 focus:border-indigo-500 outline-none"
          />
        </label>

        {pricingConfig.fields
          .filter((f): f is PriceFieldSelect => f.type === 'select')
          .map((f) => (
            <label key={f.key} className="block">
              <span className="text-xs font-bold text-slate-700">{f.label}</span>
              <select
                value={values[f.key] ?? f.default}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full mt-1 text-xs border border-slate-300 rounded px-2 py-1.5 bg-white focus:border-indigo-500 outline-none"
              >
                {f.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </label>
          ))}
      </div>

      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl space-y-1.5">
        <Row label="Ara Toplam" value={formatCurrency(breakdown.subtotal)} />
        {breakdown.appliedTier.discount > 0 && (
          <Row
            label={`Adet İndirimi (-${Math.round(breakdown.appliedTier.discount * 100)}%)`}
            value={`−${formatCurrency(breakdown.tierDiscount)}`}
            muted
          />
        )}
        <Row
          label={`KDV (%${Math.round(pricingConfig.vatRate * 100)})`}
          value={formatCurrency(breakdown.vat)}
          muted
        />
        {breakdown.shipping > 0 && (
          <Row label="Kargo" value={formatCurrency(breakdown.shipping)} muted />
        )}
        <div className="border-t border-slate-300 pt-1.5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Toplam</span>
          <span className="text-lg font-black text-indigo-700">
            {formatCurrency(breakdown.total)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Birim Fiyat</span>
          <span className="font-semibold">{formatCurrency(breakdown.unitPrice)}</span>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between text-xs ${muted ? 'text-slate-500' : 'text-slate-700'}`}>
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
