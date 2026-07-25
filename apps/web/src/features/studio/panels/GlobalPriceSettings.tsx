import { useCatalogStore } from '@/stores/studio';
import type { CatalogSettings, DeepPartial } from '@matbaapro/shared';
import {
  TypographyPicker,
} from '../pickers';
import { AppearanceControls } from '../appearanceSettings/AppearanceControls';
import { FULL_APPEARANCE_IDS } from '../appearanceSettings/registry';

export function GlobalPriceSettings() {
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const setGlobalSettings = useCatalogStore((s) => s.setGlobalSettings);

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
        <span className="text-[10px] font-bold text-slate-500 block mb-2">Konum</span>
        <div className="flex bg-slate-50 rounded p-1 gap-1 border border-slate-100">
          {(['left', 'center', 'right'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setGlobalSettings({ pricePosition: pos })}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded ${
                globalSettings.pricePosition === pos
                  ? 'bg-white shadow border border-slate-200 text-slate-800'
                  : 'text-slate-500'
              }`}
            >
              {pos === 'left' ? 'Sol' : pos === 'center' ? 'Orta' : 'Sağ'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-2">
        <h4 className="text-[10px] font-black text-slate-500">BOYUT</h4>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500 w-16">Genişlik</span>
          <input
            type="range"
            min={10}
            max={100}
            value={globalSettings.priceWidth}
            onChange={(e) =>
              setGlobalSettings({ priceWidth: parseInt(e.target.value) })
            }
            className="flex-1 studio-slider"
          />
          <input
            type="number"
            value={globalSettings.priceWidth}
            onChange={(e) =>
              setGlobalSettings({ priceWidth: parseInt(e.target.value) || 0 })
            }
            className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5"
          />
          <span className="text-[11px] text-slate-400">%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500 w-16">Yükseklik</span>
          <input
            type="range"
            min={5}
            max={30}
            value={globalSettings.priceHeight}
            onChange={(e) =>
              setGlobalSettings({ priceHeight: parseInt(e.target.value) })
            }
            className="flex-1 studio-slider"
          />
          <input
            type="number"
            value={globalSettings.priceHeight}
            onChange={(e) =>
              setGlobalSettings({ priceHeight: parseInt(e.target.value) || 0 })
            }
            className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5"
          />
          <span className="text-[11px] text-slate-400">mm</span>
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
        <AppearanceControls
          value={{
            bg: globalSettings.colors.priceBg,
            border: globalSettings.colors.priceBorder,
            radius: globalSettings.radiuses.price,
          }}
          onChange={(patch) => {
            const next: DeepPartial<CatalogSettings> = {};
            if (patch.bg || patch.border) {
              next.colors = { ...globalSettings.colors, ...(patch.bg && { priceBg: patch.bg }), ...(patch.border && { priceBorder: patch.border }) };
            }
            if (patch.radius) next.radiuses = { ...globalSettings.radiuses, price: patch.radius };
            setGlobalSettings(next);
          }}
          ids={FULL_APPEARANCE_IDS}
          layout="panel"
        />
      </div>

      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <TypographyPicker
          title="Fiyat Fontu"
          value={globalSettings.fonts.price}
          onChange={(val) =>
            setGlobalSettings({
              fonts: { ...globalSettings.fonts, price: val },
            })
          }
        />
      </div>
    </div>
  );
}
