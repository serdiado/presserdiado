// Compact panel: edit currently selected slot's product fields.

import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { uploadImage } from '@/lib/upload';

export function ProductInfoSettings() {
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotProduct = useCatalogStore((s) => s.updateSlotProduct);
  const clearSlot = useCatalogStore((s) => s.clearSlot);
  const moveSlotToTempPool = useCatalogStore((s) => s.moveSlotToTempPool);

  if (selectedSlotIds.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic p-3 text-center">
        Önce bir hücre seçin.
      </p>
    );
  }
  if (selectedSlotIds.length > 1) {
    return (
      <p className="text-xs text-slate-500 italic p-3 text-center">
        Birden fazla hücre seçili. Tek hücre seçerek detaylarını düzenleyebilirsiniz.
      </p>
    );
  }

  const slotId = selectedSlotIds[0];
  let pageNumber = 0;
  let slot = null as ReturnType<typeof getActivePages>[number]['slots'][number] | null;
  for (const p of getActivePages()) {
    const found = p.slots.find((s) => s.id === slotId);
    if (found) {
      slot = found;
      pageNumber = p.pageNumber;
      break;
    }
  }
  if (!slot) return null;

  const product = slot.product;

  return (
    <div className="space-y-3">
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-2">
        <h4 className="text-[10px] font-black text-slate-500">SEÇİLİ HÜCRE</h4>
        <p className="text-[9px] text-slate-500">
          Sayfa {pageNumber} • {slot.colSpan}×{slot.rowSpan} • {slot.role ?? 'product'}
        </p>
      </div>

      {product ? (
        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-2">
          <label className="block">
            <span className="text-[9px] font-bold text-slate-500 block mb-1">İsim</span>
            <input
              type="text"
              value={product.name ?? ''}
              onChange={(e) =>
                updateSlotProduct(pageNumber, slotId, { name: e.target.value })
              }
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:border-blue-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-bold text-slate-500 block mb-1">Fiyat</span>
            <input
              type="text"
              value={String(product.price ?? '')}
              onChange={(e) =>
                updateSlotProduct(pageNumber, slotId, { price: e.target.value })
              }
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:border-blue-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-bold text-slate-500 block mb-1">SKU</span>
            <input
              type="text"
              value={product.sku ?? ''}
              onChange={(e) =>
                updateSlotProduct(pageNumber, slotId, { sku: e.target.value })
              }
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:border-blue-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-bold text-slate-500 block mb-1">
              Görsel URL
            </span>
            <input
              type="text"
              value={product.image ?? ''}
              onChange={(e) =>
                updateSlotProduct(pageNumber, slotId, { image: e.target.value })
              }
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:border-blue-500 outline-none"
            />
            <ImageUploadButton
              onUploaded={(url) => updateSlotProduct(pageNumber, slotId, { image: url })}
            />
          </label>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => moveSlotToTempPool(pageNumber, slotId)}
              className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded"
            >
              Havuza Gönder
            </button>
            <button
              onClick={() => clearSlot(pageNumber, slotId)}
              className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded"
            >
              Temizle
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded">
          <p className="text-[10px] text-amber-700 font-bold">
            Bu hücrede ürün yok. Yan panelden bir ürün sürükleyin.
          </p>
        </div>
      )}
    </div>
  );
}

function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const t = toast.loading('Yükleniyor...');
    try {
      const result = await uploadImage(file);
      onUploaded(result.absoluteUrl);
      toast.success('Yüklendi', { id: t });
    } catch (err) {
      console.error(err);
      toast.error('Yükleme başarısız', { id: t });
    }
    if (ref.current) ref.current.value = '';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="mt-1 w-full py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded border border-emerald-200"
      >
        📤 Bilgisayardan görsel yükle
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={handle}
        className="hidden"
      />
    </>
  );
}
