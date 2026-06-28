// SKU'suz ürün resimlerini ürün listesiyle eşleştirmek için interaktif inceleme modalı.
// Yükleme sihirbazının Adım 2 (SKU eşleştir) ekranının ikizidir: otomatik tahmin SKU'ları
// ön-doldurulur, kullanıcı her satırı elle düzeltebilir, "Kaydet" mevcut resimleri günceller.

import { useEffect, useMemo, useState } from 'react';
import { X, Loader2, Wand2, AlertTriangle, RefreshCw, ImageOff } from 'lucide-react';
import { normalizeSku, guessSkuFromFileName, matchSku } from '@matbaapro/shared';
import api from '@/lib/api';
import { toAbsoluteUrl } from '@/lib/upload';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { SkuCombobox, type SkuOption } from './SkuCombobox';
import { type MatchRow, rowState, computeSortOrders, matchBadge } from './imageSkuMatch';
import type { ProductImage } from '../types';

interface RematchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function RematchModal({ isOpen, onClose, onSaved }: RematchModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [productOptions, setProductOptions] = useState<SkuOption[]>([]);
  // SKU (normalize) → DB'deki en yüksek sortOrder. Yeni eşleşmeler bunun üstüne sıralanır.
  const [existingMaxBySku, setExistingMaxBySku] = useState<Map<string, number>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Salt okunur sortOrder önizlemesi (sunucu da aynı mantıkla hesaplar).
  const sortOrders = useMemo(
    () => computeSortOrders(rows, existingMaxBySku),
    [rows, existingMaxBySku],
  );

  const load = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const [skuRes, imgRes] = await Promise.all([
        api.get<{ sku: string; name: string }[]>('/products/skus'),
        api.get<ProductImage[]>('/product-images'),
      ]);
      const options = (skuRes.data ?? [])
        .filter((p) => p.sku)
        .map((p) => ({ sku: p.sku, name: p.name }));
      const normMap = new Map<string, string>();
      for (const o of options) normMap.set(normalizeSku(o.sku), o.sku);

      // Eşleşmiş (sku≠null) resimlerden SKU başına mevcut max sortOrder.
      const maxBySku = new Map<string, number>();
      for (const img of imgRes.data ?? []) {
        if (!img.sku) continue;
        const key = normalizeSku(img.sku);
        maxBySku.set(key, Math.max(maxBySku.get(key) ?? 0, img.sortOrder ?? 0));
      }

      // Satırlar = SKU'suz resimler; otomatik tahmin SKU'su ön-doldurulur.
      const unmatched = (imgRes.data ?? []).filter((img) => !img.sku);
      const matchRows: MatchRow[] = unmatched.map((img) => ({
        id: img.id,
        fileName: img.fileName ?? '',
        url: img.imageKey,
        isTransparent: img.isTransparent,
        sku: matchSku(guessSkuFromFileName(img.fileName ?? ''), normMap),
      }));

      setProductOptions(options);
      setExistingMaxBySku(maxBySku);
      setRows(matchRows);
    } catch (err) {
      console.error('Eşleştirme verileri alınamadı', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const updateRow = (id: string, sku: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, sku } : r)));
  };

  const matchedCount = rows.filter((r) => rowState(r) === 'matched').length;
  const noneCount = rows.length - matchedCount;

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  const handleSave = async () => {
    const assignments = rows
      .filter((r) => r.sku.trim())
      .map((r) => ({ id: r.id, sku: r.sku.trim() }));
    if (assignments.length === 0) {
      toast.error('Kaydedilecek eşleştirme yok');
      return;
    }
    setIsSaving(true);
    try {
      const { data } = await api.post<{ matched: number; skipped: number }>(
        '/product-images/rematch',
        { assignments },
      );
      toast.success(
        `${data.matched} resim eşleştirildi` +
          (data.skipped > 0 ? `, ${data.skipped} atlandı (SKU başına 10 limiti)` : ''),
      );
      onSaved();
      onClose();
    } catch (err) {
      console.error('Eşleştirme kaydedilemedi', err);
      toast.error('Eşleştirme kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl w-full max-w-3xl shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
              <Wand2 size={16} />
            </div>
            <div>
              <h2 className="text-heading-xl text-text-primary">Resimleri Eşleştir</h2>
              <p className="text-body-xs text-text-muted mt-0.5">
                SKU'suz resimleri dosya adından ürünlerle eşleştir
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-body-sm mt-3">Yükleniyor…</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-danger-subtle text-danger flex items-center justify-center mb-3">
                <AlertTriangle size={22} />
              </div>
              <p className="text-body-md text-text-primary">Ürün/resim listesi alınamadı</p>
              <p className="text-body-sm text-text-secondary mt-1 mb-4">
                Bağlantıyı kontrol edip tekrar deneyin.
              </p>
              <Button variant="secondary" size="md" leftIcon={<RefreshCw size={16} />} onClick={load}>
                Tekrar dene
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted">
              <ImageOff size={28} />
              <p className="text-body-md text-text-primary mt-3">Eşleştirilecek SKU'suz resim yok</p>
              <p className="text-body-sm text-text-secondary mt-1">
                Tüm resimler zaten bir SKU'ya atanmış.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-xs">
                <span className="text-success">{matchedCount} otomatik eşleşti</span>
                <span className="text-danger">{noneCount} eşleşmedi</span>
              </div>

              <div className="border border-border-default rounded-radius-md overflow-hidden">
                <div className="max-h-[55vh] overflow-y-auto">
                  <table className="w-full text-body-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-surface-subtle/80 text-text-secondary text-body-xs">
                        <th className="text-left font-medium px-3 py-2">Dosya</th>
                        <th className="text-left font-medium px-3 py-2 w-44">SKU</th>
                        <th className="text-left font-medium px-3 py-2 w-16">Sıra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const state = rowState(r);
                        return (
                          <tr key={r.id} className="border-t border-border-default align-middle">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={toAbsoluteUrl(r.url)}
                                  alt={r.fileName}
                                  className="w-10 h-10 rounded-radius-md object-contain bg-surface-subtle shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="text-body-xs text-text-primary truncate max-w-44 block">
                                    {r.fileName || '(isimsiz)'}
                                  </span>
                                  <div className="mt-0.5">{matchBadge(state)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <SkuCombobox
                                value={r.sku}
                                options={productOptions}
                                onChange={(sku) => updateRow(r.id, sku)}
                                className="w-40"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-body-sm text-text-secondary tabular-nums">
                                {state === 'matched' ? sortOrders.get(r.id) : '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default flex justify-end items-center gap-3 shrink-0">
          <Button variant="secondary" size="md" onClick={handleClose} disabled={isSaving}>
            Vazgeç
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={isSaving || isLoading || loadError || matchedCount === 0}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Kaydediliyor…</span>
              </>
            ) : (
              <span>Kaydet ({matchedCount})</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
