// Pure render of an active forma — no chrome, no UI. Puppeteer navigates here
// with injected localStorage state and waits for #print-canvas-ready before
// snapshotting/printing.

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { availableTemplates } from '@matbaapro/shared';
import { useCatalogStore, useLayerStore } from '@/stores/studio';
import { Page } from '@/features/studio/canvas/Page';
import { LayerStack } from '@/features/studio/canvas/LayerStack';
import { RenderSurfaceProvider } from '@/features/studio/canvas/RenderSurfaceContext';

export default function PrintView() {
  const [params] = useSearchParams();
  const formaId = params.get('formaId');

  const formas = useCatalogStore((s) => s.formas);
  const staleTemplate = useCatalogStore((s) => s.activeTemplate);
  const setActiveFormaId = useCatalogStore((s) => s.setActiveFormaId);

  const template = useMemo(
    () => availableTemplates.find((t) => t.id === staleTemplate?.id) ?? staleTemplate,
    [staleTemplate],
  );

  const [ready, setReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    const injected = (window as Window & { __INJECTED_LAYER_STATE__?: { layers: unknown[] } })
      .__INJECTED_LAYER_STATE__;
    if (injected?.layers) {
      useLayerStore.setState({ layers: injected.layers as never });
    }
    if (formaId) {
      setActiveFormaId(Number(formaId));
      // Wait a tick for store hydration + ResizeObserver settling.
      setTimeout(() => setReady(true), 100);
    }
  }, [formaId, setActiveFormaId]);

  useEffect(() => {
    if (!ready) return;

    const checkImages = async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return img.decode().catch(() => {});
        }),
      );
      setImagesReady(true);
    };

    const timer = setTimeout(checkImages, 50);
    return () => clearTimeout(timer);
  }, [ready]);

  const activeForma = formas.find((f) => f.id === Number(formaId));

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

  if (!ready || !activeForma || !template) {
    return (
      <div className="p-4 bg-white text-black text-center text-xl mt-10">
        PDF Hazırlanıyor, lütfen bekleyin...
      </div>
    );
  }

  const physicalHeight = template.openHeightMm + template.bleedMm * 2;
  const order = activeForma.pages.map((p) => p.pageNumber);
  // Güvenlik taraması bulgusu: bu değerler /export'un gevşek doğrulanmış (z.record(z.unknown()))
  // catalogState'inden gelebiliyor — aşağıdaki <style> bloğuna escape'siz basılmadan önce
  // gerçekten sayı olduklarını garanti ediyoruz (CSS-injection'ı kapatır).
  const safeWidthMm = Number.isFinite(totalWidthMm) ? totalWidthMm : 210;
  const safeHeightMm = Number.isFinite(physicalHeight) ? physicalHeight : 297;

  return (
    // BASKI YOLU HER ZAMAN ORİJİNAL GÖRSELİ KULLANIR. Stüdyo kanvası küçük türevle çalışır
    // (bkz. lib/imageTier.ts) ama Puppeteer'ın bastığı bu ağaç aynı bileşenleri kullandığı
    // için katmanı burada açıkça 'original'a sabitliyoruz — matbaaya giden PDF'e düşük
    // çözünürlüklü bir görselin sızması bu sarmalayıcı sayesinde mümkün değil.
    <RenderSurfaceProvider tier="original">
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
              width: ${safeWidthMm}mm !important;
              height: ${safeHeightMm}mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: hidden !important;
            }
            @page { margin: 0; size: ${safeWidthMm}mm ${safeHeightMm}mm; }
          `,
        }}
      />
      <div
        id="print-canvas"
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
            <Page
              key={n}
              pageNumber={n}
              isFirst={idx === 0}
              isLast={idx === order.length - 1}
            />
          ))}
        </div>
      </div>
      {imagesReady && <div id="print-canvas-ready" style={{ display: 'none' }} />}
    </div>
    </RenderSurfaceProvider>
  );
}
