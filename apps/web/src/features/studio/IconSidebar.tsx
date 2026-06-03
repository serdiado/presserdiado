import { useState } from 'react';
import { Package } from 'lucide-react';
import { useCatalogStore, useUIStore } from '@/stores/studio';

export function IconSidebar() {
  const tempPool = useCatalogStore((s) => s.tempProductPool);
  const moveSlotToTempPool = useCatalogStore((s) => s.moveSlotToTempPool);
  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);

  const [isDragOver, setIsDragOver] = useState(false);

  const isFlyoutOpen = activeFlyout === 'temp-pool';

  const handleToggle = () => {
    if (isFlyoutOpen) {
      setActiveFlyout(null);
    } else {
      setActiveFlyout('temp-pool');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const sourcePageStr = e.dataTransfer.getData('sourcePage');
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');

    if (sourcePageStr && sourceIndexStr) {
      const sourcePage = parseInt(sourcePageStr, 10);
      const sourceIndex = parseInt(sourceIndexStr, 10);

      if (!isNaN(sourcePage) && !isNaN(sourceIndex)) {
        // Translate pageNumber & slotIndex to slotId
        const formas = useCatalogStore.getState().formas;
        const activeFormaId = useCatalogStore.getState().activeFormaId;
        const activeForma = formas.find((f) => f.id === activeFormaId);
        const page = activeForma?.pages.find((p) => p.pageNumber === sourcePage);
        const slot = page?.slots[sourceIndex];

        if (slot) {
          moveSlotToTempPool(sourcePage, slot.id);
        }
      }
    }
  };

  return (
    <div className="w-12 bg-surface-panel border-r border-border-default flex flex-col items-center py-4 h-full shrink-0 select-none">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleToggle}
        className={`relative w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
          isFlyoutOpen ? 'bg-surface-subtle text-text-primary' : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
        } ${isDragOver ? 'animate-pulse ring-2 ring-border-strong border-transparent' : ''}`}
        title="Geçici Havuz"
      >
        <Package size={20} />

        {tempPool.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
            {tempPool.length}
          </span>
        )}
      </div>
    </div>
  );
}
