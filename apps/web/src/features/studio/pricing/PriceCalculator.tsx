// Studio'da TopBar'da duran fiyat hesabı popover'ı.
// Aktif şablon'dan sayfa sayısı + sayfa alanını çekip, kullanıcı seçimleriyle
// pricing.config.json formülünü uygular.

import { useMemo, useState, useRef, useEffect } from 'react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { Template1 } from '@matbaapro/shared';
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
  const isPreviewMode = useUIStore((s) => s.isPreviewMode);
  const template = useCatalogStore((s) => s.activeTemplate) || Template1;

  const [open, setOpen] = useState(false);

  if (isPreviewMode) return null;
  const containerRef = useRef<HTMLDivElement>(null);

  const [quantity, setQuantity] = useState<number>(() => {
    const f = pricingConfig.fields.find((x) => x.key === 'quantity');
    return f && f.type === 'number' ? f.default : 100;
  });
  const [values, setValues] = useState<Record<string, string>>(buildDefaultValues);

  const pageAreaMm2 = (template.openWidthMm * template.openHeightMm) / template.pageCount;
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

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* TopBar Tetikleyici Butonu */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        title="Fiyat Hesaplama Detayları"
        className={`h-8 px-3 rounded-radius-md text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
          open
            ? 'bg-blue-50 border-blue-500 text-blue-700'
            : 'bg-surface-panel border-border-strong text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        }`}
      >
        <span>💰</span>
        <span className="font-bold">{formatCurrency(breakdown.total)}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Popover Penceresi */}
      {open && (
        <div className="absolute right-0 top-9 z-1100 w-80 bg-surface-panel rounded-xl shadow-2xl border border-border-default flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-surface-subtle rounded-t-xl">
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
              💰 Fiyat Detayları
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-text-muted hover:text-text-secondary text-lg leading-none cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="px-4 py-3 space-y-3 overflow-auto max-h-[calc(100vh-120px)]">
            <div className="bg-surface-subtle rounded p-2 text-[10px] text-text-secondary leading-snug">
              <strong className="text-text-primary">{template.name}</strong>
              <br />
              {template.pageCount} sayfa × {(pageAreaMm2 / 100).toFixed(0)} cm²/sayfa
            </div>

            <label className="block">
              <span className="text-xs font-bold text-text-secondary">Adet</span>
              <input
                type="number"
                min={1}
                max={100000}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full mt-1 text-sm border border-border-strong rounded px-2 py-1.5 focus:border-border-strong outline-none"
              />
            </label>

            {pricingConfig.fields
              .filter((f): f is PriceFieldSelect => f.type === 'select')
              .map((f) => (
                <label key={f.key} className="block">
                  <span className="text-xs font-bold text-text-secondary">{f.label}</span>
                  <select
                    value={values[f.key] ?? f.default}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="w-full mt-1 text-xs border border-border-strong rounded px-2 py-1.5 bg-surface-panel focus:border-border-strong outline-none"
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

          <div className="px-4 py-3 border-t border-border-default bg-surface-subtle rounded-b-xl space-y-1.5">
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
            <div className="border-t border-border-strong pt-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">Toplam</span>
              <span className="text-sm font-bold text-text-primary">
                {formatCurrency(breakdown.total)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>Birim Fiyat</span>
              <span className="font-semibold">{formatCurrency(breakdown.unitPrice)}</span>
            </div>
          </div>
        </div>
      )}
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
