// Görsel seçici — iki havuzdan seçim: Medya Kütüphanesi (media-assets) ve Ürün Resimleri
// (product-images). Çoklu seçim destekli, yeniden kullanılabilir. Atama/yükleme mantığı
// içermez; seçilen görselleri { imageKey, fileName } olarak onConfirm ile döndürür — kopyalama
// çağıranın işidir (tek-kaynak).

import React, { useEffect, useMemo, useState } from 'react';
import { X, Check, ImageOff, Loader2, AlertCircle, RefreshCw, Search } from 'lucide-react';
import api from '@/lib/api';
import { toAbsoluteUrl } from '@/lib/upload';
import { Button } from '@/components/ui/Button';
import type { MediaAsset, MediaAssetType, ProductImage } from '../types';

export interface PickedImage {
  imageKey: string;
  fileName: string | null;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: PickedImage[]) => void;
  // "Ürün Resimleri" sekmesinde bu SKU'ya zaten atanmış görseller gizlenir (manager'da listeli).
  excludeSku?: string;
  // Seçilebilecek azami görsel (kalan kota). Verilmezse sınırsız (başka bağlamlarda reusable).
  remainingSlots?: number;
}

type Source = 'media' | 'product';
type TypeFilter = 'all' | MediaAssetType;

const TYPE_TABS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'logo', label: 'Logo' },
  { key: 'background', label: 'Arka Plan' },
  { key: 'shape', label: 'Şekil' },
  { key: 'other', label: 'Diğer' },
];

// Grid'de gösterilen normalize öğe. selectionKey kaynak-önekli (media: / pi:) — sekmeler arası
// seçim korunur ve iki tablodaki aynı imageKey çakışmaz.
interface PickerItem {
  selectionKey: string;
  imageKey: string;
  fileName: string | null;
}

export function MediaPickerModal({ isOpen, onClose, onConfirm, excludeSku, remainingSlots = Infinity }: MediaPickerModalProps) {
  const [source, setSource] = useState<Source>('media');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // fileName araması — her iki havuzda da geçerli, sekme değişiminde korunur.
  const [query, setQuery] = useState('');
  // selectionKey → seçilen görsel
  const [selected, setSelected] = useState<Map<string, PickedImage>>(new Map());

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const [mediaRes, productRes] = await Promise.allSettled([
      api.get<MediaAsset[]>('/media-assets'),
      api.get<ProductImage[]>('/product-images'),
    ]);
    if (mediaRes.status === 'fulfilled') setMediaAssets(mediaRes.value.data ?? []);
    if (productRes.status === 'fulfilled') setProductImages(productRes.value.data ?? []);
    // Yalnızca iki havuz da çekilemediyse hata göster; biri gelirse kullanıcı yine seçebilsin.
    if (mediaRes.status === 'rejected' && productRes.status === 'rejected') {
      console.error('Görsel havuzları alınamadı', mediaRes.reason, productRes.reason);
      setError('Görseller yüklenemedi');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      setSelected(new Map());
      setSource('media');
      setTypeFilter('all');
      setQuery('');
      fetchData();
    }
  }, [isOpen]);

  // Medya havuzu — fileName aramasıyla. Tip filtresi grid'de ayrıca uygulanır.
  const filteredMedia = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mediaAssets;
    return mediaAssets.filter((a) => (a.fileName ?? '').toLowerCase().includes(q));
  }, [mediaAssets, query]);

  const mediaItems = useMemo<PickerItem[]>(() => {
    const filtered = typeFilter === 'all' ? filteredMedia : filteredMedia.filter((a) => a.type === typeFilter);
    return filtered.map((a) => ({
      selectionKey: `media:${a.id}`,
      imageKey: a.imageKey,
      fileName: a.fileName ?? null,
    }));
  }, [filteredMedia, typeFilter]);

  // Ürün resmi havuzu — fileName araması + bu SKU'ya atanmışlar hariç, imageKey'e göre tekilleştirilmiş.
  const productItems = useMemo<PickerItem[]>(() => {
    const q = query.trim().toLowerCase();
    const seen = new Set<string>();
    const items: PickerItem[] = [];
    for (const img of productImages) {
      if (excludeSku && img.sku === excludeSku) continue;
      if (q && !(img.fileName ?? '').toLowerCase().includes(q)) continue;
      if (seen.has(img.imageKey)) continue;
      seen.add(img.imageKey);
      items.push({ selectionKey: `pi:${img.id}`, imageKey: img.imageKey, fileName: img.fileName ?? null });
    }
    return items;
  }, [productImages, excludeSku, query]);

  const items = source === 'media' ? mediaItems : productItems;

  if (!isOpen) return null;

  // Sayım — arama aktifken eşleşen sonuçları, boş sorguda havuz toplamını yansıtır.
  const countFor = (key: TypeFilter) =>
    key === 'all' ? filteredMedia.length : filteredMedia.filter((a) => a.type === key).length;

  const limited = Number.isFinite(remainingSlots);
  // Kota dolduğunda yeni seçim engellenir; seçili olanlar geri alınabilir.
  const capReached = selected.size >= remainingSlots;

  const toggle = (item: PickerItem) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(item.selectionKey)) {
        next.delete(item.selectionKey);
      } else {
        if (next.size >= remainingSlots) return prev; // kota dolu — ekleme yok
        next.set(item.selectionKey, { imageKey: item.imageKey, fileName: item.fileName });
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size === 0) return;
    onConfirm([...selected.values()]);
  };

  const sourceTab = (key: Source, label: string, count: number) => (
    <button
      type="button"
      onClick={() => setSource(key)}
      className={`h-8 px-3 rounded-radius-md text-body-sm transition-colors ${
        source === key
          ? 'bg-surface-subtle text-text-primary border border-border-strong'
          : 'text-text-secondary border border-transparent hover:bg-surface-subtle'
      }`}
    >
      {label} ({count})
    </button>
  );

  const emptyHint = query.trim()
    ? 'Aramayla eşleşen görsel yok.'
    : source === 'media'
      ? 'Medya kütüphanenizde henüz görsel yok. Önce Medya sayfasından görsel yükleyin.'
      : 'Başka ürünlere atanmış görsel yok.';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl w-full max-w-3xl shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default shrink-0">
          <h2 className="text-heading-xl text-text-primary">Görsel Seç</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Kaynak sekmeleri + arama */}
        <div className="flex items-center justify-between gap-3 px-6 pt-4 shrink-0">
          <div className="flex items-center gap-2">
            {sourceTab('media', 'Medya', filteredMedia.length)}
            {sourceTab('product', 'Ürün Resimleri', productItems.length)}
          </div>
          <div className="relative w-56">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Dosya adıyla ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-radius-md border border-border-default hover:border-border-strong bg-surface-panel text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-strong"
            />
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-text-muted">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle size={40} className="text-danger mb-3" />
              <p className="text-body-md text-text-secondary mb-4">{error}</p>
              <Button variant="secondary" size="md" onClick={fetchData} leftIcon={<RefreshCw size={16} />}>
                Tekrar Dene
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tip filtreleri — sadece Medya sekmesinde */}
              {source === 'media' && (
                <div className="flex items-center gap-2 flex-wrap">
                  {TYPE_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setTypeFilter(tab.key)}
                      className={`h-8 px-3 rounded-radius-md text-body-sm transition-colors ${
                        typeFilter === tab.key
                          ? 'bg-surface-subtle text-text-primary border border-border-strong'
                          : 'text-text-secondary border border-transparent hover:bg-surface-subtle'
                      }`}
                    >
                      {tab.label} ({countFor(tab.key)})
                    </button>
                  ))}
                </div>
              )}

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted mb-3">
                    <ImageOff size={28} strokeWidth={1.5} />
                  </div>
                  <p className="text-body-md text-text-secondary max-w-sm">{emptyHint}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.map((item) => {
                    const isSelected = selected.has(item.selectionKey);
                    const tileDisabled = !isSelected && capReached;
                    return (
                      <button
                        key={item.selectionKey}
                        type="button"
                        onClick={() => toggle(item)}
                        disabled={tileDisabled}
                        className={`group relative aspect-square rounded-radius-lg overflow-hidden border transition-colors ${
                          isSelected
                            ? 'border-border-strong bg-surface-subtle'
                            : 'border-border-default bg-surface-panel hover:border-border-strong'
                        } ${tileDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <img
                          src={toAbsoluteUrl(item.imageKey)}
                          alt={item.fileName ?? 'Görsel'}
                          loading="lazy"
                          className="w-full h-full object-contain bg-surface-subtle"
                        />
                        <span
                          className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-surface-panel/90 border-border-default text-transparent group-hover:border-border-strong'
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default flex justify-between items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-body-sm text-text-secondary">
              {limited
                ? `${selected.size} / ${remainingSlots} seçildi`
                : selected.size > 0
                  ? `${selected.size} görsel seçildi`
                  : 'Görsel seçin'}
            </span>
            {limited && capReached && (
              <span className="text-body-xs text-text-muted">
                {remainingSlots > 0
                  ? `En fazla ${remainingSlots} görsel ekleyebilirsiniz`
                  : 'Bu ürün görsel kotası dolu'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="md" onClick={onClose}>
              İptal
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirm} disabled={selected.size === 0}>
              Seç ({selected.size})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
