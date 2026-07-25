// Görünüm ayarları MERKEZİ — tek paylaşılan UI bileşeni.
// Hızlı Bar (layout="bar", curated ids) VE Sağ Panel (layout="panel", tam ids) AYNI bileşeni,
// AYNI registry'yi (appearanceSettingsRegistry) kullanır — appearanceSettings/registry.ts tek kaynak.

import { useEffect, useRef, useState } from 'react';
import type { BorderData, CellAppearance } from '@matbaapro/shared';
import { CornerRadiusIcon } from '@/components/icons/CornerRadiusIcon';
import { ColorOpacityPicker, BorderRadiusPicker } from '../pickers';
import { colorValueBackground, colorOpacityToCss } from '../util/style';
import { appearanceSettingById } from './registry';
import type { AppearanceSettingId } from './types';

function BarPopover({
  trigger,
  children,
  width = 'w-72',
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest('[data-color-picker-popup], [data-image-picker-popup]')) return;
      if (ref.current && !ref.current.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-text-secondary hover:bg-border-default"
      >
        {trigger}
      </button>
      {open && (
        <div className={`absolute top-full left-0 mt-1 z-99999 ${width} bg-surface-panel border border-border-default rounded-radius-lg shadow-xl p-4`}>
          {children}
        </div>
      )}
    </div>
  );
}

interface AppearanceControlsProps {
  value: CellAppearance;
  onChange: (patch: Partial<CellAppearance>) => void;
  /** Hangi ayarlar gösterilsin — curated (Hızlı Bar) ya da tam (Sağ Panel) liste çağıran belirler. */
  ids: AppearanceSettingId[];
  layout: 'bar' | 'panel';
}

const BORDER_STYLE_LABELS: Record<string, string> = { solid: 'Düz', dashed: 'Kesikli', dotted: 'Noktalı' };

export function AppearanceControls({ value, onChange, ids, layout }: AppearanceControlsProps) {
  const ctx = { appearance: value };
  const has = (id: AppearanceSettingId) => ids.includes(id);

  if (layout === 'bar') {
    return (
      <>
        {has('bg') && (
          <ColorOpacityPicker
            trigger={
              <>
                <div
                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                  style={{
                    ...colorValueBackground(value.bg),
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '4px',
                  }}
                />
                <span>Zemin</span>
              </>
            }
            value={value.bg}
            onChange={(v) => onChange(appearanceSettingById.bg.apply(ctx, v))}
          />
        )}

        {has('borderColor') && (
          <ColorOpacityPicker
            solidOnly
            type="border"
            trigger={
              <>
                <div
                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                  style={{
                    backgroundColor: 'transparent',
                    border: `2px solid ${colorOpacityToCss(value.border.color)}`,
                    borderRadius: '4px',
                  }}
                />
                <span>Çerçeve</span>
              </>
            }
            value={{ type: 'solid', color: value.border.color.c, opacity: value.border.color.o }}
            thickness={has('borderWidth') ? value.border.t : undefined}
            onChange={(v) => onChange(appearanceSettingById.borderColor.apply(ctx, v))}
            onThicknessChange={
              has('borderWidth') ? (t) => onChange(appearanceSettingById.borderWidth.apply(ctx, t)) : undefined
            }
          />
        )}

        {has('radius') && (
          <BarPopover trigger={<><CornerRadiusIcon size={16} />Köşe</>} width="w-72">
            <BorderRadiusPicker
              value={value.radius}
              onChange={(v) => onChange(appearanceSettingById.radius.apply(ctx, v))}
            />
          </BarPopover>
        )}
      </>
    );
  }

  // layout === 'panel' — Sağ Panel: dikey stack, her ayar kendi satırı.
  return (
    <div className="space-y-3">
      {has('bg') && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">Zemin Rengi</span>
          <ColorOpacityPicker value={value.bg} onChange={(v) => onChange(appearanceSettingById.bg.apply(ctx, v))} />
        </div>
      )}

      {has('borderColor') && (
        <div className="flex items-center justify-between pt-2 border-t border-border-default">
          <span className="text-xs font-medium text-text-secondary">Kenarlık Rengi</span>
          <ColorOpacityPicker
            solidOnly
            value={{ type: 'solid', color: value.border.color.c, opacity: value.border.color.o }}
            onChange={(v) => onChange(appearanceSettingById.borderColor.apply(ctx, v))}
          />
        </div>
      )}

      {has('borderWidth') && (
        <div className="flex items-center gap-2 pt-2 border-t border-border-default">
          <span className="text-[11px] font-medium text-text-secondary w-16">Kalınlık</span>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={value.border.t}
            onChange={(e) => onChange(appearanceSettingById.borderWidth.apply(ctx, parseInt(e.target.value, 10) || 0))}
            className="flex-1 studio-slider"
          />
          <input
            type="number"
            value={value.border.t}
            onChange={(e) => onChange(appearanceSettingById.borderWidth.apply(ctx, parseInt(e.target.value, 10) || 0))}
            className="w-12 text-xs font-normal text-text-primary text-center border border-border-default rounded p-0.5"
          />
        </div>
      )}

      {has('borderStyle') && (
        <div className="flex items-center justify-between pt-2 border-t border-border-default">
          <span className="text-xs font-medium text-text-secondary">Çizgi Stili</span>
          <select
            value={value.border.style}
            onChange={(e) => onChange(appearanceSettingById.borderStyle.apply(ctx, e.target.value as BorderData['style']))}
            className="text-xs border border-border-default rounded-md px-2 py-1.5 bg-surface-panel"
          >
            {Object.entries(BORDER_STYLE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {has('radius') && (
        <div className="pt-1 border-t border-border-default">
          <BorderRadiusPicker
            title="Köşe ovalliği"
            value={value.radius}
            onChange={(v) => onChange(appearanceSettingById.radius.apply(ctx, v))}
          />
        </div>
      )}
    </div>
  );
}
