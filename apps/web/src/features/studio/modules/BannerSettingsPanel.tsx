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
      <p className="p-3 text-xs text-slate-500 italic text-center">
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
        <p className="text-xs text-slate-500 italic text-center">
          Banner içinde bir hücre seçin (32 hücre arasından).
        </p>
        <p className="text-[10px] text-slate-400">
          Çift tıklayarak metin düzenleyebilirsiniz. Ctrl+tıklama ile çoklu seçim.
        </p>
      </div>
    );
  }

  const ref = targetCells[0];

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-slate-500 font-bold">
        {targetCells.length} banner hücresi
      </p>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600">Zemin</span>
          <ColorOpacityPicker
            color={ref.bgColor.c}
            opacity={ref.bgColor.o}
            onChange={(c, o) => updateSelectedCells({ bgColor: { c, o } })}
          />
        </div>
      </div>

      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <SpacingPicker
          title="İç Boşluk"
          value={ref.padding}
          onChange={(val) => updateSelectedCells({ padding: val })}
        />
      </div>

      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
        <TypographyPicker
          title="Yazı"
          value={ref.font}
          onChange={(val) => updateSelectedCells({ font: val })}
        />
      </div>
    </div>
  );
}
