import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, Upload } from 'lucide-react';
import api from '@/lib/api';

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
}: ImagePickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

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
  }, [isOpen]);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ url: string; size?: number; mimeType?: string }>(
        '/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      onImageSelected({
        imageUrl: data.url,
        imageSize: draftImageSize,
        imagePosition: draftImagePosition,
        imageOpacity: draftImageOpacity,
      });
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

                {!hasImage ? (
                  <button
                    type="button"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-5 h-5 text-slate-500 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray="60"
                            strokeDashoffset="20"
                          />
                        </svg>
                        <span className="text-xs text-slate-500 font-bold uppercase">Yükleniyor...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="mx-auto mb-2 text-slate-500" />
                        <p className="text-xs text-slate-800 font-bold">Görsel yüklemek için tıklayın</p>
                        <p className="text-[10px] text-slate-400 leading-snug mt-1">
                          PNG, JPG, WEBP, SVG — maks. 20MB
                        </p>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Arka plan görseli"
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
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-[11px] bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded font-bold border border-slate-200 text-slate-800 transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon size={14} />
                      Değiştir
                    </button>
                  </div>
                )}

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
    </>
  );
}