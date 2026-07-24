// Sade kart seçici — turmatsan "hazır paket" ürünleri (kartvizit). Her kart bir ürün:
// ad + özellik + KDV-dahil fiyat. Segmentlere (EKO/LAK/VİP/FAN) göre gruplanır.
// Sihirbaz/eksen mantığı YOK — bir kart seçilir, fiyat sağ panelde çıkar.

import { Check } from 'lucide-react';
import { formatTRY, packagePriceInclTax, type CatalogPackage } from './types';

export interface PickerVariant {
  code: string;
  name: string; // "Tek Yön Renkli"
  specs: string; // "250 gr Bristol · Parlak Selefon · Tek Yön"
  group: string; // EKO / LAK / VİP / FAN
}

// Segment gösterim sırası + başlıkları.
const GROUP_ORDER = ['EKO', 'LAK', 'VİP', 'FAN', 'Diğer'];
const GROUP_LABEL: Record<string, string> = {
  EKO: 'Ekonomik',
  LAK: 'Laklı / Özel Kesim',
  'VİP': 'Yaldızlı (VIP)',
  FAN: 'Tuale (Fan)',
  'Diğer': 'Diğer',
};

interface VariantPickerProps {
  variants: PickerVariant[];
  packages: CatalogPackage[] | null;
  selectedCode: string | null;
  onSelect: (code: string) => void;
}

export function VariantPicker({ variants, packages, selectedCode, onSelect }: VariantPickerProps) {
  const priceOf = (code: string): number | null => {
    const pkg = packages?.find((p) => p.paperTypeKey === code);
    return pkg ? packagePriceInclTax(pkg) : null;
  };

  const groups = GROUP_ORDER.map((g) => ({
    key: g,
    label: GROUP_LABEL[g] ?? g,
    items: variants.filter((v) => v.group === g),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-2.5">
            {group.label}
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {group.items.map((v) => {
              const price = priceOf(v.code);
              const isSel = selectedCode === v.code;
              return (
                <button
                  key={v.code}
                  type="button"
                  onClick={() => onSelect(v.code)}
                  className={[
                    'relative text-left p-4 rounded-lg border-2 transition-all',
                    isSel
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-400',
                  ].join(' ')}
                >
                  {isSel && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 text-white grid place-items-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <div className="text-sm font-bold text-slate-900 pr-6">{v.name}</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">{v.specs}</div>
                  {price != null && (
                    <div className="text-sm font-bold text-slate-900 mt-2">
                      {formatTRY(price)}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">
                        / 1.000 adet · KDV dahil
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
