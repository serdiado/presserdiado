import { useCatalogStore, useUIStore } from '@/stores/studio';
import {
  ColorOpacityPicker,
  SpacingPicker,
  TypographyPicker,
} from '../pickers';
import type { BannerCellData, BannerModuleData } from './types';

const MIN_DIM = 1;
const MAX_DIM = 10;

const defaultCell = (i: number, ref: BannerCellData): BannerCellData => ({
  id: `banner-inst-${i}`,
  text: '',
  colSpan: 1,
  rowSpan: 1,
  hidden: false,
  mergedInto: null,
  font: ref.font,
  padding: ref.padding,
  bgColor: ref.bgColor,
  border: ref.border,
  image: null,
  imageMode: 'contain',
  imagePosX: 0,
  imagePosY: 0,
  imageScale: 100,
});

export function BannerSettingsPanel() {
  const selection = useUIStore((s) => s.selection);
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);

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

  const resizeGrid = (newRows: number, newCols: number) => {
    const r = Math.max(MIN_DIM, Math.min(MAX_DIM, newRows));
    const c = Math.max(MIN_DIM, Math.min(MAX_DIM, newCols));
    const newCount = r * c;
    const existing = module!.cells;
    const refCell = existing[0];
    let newCells: BannerCellData[];
    if (newCount >= existing.length) {
      const extra = Array.from({ length: newCount - existing.length }, (_, i) =>
        defaultCell(existing.length + i, refCell),
      );
      newCells = [...existing, ...extra];
    } else {
      newCells = existing.slice(0, newCount);
    }
    updateSlotModuleData(pageNumber, slotId, { rows: r, cols: c, cells: newCells });
  };

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
              min={MIN_DIM}
              max={MAX_DIM}
              value={rows}
              onChange={(e) => resizeGrid(parseInt(e.target.value) || MIN_DIM, cols)}
              className="w-full text-xs text-center border border-border-default rounded px-1 py-0.5 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
          <span className="text-text-muted text-xs">×</span>
          <label className="flex items-center gap-1.5 flex-1">
            <span className="text-[10px] text-text-muted w-10">Sütun</span>
            <input
              type="number"
              min={MIN_DIM}
              max={MAX_DIM}
              value={cols}
              onChange={(e) => resizeGrid(rows, parseInt(e.target.value) || MIN_DIM)}
              className="w-full text-xs text-center border border-border-default rounded px-1 py-0.5 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
        </div>
        <p className="text-[11px] text-text-muted">En fazla {MAX_DIM}×{MAX_DIM}</p>
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
