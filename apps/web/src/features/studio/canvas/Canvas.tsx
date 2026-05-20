import { useEffect, useMemo, useRef, useState } from 'react';
import { ZOOM_MAX, ZOOM_MIN } from '@matbaapro/shared';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { Page } from './Page';
import { LayerStack } from './LayerStack';
import { MM_TO_PX } from '../util/style';

const WHEEL_FACTOR_IN = 1.1;
const WHEEL_FACTOR_OUT = 0.9;

export function Canvas() {
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const template = useCatalogStore((s) => s.activeTemplate);
  const clearSelection = useUIStore((s) => s.clearSelection);
  const disableAllImageEditModes = useCatalogStore((s) => s.disableAllImageEditModes);
  const userScale = useUIStore((s) => s.userScale);
  const pan = useUIStore((s) => s.pan);
  const setUserZoom = useUIStore((s) => s.setUserZoom);

  const activeForma = formas.find((f) => f.id === activeFormaId);
  const pages = activeForma?.pages ?? [];

  const [fitScale, setFitScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Drag state lives in ref so mousemove doesn't churn React reconciler.
  const dragRef = useRef<{ startMouseX: number; startMouseY: number; startPanX: number; startPanY: number } | null>(null);

  const { bleedMm, openHeightMm } = template;
  const physicalHeight = openHeightMm + bleedMm * 2;
  const order = pages.map((p) => p.pageNumber);

  const totalWidthMm = useMemo(() => {
    return (
      order.reduce((sum, n) => {
        const pc = template.pages.find((p) => p.pageNumber === n);
        return sum + (pc ? pc.widthMm : 210);
      }, 0) +
      bleedMm * 2
    );
  }, [order, template, bleedMm]);

  const refWidthPx = totalWidthMm * MM_TO_PX;
  const refHeightPx = physicalHeight * MM_TO_PX;

  // Fit-to-screen recompute
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const sw = (width - 60) / refWidthPx;
      const sh = (height - 60) / refHeightPx;
      setFitScale(Math.min(sw, sh));
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [refWidthPx, refHeightPx]);

  // Space tuşu hold-to-pan (Figma/Photoshop benzeri)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const t = e.target as HTMLElement;
        if (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
        if (!spaceDown) setSpaceDown(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [spaceDown]);

  // Pan drag listeners (window seviyesinde — wrapper dışına taşıldığında da takip)
  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startMouseX;
      const dy = e.clientY - d.startMouseY;
      setUserZoom(useUIStore.getState().userScale, {
        x: d.startPanX + dx,
        y: d.startPanY + dy,
      });
    };
    const onUp = () => {
      setIsPanning(false);
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isPanning, setUserZoom]);

  // Wheel zoom — cursor-anchored
  const handleWheel = (e: React.WheelEvent) => {
    if (!wrapperRef.current) return;
    e.preventDefault();
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const wcx = rect.width / 2;
    const wcy = rect.height / 2;

    const factor = e.deltaY > 0 ? WHEEL_FACTOR_OUT : WHEEL_FACTOR_IN;
    const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, userScale * factor));
    if (next === userScale) return;

    const ratio = next / userScale;
    const dx = cx - wcx;
    const dy = cy - wcy;
    const newPanX = dx * (1 - ratio) + pan.x * ratio;
    const newPanY = dy * (1 - ratio) + pan.y * ratio;

    setUserZoom(next, { x: newPanX, y: newPanY });
  };

  // Pan başlat: middle mouse (button=1) VEYA space basılı + sol tık
  const handleMouseDown = (e: React.MouseEvent) => {
    const isMiddle = e.button === 1;
    const isSpaceLeft = spaceDown && e.button === 0;
    if (!isMiddle && !isSpaceLeft) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
    setIsPanning(true);
  };

  // Middle button auto-scroll'u browser'a vermemek için
  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button === 1) e.preventDefault();
  };

  const effectiveScale = fitScale * userScale;
  const transform = `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${effectiveScale})`;
  const cursor = isPanning ? 'grabbing' : spaceDown ? 'grab' : 'default';

  return (
    <div
      ref={wrapperRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onAuxClick={handleAuxClick}
      onContextMenu={(e) => {
        // Middle-click bazi platformlarda context menu acabilir; iptal et
        if (isPanning) e.preventDefault();
      }}
      className="flex-1 relative w-full h-full min-w-0 min-h-0 bg-slate-300 overflow-hidden select-none"
      style={{ cursor }}
    >
      <div
        id="canvas"
        onClick={() => {
          if (isPanning) return;
          clearSelection();
          disableAllImageEditModes();
        }}
        className="canvas absolute top-1/2 left-1/2 origin-center"
        style={{
          boxSizing: 'border-box',
          width: `${totalWidthMm}mm`,
          height: `${physicalHeight}mm`,
          padding: `${bleedMm}mm`,
          backgroundColor: '#ffffff',
          outline: '1px dashed #ef4444',
          outlineOffset: '-1px',
          transform,
          transition: isPanning ? 'none' : 'transform 80ms ease-out',
          willChange: 'transform',
          pointerEvents: spaceDown ? 'none' : 'auto',
        }}
      >
        <LayerStack forma={activeForma} />

        <div
          className="relative z-10 flex h-full w-full flex-row items-stretch bg-transparent"
          style={{ outline: '1px solid #22c55e' }}
        >
          <div
            data-hide-on-export="true"
            className="pointer-events-none absolute z-50"
            style={{
              top: '5mm',
              bottom: '5mm',
              left: '5mm',
              right: '5mm',
              border: '1px dashed #3b82f6',
              boxSizing: 'border-box',
            }}
          />
          {order.map((n) => (
            <Page key={n} pageNumber={n} />
          ))}
        </div>
      </div>
    </div>
  );
}
