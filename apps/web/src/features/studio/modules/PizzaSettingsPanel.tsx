import type { ColorValue } from '@matbaapro/shared';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import {
  BorderRadiusPicker,
  ColorOpacityPicker,
  ShadowPicker,
  SpacingPicker,
  TypographyPicker,
} from '../pickers';
import type { PizzaModuleData } from './types';

// Keys whose data type is ColorValue (supports gradient).
const BG_KEYS = ['bg', 'tableBg', 'tableTitleBg', 'cellBg', 'cellPriceBg', 'imgBg'] as const;
// Keys that remain solid ColorOpacity ({c,o}).
const SOLID_KEYS = ['border', 'tableLine', 'imgBorder'] as const;

const LABELS: Record<string, string> = {
  bg: 'Genel Zemin',
  tableBg: 'Tablo Zemini',
  tableTitleBg: 'Tablo Başlığı',
  cellBg: 'Hücre',
  cellPriceBg: 'Fiyat Hücresi',
  imgBg: 'Görsel Zemini',
  border: 'Çerçeve',
  tableLine: 'Tablo Çizgisi',
  imgBorder: 'Görsel Çerçevesi',
};

export function PizzaSettingsPanel() {
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);

  const slotId = selectedSlotIds[0];
  let pageNumber = 0;
  let module: PizzaModuleData | null = null;
  for (const p of getActivePages()) {
    const slot = p.slots.find((s) => s.id === slotId);
    if (slot && slot.role === 'free' && (slot.moduleData as PizzaModuleData)?.type === 'pizza') {
      module = slot.moduleData as PizzaModuleData;
      pageNumber = p.pageNumber;
      break;
    }
  }

  if (!module) {
    return (
      <p className="p-3 text-xs text-slate-500 italic text-center">
        Pizza modülü olan bir hücre seçin.
      </p>
    );
  }

  const m = module;
  const patch = (p: Partial<PizzaModuleData>) => updateSlotModuleData(pageNumber, slotId, p);

  return (
    <div className="space-y-3">
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-2">
        <h4 className="text-[10px] font-black text-slate-500">RENKLER</h4>
        {BG_KEYS.map((k) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-[10px] text-slate-600">{LABELS[k]}</span>
            <ColorOpacityPicker
              value={m.colors[k]}
              onChange={(v: ColorValue) =>
                patch({ colors: { ...m.colors, [k]: v } })
              }
            />
          </div>
        ))}
        {SOLID_KEYS.map((k) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-[10px] text-slate-600">{LABELS[k]}</span>
            <ColorOpacityPicker
              solidOnly
              value={{ type: 'solid', color: m.colors[k].c, opacity: m.colors[k].o }}
              onChange={(v: ColorValue) => {
                if (v.type !== 'solid') return;
                patch({
                  colors: { ...m.colors, [k]: { c: v.color, o: v.opacity } },
                });
              }}
            />
          </div>
        ))}
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-600 w-24">Tablo Çizgi Kalınlığı</span>
          <input
            type="range"
            min={0}
            max={6}
            value={m.tableLineWidth}
            onChange={(e) => patch({ tableLineWidth: parseInt(e.target.value) })}
            className="flex-1 accent-blue-600"
          />
          <input
            type="number"
            value={m.tableLineWidth}
            onChange={(e) => patch({ tableLineWidth: parseInt(e.target.value) || 0 })}
            className="w-12 text-[10px] font-bold text-center border border-slate-200 rounded p-0.5"
          />
        </div>
      </div>

      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <TypographyPicker
          title="Başlık"
          value={m.fonts.title}
          onChange={(val) => patch({ fonts: { ...m.fonts, title: val } })}
        />
        <TypographyPicker
          title="Tablo Başlığı"
          value={m.fonts.tableTitle}
          onChange={(val) => patch({ fonts: { ...m.fonts, tableTitle: val } })}
        />
        <TypographyPicker
          title="Boyutlar (sizes)"
          value={m.fonts.sizes}
          onChange={(val) => patch({ fonts: { ...m.fonts, sizes: val } })}
        />
        <TypographyPicker
          title="Fiyatlar"
          value={m.fonts.prices}
          onChange={(val) => patch({ fonts: { ...m.fonts, prices: val } })}
        />
      </div>

      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <BorderRadiusPicker
          title="Kapsayıcı Köşesi"
          value={m.radiuses.container}
          onChange={(val) => patch({ radiuses: { ...m.radiuses, container: val } })}
        />
      </div>
      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <BorderRadiusPicker
          title="Tablo Köşesi"
          value={m.radiuses.table}
          onChange={(val) => patch({ radiuses: { ...m.radiuses, table: val } })}
        />
      </div>

      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <SpacingPicker
          title="Kapsayıcı Boşluk"
          value={m.spacings.container}
          onChange={(val) => patch({ spacings: { ...m.spacings, container: val } })}
        />
      </div>
      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <SpacingPicker
          title="Tablo Başlık Boşluk"
          value={m.spacings.tableTitle}
          onChange={(val) => patch({ spacings: { ...m.spacings, tableTitle: val } })}
        />
      </div>

      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <ShadowPicker
          title="Kapsayıcı Gölge"
          value={m.shadows.container}
          onChange={(val) => patch({ shadows: { ...m.shadows, container: val } })}
        />
      </div>
    </div>
  );
}
