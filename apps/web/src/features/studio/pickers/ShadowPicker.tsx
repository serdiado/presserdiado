import type { ShadowData } from '@matbaapro/shared';
import { ColorOpacityPicker } from './ColorOpacityPicker';

interface Props {
  title?: string;
  value: ShadowData;
  onChange: (v: ShadowData) => void;
}

export function ShadowPicker({ title = 'Gölge', value, onChange }: Props) {
  const set = (k: 'x' | 'y' | 'blur' | 'spread', v: number) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-600">{title}</span>
        <button
          onClick={() => onChange({ ...value, active: !value.active })}
          className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
            value.active
              ? 'bg-slate-100 text-slate-800'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          {value.active ? 'AKTİF' : 'KAPALI'}
        </button>
      </div>

      {value.active && (
        <div className="p-3 space-y-3 bg-slate-50 rounded border border-slate-200">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ['x', 'Yatay (X)', -50, 50],
                ['y', 'Dikey (Y)', -50, 50],
                ['blur', 'Bulanıklık', 0, 100],
                ['spread', 'Yayılma', -20, 50],
              ] as const
            ).map(([k, label, min, max]) => (
              <div key={k} className="flex flex-col gap-1.5 bg-white p-1.5 rounded border border-slate-100">
                <span className="text-[9px] font-medium text-slate-400">{label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={value[k]}
                    onChange={(e) => set(k, Number(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <input
                    type="number"
                    value={value[k]}
                    onChange={(e) => set(k, parseInt(e.target.value) || 0)}
                    className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-100">
            <span className="text-[10px] font-bold text-slate-700">Renk & Saydamlık</span>
            <ColorOpacityPicker
              solidOnly
              value={{ type: 'solid', color: value.color, opacity: value.opacity }}
              onChange={(v) => {
                if (v.type !== 'solid') return;
                onChange({ ...value, color: v.color, opacity: v.opacity });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
