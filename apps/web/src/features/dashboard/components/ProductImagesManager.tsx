// Bir SKU'nun ürün resimlerini yöneten yeniden kullanılabilir bileşen (ekle + sil).
// Tek-kaynak: per-SKU resim yönetimi sadece burada. Birincil = en düşük sortOrder (ilk öğe).
// Eklemenin iki kaynağı: (a) bilgisayardan yükle, (b) Medya Kütüphanesi'nden seç.

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2, UploadCloud, Library, ImageOff } from 'lucide-react';
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

export function ProductImagesManager({ sku, onChange }: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const files = Array.from(fileList).filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
    if (files.length === 0) {
      toast.error('Sadece JPEG, PNG veya WebP dosyaları yüklenebilir');
      return;
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
      if (limitHit) toast.error('SKU başına en fazla 10 resim eklenebilir');
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
      if (limitHit) toast.error('SKU başına en fazla 10 resim eklenebilir');
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-label-md text-text-primary">Ürün Görselleri</label>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UploadCloud size={14} />}
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            Bilgisayardan Yükle
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Library size={14} />}
            onClick={() => setIsPickerOpen(true)}
            disabled={isUploading}
          >
            Kütüphaneden Seç
          </Button>
        </div>
      </div>

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
            return (
              <div
                key={img.id}
                className="group relative aspect-square rounded-radius-md overflow-hidden border border-border-default bg-surface-subtle"
              >
                <img
                  src={toAbsoluteUrl(img.imageKey)}
                  alt={img.fileName ?? 'Ürün görseli'}
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-panel/90 border border-border-default text-text-secondary">
                    Birincil
                  </span>
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
      />
    </div>
  );
}
