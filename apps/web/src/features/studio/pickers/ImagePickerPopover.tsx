import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Library } from 'lucide-react';
import api from '@/lib/api';
import { uploadImage, toAbsoluteUrl } from '@/lib/upload';
import { MediaPickerModal } from '@/features/dashboard/components/MediaPickerModal';
import type { MediaAssetType } from '@/features/dashboard/types';

export type ImageSizeType = 'fit' | 'fill' | 'stretch' | 'tile';

export type ImagePositionType =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

type ImageTab = 'image' | 'pattern';

interface ImagePayload {
  imageUrl: string;
  imageSize: ImageSizeType;
  imagePosition: ImagePositionType;
  imageOpacity: number;
}

interface ImagePickerPopoverProps {
  trigger: React.ReactNode;
  className?: string;
  disabled?: boolean;
  imageUrl?: string;
  imageSize: ImageSizeType;
  imagePosition: ImagePositionType;
  imageOpacity: number;
  onImageSelected: (payload: ImagePayload) => void;
  onImageCleared?: () => void;
  onSettingsChange: (
    patch: Partial<{
      imageSize: ImageSizeType;
      imagePosition: ImagePositionType;
      imageOpacity: number;
    }>,
  ) => void;
  /**
   * Dışarıdan-aç sinyali (opt-in). true'ya geçince picker kendi trigger'ına anchor'lı açılır —
   * zemin sağ-tık "Görsel" kalemi bunu kullanır (ui.store bgPickerToOpen köprüsü). Yalnız BackgroundMode
   * geçirir; diğer örnekler bu prop'u almaz → etkilenmez.
   */
  openSignal?: boolean;
  /** openSignal tüketildiğinde çağrılır → çağıran sinyali temizler (tek-atış). */
  onConsumeOpen?: () => void;
  /** "Bilgisayardan Yükle" ile kütüphaneye eklenen görselin medya türü (varsayılan 'background'). */
  uploadType?: MediaAssetType;
}

const POPUP_WIDTH = 320;
const POPUP_HEIGHT = 520;

const IMAGE_SIZE_OPTIONS: { value: ImageSizeType; label: string }[] = [
  { value: 'fit', label: 'Sığdır' },
  { value: 'fill', label: 'Doldur' },
  { value: 'stretch', label: 'Uzat' },
  { value: 'tile', label: 'Döşe' },
];

const IMAGE_POSITION_OPTIONS: ImagePositionType[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

function clampOpacity(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function ImagePickerPopover({
  trigger,
  className,
  disabled = false,
  imageUrl,
  imageSize,
  imagePosition,
  imageOpacity,
  onImageSelected,
  onImageCleared,
  onSettingsChange,
  openSignal = false,
  onConsumeOpen,
  uploadType = 'background',
}: ImagePickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Kütüphaneden seçim modalı (MediaPickerModal). Yüzen panelden bağımsız, kökte render edilir.
  const [pickerOpen, setPickerOpen] = useState(false);

  // Dışarıdan-aç köprüsü: openSignal true'ya geçince aç + sinyali tüket (tek-atış). ColorOpacityPicker
  // ile aynı desen — isOpen bağımsız kalır.
  useEffect(() => {
    if (!openSignal) return;
    setIsOpen(true);
    onConsumeOpen?.();
  }, [openSignal, onConsumeOpen]);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [imageTab, setImageTab] = useState<ImageTab>('image');
  const [draftImageSize, setDraftImageSize] = useState<ImageSizeType>(imageSize);
  const [draftImagePosition, setDraftImagePosition] = useState<ImagePositionType>(imagePosition);
  const [draftImageOpacity, setDraftImageOpacity] = useState(clampOpacity(imageOpacity));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  const buttonRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasImage = Boolean(imageUrl);

  useEffect(() => {
    setDraftImageSize(imageSize);
    setDraftImagePosition(imagePosition);
    setDraftImageOpacity(clampOpacity(imageOpacity));
  }, [imageSize, imagePosition, imageOpacity, imageUrl]);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left =
      r.right + 5 + POPUP_WIDTH > vw ? Math.max(4, r.left - POPUP_WIDTH - 5) : r.right + 5;
    const top =
      r.bottom + 5 + POPUP_HEIGHT > vh ? Math.max(4, r.top - POPUP_HEIGHT) : r.bottom + 5;
    setCoords({ top, left });
  }, [isOpen]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Kütüphane modalı açıkken paneli dış-tıkla kapatma (modal panelin DIŞINDA, body'ye portal'lı
      // → yoksa panel kapanıp MediaPickerModal'ı unmount ederdi).
      if (pickerOpen) return;
      if (
        isOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen, pickerOpen]);

  const emitSettingsChange = useCallback(
    (
      patch: Partial<{
        imageSize: ImageSizeType;
        imagePosition: ImagePositionType;
        imageOpacity: number;
      }>,
    ) => {
      if (patch.imageSize) setDraftImageSize(patch.imageSize);
      if (patch.imagePosition) setDraftImagePosition(patch.imagePosition);
      if (patch.imageOpacity !== undefined) setDraftImageOpacity(clampOpacity(patch.imageOpacity));

      if (hasImage) {
        onSettingsChange(patch);
      }
    },
    [hasImage, onSettingsChange],
  );

  // Seçilen bir görseli (mutlak URL) mevcut taslak ayarlarıyla uygular.
  const applyImageUrl = useCallback(
    (imageUrl: string) => {
      onImageSelected({
        imageUrl,
        imageSize: draftImageSize,
        imagePosition: draftImagePosition,
        imageOpacity: draftImageOpacity,
      });
    },
    [onImageSelected, draftImageSize, draftImagePosition, draftImageOpacity],
  );

  // Kütüphaneden seçim onayı — tek görsel (remainingSlots=1). imageKey relative → mutlak.
  const handleLibraryPicked = (items: { imageKey: string; fileName: string | null }[]) => {
    setPickerOpen(false);
    const picked = items[0];
    if (picked) applyImageUrl(toAbsoluteUrl(picked.imageKey));
  };

  // "Bilgisayardan Yükle" = HIZLI kütüphane-yükleme: dosyayı yükle → Medya kütüphanesine kaydet →
  // anında uygula. Ad-hoc (kütüphaneye uğramayan) yükleme artık yok.
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(false);
    try {
      const { url, absoluteUrl, mimeType, size } = await uploadImage(file);
      await api.post('/media-assets', {
        imageKey: url,
        fileName: file.name,
        mimeType,
        size,
        type: uploadType,
      });
      applyImageUrl(absoluteUrl);
    } catch {
      setUploadError(true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div
        ref={buttonRef}
        className={className ?? 'h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium whitespace-nowrap hover:bg-border-default transition-colors text-text-secondary cursor-pointer'}
        onClick={() => {
          if (disabled) return;
          setIsOpen((v) => !v);
        }}
        aria-disabled={disabled}
      >
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            data-image-picker-popup
            className="fixed z-99999 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 flex flex-col gap-3 overflow-y-auto"
            style={{
              top: coords.top,
              left: coords.left,
              width: POPUP_WIDTH,
              maxHeight: 'calc(100vh - 16px)',
            }}
          >
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
              {(['image', 'pattern'] as ImageTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setImageTab(tab)}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    imageTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'image' ? 'Resim' : 'Desen'}
                </button>
              ))}
            </div>

            {imageTab === 'pattern' ? (
              <div
                className="bg-slate-50 rounded-lg p-4 text-center text-xs text-slate-500 italic border border-slate-200"
                title="Yakında: Hazır desen ve tekstür kütüphanesi eklenecek."
              >
                Desen kütüphanesi geliştirme aşamasında.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.gif,.svg,image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {hasImage && (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Seçili görsel"
                      className="w-full h-28 object-cover rounded-lg border border-slate-200"
                    />
                    {onImageCleared && (
                      <button
                        type="button"
                        onClick={onImageCleared}
                        className="absolute top-1 right-1 w-6 h-6 rounded bg-white/90 border border-slate-200 text-slate-500 hover:text-red-500 hover:border-slate-400 flex items-center justify-center text-xs font-bold shadow-sm"
                        title="Görseli kaldır"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}

                {/* Kütüphane-öncelikli: birincil eylem kütüphaneden seçim. */}
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  <Library size={14} />
                  {hasImage ? 'Kütüphaneden Değiştir' : 'Kütüphaneden Seç'}
                </button>

                {/* Bilgisayardan yükleme → görsel YALNIZCA kütüphaneye eklenir, sonra uygulanır. */}
                <button
                  type="button"
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                      </svg>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Bilgisayardan Yükle
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-400 leading-snug text-center">
                  Yüklenen görsel Medya kütüphanenize eklenir. PNG, JPG, WEBP, SVG — maks. 20MB
                </p>

                {uploadError && (
                  <p className="text-xs text-red-500 font-bold">Yükleme başarısız, tekrar deneyin.</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase">Boyutlandırma</span>
              <div className="grid grid-cols-4 gap-1.5">
                {IMAGE_SIZE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => emitSettingsChange({ imageSize: value })}
                    className={`py-1.5 rounded-md text-[11px] transition-colors ${
                      draftImageSize === value
                        ? 'border-2 border-slate-900 bg-slate-50 text-slate-900 font-semibold'
                        : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase">Konum</span>
              <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
                {IMAGE_POSITION_OPTIONS.map((position) => (
                  <button
                    key={position}
                    type="button"
                    onClick={() => emitSettingsChange({ imagePosition: position })}
                    className={`w-6 h-6 rounded transition-colors ${
                      draftImagePosition === position
                        ? 'bg-slate-900 border border-slate-900'
                        : 'border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'
                    }`}
                    title={position}
                    aria-label={position}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase">Saydamlık</span>
                <span className="text-xs text-slate-800 font-bold">%{draftImageOpacity}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={draftImageOpacity}
                onChange={(e) => emitSettingsChange({ imageOpacity: parseInt(e.target.value, 10) })}
                className="w-full studio-slider"
              />
            </div>
          </div>,
          document.body,
        )}

      {/* Kütüphane seçici — yüzen panelden bağımsız (panel kapansa da yaşar); yalnız Medya, tekli. */}
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handleLibraryPicked}
        sources={['media']}
        remainingSlots={1}
      />
    </>
  );
}