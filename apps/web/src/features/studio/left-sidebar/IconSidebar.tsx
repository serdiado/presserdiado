import { useState, type DragEvent } from 'react';
import { Package, LayoutTemplate, FolderOpen, Wand2, ImageIcon, LayoutGrid, PenTool } from 'lucide-react';
import { useCatalogStore, useUIStore } from '@/stores/studio';

const FLYOUT_ID = 'temp-pool';
const FORMAS_FLYOUT_ID = 'formas';
const PROJELER_FLYOUT_ID = 'projeler';
const TEMALAR_FLYOUT_ID = 'temalar';
const MEDYA_FLYOUT_ID = 'medya';
const MODULLER_FLYOUT_ID = 'moduller';

export function IconSidebar() {
  const tempPoolCount = useCatalogStore((s) => s.tempProductPool.length);
  const moveSlotToTempPool = useCatalogStore((s) => s.moveSlotToTempPool);
  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);

  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!isDropTarget) setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);

    const sourcePageStr = e.dataTransfer.getData('sourcePage');
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
    if (!sourcePageStr || !sourceIndexStr) return;

    const sourcePage = parseInt(sourcePageStr, 10);
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (isNaN(sourcePage) || isNaN(sourceIndex)) return;

    // moveSlotToTempPool(pageNumber, slotId) imzasını kullanmak için index -> id
    const { formas, activeFormaId } = useCatalogStore.getState();
    const activeForma = formas.find((f) => f.id === activeFormaId);
    const page = activeForma?.pages.find((p) => p.pageNumber === sourcePage);
    const slot = page?.slots[sourceIndex];
    if (slot) {
      moveSlotToTempPool(sourcePage, slot.id);
    }
  };

  const toggleFlyout = (id: string) => {
    setActiveFlyout(activeFlyout === id ? null : id);
  };

  return (
    <div className="w-full h-full flex flex-col gap-2 py-2">
      {/* Bekleme */}
      <button
        type="button"
        title="Bekleme Alanı"
        onClick={() => toggleFlyout(FLYOUT_ID)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 px-1 transition-colors cursor-pointer ${
          activeFlyout === FLYOUT_ID
            ? 'bg-surface-subtle text-text-primary'
            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        } ${isDropTarget ? 'ring-2 ring-primary ring-inset animate-pulse' : ''}`}
      >
        <div className="relative">
          <Package size={22} strokeWidth={1.5} />
          {tempPoolCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-4.5 h-4.5 px-1 bg-text-primary text-white text-label-sm rounded-full flex items-center justify-center">
              {tempPoolCount}
            </span>
          )}
        </div>
        <span className="text-icon-label">Bekleme</span>
      </button>

      {/* İnce ayraç */}
      <div className="mx-3 border-t border-border-default" />

      {/* Formalar */}
      <button
        type="button"
        title="Formalar"
        onClick={() => toggleFlyout(FORMAS_FLYOUT_ID)}
        className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 px-1 transition-colors cursor-pointer ${
          activeFlyout === FORMAS_FLYOUT_ID
            ? 'bg-surface-subtle text-text-primary'
            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        }`}
      >
        <div className="relative">
          <LayoutTemplate size={22} strokeWidth={1.5} />
        </div>
        <span className="text-icon-label">Formalar</span>
      </button>

      {/* Projeler */}
      <button
        type="button"
        title="Projeler"
        onClick={() => toggleFlyout(PROJELER_FLYOUT_ID)}
        className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 px-1 transition-colors cursor-pointer ${
          activeFlyout === PROJELER_FLYOUT_ID
            ? 'bg-surface-subtle text-text-primary'
            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        }`}
      >
        <div className="relative">
          <FolderOpen size={22} strokeWidth={1.5} />
        </div>
        <span className="text-icon-label">Projeler</span>
      </button>

      {/* İnce ayraç */}
      <div className="mx-3 border-t border-border-default" />

      {/* Temalar */}
      <button
        type="button"
        title="Temalar"
        onClick={() => toggleFlyout(TEMALAR_FLYOUT_ID)}
        className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 px-1 transition-colors cursor-pointer ${
          activeFlyout === TEMALAR_FLYOUT_ID
            ? 'bg-surface-subtle text-text-primary'
            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        }`}
      >
        <div className="relative">
          <Wand2 size={22} strokeWidth={1.5} />
        </div>
        <span className="text-icon-label">Temalar</span>
      </button>

      {/* Medya */}
      <button
        type="button"
        title="Medya"
        onClick={() => toggleFlyout(MEDYA_FLYOUT_ID)}
        className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 px-1 transition-colors cursor-pointer ${
          activeFlyout === MEDYA_FLYOUT_ID
            ? 'bg-surface-subtle text-text-primary'
            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        }`}
      >
        <div className="relative">
          <ImageIcon size={22} strokeWidth={1.5} />
        </div>
        <span className="text-icon-label">Medya</span>
      </button>

      {/* Modüller */}
      <button
        type="button"
        title="Modüller"
        onClick={() => toggleFlyout(MODULLER_FLYOUT_ID)}
        className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 px-1 transition-colors cursor-pointer ${
          activeFlyout === MODULLER_FLYOUT_ID
            ? 'bg-surface-subtle text-text-primary'
            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        }`}
      >
        <div className="relative">
          <LayoutGrid size={22} strokeWidth={1.5} />
        </div>
        <span className="text-icon-label">Modüller</span>
      </button>

      {/* İnce ayraç */}
      <div className="mx-3 border-t border-border-default" />

      {/* Araçlar (Disabled) */}
      <button
        type="button"
        disabled
        title="Yakında"
        className="w-full flex flex-col items-center justify-center gap-1.5 py-3 px-1 transition-colors cursor-not-allowed opacity-50 text-text-secondary"
      >
        <div className="relative">
          <PenTool size={22} strokeWidth={1.5} />
        </div>
        <span className="text-icon-label">Araçlar</span>
      </button>
    </div>
  );
}
