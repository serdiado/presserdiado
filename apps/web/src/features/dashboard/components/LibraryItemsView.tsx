// Kütüphane sayfalarının ortak öğe listeleyicisi: Liste / Küçük / Büyük modlarını slotlarla çizer.
// Her sayfa öğesini slot fonksiyonlarıyla bağlar (resim, başlık, meta, rozet, aksiyon). Böylece
// görünüm modları tek yerde tutarlı kalır; sayfaya özel içerik slotlarda kalır.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, ImageOff } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/upload';
import { HoverPreview } from './HoverPreview';
import type { ViewMode } from './LibraryToolbar';

export interface LibraryItemAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface LibraryItemsViewProps<T> {
  items: T[];
  mode: ViewMode;
  getKey: (item: T) => string;
  getImage: (item: T) => string | null | undefined; // relative imageKey veya null
  getTitle: (item: T) => string;
  renderMeta?: (item: T, mode: ViewMode) => ReactNode;
  renderBadges?: (item: T) => ReactNode;
  isSelected: (item: T) => boolean;
  onToggleSelect: (item: T) => void;
  getActions?: (item: T) => LibraryItemAction[];
  getPreviewSubtitle?: (item: T) => string | undefined;
}

// Üç-nokta aksiyon menüsü (küçük/büyük kartlarda). Dropdown body'e portal edilir (kart
// overflow-hidden olduğundan kırpılmasın); dışarı tıklamada kapanır.
function ItemMenu({ actions }: { actions: LibraryItemAction[] }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    const el = btnRef.current;
    if (!el) return;
    if (!open) {
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (btnRef.current?.contains(t)) return;
      if (t.closest?.('[data-item-menu]')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title="Aksiyonlar"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className="p-1.5 rounded-radius-md text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open &&
        rect &&
        createPortal(
          <div
            data-item-menu
            style={{ position: 'fixed', top: rect.top, right: rect.right, zIndex: 100000 }}
            className="w-44 bg-surface-panel border border-border-default rounded-radius-md shadow-drop-lg py-1 animate-in fade-in slide-in-from-top-1 duration-100"
          >
            {actions.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => {
                  setOpen(false);
                  a.onClick();
                }}
                className={`w-full text-left px-3 py-2 text-body-xs flex items-center gap-2 transition-colors ${
                  a.danger
                    ? 'text-danger hover:bg-danger-subtle'
                    : 'text-text-primary hover:bg-surface-subtle'
                }`}
              >
                {a.icon}
                <span>{a.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

// Resim veya tutarlı placeholder.
function ItemImage({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-muted">
        <ImageOff size={22} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className="w-full h-full object-contain"
    />
  );
}

export function LibraryItemsView<T>({
  items,
  mode,
  getKey,
  getImage,
  getTitle,
  renderMeta,
  renderBadges,
  isSelected,
  onToggleSelect,
  getActions,
  getPreviewSubtitle,
}: LibraryItemsViewProps<T>) {
  const toAbs = (item: T) => {
    const rel = getImage(item);
    return rel ? toAbsoluteUrl(rel) : null;
  };

  // --- LİSTE: satırlar, mini resim (hover önizleme), detay, inline aksiyon ikonları ---
  if (mode === 'list') {
    return (
      <div className="space-y-2">
        {items.map((item) => {
          const selected = isSelected(item);
          const img = toAbs(item);
          const actions = getActions?.(item) ?? [];
          return (
            <div
              key={getKey(item)}
              className={`group flex items-center gap-4 border p-3 rounded-radius-md transition-colors ${
                selected
                  ? 'bg-surface-subtle border-border-strong'
                  : 'bg-surface-panel border-border-default hover:border-border-strong'
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(item)}
                className={`w-4 h-4 accent-primary cursor-pointer shrink-0 transition-opacity ${
                  selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
              <HoverPreview
                src={img}
                title={getTitle(item)}
                subtitle={getPreviewSubtitle?.(item)}
                className="shrink-0"
              >
                <div className="w-12 h-12 rounded border border-border-default bg-white flex items-center justify-center overflow-hidden">
                  <ItemImage src={img} alt={getTitle(item)} />
                </div>
              </HoverPreview>
              <div className="flex-1 min-w-0">
                <div className="text-heading-sm text-text-primary truncate">{getTitle(item)}</div>
                {renderMeta && <div className="mt-0.5">{renderMeta(item, mode)}</div>}
              </div>
              {actions.length > 0 && (
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {actions.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={a.onClick}
                      title={a.label}
                      className={`p-1.5 rounded transition-colors ${
                        a.danger
                          ? 'text-text-secondary hover:text-danger hover:bg-danger-subtle'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                      }`}
                    >
                      {a.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // --- KÜÇÜK / BÜYÜK: kare kartlar; küçük modda hover önizleme; aksiyonlar üç-nokta menüde ---
  const isLarge = mode === 'large';
  const gridClass = isLarge
    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
    : 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3';

  return (
    <div className={gridClass}>
      {items.map((item) => {
        const selected = isSelected(item);
        const img = toAbs(item);
        const actions = getActions?.(item) ?? [];
        const imageBox = (
          <div className="aspect-square bg-surface-subtle flex items-center justify-center overflow-hidden">
            <ItemImage src={img} alt={getTitle(item)} />
          </div>
        );
        return (
          <div
            key={getKey(item)}
            className={`group relative bg-surface-panel border rounded-radius-lg overflow-hidden transition-colors ${
              selected
                ? 'border-border-strong bg-surface-subtle'
                : 'border-border-default hover:border-border-strong'
            }`}
          >
            {/* Hover önizleme yalnız Liste modunda; Küçük/Büyük'te resim zaten yeterli boyutta. */}
            {imageBox}

            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item)}
              className={`absolute top-1.5 left-1.5 w-4 h-4 accent-primary cursor-pointer transition-opacity ${
                selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            />
            {renderBadges && <div className="absolute top-1.5 right-1.5">{renderBadges(item)}</div>}

            <div className={`${isLarge ? 'p-2.5' : 'p-2'} space-y-1`}>
              <div className="text-[11px] text-text-primary truncate" title={getTitle(item)}>
                {getTitle(item)}
              </div>
              {renderMeta && <div className="min-w-0">{renderMeta(item, mode)}</div>}
              {actions.length > 0 && (
                <div className="flex justify-end">
                  <ItemMenu actions={actions} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
