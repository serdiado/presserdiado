import { useEffect, useState, type DragEvent } from 'react';
import { X, Package, Inbox } from 'lucide-react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import type { TempPoolProduct } from '@matbaapro/shared';

const FLYOUT_ID = 'temp-pool';

export function FlyoutPanel() {
  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);
  const tempPool = useCatalogStore((s) => s.tempProductPool);
  const clearSlotToPool = useCatalogStore((s) => s.clearSlotToPool);
  const returnProductFromTempPool = useCatalogStore((s) => s.returnProductFromTempPool);
  const removeFromTempPool = useCatalogStore((s) => s.removeFromTempPool);
  const clearTempPool = useCatalogStore((s) => s.clearTempPool);

  const isOpen = activeFlyout === FLYOUT_ID;
  const [isDropTarget, setIsDropTarget] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveFlyout(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setActiveFlyout]);

  const handleProductDragStart = (e: DragEvent, product: TempPoolProduct) => {
    if (product.sku) e.dataTransfer.setData('sourceTempPoolSku', product.sku);
  };

  const handlePanelDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!isDropTarget) setIsDropTarget(true);
  };

  const handlePanelDragLeave = (e: DragEvent) => {
    if (e.currentTarget === e.target) setIsDropTarget(false);
  };

  const handlePanelDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);

    const sourcePageStr = e.dataTransfer.getData('sourcePage');
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
    if (!sourcePageStr || !sourceIndexStr) return;

    const sourcePage = parseInt(sourcePageStr, 10);
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (isNaN(sourcePage) || isNaN(sourceIndex)) return;

    const { formas, activeFormaId } = useCatalogStore.getState();
    const activeForma = formas.find((f) => f.id === activeFormaId);
    const page = activeForma?.pages.find((p) => p.pageNumber === sourcePage);
    const slot = page?.slots[sourceIndex];
    if (slot) {
      clearSlotToPool(sourcePage, slot.id);
    }
  };

  return (
    <div
      onDragOver={handlePanelDragOver}
      onDragLeave={handlePanelDragLeave}
      onDrop={handlePanelDrop}
      className="absolute top-4 bottom-4 w-60 bg-surface-panel rounded-xl shadow-xl border border-border-default flex flex-col overflow-hidden transition-transform duration-200 ease-out z-10"
      style={{
        left: '80px',
        transform: isOpen ? 'translateX(0)' : 'translateX(calc(-100% - 80px))',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between px-3 py-2.5 bg-surface-subtle border-b border-border-default shrink-0">
        <div className="flex items-center gap-2 text-text-primary">
          <span className="text-heading-md">Bekleme Alanı</span>
        </div>
        <button
          type="button"
          onClick={() => setActiveFlyout(null)}
          className="text-text-secondary hover:text-text-primary p-1 rounded transition-colors"
          title="Kapat"
        >
          <X size={16} />
        </button>
      </div>

      {tempPool.length > 0 && (
        <div className="px-4 py-2 border-b border-border-default flex items-center justify-between shrink-0">
          <span className="text-body-sm text-text-secondary">{tempPool.length} ürün</span>
          <button
            type="button"
            onClick={clearTempPool}
            className="text-body-sm text-danger hover:underline"
          >
            Havuzu temizle
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {tempPool.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted px-4 text-center">
            <Inbox size={32} strokeWidth={1.25} className="mb-2 opacity-50" />
            <p className="text-body-sm">Sayfadan bir ürün hücresini sürükleyip buraya bırakın.</p>
          </div>
        ) : (
          tempPool.map((p, i) => (
            <div
              key={`${p.sku ?? p.id}-${i}`}
              draggable
              onDragStart={(e) => handleProductDragStart(e, p)}
              onDoubleClick={() => p.sku && returnProductFromTempPool(p.sku)}
              className="group relative flex items-center gap-2 bg-surface-panel border border-border-default rounded-radius-md p-2 hover:border-border-strong hover:shadow-drop-sm transition-all cursor-grab active:cursor-grabbing"
              title="Çift tıkla → orijinal hücreye geri koy"
            >
              <div className="w-9 h-9 bg-surface-subtle rounded border border-border-default flex items-center justify-center overflow-hidden shrink-0">
                {p.image ? (
                  <img src={p.image} alt={p.name ?? ''} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-body-xs text-text-muted">Yok</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-body-sm text-text-primary truncate">{p.name}</div>
                <div className="text-body-xs text-text-muted truncate">{p.sku}</div>
              </div>

              {p.price != null && p.price !== '' && (
                <div className="text-body-sm text-text-primary shrink-0 pr-1">{p.price}</div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  p.sku && removeFromTempPool(p.sku);
                }}
                className="absolute top-1 right-1 p-0.5 rounded text-text-muted hover:text-danger hover:bg-surface-subtle opacity-0 group-hover:opacity-100 transition-opacity"
                title="Sil"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
