// Stüdyo sol panel "Medya" flyout'u — kullanıcının medya kütüphanesini (Genel Medya) salt-okunur
// gösterir. Dashboard'daki GenelMedyaPage ile AYNI kaynağı kullanır: GET /media-assets. Görseller
// toAbsoluteUrl ile mutlak URL'e çevrilir. Flyout iskeleti TemalarFlyoutPanel deseniyle birebir.
// (Bu aşamada salt gösterim; tıklayınca kanvasa ekleme/zemin yapma sonraki adım.)

import { useEffect, useRef, useState } from 'react';
import { X, ImageOff, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { toAbsoluteUrl } from '@/lib/upload';
import { useUIStore } from '@/stores/studio';
import type { MediaAsset, MediaAssetType } from '@/features/dashboard/types';

const FLYOUT_ID = 'medya';

const TYPE_LABELS: Record<MediaAssetType, string> = {
  logo: 'Logo',
  background: 'Arka Plan',
  shape: 'Şekil',
  other: 'Diğer',
};

export function MedyaFlyoutPanel() {
  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);
  const isOpen = activeFlyout === FLYOUT_ID;

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<MediaAsset[]>('/media-assets');
      setAssets(res.data ?? []);
      hasLoadedRef.current = true;
    } catch (err) {
      console.error('Medya yüklenemedi:', err);
      setError('Medya yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  // Lazy: panel ilk açıldığında bir kez çek (her stüdyo açılışında değil).
  useEffect(() => {
    if (isOpen && !hasLoadedRef.current && !isLoading) fetchData();
  }, [isOpen]);

  // Escape ile kapat (TemalarFlyoutPanel deseni).
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveFlyout(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setActiveFlyout]);

  return (
    <div
      className="absolute top-4 bottom-4 w-60 bg-surface-panel rounded-xl shadow-xl border border-border-default flex flex-col overflow-hidden transition-transform duration-200 ease-out z-10"
      style={{
        left: '80px',
        transform: isOpen ? 'translateX(0)' : 'translateX(calc(-100% - 80px))',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between px-3 py-2.5 bg-surface-subtle border-b border-border-default shrink-0">
        <span className="text-heading-md text-text-primary">Medya</span>
        <button
          type="button"
          onClick={() => setActiveFlyout(null)}
          className="text-text-secondary hover:text-text-primary p-1 rounded transition-colors"
          title="Kapat"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-surface-subtle border border-border-default animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-body-sm text-text-muted">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-subtle text-text-primary hover:bg-surface-panel border border-border-default transition-colors"
            >
              <RefreshCw size={14} /> Tekrar dene
            </button>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <ImageOff size={28} strokeWidth={1.25} className="text-text-muted" />
            <p className="text-body-sm text-text-muted">
              Henüz medya yok. Medya sayfasından görsel yükleyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="relative aspect-square rounded-lg border border-border-default bg-surface-subtle overflow-hidden"
                title={asset.fileName ?? TYPE_LABELS[asset.type]}
              >
                <img
                  src={toAbsoluteUrl(asset.imageKey)}
                  alt={asset.fileName ?? TYPE_LABELS[asset.type]}
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
