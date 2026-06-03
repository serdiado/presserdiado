import { useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import type { TempPoolProduct } from '@matbaapro/shared';

export function FlyoutPanel() {
  const tempPool = useCatalogStore((s) => s.tempProductPool);
  const returnProductFromTempPool = useCatalogStore((s) => s.returnProductFromTempPool);
  const removeFromTempPool = useCatalogStore((s) => s.removeFromTempPool);
  const clearTempPool = useCatalogStore((s) => s.clearTempPool);

  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);

  const isOpen = activeFlyout === 'temp-pool';

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveFlyout(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setActiveFlyout]);

  const onDragStart = (e: React.DragEvent, product: TempPoolProduct) => {
    if (product.sku) {
      e.dataTransfer.setData('sourceTempPoolSku', product.sku);
    }
  };

  return (
    <div
      className={`fixed top-12 bottom-0 left-12 w-60 bg-surface-panel border-r border-border-default flex flex-col shadow-xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
      }`}
      style={{ zIndex: 450 }}
    >
      {/* Header */}
      <div className="h-12 border-b border-border-default px-4 flex items-center justify-between bg-surface-subtle/50 shrink-0">
        <span className="text-label-md font-semibold text-text-primary">Geçici Havuz</span>
        <button
          onClick={() => setActiveFlyout(null)}
          className="text-text-muted hover:text-text-primary hover:bg-surface-subtle p-1 rounded transition-colors"
          title="Kapat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Havuzu temizle butonu */}
      {tempPool.length > 0 && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <button
            onClick={clearTempPool}
            className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 size={13} />
            Havuzu temizle
          </button>
        </div>
      )}

      {/* İçerik Listesi */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tempPool.length === 0 ? (
          <div className="py-8 text-center text-text-muted flex flex-col items-center justify-center h-full">
            <svg className="w-8 h-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-body-xs italic px-4">
              Sayfadan çıkardığınız ürünler burada görünür.
            </p>
          </div>
        ) : (
          tempPool.map((p, i) => (
            <div
              key={`${p.sku ?? p.id}-${i}`}
              draggable
              onDragStart={(e) => onDragStart(e, p)}
              onDoubleClick={() => p.sku && returnProductFromTempPool(p.sku)}
              className="group relative flex items-center gap-2 bg-surface-panel border border-border-default rounded-lg p-2 shadow-sm hover:border-border-strong hover:shadow-drop-sm transition-all duration-200 cursor-grab active:cursor-grabbing"
              title="Çift tıkla → orijinal hücreye geri koy"
            >
              {/* Ürün Görseli */}
              <div className="w-8 h-8 bg-surface-panel rounded border border-border-default flex justify-center items-center overflow-hidden shrink-0">
                {p.image ? (
                  <img src={p.image} alt={p.name ?? ''} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-[9px] text-text-muted">Yok</span>
                )}
              </div>

              {/* Ürün Bilgisi */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-xs font-medium text-text-primary truncate">
                  {p.name}
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  {p.sku}
                </div>
              </div>

              {/* Fiyat ve Sil Butonu */}
              <div className="flex items-center gap-1.5 shrink-0 pr-1">
                <div className="text-xs font-semibold text-text-primary">
                  {p.price} €
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    p.sku && removeFromTempPool(p.sku);
                  }}
                  className="absolute top-1 right-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-surface-panel hover:bg-red-50 border border-transparent hover:border-red-100"
                  title="Sil"
                >
                  <X size={11} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
