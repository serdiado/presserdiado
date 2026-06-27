// Tek bir hazır şablonun (StudioPreset) ÜRÜNSÜZ, standart önizlemesini UI olmadan render
// eder — gen:preset-thumbs script'i Puppeteer ile buraya gelip screenshot alır. PrintView'in
// kuzeni: aynı hide-on-export CSS'i + image-decode bekleme + #preset-preview-ready işareti.
//
//   /preset-preview?id=<presetId>  → o preset'in önizlemesi (tek forma / 2 sayfa / tek kırım)
//   /preset-preview                → window.__PRESET_IDS__ = [...] (script preset listesini buradan okur)

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { availableTemplates } from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';
import { Page } from '@/features/studio/canvas/Page';
import { LayerStack } from '@/features/studio/canvas/LayerStack';
import { listStudioPresets } from '@/features/studio/presets/studioPresets';
import { loadPresetPreviewState } from '@/features/studio/presets/buildPresetPreviewState';

const READY_ID = 'preset-preview-ready';

export default function PresetPreview() {
  const [params] = useSearchParams();
  const id = params.get('id');

  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const staleTemplate = useCatalogStore((s) => s.activeTemplate);

  // Render bütünlüğü için kanonik template referansını kullan (PrintView ile aynı koruma).
  const template = useMemo(
    () => availableTemplates.find((t) => t.id === staleTemplate?.id) ?? staleTemplate,
    [staleTemplate],
  );

  const [ready, setReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    // Index modu: id yoksa script'in okuyacağı id listesini window'a yayınla ve hemen hazır ol.
    if (!id) {
      (window as Window & { __PRESET_IDS__?: string[] }).__PRESET_IDS__ = listStudioPresets().map(
        (p) => p.id,
      );
      setReady(true);
      setImagesReady(true);
      return;
    }
    const preset = listStudioPresets().find((p) => p.id === id);
    if (!preset) {
      setReady(true);
      setImagesReady(true);
      return;
    }
    loadPresetPreviewState(preset);
    // Store hidrasyonu + ResizeObserver oturması için bir tick bekle (PrintView ile aynı).
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, [id]);

  useEffect(() => {
    if (!ready) return;
    const checkImages = async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {}))),
      );
      setImagesReady(true);
    };
    const timer = setTimeout(checkImages, 50);
    return () => clearTimeout(timer);
  }, [ready]);

  const activeForma = formas.find((f) => f.id === activeFormaId) ?? formas[0];

  const totalWidthMm = useMemo(() => {
    if (!activeForma || !template) return 210;
    return (
      activeForma.pages.reduce((sum, p) => {
        const cfg = template.pages.find((pp) => pp.pageNumber === p.pageNumber);
        return sum + (cfg?.widthMm ?? 210);
      }, 0) +
      template.bleedMm * 2
    );
  }, [activeForma, template]);

  // Index modu: yalnızca hazır işareti (script preset listesini window'dan okur).
  if (!id) {
    return imagesReady ? <div id={READY_ID} style={{ display: 'none' }} /> : null;
  }

  if (!ready || !activeForma || !template) {
    return (
      <div className="p-4 bg-white text-black text-center text-xl mt-10">
        Önizleme hazırlanıyor…
      </div>
    );
  }

  const physicalHeight = template.openHeightMm + template.bleedMm * 2;
  const order = activeForma.pages.map((p) => p.pageNumber);

  return (
    <div
      className="print-mode bg-white overflow-hidden m-0 p-0"
      style={{
        width: `${totalWidthMm}mm`,
        height: `${physicalHeight}mm`,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .print-mode [data-hide-on-export] { display: none !important; }
            .print-mode [data-hide-border-on-export="true"] { border-style: none !important; }
            html, body, #root {
              width: ${totalWidthMm}mm !important;
              height: ${physicalHeight}mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: hidden !important;
            }
            @page { margin: 0; size: ${totalWidthMm}mm ${physicalHeight}mm; }
          `,
        }}
      />
      <div
        id="preset-preview-canvas"
        className="relative bg-white overflow-hidden m-0 p-0"
        style={{
          boxSizing: 'border-box',
          width: `${totalWidthMm}mm`,
          height: `${physicalHeight}mm`,
          padding: `${template.bleedMm}mm`,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <LayerStack forma={activeForma} />
        <div className="relative z-10 flex h-full w-full flex-row items-stretch bg-transparent m-0 p-0">
          {order.map((n, idx) => (
            <Page key={n} pageNumber={n} isFirst={idx === 0} isLast={idx === order.length - 1} />
          ))}
        </div>
      </div>
      {imagesReady && <div id={READY_ID} style={{ display: 'none' }} />}
    </div>
  );
}
