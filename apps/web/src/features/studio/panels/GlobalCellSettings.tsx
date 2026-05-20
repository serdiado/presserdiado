import { useCatalogStore, useUIStore } from '@/stores/studio';
import {
  BorderRadiusPicker,
  ColorOpacityPicker,
  ShadowPicker,
  SpacingPicker,
  TypographyPicker,
} from '../pickers';

export function GlobalCellSettings() {
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const setGlobalSettings = useCatalogStore((s) => s.setGlobalSettings);
  const updateSelectedSlotsImageSettings = useCatalogStore(
    (s) => s.updateSelectedSlotsImageSettings,
  );
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);

  const selectedSlot =
    selectedSlotIds.length > 0
      ? getActivePages()
          .flatMap((p) => p.slots)
          .find((s) => s.id === selectedSlotIds[0])
      : null;

  const imgSettings = selectedSlot?.imageSettings ?? {};
  const isImgEditMode = imgSettings.editMode ?? false;
  const imgScale = imgSettings.scale ?? 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded border border-slate-200 shadow-sm">
        <span className="text-[10px] font-bold text-slate-600 w-24">Hücre Boşluğu</span>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={globalSettings.gridGap}
          onChange={(e) => setGlobalSettings({ gridGap: parseFloat(e.target.value) })}
          className="flex-1 accent-blue-600"
        />
        <input
          type="number"
          value={globalSettings.gridGap}
          onChange={(e) =>
            setGlobalSettings({ gridGap: parseFloat(e.target.value) || 0 })
          }
          className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5"
        />
        <span className="text-[9px] text-slate-400">mm</span>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-700">
              Görsel Serbest Konum
            </span>
            {selectedSlotIds.length > 1 && (
              <span className="text-[8px] text-blue-600 font-bold">
                {selectedSlotIds.length} ürün seçili
              </span>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              disabled={selectedSlotIds.length === 0}
              checked={isImgEditMode}
              onChange={(e) =>
                updateSelectedSlotsImageSettings({ editMode: e.target.checked })
              }
            />
            <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 shadow-inner" />
          </label>
        </div>
        {selectedSlotIds.length === 0 ? (
          <div className="p-2 bg-amber-50 rounded border border-amber-100 text-[9px] text-amber-700 font-bold">
            ⓘ Önce bir ürün seçin.
          </div>
        ) : (
          <div className={`space-y-2 ${isImgEditMode ? '' : 'opacity-40 pointer-events-none'}`}>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-medium text-slate-500 w-16">Büyütme</span>
              <input
                type="range"
                min={10}
                max={300}
                value={imgScale}
                onChange={(e) =>
                  updateSelectedSlotsImageSettings({ scale: parseInt(e.target.value) })
                }
                className="flex-1 accent-blue-600"
              />
              <input
                type="number"
                value={imgScale}
                onChange={(e) =>
                  updateSelectedSlotsImageSettings({
                    scale: parseInt(e.target.value) || 0,
                  })
                }
                className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5"
              />
              <span className="text-[9px] text-slate-400">%</span>
            </div>
            <button
              onClick={() =>
                updateSelectedSlotsImageSettings({
                  scale: 100,
                  posX: 0,
                  posY: 0,
                  editMode: false,
                })
              }
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-bold rounded border border-slate-200"
            >
              Konumu Sıfırla
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
          <ColorOpacityPicker
            color={globalSettings.colors.cellBg.c}
            opacity={globalSettings.colors.cellBg.o}
            onChange={(c, o) =>
              setGlobalSettings({
                colors: { ...globalSettings.colors, cellBg: { c, o } },
              })
            }
          />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-600">Kenarlık</span>
          <ColorOpacityPicker
            color={globalSettings.colors.cellBorder.c}
            opacity={globalSettings.colors.cellBorder.o}
            onChange={(c, o) =>
              setGlobalSettings({
                colors: { ...globalSettings.colors, cellBorder: { c, o } },
              })
            }
          />
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[9px] font-medium text-slate-500 w-16">Kalınlık</span>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={globalSettings.borderWidth}
            onChange={(e) =>
              setGlobalSettings({ borderWidth: parseFloat(e.target.value) })
            }
            className="flex-1 accent-blue-600"
          />
          <input
            type="number"
            value={globalSettings.borderWidth}
            onChange={(e) =>
              setGlobalSettings({ borderWidth: parseFloat(e.target.value) || 0 })
            }
            className="w-12 text-[10px] font-bold text-slate-600 text-center border border-slate-200 rounded p-0.5"
          />
        </div>
      </div>

      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <BorderRadiusPicker
          title="Köşe Ovalliği"
          value={globalSettings.radiuses.cell}
          onChange={(val) =>
            setGlobalSettings({
              radiuses: { ...globalSettings.radiuses, cell: val },
            })
          }
        />
      </div>
      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <SpacingPicker
          title="İç Boşluk"
          value={globalSettings.spacings.cell}
          onChange={(val) =>
            setGlobalSettings({
              spacings: { ...globalSettings.spacings, cell: val },
            })
          }
        />
      </div>
      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <ShadowPicker
          title="Gölge"
          value={globalSettings.shadows.cell}
          onChange={(val) =>
            setGlobalSettings({
              shadows: { ...globalSettings.shadows, cell: val },
            })
          }
        />
      </div>
      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <TypographyPicker
          title="Ürün İsmi Fontu"
          value={globalSettings.fonts.productName}
          onChange={(val) =>
            setGlobalSettings({
              fonts: { ...globalSettings.fonts, productName: val },
            })
          }
        />
      </div>
    </div>
  );
}
