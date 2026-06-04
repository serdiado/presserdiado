import { useState, type DragEvent } from 'react';
import { Package } from 'lucide-react';
import { useCatalogStore, useUIStore } from '@/stores/studio';

const FLYOUT_ID = 'temp-pool';

export function IconSidebar() {
  const tempPoolCount = useCatalogStore((s) => s.tempProductPool.length);
  const moveSlotToTempPool = useCatalogStore((s) => s.moveSlotToTempPool);
  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);

  const [isDropTarget, setIsDropTarget] = useState(false);
  const isActive = activeFlyout === FLYOUT_ID;

  const handleClick = () => {
    setActiveFlyout(isActive ? null : FLYOUT_ID);
  };

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

  return (
    <div className="w-full h-full flex flex-col">
      <button
        type="button"
        title="Bekleme Alanı"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 px-1 transition-colors cursor-pointer ${
          isActive
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
    </div>
  );
}
