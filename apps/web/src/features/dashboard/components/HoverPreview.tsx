// Liste/Küçük modlarda küçük bir thumbnail'in üzerine gelince büyüyen önizleme.
// Çocuğu (tetikleyici thumbnail) sarar; mouse girince portal ile sabit konumlu büyük resim +
// ad/alt-bilgi kartı gösterir. src yoksa önizleme açılmaz.

import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const PREVIEW_W = 280;
const PREVIEW_H = 320; // resim (280) + alt bilgi payı

interface HoverPreviewProps {
  src?: string | null; // mutlak URL
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function HoverPreview({ src, title, subtitle, children, className = '' }: HoverPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const show = () => {
    if (!src) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Öğenin sağına yerleştir; sığmazsa soluna; viewport'a sıkıştır.
    let left = r.right + 12;
    if (left + PREVIEW_W > window.innerWidth - 8) left = r.left - PREVIEW_W - 12;
    left = Math.max(8, left);
    let top = r.top + r.height / 2 - PREVIEW_H / 2;
    top = Math.max(8, Math.min(top, window.innerHeight - PREVIEW_H - 8));
    setPos({ left, top });
  };
  const hide = () => setPos(null);

  return (
    <div ref={ref} className={className} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {pos &&
        src &&
        createPortal(
          <div
            style={{ position: 'fixed', left: pos.left, top: pos.top, width: PREVIEW_W, zIndex: 100000 }}
            className="pointer-events-none rounded-radius-lg border border-border-default bg-surface-panel shadow-drop-lg overflow-hidden animate-in fade-in duration-100"
          >
            <div className="w-full h-[280px] bg-surface-subtle flex items-center justify-center overflow-hidden">
              <img src={src} alt={title ?? ''} className="max-w-full max-h-full object-contain" />
            </div>
            {(title || subtitle) && (
              <div className="px-3 py-2 border-t border-border-default">
                {title && <div className="text-body-xs text-text-primary truncate">{title}</div>}
                {subtitle && (
                  <div className="text-[11px] text-text-muted font-mono truncate">{subtitle}</div>
                )}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
