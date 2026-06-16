// TODO: Serbest hareket ve boyutlandırma (canvas üzerinde sürükle-bırak)
// TODO: Filtreler (Exposure, Contrast, Saturation, Temperature, Tint, Highlights, Shadows)
// TODO: Upload endpoint S3/MinIO'ya taşınacak (şu an lokal disk)
// TODO: Desen kütüphanesi (hazır tekstür ve desenler)

import { useEffect, useState } from 'react';
import { Image, Info, Palette } from 'lucide-react';
import type { ColorValue } from '@matbaapro/shared';
import { useCatalogStore, useLayerStore, useUIStore } from '@/stores/studio';
import { ColorOpacityPicker, ImagePickerPopover } from '../pickers';
import { Slider } from '@/components/ui/Slider';

type BgType = 'color' | 'image';
type ImageSizeType = 'fit' | 'fill' | 'stretch' | 'tile';
type ImagePositionType =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

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
  const copiedBackground = useCatalogStore((s) => s.copiedBackground);
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
  const [applyReport, setApplyReport] = useState<
    { formaId: number; success: boolean; reason?: string }[] | null
  >(null);
  const [bgType, setBgType] = useState<BgType>('color');
  const [colorValue, setColorValue] = useState<ColorValue>(DEFAULT_VALUE);
  const [imageUrl, setImageUrl] = useState('');
  const [imageSize, setImageSize] = useState<ImageSizeType>('fill');
  const [imagePosition, setImagePosition] = useState<ImagePositionType>('center');
  const [imageOpacity, setImageOpacity] = useState(100);

  const firstSelectedPage = activePages.find((p) => selectedBackgroundPageIds.includes(p.pageNumber));
  const firstBgType = firstSelectedPage?.background?.type;
  const firstBgImageUrl = firstSelectedPage?.background?.imageUrl;
  const firstBgImageSize = firstSelectedPage?.background?.imageSize;
  const firstBgImagePosition = firstSelectedPage?.background?.imagePosition;
  const firstBgImageOpacity = firstSelectedPage?.background?.imageOpacity;

  useEffect(() => {
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
    // Replace semantiği: Görsel zemine geçildiğinde colorValue korunur; sadece gerçek
    // renk background'ı geldiğinde güncellenir. Böylece "Kaldır" eski renge döner.
    if (bg.value) setColorValue(bg.value);
    setImageUrl(bg.imageUrl ?? '');
    setImageSize(bg.imageSize ?? 'fill');
    setImagePosition(bg.imagePosition ?? 'center');
    setImageOpacity(bg.imageOpacity ?? 100);
  }, [
    selectedBackgroundPageIds,
    firstBgType,
    firstBgImageUrl,
    firstBgImageSize,
    firstBgImagePosition,
    firstBgImageOpacity,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const noPages = selectedBackgroundPageIds.length === 0;

  const applyColorType = () => {
    setBgType('color');
    if (noPages) return;
    updatePagesBackground(selectedBackgroundPageIds, { type: 'color', value: colorValue });
  };

  const applyColor = (v: ColorValue) => {
    setColorValue(v);
    if (noPages) return;
    updatePagesBackground(selectedBackgroundPageIds, { type: 'color', value: v });
  };

  const applyImageSettings = (
    patch: Partial<{ imageSize: ImageSizeType; imagePosition: ImagePositionType; imageOpacity: number }>,
  ) => {
    const nextImageSize = patch.imageSize ?? imageSize;
    const nextImagePosition = patch.imagePosition ?? imagePosition;
    const nextImageOpacity = patch.imageOpacity ?? imageOpacity;
    setImageSize(nextImageSize);
    setImagePosition(nextImagePosition);
    setImageOpacity(nextImageOpacity);
    if (noPages || !imageUrl) return;
    updatePagesBackground(selectedBackgroundPageIds, {
      type: 'image',
      imageUrl,
      imageSize: nextImageSize,
      imagePosition: nextImagePosition,
      imageOpacity: nextImageOpacity,
    });
  };

  const applyImageSelected = (payload: {
    imageUrl: string;
    imageSize: ImageSizeType;
    imagePosition: ImagePositionType;
    imageOpacity: number;
  }) => {
    setBgType('image');
    setImageUrl(payload.imageUrl);
    setImageSize(payload.imageSize);
    setImagePosition(payload.imagePosition);
    setImageOpacity(payload.imageOpacity);
    if (noPages) return;
    updatePagesBackground(selectedBackgroundPageIds, {
      type: 'image',
      imageUrl: payload.imageUrl,
      imageSize: payload.imageSize,
      imagePosition: payload.imagePosition,
      imageOpacity: payload.imageOpacity,
    });
  };

  const clearImageToColor = () => {
    setBgType('color');
    setImageUrl('');
    if (noPages) return;
    updatePagesBackground(selectedBackgroundPageIds, { type: 'color', value: colorValue });
  };

  return (
    <div className="space-y-3">

      {/* ─── 1 · GÖRÜNÜM MODU ───────────────────────────────── */}
      <div className="border border-border-default rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2 bg-surface-subtle border-b border-border-default flex items-center justify-between">
          <span className="text-[11px] font-medium text-text-secondary tracking-normal">
            Görünüm Modu
          </span>
          {isModified && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              Aktif
            </span>
          )}
        </div>
        <div className="p-3 space-y-3">
          <Slider
            min={0}
            max={100}
            step={1}
            value={foregroundOpacity}
            onChange={setForegroundOpacity}
            label="Ön Plan Saydamlığı"
            unit="%"
          />

          <div className="flex justify-between text-[11px] font-normal text-text-muted leading-relaxed">
            <span>%0 — Tam Saydam</span>
            <span>%100 — Tam Görünür</span>
          </div>

          {isModified && (
            <button
              onClick={() => setForegroundOpacity(100)}
              className="w-full py-2 border border-border-default text-text-secondary hover:bg-surface-subtle text-xs font-medium rounded-lg transition-colors"
            >
              Sıfırla (%100)
            </button>
          )}

          <p className="text-[11px] font-normal text-text-muted leading-relaxed">
            Arka plan hariç tüm katmanların görünürlüğünü ayarlar. Yalnızca editör önizlemesini etkiler, baskıya yansımaz.
          </p>
        </div>
      </div>

      {/* ─── 2 · SAYFA SEÇİMİ ───────────────────────────────── */}
      <div className="border border-border-default rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2 bg-surface-subtle border-b border-border-default">
          <span className="text-[11px] font-medium text-text-secondary tracking-normal">
            Sayfa Seçimi
          </span>
        </div>
        <div className="p-3 space-y-3">

          <div className="flex items-center justify-between text-sm">
            <span className="text-xs font-medium text-text-secondary">{formaLabel}</span>
            <span className="text-[11px] font-normal text-text-muted leading-relaxed">{activePages.length} sayfa</span>
          </div>

          {backgroundMerged ? (
            <div className="relative" style={{ height: '3rem' }}>
              <div
                className="absolute border border-border-default bg-surface-subtle rounded-md"
                style={{ width: '2.5rem', height: '2.75rem', top: '6px', left: '6px' }}
              />
              <div
                className="absolute border border-border-default bg-surface-subtle rounded-md"
                style={{ width: '2.5rem', height: '2.75rem', top: '3px', left: '3px' }}
              />
              <div
                className="absolute border-2 border-[#1e293b] bg-white rounded-md flex items-center justify-center"
                style={{ width: '2.5rem', height: '2.75rem', top: 0, left: 0 }}
              >
                <span className="text-text-primary font-medium text-sm">
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
                        ? 'border-2 border-[#1e293b] bg-surface-subtle'
                        : 'border border-border-default bg-white hover:border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#1e293b] text-white text-[11px] flex items-center justify-center leading-none">
                        ✓
                      </span>
                    )}
                    <span className="text-text-primary font-medium text-sm">
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
                  className="py-2 text-xs font-medium rounded-lg border transition-colors border-border-default bg-white text-slate-300 opacity-40 cursor-not-allowed"
                >
                  Yüzeyleri Birleştir
                </button>
                <button
                  onClick={() => setBackgroundMerged(false)}
                  disabled={backgroundMerged === false}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                    backgroundMerged === false
                      ? 'border-border-default bg-white text-slate-300 cursor-not-allowed opacity-40'
                      : 'border-border-default bg-white hover:bg-surface-subtle text-text-secondary'
                  }`}
                >
                  Yüzeyleri Ayır
                </button>
              </div>
              <span className="text-[11px] font-normal text-text-muted leading-relaxed italic">
                Birleştirme özelliği geliştirme aşamasında.
              </span>
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
                  ? 'border-border-default bg-white text-slate-300 cursor-not-allowed opacity-40'
                  : 'border-border-default bg-white hover:bg-surface-subtle text-text-secondary'
              }`}
            >
              Tüm Sayfalara Uygula
            </button>

          </div>

          {/* Uygulama sonuç raporu */}
          {applyReport && (
            <div className="relative rounded-lg border border-slate-100 bg-surface-subtle p-2.5">
              <button
                onClick={() => setApplyReport(null)}
                className="absolute top-1.5 right-2 text-text-muted hover:text-text-secondary text-sm leading-none"
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
      <div className="border border-border-default rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2 bg-surface-subtle border-b border-border-default">
          <span className="text-[11px] font-medium text-text-secondary tracking-normal">
            Zemin Türü
          </span>
        </div>
        <div className="p-3 space-y-3">

          {noPages && (
            <p className="text-[11px] font-normal text-text-muted leading-relaxed text-center py-1">
              Zemin düzenlemek için sayfa seçin.
            </p>
          )}

          {/* Tür seçici */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={applyColorType}
              disabled={noPages}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border cursor-pointer transition-colors ${
                bgType === 'color'
                  ? 'border-2 border-[#1e293b] bg-surface-subtle'
                  : 'border border-border-default bg-white hover:border-slate-300 hover:bg-surface-subtle'
              } ${noPages ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Palette
                size={20}
                className={bgType === 'color' ? 'text-text-primary' : 'text-text-secondary'}
              />
              <span
                className={`text-xs ${bgType === 'color' ? 'font-medium text-text-primary' : 'font-medium text-text-secondary'}`}
              >
                Renk
              </span>
            </button>

            <ImagePickerPopover
              disabled={noPages}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border cursor-pointer transition-colors ${
                bgType === 'image'
                  ? 'border-2 border-[#1e293b] bg-surface-subtle'
                  : 'border border-border-default bg-white hover:border-slate-300 hover:bg-surface-subtle'
              } ${noPages ? 'opacity-40 cursor-not-allowed' : ''}`}
              trigger={
                <>
                  <Image
                    size={20}
                    className={bgType === 'image' ? 'text-text-primary' : 'text-text-secondary'}
                  />
                  <span
                    className={`text-xs ${bgType === 'image' ? 'font-medium text-text-primary' : 'font-medium text-text-secondary'}`}
                  >
                    Görsel
                  </span>
                </>
              }
              imageUrl={imageUrl}
              imageSize={imageSize}
              imagePosition={imagePosition}
              imageOpacity={imageOpacity}
              onImageSelected={applyImageSelected}
              onSettingsChange={applyImageSettings}
              onImageCleared={clearImageToColor}
            />
          </div>

          {/* ── Renk (düz veya geçişli) ── */}
          {bgType === 'color' && !noPages && (
            <div className="flex items-center gap-3">
              <ColorOpacityPicker value={colorValue} onChange={applyColor} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-text-secondary">Zemin</div>
                <div className="text-[11px] font-normal text-text-muted leading-relaxed">
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

        </div>
      </div>

    </div>
  );
}
