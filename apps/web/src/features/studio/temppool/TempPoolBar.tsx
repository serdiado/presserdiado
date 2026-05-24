import { useCatalogStore, useUIStore } from '@/stores/studio';
import type { TempPoolProduct } from '@matbaapro/shared';

export function TempPoolBar() {
  const tempPool = useCatalogStore((s) => s.tempProductPool);
  const returnProductFromTempPool = useCatalogStore((s) => s.returnProductFromTempPool);
  const removeFromTempPool = useCatalogStore((s) => s.removeFromTempPool);
  const clearTempPool = useCatalogStore((s) => s.clearTempPool);
  const isOpen = useUIStore((s) => s.isTempPoolOpen);
  const toggleTempPool = useUIStore((s) => s.toggleTempPool);

  const onDragStart = (e: React.DragEvent, product: TempPoolProduct) => {
    if (product.sku) e.dataTransfer.setData('sourceTempPoolSku', product.sku);
  };

  return (
    <div
      className={`bg-white border-r border-slate-200 flex flex-col h-full transition-all ${
        isOpen ? 'w-56' : 'w-12'
      }`}
    >
      <button
        onClick={toggleTempPool}
        className="h-12 flex items-center justify-center border-b border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
        title={isOpen ? 'Havuzu Kapat' : 'Havuzu Aç'}
      >
        {isOpen ? '◀ Havuz' : '▶'}
      </button>
      {isOpen && (
        <>
          <div className="px-2 py-1.5 text-[10px] text-slate-500 flex justify-between items-center border-b">
            <span className="font-semibold">Geçici Havuz ({tempPool.length})</span>
            {tempPool.length > 0 && (
              <button
                onClick={clearTempPool}
                className="text-red-600 hover:underline"
                title="Hepsini temizle"
              >
                temizle
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {tempPool.length === 0 && (
              <p className="text-[10px] text-slate-400 italic text-center p-3">
                Sayfadan çıkardığınız ürünler burada görünür.
              </p>
            )}
            {tempPool.map((p) => (
              <div
                key={p.sku ?? p.id}
                draggable
                onDragStart={(e) => onDragStart(e, p)}
                onDoubleClick={() => p.sku && returnProductFromTempPool(p.sku)}
                className="group relative px-2 py-1.5 bg-amber-50 hover:bg-amber-100 rounded text-xs cursor-grab border border-amber-200"
                title="Çift tıkla → orijinal yere geri koy"
              >
                <div className="font-semibold text-slate-700 truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500">{p.sku}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    p.sku && removeFromTempPool(p.sku);
                  }}
                  className="absolute top-0.5 right-0.5 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
