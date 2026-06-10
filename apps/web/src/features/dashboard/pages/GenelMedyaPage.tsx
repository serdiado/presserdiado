import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ImageOff, MoreVertical, RefreshCw, Trash2, Upload } from 'lucide-react';
import api from '@/lib/api';
import { toAbsoluteUrl } from '@/lib/upload';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { MediaUploadModal } from '../components/MediaUploadModal';
import type { MediaAsset, MediaAssetType } from '../types';

type Filter = 'all' | MediaAssetType;

const TYPE_LABELS: Record<MediaAssetType, string> = {
  logo: 'Logo',
  background: 'Arka Plan',
  shape: 'Şekil',
  other: 'Diğer',
};

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'logo', label: 'Logo' },
  { key: 'background', label: 'Arka Plan' },
  { key: 'shape', label: 'Şekil' },
  { key: 'other', label: 'Diğer' },
];

function formatFileSize(size?: number | null) {
  if (!size) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function GenelMedyaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const assetRes = await api.get<MediaAsset[]>('/media-assets');
      setAssets(assetRes.data ?? []);
    } catch (err) {
      console.error('Medya yüklenemedi:', err);
      setError('Medya yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openMenuId]);

  const filteredAssets = useMemo(() => {
    if (filter === 'all') return assets;
    return assets.filter((asset) => asset.type === filter);
  }, [assets, filter]);

  const countFor = (key: Filter) => (key === 'all' ? assets.length : assets.filter((asset) => asset.type === key).length);

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/media-assets/${deleting.id}`);
      setAssets((prev) => prev.filter((asset) => asset.id !== deleting.id));
      toast.success('Medya silindi');
    } catch (err) {
      console.error('Medya silinemedi:', err);
      toast.error('Medya silinemedi');
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 w-full max-w-300 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-heading-xl text-text-primary">Medya</h1>
          <div className="w-32 h-9 bg-surface-subtle animate-pulse rounded-radius-md" />
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square bg-surface-panel border border-border-default rounded-radius-lg animate-pulse" />
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
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-heading-xl text-text-primary">Medya</h1>
        <Button variant="primary" size="md" leftIcon={<Upload size={16} />} onClick={() => setIsUploadOpen(true)}>
          Medya Yükle
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-panel border border-dashed border-border-strong rounded-radius-lg">
          <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted mb-4">
            <ImageOff size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-heading-md text-text-primary mb-1">Henüz medya eklenmedi</h3>
          <p className="text-body-sm text-text-secondary mb-6 max-w-sm text-center">
            Logo, arka plan ve şekil dosyalarınızı buradan yükleyip kütüphanenizde saklayabilirsiniz.
          </p>
          <Button variant="primary" size="md" leftIcon={<Upload size={16} />} onClick={() => setIsUploadOpen(true)}>
            Medya Yükle
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4 shrink-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`h-8 px-3 rounded-radius-md text-body-sm transition-colors ${
                  filter === tab.key
                    ? 'bg-surface-subtle text-text-primary border border-border-strong'
                    : 'text-text-secondary border border-transparent hover:bg-surface-subtle'
                }`}
              >
                {tab.label} ({countFor(tab.key)})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group relative bg-surface-panel border border-border-default rounded-radius-lg overflow-visible transition-colors hover:border-border-strong"
              >
                <div className="aspect-square bg-surface-subtle flex items-center justify-center overflow-hidden rounded-t-radius-lg">
                  <img
                    src={toAbsoluteUrl(asset.imageKey)}
                    alt={asset.fileName ?? TYPE_LABELS[asset.type]}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="absolute top-2 right-2" onMouseDown={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuId((current) => (current === asset.id ? null : asset.id));
                    }}
                    className="p-1.5 rounded-radius-md bg-surface-panel/90 text-text-secondary hover:text-text-primary hover:bg-surface-subtle opacity-0 group-hover:opacity-100 transition-all"
                    title="Aksiyonlar"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openMenuId === asset.id && (
                    <div className="absolute right-0 mt-1 z-50 w-36 bg-surface-panel border border-border-default rounded-radius-md shadow-drop-lg py-1 animate-in fade-in slide-in-from-top-2 duration-100">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId(null);
                          setDeleting(asset);
                        }}
                        className="w-full px-3 py-2 text-left text-body-xs text-danger hover:bg-danger-subtle hover:text-danger-hover flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Trash2 size={14} className="text-danger" />
                        <span>Sil</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-2.5 space-y-2 overflow-hidden rounded-b-radius-lg">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-radius-md border border-border-default bg-surface-subtle text-body-xs text-text-secondary shrink-0">
                      {TYPE_LABELS[asset.type]}
                    </span>
                    {formatFileSize(asset.size) && (
                      <span className="text-body-xs text-text-muted tabular-nums shrink-0">{formatFileSize(asset.size)}</span>
                    )}
                  </div>
                  <p className="text-body-xs text-text-primary truncate" title={asset.fileName ?? undefined}>
                    {asset.fileName ?? 'İsimsiz medya'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-12 text-body-md text-text-secondary">
              Bu filtreyle eşleşen medya yok.
            </div>
          )}
        </>
      )}

      <MediaUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSaved={fetchData} />

      <ConfirmModal
        isOpen={deleting !== null}
        title="Medyayı Sil"
        description={
          deleting
            ? `"${deleting.fileName ?? TYPE_LABELS[deleting.type]}" medyasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : ''
        }
        confirmLabel="Sil"
        cancelLabel="Vazgeç"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
