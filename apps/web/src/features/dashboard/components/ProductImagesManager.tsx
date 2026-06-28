// Bir SKU'nun ürün resimlerini yöneten yeniden kullanılabilir bileşen (ekle + sil).
// Tek-kaynak: per-SKU resim yönetimi sadece burada. Birincil = en düşük sortOrder (ilk öğe).
// Eklemenin iki kaynağı: (a) bilgisayardan yükle, (b) Medya Kütüphanesi'nden seç.

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2, UploadCloud, Library, ImageOff, Star } from 'lucide-react';
import axios from 'axios';
import api from '@/lib/api';
import { uploadImage, toAbsoluteUrl } from '@/lib/upload';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { MediaPickerModal, type PickedImage } from './MediaPickerModal';
import type { ProductImage } from '../types';

interface ProductImagesManagerProps {
  sku: string;
  // Resim listesi değiştiğinde (ekle/sil) çağrılır — üst bileşen listeyi tazeleyebilsin diye.
  onChange?: () => void;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';
// backend MAX_IMAGES_PER_SKU ile senkron tutulmalı.
const MAX_IMAGES_PER_SKU = 10;

export function ProductImagesManager({ sku, onChange }: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_IMAGES_PER_SKU - images.length;
  const atLimit = remaining <= 0;

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ProductImage[]>(`/product-images/by-sku/${encodeURIComponent(sku)}`);
      setImages(res.data ?? []);
    } catch (err) {
      console.error('Ürün resimleri alınamadı:', err);
      toast.error('Ürün resimleri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sku) fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku]);

  const notifyChanged = async () => {
    await fetchImages();
    onChange?.();
  };

  // Bilgisayardan yükleme: her dosyayı /upload ile yükle, sonra product-images kaydı oluştur.
  // sortOrder gönderilmez → backend mevcut max + 1 atar (tek-kaynak sıralama).
  const handleFiles = async (fileList: FileList | File[]) => {
    let files = Array.from(fileList).filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
    if (files.length === 0) {
      toast.error('Sadece JPEG, PNG veya WebP dosyaları yüklenebilir');
      return;
    }
    // Kota ön-kontrolü (backend 409 yine güvenlik ağı). Kalanı aşan dosyalar kırpılır.
    if (remaining <= 0) {
      toast.error(`Bu ürün maksimum ${MAX_IMAGES_PER_SKU} görsele ulaştı`);
      return;
    }
    if (files.length > remaining) {
      files = files.slice(0, remaining);
      toast.error(`Limit nedeniyle yalnızca ${remaining} görsel eklendi (SKU başına en fazla ${MAX_IMAGES_PER_SKU})`);
    }
    setIsUploading(true);
    let added = 0;
    let limitHit = false;
    try {
      for (const file of files) {
        try {
          const { url } = await uploadImage(file);
          await api.post('/product-images', { imageKey: url, fileName: file.name, sku });
          added++;
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 409) {
            limitHit = true;
          } else {
            console.error('Resim eklenemedi:', file.name, err);
          }
        }
      }
      if (added > 0) toast.success(`${added} görsel eklendi`);
      if (limitHit) toast.error(`SKU başına en fazla ${MAX_IMAGES_PER_SKU} resim eklenebilir`);
      if (added > 0) await notifyChanged();
    } finally {
      setIsUploading(false);
    }
  };

  // Picker'dan seçilen görselleri ürüne kopyala. Kaynak (medya / başka SKU'nun ürün resmi)
  // ne olursa olsun tek yol: imageKey kopyalanarak yeni product-images kaydı (backend otomatik
  // sortOrder). Kaynak satır/dosya yerinde kalır — kopya semantiği.
  const handlePicked = async (picked: PickedImage[]) => {
    setIsPickerOpen(false);
    if (picked.length === 0) return;
    setIsUploading(true);
    let added = 0;
    let limitHit = false;
    try {
      for (const item of picked) {
        try {
          await api.post('/product-images', {
            imageKey: item.imageKey,
            ...(item.fileName ? { fileName: item.fileName } : {}),
            sku,
          });
          added++;
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 409) {
            limitHit = true;
          } else {
            console.error('Görsel ürüne eklenemedi:', item.imageKey, err);
          }
        }
      }
      if (added > 0) toast.success(`${added} görsel eklendi`);
      if (limitHit) toast.error(`SKU başına en fazla ${MAX_IMAGES_PER_SKU} resim eklenebilir`);
      if (added > 0) await notifyChanged();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/product-images/${id}`);
      await notifyChanged();
    } catch (err) {
      console.error('Resim silinemedi:', err);
      toast.error('Resim silinemedi');
    } finally {
      setDeletingId(null);
    }
  };

  // Yeni sırayı optimistic uygula → backend'e yaz → üst bileşeni bildir (refetch yapmadan; spinner
  // flash'ı olmasın, optimistic durum sunucuyla zaten aynı). Hata → eski sıraya geri dön.
  const persistOrder = async (newImages: ProductImage[]) => {
    const prev = images;
    setImages(newImages);
    setIsReordering(true);
    try {
      await api.patch('/product-images/reorder', {
        sku,
        orderedIds: newImages.map((i) => i.id),
      });
      onChange?.();
    } catch (err) {
      console.error('Sıralama güncellenemedi:', err);
      toast.error('Sıralama güncellenemedi');
      setImages(prev);
    } finally {
      setIsReordering(false);
    }
  };

  // Bir resmi başa al (birincil yap). Zaten birincilse veya tek resim varsa no-op.
  const handleSetPrimary = (id: string) => {
    if (images.length < 2 || images[0]?.id === id) return;
    const target = images.find((i) => i.id === id);
    if (!target) return;
    persistOrder([target, ...images.filter((i) => i.id !== id)]);
  };

  // Sürükle-bırak ile yeniden sırala: dragId'yi targetId'nin konumuna taşı.
  const handleDrop = (targetId: string) => {
    const sourceId = dragId;
    setDragId(null);
    if (!sourceId || sourceId === targetId) return;
    const fromIdx = images.findIndex((i) => i.id === sourceId);
    const toIdx = images.findIndex((i) => i.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...images];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    persistOrder(next);
  };

  return (
    <div className="space-y-3">
      {/* Aksiyon butonları kendi satırında — dar panelde (Stüdyo sağ panel) sarıp alt alta geçer,
          geniş modalda yan yana durur. Görsel sayısı başlıktan çıkarılıp ızgaranın altına alındı. */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 min-w-36"
          leftIcon={<UploadCloud size={14} />}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading || atLimit}
        >
          Bilgisayardan Yükle
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 min-w-36"
          leftIcon={<Library size={14} />}
          onClick={() => setIsPickerOpen(true)}
          disabled={isUploading || atLimit}
        >
          Kütüphaneden Seç
        </Button>
      </div>

      {atLimit && (
        <p className="text-body-xs text-text-muted">
          Bu ürün maksimum {MAX_IMAGES_PER_SKU} görsele ulaştı. Yeni görsel eklemek için önce bir görsel silin.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          if (inputRef.current) inputRef.current.value = '';
        }}
        className="hidden"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border-default rounded-radius-lg text-center">
          <div className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted mb-2">
            <ImageOff size={20} strokeWidth={1.5} />
          </div>
          <p className="text-body-sm text-text-secondary">
            Bu ürüne henüz görsel eklenmedi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {images.map((img, index) => {
            const isDeleting = deletingId === img.id;
            const isDragging = dragId === img.id;
            const canReorder = images.length > 1 && !isReordering && !isUploading;
            return (
              <div
                key={img.id}
                draggable={canReorder}
                onDragStart={(e) => {
                  if (!canReorder) return;
                  setDragId(img.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => {
                  if (canReorder && dragId && dragId !== img.id) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(img.id);
                }}
                title={canReorder ? 'Sürükleyerek sırayı değiştirin' : undefined}
                className={`group relative aspect-square rounded-radius-md overflow-hidden border bg-surface-subtle transition-all ${
                  isDragging
                    ? 'opacity-40 border-border-strong'
                    : dragId && dragId !== img.id
                      ? 'border-dashed border-border-strong'
                      : 'border-border-default'
                } ${canReorder ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <img
                  src={toAbsoluteUrl(img.imageKey)}
                  alt={img.fileName ?? 'Ürün görseli'}
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-contain pointer-events-none"
                />
                {index === 0 ? (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-panel/90 border border-border-default text-text-secondary">
                    Birincil
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={isReordering}
                    title="Birincil yap"
                    className="absolute top-1 left-1 p-1 rounded bg-surface-panel/90 text-text-secondary hover:text-warning hover:bg-warning/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={isDeleting}
                  title="Sil"
                  className="absolute top-1 right-1 p-1 rounded bg-surface-panel/90 text-text-secondary hover:text-danger hover:bg-danger-subtle opacity-0 group-hover:opacity-100 transition-all disabled:opacity-100"
                >
                  {isDeleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && (
        <p className="text-body-xs text-text-muted">
          Ürün Görselleri{' '}
          <span className="tabular-nums">({images.length}/{MAX_IMAGES_PER_SKU})</span>
        </p>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 text-body-xs text-text-secondary">
          <Loader2 size={14} className="animate-spin" />
          <span>Görseller ekleniyor…</span>
        </div>
      )}

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handlePicked}
        excludeSku={sku}
        remainingSlots={remaining}
      />
    </div>
  );
}
