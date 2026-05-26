// Compact panel: edit currently selected slot's product fields.

import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { uploadImage } from '@/lib/upload';

const RAW_FIELD_LABELS: Record<string, string> = {
  POS: 'Pozisyon',
  SIRA: 'Sıra',
  INDEX: 'Index',
  ARTNR: 'SKU / Ürün Kodu',
  KOD: 'SKU / Ürün Kodu',
  SKU: 'SKU / Ürün Kodu',
  BEZEICHNUNG: 'Ürün Adı',
  URUN_ADI: 'Ürün Adı',
  AD: 'Ürün Adı',
  NAME: 'Ürün Adı',
  VK_NETTO: 'Satış Fiyatı',
  FIYAT: 'Satış Fiyatı',
  PRICE: 'Satış Fiyatı',
  KATEGORI: 'Kategori',
  ARTGRP: 'Kategori',
  CATEGORY: 'Kategori',
  RESIM: 'Görsel URL',
  IMAGE: 'Görsel URL',
};

function rawToRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

function rawPatchForKnownField(raw: Record<string, unknown>, candidates: string[], value: string) {
  const key = candidates.find((candidate) => Object.prototype.hasOwnProperty.call(raw, candidate));
  return key ? { [key]: value } : {};
}

export function ProductInfoSettings() {
  const selectedSlotIds = useUIStore((s) => s.selectedSlotIds);
  const getActivePages = useCatalogStore((s) => s.getActivePages);
  const updateSlotProduct = useCatalogStore((s) => s.updateSlotProduct);
  const clearSlot = useCatalogStore((s) => s.clearSlot);
  const moveSlotToTempPool = useCatalogStore((s) => s.moveSlotToTempPool);

  if (selectedSlotIds.length === 0) {
    return (
      <p className="text-xs text-text-muted italic p-3 text-center">
        Önce bir hücre seçin.
      </p>
    );
  }
  if (selectedSlotIds.length > 1) {
    return (
      <p className="text-xs text-text-muted italic p-3 text-center">
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

  const rawRecord = rawToRecord(product?.raw);
  const updateProductField = (updates: Record<string, unknown>, rawUpdates: Record<string, unknown> = {}) => {
    updateSlotProduct(pageNumber, slotId, {
      ...updates,
      raw: { ...rawRecord, ...rawUpdates },
    });
  };

  const updateRawField = (key: string, value: string) => {
    const upperKey = key.trim().toUpperCase();
    const syncedUpdates: Record<string, unknown> = {};

    if (['ARTNR', 'KOD', 'SKU'].includes(upperKey)) syncedUpdates.sku = value;
    if (['BEZEICHNUNG', 'URUN_ADI', 'AD', 'NAME'].includes(upperKey)) syncedUpdates.name = value;
    if (['VK_NETTO', 'FIYAT', 'PRICE'].includes(upperKey)) syncedUpdates.price = value;
    if (['KATEGORI', 'ARTGRP', 'CATEGORY'].includes(upperKey)) syncedUpdates.category = value;
    if (['RESIM', 'IMAGE'].includes(upperKey)) syncedUpdates.image = value;

    updateProductField(syncedUpdates, { [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm space-y-2">
        <h4 className="text-[10px] font-black text-text-muted">SEÇİLİ HÜCRE</h4>
        <p className="text-[9px] text-text-muted">
          Sayfa {pageNumber} • {slot.colSpan}×{slot.rowSpan} • {slot.role ?? 'product'}
        </p>
      </div>

      {product ? (
        <div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm space-y-2">
          <label className="block">
            <span className="text-[9px] font-bold text-text-muted block mb-1">Ürün Adı</span>
            <input
              type="text"
              value={product.name ?? ''}
              onChange={(e) =>
                updateProductField(
                  { name: e.target.value },
                  rawPatchForKnownField(rawRecord, ['BEZEICHNUNG', 'URUN_ADI', 'AD', 'NAME'], e.target.value),
                )
              }
              className="w-full text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-bold text-text-muted block mb-1">Fiyat</span>
            <input
              type="text"
              value={String(product.price ?? '')}
              onChange={(e) =>
                updateProductField(
                  { price: e.target.value },
                  rawPatchForKnownField(rawRecord, ['VK_NETTO', 'FIYAT', 'PRICE'], e.target.value),
                )
              }
              className="w-full text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-bold text-text-muted block mb-1">SKU</span>
            <input
              type="text"
              value={product.sku ?? ''}
              onChange={(e) =>
                updateProductField(
                  { sku: e.target.value },
                  rawPatchForKnownField(rawRecord, ['ARTNR', 'KOD', 'SKU'], e.target.value),
                )
              }
              className="w-full text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-bold text-text-muted block mb-1">Kategori</span>
            <input
              type="text"
              value={product.category ?? ''}
              onChange={(e) =>
                updateProductField(
                  { category: e.target.value },
                  rawPatchForKnownField(rawRecord, ['KATEGORI', 'ARTGRP', 'CATEGORY'], e.target.value),
                )
              }
              className="w-full text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-bold text-text-muted block mb-1">
              Görsel URL
            </span>
            <input
              type="text"
              value={product.image ?? ''}
              onChange={(e) =>
                updateProductField(
                  { image: e.target.value },
                  rawPatchForKnownField(rawRecord, ['RESIM', 'IMAGE'], e.target.value),
                )
              }
              className="w-full text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"
            />
            <ImageUploadButton
              onUploaded={(url) =>
                updateProductField(
                  { image: url },
                  rawPatchForKnownField(rawRecord, ['RESIM', 'IMAGE'], url),
                )
              }
            />
          </label>

          {Object.keys(rawRecord).length > 0 && (
            <div className="pt-3 mt-3 border-t border-border-default space-y-2">
              <div>
                <h5 className="text-[9px] font-black text-text-muted uppercase tracking-wider">Excel Alanları</h5>
                <p className="text-[9px] text-text-muted mt-0.5">Excel’den gelen tüm kolonlar burada düzenlenebilir.</p>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {Object.entries(rawRecord).map(([key, value]) => (
                  <label key={key} className="block">
                    <span className="text-[9px] font-bold text-text-muted block mb-1">
                      {RAW_FIELD_LABELS[key.toUpperCase()] ?? key}
                      <span className="ml-1 font-mono font-normal text-[8px] text-text-muted/70">({key})</span>
                    </span>
                    <input
                      type="text"
                      value={String(value ?? '')}
                      onChange={(e) => updateRawField(key, e.target.value)}
                      className="w-full text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => moveSlotToTempPool(pageNumber, slotId)}
              className="flex-1 py-1.5 bg-surface-subtle hover:bg-border-default text-text-secondary text-[10px] font-medium rounded border border-border-default"
            >
              Havuza Gönder
            </button>
            <button
              onClick={() => clearSlot(pageNumber, slotId)}
              className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-medium rounded border border-red-200"
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
