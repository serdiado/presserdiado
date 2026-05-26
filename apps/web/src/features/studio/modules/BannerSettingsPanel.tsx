import { useCatalogStore, useUIStore } from '@/stores/studio';
import {
  ColorOpacityPicker,
  SpacingPicker,
  TypographyPicker,
} from '../pickers';
import type { BannerCellData, BannerModuleData } from './types';

export function BannerSettingsPanel() {
  const selection = useUIStore((s) => s.selection);
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);

  const slotId = selectedSlotIds[0];
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
        Banner modülü olan bir hücre seçin.
      </p>
    );
  }

  const selectedCellIds =
    selection.type === 'bannerCell' && selection.parentId === slotId ? selection.ids : [];
  const targetCells = module.cells.filter((c) => selectedCellIds.includes(c.id));

  const updateSelectedCells = (patch: Partial<BannerCellData>) => {
    const cells = module!.cells.map((c) =>
      selectedCellIds.includes(c.id) ? { ...c, ...patch } : c,
    );
    updateSlotModuleData(pageNumber, slotId, { cells });
  };

  if (targetCells.length === 0) {
    return (
      <div className="p-3 space-y-2">
        <p className="text-xs text-text-muted italic text-center">
          Banner içinde bir hücre seçin (32 hücre arasından).
        </p>
        <p className="text-[10px] text-text-muted">
          Çift tıklayarak metin düzenleyebilirsiniz. Ctrl+tıklama ile çoklu seçim.
        </p>
      </div>
    );
  }

  const ref = targetCells[0];

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-text-muted font-bold">
        {targetCells.length} banner hücresi
      </p>

      <div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-secondary">Zemin</span>
          <ColorOpacityPicker
            value={ref.bgColor}
            onChange={(v) => updateSelectedCells({ bgColor: v })}
          />
        </div>
      </div>

      <div className="bg-surface-panel p-2 rounded border border-border-default shadow-drop-sm">
        <SpacingPicker
          title="İç Boşluk"
          value={ref.padding}
          onChange={(val) => updateSelectedCells({ padding: val })}
        />
      </div>

      <div className="bg-surface-panel p-2 rounded border border-border-default shadow-drop-sm">
        <TypographyPicker
          title="Yazı"
          value={ref.font}
          onChange={(val) => updateSelectedCells({ font: val })}
        />
      </div>
    </div>
  );
}
