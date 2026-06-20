import { useCatalogStore, useUIStore } from '@/stores/studio';
import {
  ColorOpacityPicker,
  SpacingPicker,
  TypographyPicker,
} from '../pickers';
import type { BannerCellData, BannerModuleData } from './types';
import { BANNER_DIM_MIN, BANNER_DIM_MAX } from './fractions';

export function BannerSettingsPanel() {
  const selection = useUIStore((s) => s.selection);
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);
  const setBannerGridSize = useCatalogStore((s) => s.setBannerGridSize);

  const slotId =
    selection.type === 'bannerCell' && selection.parentId
      ? selection.parentId
      : selectedSlotIds[0];
  let pageNumber = 0;
  let module: BannerModuleData | null = null;
  for (const p of getActivePages()) {
    const slot = p.slots.find((s) => s.id === slotId);
    if (slot && slot.role === 'free' && (slot.moduleData as BannerModuleData)?.type === 'banner') {
      module = slot.moduleData as BannerModuleData;
      pageNumber = p.pageNumber;
      break;
    }
  }

  if (!module) {
    return (
      <p className="p-3 text-xs text-text-muted italic text-center">
        Tablo Alanı modülü olan bir hücre seçin.
      </p>
    );
  }

  const rows = module.rows ?? 4;
  const cols = module.cols ?? 4;

  // Sayısal grid boyutu → merge-aware motor (setBannerGridSize). Clamp burada.
  const resizeGrid = (newRows: number, newCols: number) =>
    setBannerGridSize(slotId, Math.max(BANNER_DIM_MIN, Math.min(BANNER_DIM_MAX, newRows)),
      Math.max(BANNER_DIM_MIN, Math.min(BANNER_DIM_MAX, newCols)));

  const selectedCellIds =
    selection.type === 'bannerCell' && selection.parentId === slotId ? selection.ids : [];
  const targetCells = module.cells.filter((c) => selectedCellIds.includes(c.id));

  const updateSelectedCells = (patch: Partial<BannerCellData>) => {
    const cells = module!.cells.map((c) =>
      selectedCellIds.includes(c.id) ? { ...c, ...patch } : c,
    );
    updateSlotModuleData(pageNumber, slotId, { cells });
  };

  return (
    <div className="space-y-3">
      {/* Izgara boyutu */}
      <div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm space-y-2">
        <span className="text-[10px] font-bold text-text-secondary block">Izgara Boyutu</span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 flex-1">
            <span className="text-[10px] text-text-muted w-10">Satır</span>
            <input
              type="number"
              min={BANNER_DIM_MIN}
              max={BANNER_DIM_MAX}
              value={rows}
              onChange={(e) => resizeGrid(parseInt(e.target.value) || BANNER_DIM_MIN, cols)}
              className="w-full text-xs text-center border border-border-default rounded px-1 py-0.5 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
          <span className="text-text-muted text-xs">×</span>
          <label className="flex items-center gap-1.5 flex-1">
            <span className="text-[10px] text-text-muted w-10">Sütun</span>
            <input
              type="number"
              min={BANNER_DIM_MIN}
              max={BANNER_DIM_MAX}
              value={cols}
              onChange={(e) => resizeGrid(rows, parseInt(e.target.value) || BANNER_DIM_MIN)}
              className="w-full text-xs text-center border border-border-default rounded px-1 py-0.5 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
        </div>
        <p className="text-[11px] text-text-muted">En fazla {BANNER_DIM_MAX}×{BANNER_DIM_MAX}</p>
      </div>

      {/* Hücre ayarları */}
      {targetCells.length === 0 ? (
        <div className="p-3 space-y-1">
          <p className="text-xs text-text-muted italic text-center">
            Tabloda bir hücre seçin.
          </p>
          <p className="text-[10px] text-text-muted text-center">
            Çift tıklayarak metin düzenleyebilirsiniz.
          </p>
        </div>
      ) : (
        <>
          <p className="text-[10px] text-text-muted font-bold px-1">
            {targetCells.length} hücre seçili
          </p>

          <div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-secondary">Zemin</span>
              <ColorOpacityPicker
                value={targetCells[0].bgColor}
                onChange={(v) => updateSelectedCells({ bgColor: v })}
              />
            </div>
          </div>

          <div className="bg-surface-panel p-2 rounded border border-border-default shadow-drop-sm">
            <SpacingPicker
              title="İç Boşluk"
              value={targetCells[0].padding}
              onChange={(val) => updateSelectedCells({ padding: val })}
            />
          </div>

          <div className="bg-surface-panel p-2 rounded border border-border-default shadow-drop-sm">
            <TypographyPicker
              title="Yazı"
              value={targetCells[0].font}
              onChange={(val) => updateSelectedCells({ font: val })}
            />
          </div>
        </>
      )}
    </div>
  );
}
