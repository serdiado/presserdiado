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
import { useHistoryStore } from '@/stores/studio';
import { textSettingById } from '../textSettings/registry';
import type { TextSettingCtx } from '../textSettings/types';
import type { RunValue } from '../modules/richText';

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
  /** Run-bearing yüzeyler (ürün adı / banner hücresi): cell-level değişimde bu property'nin
   *  run-override'larını temizle (property-scoped uniform). Verilirse onChange+onClearRun ATOMİK
   *  (withHistoryBatch → tek undo). price/badge/global verilmez (container-only). */
  onClearRun?: (property: string) => void;
}

const ALIGNS = ['left', 'center', 'right', 'justify'] as const;
const VALIGNS = ['top', 'middle', 'bottom'] as const;

export function TypographyPicker({ title, value, onChange, inline = false, onClearRun }: Props) {
  // Sağ Panel cell-level tam görünümü — TÜM kontroller MERKEZİ registry'den (Hızlı Bar ile TEK kaynak).
  // ctx.surface metadata; cell apply/read PURE olduğundan kullanılmaz (picker badge/footer/price'a da
  // hizmet eder). apply cell dalı → typography patch; onChange genel/özel/global/slot wiring'i ÇAĞIRANDA.
  const ctx: TextSettingCtx = { surface: 'product', slotId: '', cellId: '', font: value };
  const rd = (id: string) => textSettingById[id].read(ctx);
  const ap = (id: string, v: RunValue) => {
    const next = { ...value, ...(textSettingById[id].apply(ctx, v) as Partial<TypographyData>) };
    if (onClearRun && textSettingById[id].runCapable) {
      // Cell-level property-scoped: container patch + bu hücrede run-override'larını temizle. ATOMİK (Fold 1).
      useHistoryStore.getState().withHistoryBatch(() => {
        onChange(next);
        onClearRun(id);
      });
    } else {
      onChange(next); // cell-only / run-bearing olmayan → tek yazım (slider coalesce korunur)
    }
  };

  const color = (rd('color') as { color: string; opacity: number } | undefined) ?? {
    color: value.color,
    opacity: value.opacity,
  };

  const content = (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Font</span>
          <select
            value={rd('fontFamily') as string}
            onChange={(e) => ap('fontFamily', e.target.value)}
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
            value={rd('fontWeight') as string}
            onChange={(e) => ap('fontWeight', e.target.value)}
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
        ).map(([id, label, min, max, step]) => (
          <div key={id} className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 w-20">{label}</span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={rd(id) as number}
              onChange={(e) => ap(id, Number(e.target.value))}
              className="flex-1 studio-slider"
            />
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={rd(id) as number}
              onChange={(e) => ap(id, Number(e.target.value))}
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
                  onClick={() => ap('textAlign', a)}
                  className={`flex-1 py-1 flex items-center justify-center rounded-sm ${
                    rd('textAlign') === a ? 'bg-white shadow text-slate-800' : 'text-slate-400'
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
                  onClick={() => ap('verticalAlign', a)}
                  className={`flex-1 py-1 flex items-center justify-center rounded-sm ${
                    rd('verticalAlign') === a ? 'bg-white shadow text-slate-800' : 'text-slate-400'
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
          onClick={() => ap('textTransform', rd('textTransform') === 'uppercase' ? 'none' : 'uppercase')}
          className={`flex-1 py-1 text-[10px] font-bold rounded-sm ${
            rd('textTransform') === 'uppercase' ? 'bg-white shadow text-slate-800' : 'text-slate-400'
          }`}
        >
          AA
        </button>
        <button
          onClick={() => ap('textTransform', rd('textTransform') === 'capitalize' ? 'none' : 'capitalize')}
          className={`flex-1 py-1 text-[10px] font-bold rounded-sm ${
            rd('textTransform') === 'capitalize' ? 'bg-white shadow text-slate-800' : 'text-slate-400'
          }`}
        >
          Aa
        </button>
        <button
          onClick={() => ap('italic', rd('italic') !== true)}
          className={`flex-1 py-1 text-[10px] font-bold italic rounded-sm ${
            rd('italic') === true ? 'bg-white shadow text-slate-800' : 'text-slate-400'
          }`}
        >
          I
        </button>
        <button
          onClick={() => ap('underline', rd('underline') !== true)}
          className={`flex-1 py-1 text-[10px] font-bold rounded-sm underline ${
            rd('underline') === true ? 'bg-white shadow text-slate-800' : 'text-slate-400'
          }`}
        >
          U
        </button>
        <button
          onClick={() => ap('lineThrough', rd('lineThrough') !== true)}
          className={`flex-1 py-1 text-[10px] font-bold rounded-sm line-through ${
            rd('lineThrough') === true ? 'bg-white shadow text-slate-800' : 'text-slate-400'
          }`}
        >
          S
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-700">Renk & Saydamlık</span>
        <ColorOpacityPicker
          solidOnly
          value={{ type: 'solid', color: color.color, opacity: color.opacity }}
          onChange={(v) => {
            if (v.type !== 'solid') return;
            ap('color', { color: v.color, opacity: v.opacity });
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
