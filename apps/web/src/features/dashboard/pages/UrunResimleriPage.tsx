import React, { useEffect, useMemo, useState } from 'react';
import {
  ImagePlus, Trash2, ImageOff, AlertCircle, RefreshCw, AlertTriangle, X, Plus,
} from 'lucide-react';
import api from '@/lib/api';
import { toAbsoluteUrl } from '@/lib/upload';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ProductImageUploadModal } from '../components/ProductImageUploadModal';
import { ProductFormModal } from '../components/ProductFormModal';
import { SkuCombobox, type SkuOption } from '../components/SkuCombobox';
import type { ProductImage, Product } from '../types';

type Filter = 'all' | 'matched' | 'unmatched';

export function UrunResimleriPage() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [productOptions, setProductOptions] = useState<SkuOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<ProductImage | null>(null);
  // SKU eşleştirme onayı (combobox'tan seçim sonrası)
  const [assigning, setAssigning] = useState<{ image: ProductImage; sku: string } | null>(null);
  // SKU eşleştirmesini kaldırma onayı
  const [unassigning, setUnassigning] = useState<ProductImage | null>(null);
  // "Yeni Ürün" akışı: hangi resim için ürün oluşturuluyor
  const [creatingForImage, setCreatingForImage] = useState<ProductImage | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [imgRes, prodRes] = await Promise.all([
        api.get<ProductImage[]>('/product-images'),
        api.get('/products'),
      ]);
      setImages(imgRes.data ?? []);
      const products: Product[] = prodRes.data?.data ?? prodRes.data ?? [];
      setProductOptions(products.filter((p) => p.sku).map((p) => ({ sku: p.sku, name: p.name })));
    } catch (err) {
      console.error('Resimler yüklenemedi:', err);
      setError('Resimler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const skuSet = useMemo(() => new Set(productOptions.map((o) => o.sku)), [productOptions]);

  // Eşleşmiş = SKU atanmış VE o SKU ürün listesinde mevcut. null/boş sku → eşleşmemiş.
  const isMatched = (img: ProductImage) => !!img.sku && skuSet.has(img.sku);

  const filtered = useMemo(() => {
    if (filter === 'matched') return images.filter(isMatched);
    if (filter === 'unmatched') return images.filter((i) => !isMatched(i));
    return images;
  }, [images, filter, skuSet]);

  const matchedCount = useMemo(
    () => images.filter(isMatched).length,
    [images, skuSet],
  );

  const productName = (sku: string) => productOptions.find((o) => o.sku === sku)?.name ?? null;

  // Combobox'tan seçim → doğrudan PATCH yerine onay modalı aç.
  const handleSelectSku = (image: ProductImage, sku: string) => {
    setEditingId(null);
    if (!sku || sku === image.sku) return;
    setAssigning({ image, sku });
  };

  const handleConfirmAssign = async () => {
    if (!assigning) return;
    const { image, sku } = assigning;
    try {
      await api.patch(`/product-images/${image.id}/sku`, { sku });
      setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, sku } : i)));
      toast.success('SKU eşleştirildi');
    } catch (err) {
      console.error('SKU eşleştirilemedi', err);
      toast.error('SKU eşleştirilemedi');
    } finally {
      setAssigning(null);
    }
  };

  const handleConfirmUnassign = async () => {
    if (!unassigning) return;
    const image = unassigning;
    try {
      await api.patch(`/product-images/${image.id}/sku`, { sku: null });
      setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, sku: null } : i)));
      toast.success('SKU eşleştirmesi kaldırıldı');
    } catch (err) {
      console.error('SKU eşleştirmesi kaldırılamadı', err);
      toast.error('SKU eşleştirmesi kaldırılamadı');
    } finally {
      setUnassigning(null);
    }
  };

  // "Yeni Ürün" ile oluşturulan ürünün SKU'su, ilgili resme otomatik atanır (onay gerekmez).
  const handleProductCreated = async (saved?: Product) => {
    const image = creatingForImage;
    setCreatingForImage(null);
    if (!saved?.sku) return;
    setProductOptions((prev) =>
      prev.some((o) => o.sku === saved.sku) ? prev : [...prev, { sku: saved.sku, name: saved.name }],
    );
    if (!image) return;
    try {
      await api.patch(`/product-images/${image.id}/sku`, { sku: saved.sku });
      setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, sku: saved.sku } : i)));
      toast.success(`"${saved.sku}" oluşturuldu ve eşleştirildi`);
    } catch (err) {
      console.error('Yeni ürün resme eşleştirilemedi', err);
      toast.error('Ürün oluşturuldu ama resme eşleştirilemedi');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/product-images/${deleting.id}`);
      setImages((prev) => prev.filter((i) => i.id !== deleting.id));
      toast.success('Resim silindi');
    } catch (err) {
      console.error('Resim silinemedi', err);
      toast.error('Resim silinemedi');
    } finally {
      setDeleting(null);
    }
  };

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'all', label: `Tümü (${images.length})` },
    { key: 'matched', label: `Eşleşmiş (${matchedCount})` },
    { key: 'unmatched', label: `Eşleşmemiş (${images.length - matchedCount})` },
  ];

  if (isLoading) {
    return (
      <div className="p-8 w-full max-w-300 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-heading-xl text-text-primary">Ürün Resimleri</h1>
          <div className="w-32 h-9 bg-surface-subtle animate-pulse rounded-radius-md" />
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-surface-panel border border-border-default rounded-radius-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-body-md text-text-secondary mb-4">{error}</p>
        <Button variant="secondary" onClick={fetchData} leftIcon={<RefreshCw size={16} />}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-300 mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-heading-xl text-text-primary">Ürün Resimleri</h1>
        <Button
          variant="primary"
          size="md"
          leftIcon={<ImagePlus size={16} />}
          onClick={() => setIsUploadOpen(true)}
        >
          Resim Yükle
        </Button>
      </div>

      {images.length === 0 ? (
        // Boş durum
        <div className="flex flex-col items-center justify-center py-20 bg-surface-panel border border-dashed border-border-strong rounded-radius-lg">
          <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted mb-4">
            <ImageOff size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-heading-md text-text-primary mb-1">Henüz resim yüklenmedi</h3>
          <p className="text-body-sm text-text-secondary mb-6 max-w-sm text-center">
            Ürün resimlerinizi toplu yükleyin; dosya adlarından SKU eşleştirmesini sizin için yapalım.
          </p>
          <Button variant="primary" size="md" leftIcon={<ImagePlus size={16} />} onClick={() => setIsUploadOpen(true)}>
            Resim Yükle
          </Button>
        </div>
      ) : (
        <>
          {/* Filtre sekmeleri */}
          <div className="flex items-center gap-2 mb-4 shrink-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`h-8 px-3 rounded-radius-md text-body-sm transition-colors ${
                  filter === tab.key
                    ? 'bg-surface-subtle text-text-primary border border-border-strong'
                    : 'text-text-secondary border border-transparent hover:bg-surface-subtle'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((img) => {
              const matched = isMatched(img);
              return (
                <div
                  key={img.id}
                  className="group relative bg-surface-panel border border-border-default hover:border-border-strong rounded-radius-lg overflow-hidden transition-colors"
                >
                  <div className="aspect-square bg-surface-subtle flex items-center justify-center overflow-hidden">
                    <img
                      src={toAbsoluteUrl(img.imageKey)}
                      alt={img.fileName ?? img.sku ?? 'ürün resmi'}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Sil butonu */}
                  <button
                    onClick={() => setDeleting(img)}
                    className="absolute top-2 right-2 p-1.5 rounded-radius-md bg-surface-panel/90 text-text-secondary hover:text-danger hover:bg-danger-subtle opacity-0 group-hover:opacity-100 transition-all"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* PNG opak uyarısı */}
                  {!img.isTransparent && img.fileName?.toLowerCase().endsWith('.png') && (
                    <span
                      title="Bu PNG'nin köşeleri opak olabilir — şeffaf arka plan beklentinizi kontrol edin"
                      className="absolute top-2 left-2 p-1 rounded-radius-md bg-surface-panel/90 text-warning"
                    >
                      <AlertTriangle size={14} />
                    </span>
                  )}

                  <div className="p-2.5 space-y-1">
                    {editingId === img.id ? (
                      <SkuCombobox
                        value={img.sku ?? ''}
                        options={productOptions}
                        onChange={(sku) => handleSelectSku(img, sku)}
                        autoOpen
                        onClose={() => setEditingId(null)}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-1 min-w-0">
                        <button
                          onClick={() => setEditingId(img.id)}
                          title="SKU ata / değiştir"
                          className={`inline-flex items-center min-w-0 truncate text-body-xs px-2 py-0.5 rounded-radius-md border transition-colors ${
                            !img.sku
                              ? 'text-danger bg-danger-subtle border-danger/30'
                              : matched
                                ? 'text-success bg-success/10 border-success/30 font-mono'
                                : 'text-warning bg-warning/10 border-warning/30 font-mono'
                          }`}
                        >
                          {img.sku || 'SKU atanmadı'}
                        </button>
                        {img.sku ? (
                          <button
                            onClick={() => setUnassigning(img)}
                            title="SKU eşleştirmesini kaldır"
                            className="shrink-0 p-0.5 rounded text-text-muted hover:text-danger transition-colors"
                          >
                            <X size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setCreatingForImage(img)}
                            title="Bu resim için yeni ürün oluştur"
                            className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-radius-md text-body-xs text-text-secondary hover:bg-surface-subtle transition-colors"
                          >
                            <Plus size={13} /> Yeni Ürün
                          </button>
                        )}
                      </div>
                    )}
                    {img.fileName && (
                      <p className="text-[11px] text-text-muted truncate" title={img.fileName}>
                        {img.fileName}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-body-md text-text-secondary">
              Bu filtreyle eşleşen resim yok.
            </div>
          )}
        </>
      )}

      <ProductImageUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSaved={fetchData}
      />

      <ConfirmModal
        isOpen={deleting !== null}
        title="Resmi Sil"
        description={
          deleting
            ? `"${deleting.fileName ?? deleting.sku}" resmini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : ''
        }
        confirmLabel="Sil"
        cancelLabel="Vazgeç"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />

      <ConfirmModal
        isOpen={assigning !== null}
        title="SKU Eşleştir"
        description={
          assigning
            ? `Bu resmi ${assigning.sku}${
                productName(assigning.sku) ? ` — ${productName(assigning.sku)}` : ''
              } ile eşleştirmek istiyor musunuz?`
            : ''
        }
        confirmLabel="Eşleştir"
        cancelLabel="Vazgeç"
        confirmVariant="primary"
        onConfirm={handleConfirmAssign}
        onCancel={() => setAssigning(null)}
      />

      <ConfirmModal
        isOpen={unassigning !== null}
        title="SKU Eşleştirmesini Kaldır"
        description={
          unassigning
            ? `Bu resmin ${unassigning.sku} eşleştirmesi kaldırılacak. Resim Eşleşmemiş bölümüne taşınacak.`
            : ''
        }
        confirmLabel="Kaldır"
        cancelLabel="Vazgeç"
        confirmVariant="danger"
        onConfirm={handleConfirmUnassign}
        onCancel={() => setUnassigning(null)}
      />

      <ProductFormModal
        isOpen={creatingForImage !== null}
        onClose={() => setCreatingForImage(null)}
        onSave={handleProductCreated}
      />
    </div>
  );
}
