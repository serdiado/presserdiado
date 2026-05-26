// TODO: Serbest hareket ve boyutlandırma (canvas üzerinde sürükle-bırak)
// TODO: Filtreler (Exposure, Contrast, Saturation, Temperature, Tint, Highlights, Shadows)
// TODO: Upload endpoint S3/MinIO'ya taşınacak (şu an lokal disk)
// TODO: Desen kütüphanesi (hazır tekstür ve desenler)

import { useEffect, useRef, useState } from 'react';
import { Image, Info, Palette, Upload } from 'lucide-react';
import type { CatalogPage, ColorValue } from '@matbaapro/shared';
import { useCatalogStore, useLayerStore, useUIStore } from '@/stores/studio';
import api from '@/lib/api';
import { ColorOpacityPicker } from '../pickers';

type BgType = 'color' | 'image';
type ImageTab = 'pattern' | 'image';
type ImageSizeType = 'fit' | 'fill' | 'stretch' | 'tile';
type ImagePositionType =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

type PageBackground = NonNullable<CatalogPage['background']>;

const DEFAULT_VALUE: ColorValue = { type: 'solid', color: '#ffffff', opacity: 100 };

export function BackgroundSettings() {
  const foregroundOpacity = useUIStore((s) => s.foregroundOpacity);
  const setForegroundOpacity = useUIStore((s) => s.setForegroundOpacity);
  const selectedBackgroundPageIds = useUIStore((s) => s.selectedBackgroundPageIds);
  const setSelectedBackgroundPageIds = useUIStore((s) => s.setSelectedBackgroundPageIds);
  const backgroundMerged = useUIStore((s) => s.backgroundMerged);
  const setBackgroundMerged = useUIStore((s) => s.setBackgroundMerged);

  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const updatePagesBackground = useCatalogStore((s) => s.updatePagesBackground);
  const applyBackgroundGlobally = useCatalogStore((s) => s.applyBackgroundGlobally);
  const selectedPageIds = useLayerStore((s) => s.selectedPageIds);

  const activePages = formas.find((f) => f.id === activeFormaId)?.pages ?? [];
  const allPageNumbers = activePages.map((p) => p.pageNumber);

  const formaLabel =
    activeFormaId === 1 ? 'Forma 1 (Dış Yüz)' :
    activeFormaId === 2 ? 'Forma 2 (İç Yüz)' :
    `Forma ${activeFormaId}`;

  useEffect(() => {
    if (selectedPageIds.length === 0) {
      setSelectedBackgroundPageIds([]);
      return;
    }
    const pageNumbers: number[] = [];
    for (const forma of formas) {
      for (const page of forma.pages) {
        if (selectedPageIds.includes(page.id)) {
          pageNumbers.push(page.pageNumber);
        }
      }
    }
    setSelectedBackgroundPageIds(pageNumbers);
  }, [selectedPageIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const isModified = foregroundOpacity < 100;

  const togglePage = (pageNumber: number) => {
    if (backgroundMerged) return;
    const isSelected = selectedBackgroundPageIds.includes(pageNumber);
    setSelectedBackgroundPageIds(
      isSelected
        ? selectedBackgroundPageIds.filter((id) => id !== pageNumber)
        : [...selectedBackgroundPageIds, pageNumber],
    );
  };

  // ─── Zemin Türü local state ───────────────────────────────────────
  const [copiedBackground, setCopiedBackground] = useState<PageBackground | null>(null);
  const [applyReport, setApplyReport] = useState<
    { formaId: number; success: boolean; reason?: string }[] | null
  >(null);
  const [bgType, setBgType] = useState<BgType>('color');
  const [colorValue, setColorValue] = useState<ColorValue>(DEFAULT_VALUE);
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState<ImageTab>('image');
  const [imageSize, setImageSize] = useState<ImageSizeType>('fill');
  const [imagePosition, setImagePosition] = useState<ImagePositionType>('center');
  const [imageOpacity, setImageOpacity] = useState(100);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevSelKey = useRef('');

  useEffect(() => {
    const key = selectedBackgroundPageIds.join(',');
    if (key === prevSelKey.current) return;
    prevSelKey.current = key;

    const firstPage = activePages.find((p) => selectedBackgroundPageIds.includes(p.pageNumber));
    const bg = firstPage?.background;
    if (!bg) {
      setBgType('color');
      setColorValue(DEFAULT_VALUE);
      setImageUrl('');
      setImageSize('fill');
      setImagePosition('center');
      setImageOpacity(100);
      return;
    }
    setBgType(bg.type);
    if (bg.value) setColorValue(bg.value);
    setImageUrl(bg.imageUrl ?? '');
    setImageSize(bg.imageSize ?? 'fill');
    setImagePosition(bg.imagePosition ?? 'center');
    setImageOpacity(bg.imageOpacity ?? 100);
  }, [selectedBackgroundPageIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const noPages = selectedBackgroundPageIds.length === 0;

  const applyType = (type: BgType) => {
    setBgType(type);
    if (noPages) return;
    const bg: PageBackground = { type };
    if (type === 'color') bg.value = colorValue;
    if (type === 'image') {
      bg.imageUrl = imageUrl || undefined;
      bg.imageSize = imageSize;
      bg.imagePosition = imagePosition;
      bg.imageOpacity = imageOpacity;
    }
    updatePagesBackground(selectedBackgroundPageIds, bg);
  };

  const applyColor = (v: ColorValue) => {
    setColorValue(v);
    if (noPages) return;
    updatePagesBackground(selectedBackgroundPageIds, { type: 'color', value: v });
  };

  const applyImageSettings = (
    patch: Partial<{ imageSize: ImageSizeType; imagePosition: ImagePositionType; imageOpacity: number }>,
  ) => {
    if (noPages) return;
    updatePagesBackground(selectedBackgroundPageIds, {
      type: 'image',
      imageUrl: imageUrl || undefined,
      imageSize: patch.imageSize ?? imageSize,
      imagePosition: patch.imagePosition ?? imagePosition,
      imageOpacity: patch.imageOpacity ?? imageOpacity,
    });
  };

  const clearImage = () => {
    setImageUrl('');
    if (noPages) return;
    updatePagesBackground(selectedBackgroundPageIds, {
      type: 'image',
      imageUrl: undefined,
      imageSize,
      imagePosition,
      imageOpacity,
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ url: string; size: number; mimeType: string }>(
        '/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      console.log('[upload] data.url:', data.url);
      setImageUrl(data.url);
      if (!noPages) {
        updatePagesBackground(selectedBackgroundPageIds, {
          type: 'image',
          imageUrl: data.url,
          imageSize,
          imagePosition,
          imageOpacity,
        });
      }
    } catch {
      setUploadError(true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">

      {/* ─── 1 · GÖRÜNÜM MODU ───────────────────────────────── */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
            Görünüm Modu
          </span>
          {isModified && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              Aktif
            </span>
          )}
        </div>
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Ön Plan Saydamlığı</span>
            <span className="font-bold text-slate-800 tabular-nums w-10 text-right">
              %{foregroundOpacity}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={foregroundOpacity}
            onChange={(e) => setForegroundOpacity(parseInt(e.target.value))}
            className="w-full studio-slider"
            style={{
              background: `linear-gradient(to right, #2563eb ${foregroundOpacity}%, #e2e8f0 ${foregroundOpacity}%)`,
            }}
          />

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>%0 — Tam Saydam</span>
            <span>%100 — Tam Görünür</span>
          </div>

          {isModified && (
            <button
              onClick={() => setForegroundOpacity(100)}
              className="w-full py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-lg transition-colors"
            >
              Sıfırla (%100)
            </button>
          )}

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Arka plan hariç tüm katmanların görünürlüğünü ayarlar. Yalnızca editör önizlemesini etkiler, baskıya yansımaz.
          </p>
        </div>
      </div>

      {/* ─── 2 · SAYFA SEÇİMİ ───────────────────────────────── */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
          <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
            Sayfa Seçimi
          </span>
        </div>
        <div className="p-3 space-y-3">

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{formaLabel}</span>
            <span className="text-xs text-slate-400">{activePages.length} sayfa</span>
          </div>

          {backgroundMerged ? (
            <div className="relative" style={{ height: '3rem' }}>
              <div
                className="absolute border border-slate-200 bg-slate-100 rounded-md"
                style={{ width: '2.5rem', height: '2.75rem', top: '6px', left: '6px' }}
              />
              <div
                className="absolute border border-slate-200 bg-slate-50 rounded-md"
                style={{ width: '2.5rem', height: '2.75rem', top: '3px', left: '3px' }}
              />
              <div
                className="absolute border-2 border-slate-900 bg-white rounded-md flex items-center justify-center"
                style={{ width: '2.5rem', height: '2.75rem', top: 0, left: 0 }}
              >
                <span className="text-slate-900 font-semibold text-sm">
                  {allPageNumbers.length}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {activePages.map((page) => {
                const isSelected = selectedBackgroundPageIds.includes(page.pageNumber);
                return (
                  <button
                    key={page.pageNumber}
                    onClick={() => togglePage(page.pageNumber)}
                    className={`relative py-2.5 rounded-md text-center transition-colors ${
                      isSelected
                        ? 'border-2 border-slate-900 bg-slate-50'
                        : 'border border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center leading-none">
                        ✓
                      </span>
                    )}
                    <span className="text-slate-900 font-semibold text-sm">
                      {page.pageNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-start gap-2 px-2.5 py-2 rounded-md bg-blue-50">
            <Info size={13} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-600 leading-snug">
              {backgroundMerged
                ? 'Sayfalar birleştirildi. Zemin tek yüzey olarak uygulanacak.'
                : `${selectedBackgroundPageIds.length} sayfa seçili. Zemin değişiklikleri bu sayfalara uygulanacak.`}
            </p>
          </div>

          <div className="flex flex-col gap-2">

            {/* Satır 1 — Birleştir / Ayır */}
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBackgroundMerged(true)}
                  disabled
                  title="Bu özellik yakında kullanıma açılacak"
                  className="py-2 text-xs font-medium rounded-lg border transition-colors border-slate-200 bg-white text-slate-300 opacity-40 cursor-not-allowed"
                >
                  Yüzeyleri Birleştir
                </button>
                <button
                  onClick={() => setBackgroundMerged(false)}
                  disabled={backgroundMerged === false}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                    backgroundMerged === false
                      ? 'border-slate-200 bg-white text-slate-300 cursor-not-allowed opacity-40'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Yüzeyleri Ayır
                </button>
              </div>
              <span className="text-[10px] text-slate-400 italic">
                Birleştirme özelliği geliştirme aşamasında.
              </span>
            </div>

            {/* Satır 2 — Kopyala / Yapıştır */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const page = activePages.find(
                    (p) => p.pageNumber === selectedBackgroundPageIds[0],
                  );
                  if (page?.background) setCopiedBackground(page.background);
                }}
                disabled={noPages}
                className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                  noPages
                    ? 'border-slate-200 bg-white text-slate-300 cursor-not-allowed opacity-40'
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Zemini Kopyala
              </button>
              <button
                onClick={() => {
                  if (copiedBackground)
                    updatePagesBackground(selectedBackgroundPageIds, copiedBackground);
                }}
                disabled={copiedBackground === null || noPages}
                className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                  copiedBackground === null || noPages
                    ? 'border-slate-200 bg-white text-slate-300 cursor-not-allowed opacity-40'
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Zemini Yapıştır
              </button>
            </div>

            {/* Satır 3 — Tüm Sayfalara Uygula */}
            <button
              onClick={() => {
                if (!copiedBackground) return;
                const report = applyBackgroundGlobally(copiedBackground);
                setApplyReport(report.length > 0 ? report : null);
              }}
              disabled={copiedBackground === null}
              className={`w-full py-2 text-xs font-medium rounded-lg border transition-colors ${
                copiedBackground === null
                  ? 'border-slate-200 bg-white text-slate-300 cursor-not-allowed opacity-40'
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              Tüm Sayfalara Uygula
            </button>

          </div>

          {/* Uygulama sonuç raporu */}
          {applyReport && (
            <div className="relative rounded-lg border border-slate-100 bg-slate-50 p-2.5">
              <button
                onClick={() => setApplyReport(null)}
                className="absolute top-1.5 right-2 text-slate-400 hover:text-slate-600 text-sm leading-none"
              >
                ×
              </button>
              <div className="flex flex-col gap-1 pr-4">
                {applyReport.map((r) => (
                  <span
                    key={r.formaId}
                    className={`text-[11px] ${r.success ? 'text-emerald-600' : 'text-amber-600'}`}
                  >
                    {r.success
                      ? `Forma ${r.formaId} — Uygulandı`
                      : `Forma ${r.formaId} — ${r.reason ?? 'Atlandı'}`}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── 3 · ZEMİN TÜRÜ ─────────────────────────────────── */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
          <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
            Zemin Türü
          </span>
        </div>
        <div className="p-3 space-y-3">

          {noPages && (
            <p className="text-[11px] text-slate-400 text-center py-1">
              Zemin düzenlemek için sayfa seçin.
            </p>
          )}

          {/* Tür seçici */}
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { type: 'color', label: 'Renk', Icon: Palette },
                { type: 'image', label: 'Görsel', Icon: Image },
              ] as { type: BgType; label: string; Icon: typeof Palette }[]
            ).map(({ type, label, Icon }) => {
              const active = bgType === type;
              return (
                <button
                  key={type}
                  onClick={() => applyType(type)}
                  disabled={noPages}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border cursor-pointer transition-colors ${
                    active
                      ? 'border-2 border-slate-900 bg-slate-50'
                      : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  } ${noPages ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Icon
                    size={20}
                    className={active ? 'text-slate-900' : 'text-slate-500'}
                  />
                  <span
                    className={`text-xs ${active ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Renk (düz veya geçişli) ── */}
          {bgType === 'color' && !noPages && (
            <div className="flex items-center gap-3">
              <ColorOpacityPicker value={colorValue} onChange={applyColor} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-600">Zemin</div>
                <div className="text-[10px] text-slate-400">
                  {colorValue.type === 'solid'
                    ? `${colorValue.color.toUpperCase()} / %${colorValue.opacity}`
                    : `Geçişli (${
                        colorValue.gradientType === 'linear'
                          ? 'doğrusal'
                          : colorValue.gradientType === 'radial'
                            ? 'dairesel'
                            : 'baklava'
                      }, ${colorValue.stops.length} durak)`}
                </div>
              </div>
            </div>
          )}

          {/* ── Görsel ── */}
          {bgType === 'image' && !noPages && (
            <div className="space-y-3">

              {/* Tab bar */}
              <div className="flex border-b border-slate-100">
                {(['image', 'pattern'] as ImageTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setImageTab(t)}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      imageTab === t
                        ? 'border-b-2 border-blue-600 text-slate-900 font-semibold -mb-px'
                        : 'text-slate-400 hover:text-slate-600 font-medium'
                    }`}
                  >
                    {t === 'image' ? 'Resim' : 'Desen'}
                  </button>
                ))}
              </div>

              {/* Desen sekmesi */}
              {imageTab === 'pattern' && (
                <div
                  className="bg-slate-50 rounded-lg p-4 text-center text-xs text-slate-400 italic"
                  title="Yakında: Hazır desen ve tekstür kütüphanesi eklenecek."
                >
                  Desen kütüphanesi geliştirme aşamasında.
                </div>
              )}

              {/* Resim sekmesi */}
              {imageTab === 'image' && (
                <div className="space-y-3">

                  {/* hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.gif,.svg"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {/* Upload area or preview */}
                  {!imageUrl ? (
                    <div
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg
                            className="w-5 h-5 text-slate-400 animate-spin"
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
                          <span className="text-xs text-slate-500">Yükleniyor...</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={20} className="mx-auto mb-2 text-slate-400" />
                          <p className="text-xs text-slate-500">Görsel yüklemek için tıklayın</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            PNG, JPG, WEBP, SVG — maks. 20MB
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt="Arka plan görseli"
                          className="w-full h-24 object-cover rounded-lg border border-slate-200"
                          onError={() => console.warn('[bg-preview] Görsel yüklenemedi:', imageUrl)}
                        />
                        <button
                          onClick={clearImage}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 border border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-400 flex items-center justify-center text-xs font-bold shadow-sm"
                          title="Görseli kaldır"
                        >
                          ×
                        </button>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        Değiştir
                      </button>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-red-500 text-xs">Yükleme başarısız, tekrar deneyin.</p>
                  )}

                  {/* Settings — shown only when an image is loaded */}
                  {imageUrl && (
                    <>
                      {/* Boyutlandırma */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Boyutlandırma
                        </span>
                        <div className="grid grid-cols-4 gap-1">
                          {(
                            [
                              { value: 'fit', label: 'Fit' },
                              { value: 'fill', label: 'Fill' },
                              { value: 'stretch', label: 'Uzat' },
                              { value: 'tile', label: 'Döşe' },
                            ] as { value: ImageSizeType; label: string }[]
                          ).map(({ value, label }) => (
                            <button
                              key={value}
                              onClick={() => {
                                setImageSize(value);
                                applyImageSettings({ imageSize: value });
                              }}
                              className={`py-1.5 rounded text-[11px] transition-colors ${
                                imageSize === value
                                  ? 'border-2 border-slate-900 bg-slate-50 text-slate-900 font-semibold'
                                  : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Konum grid'i */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Konum
                        </span>
                        <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
                          {(
                            [
                              'top-left', 'top-center', 'top-right',
                              'middle-left', 'center', 'middle-right',
                              'bottom-left', 'bottom-center', 'bottom-right',
                            ] as ImagePositionType[]
                          ).map((pos) => (
                            <button
                              key={pos}
                              onClick={() => {
                                setImagePosition(pos);
                                applyImageSettings({ imagePosition: pos });
                              }}
                              className={`w-6 h-6 rounded transition-colors ${
                                imagePosition === pos
                                  ? 'bg-slate-900 border border-slate-900'
                                  : 'border border-slate-200 hover:border-slate-400'
                              }`}
                              title={pos}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Saydamlık */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Saydamlık
                          </span>
                          <span className="text-xs text-slate-800 font-bold">
                            %{imageOpacity}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={imageOpacity}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setImageOpacity(v);
                            applyImageSettings({ imageOpacity: v });
                          }}
                          className="w-full studio-slider"
                        />
                      </div>
                    </>
                  )}

                </div>
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
