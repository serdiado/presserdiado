import type { TypographyData } from '@matbaapro/shared';
import { ColorOpacityPicker } from './ColorOpacityPicker';

interface Props {
  title: string;
  value: TypographyData;
  onChange: (v: TypographyData) => void;
}

const ALIGNS = ['left', 'center', 'right', 'justify'] as const;
const VALIGNS = ['top', 'middle', 'bottom'] as const;

export function TypographyPicker({ title, value, onChange }: Props) {
  const set = <K extends keyof TypographyData>(k: K, v: TypographyData[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <details className="bg-white border border-slate-200 rounded shadow-sm mb-2 group/font">
      <summary className="text-[10px] font-bold text-slate-700 uppercase tracking-wider p-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 list-none flex justify-between items-center">
        {title}
        <span className="group-open/font:rotate-180 transition-transform text-[9px] text-slate-400">▼</span>
      </summary>
      <div className="p-3 space-y-3 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Font</span>
            <select
              value={value.fontFamily}
              onChange={(e) => set('fontFamily', e.target.value)}
              className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50"
            >
              {['Inter', 'Roboto', 'Arial', 'Oswald', 'Helvetica', 'Georgia'].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Kalınlık</span>
            <select
              value={value.fontWeight}
              onChange={(e) => set('fontWeight', e.target.value)}
              className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50"
            >
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="700">Bold</option>
              <option value="900">Black</option>
            </select>
          </label>
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-100">
          {(
            [
              ['fontSize', 'Punto', 8, 72, 1],
              ['lineHeight', 'Satır', 0.5, 3, 0.1],
              ['letterSpacing', 'Harf Aralığı', -5, 10, 0.5],
              ['decimalScale', 'Küsurat %', 30, 200, 1],
            ] as const
          ).map(([k, label, min, max, step]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="text-[9px] font-medium text-slate-500 w-20">{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[k] as number}
                onChange={(e) => set(k, Number(e.target.value))}
                className="flex-1 accent-blue-600"
              />
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value[k] as number}
                onChange={(e) => set(k, Number(e.target.value))}
                className="w-12 text-[9px] font-bold text-slate-600 text-center border border-slate-200 rounded p-0.5"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Yatay</span>
            <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
              {ALIGNS.map((a) => (
                <button
                  key={a}
                  onClick={() => set('textAlign', a)}
                  className={`flex-1 py-1 text-[9px] font-bold uppercase rounded-sm ${
                    value.textAlign === a ? 'bg-white shadow text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {a[0]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Dikey</span>
            <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
              {VALIGNS.map((a) => (
                <button
                  key={a}
                  onClick={() => set('verticalAlign', a)}
                  className={`flex-1 py-1 text-[9px] font-bold uppercase rounded-sm ${
                    value.verticalAlign === a ? 'bg-white shadow text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {a[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
          <button
            onClick={() =>
              set('textTransform', value.textTransform === 'uppercase' ? 'none' : 'uppercase')
            }
            className={`flex-1 py-1 text-[10px] font-bold rounded-sm ${
              value.textTransform === 'uppercase' ? 'bg-white shadow text-blue-600' : 'text-slate-400'
            }`}
          >
            AA
          </button>
          <button
            onClick={() =>
              set('textTransform', value.textTransform === 'capitalize' ? 'none' : 'capitalize')
            }
            className={`flex-1 py-1 text-[10px] font-bold rounded-sm ${
              value.textTransform === 'capitalize' ? 'bg-white shadow text-blue-600' : 'text-slate-400'
            }`}
          >
            Aa
          </button>
          <button
            onClick={() =>
              set('textDecoration', value.textDecoration === 'underline' ? 'none' : 'underline')
            }
            className={`flex-1 py-1 text-[10px] font-bold rounded-sm underline ${
              value.textDecoration === 'underline'
                ? 'bg-white shadow text-blue-600'
                : 'text-slate-400'
            }`}
          >
            U
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-700">Renk & Saydamlık</span>
          <ColorOpacityPicker
            color={value.color}
            opacity={value.opacity}
            onChange={(c, o) => onChange({ ...value, color: c, opacity: o })}
          />
        </div>
      </div>
    </details>
  );
}
