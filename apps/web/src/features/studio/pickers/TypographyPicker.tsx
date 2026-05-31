import type { TypographyData } from '@matbaapro/shared';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react';
import { ColorOpacityPicker } from './ColorOpacityPicker';

const HALIGN_ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
} as const;

const VALIGN_ICONS = {
  top: AlignVerticalJustifyStart,
  middle: AlignVerticalJustifyCenter,
  bottom: AlignVerticalJustifyEnd,
} as const;

interface Props {
  title: string;
  value: TypographyData;
  onChange: (v: TypographyData) => void;
  inline?: boolean;
}

const ALIGNS = ['left', 'center', 'right', 'justify'] as const;
const VALIGNS = ['top', 'middle', 'bottom'] as const;

export function TypographyPicker({ title, value, onChange, inline = false }: Props) {
  const set = <K extends keyof TypographyData>(k: K, v: TypographyData[K]) =>
    onChange({ ...value, [k]: v });

  const content = (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Font</span>
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
          <span className="text-[11px] font-bold text-slate-500 uppercase">Kalınlık</span>
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
            <span className="text-[11px] font-medium text-slate-500 w-20">{label}</span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value[k] as number}
              onChange={(e) => set(k, Number(e.target.value))}
              className="flex-1 studio-slider"
            />
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value[k] as number}
              onChange={(e) => set(k, Number(e.target.value))}
              className="w-12 text-[11px] font-bold text-slate-600 text-center border border-slate-200 rounded p-0.5"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Yatay</span>
          <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
            {ALIGNS.map((a) => {
              const Icon = HALIGN_ICONS[a];
              return (
                <button
                  key={a}
                  onClick={() => set('textAlign', a)}
                  className={`flex-1 py-1 flex items-center justify-center rounded-sm ${
                    value.textAlign === a ? 'bg-white shadow text-slate-800' : 'text-slate-400'
                  }`}
                >
                  <Icon size={12} />
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Dikey</span>
          <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
            {VALIGNS.map((a) => {
              const Icon = VALIGN_ICONS[a];
              return (
                <button
                  key={a}
                  onClick={() => set('verticalAlign', a)}
                  className={`flex-1 py-1 flex items-center justify-center rounded-sm ${
                    value.verticalAlign === a ? 'bg-white shadow text-slate-800' : 'text-slate-400'
                  }`}
                >
                  <Icon size={12} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
        <button
          onClick={() =>
            set('textTransform', value.textTransform === 'uppercase' ? 'none' : 'uppercase')
          }
          className={`flex-1 py-1 text-[10px] font-bold rounded-sm ${
            value.textTransform === 'uppercase' ? 'bg-white shadow text-slate-800' : 'text-slate-400'
          }`}
        >
          AA
        </button>
        <button
          onClick={() =>
            set('textTransform', value.textTransform === 'capitalize' ? 'none' : 'capitalize')
          }
          className={`flex-1 py-1 text-[10px] font-bold rounded-sm ${
            value.textTransform === 'capitalize' ? 'bg-white shadow text-slate-800' : 'text-slate-400'
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
              ? 'bg-white shadow text-slate-800'
              : 'text-slate-400'
          }`}
        >
          U
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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
  );

  return (
    <div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel shadow-drop-sm mb-3">
      <div className="px-3 py-2 bg-surface-subtle border-b border-border-default font-semibold text-xs text-text-primary">
        {title}
      </div>
      {content}
    </div>
  );
}
