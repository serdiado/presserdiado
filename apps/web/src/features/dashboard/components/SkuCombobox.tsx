// Arama destekli SKU seçici — saf React + Tailwind (harici kütüphane yok).
// Açılır liste, tablo gibi overflow konteynerlerinde kırpılmasın diye body'e portal edilir.
// Klavye: ↓/↑ gezin, Enter seç, Escape kapat. Click-outside ile kapanır.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';

export interface SkuOption {
  sku: string;
  name?: string | null;
}

interface SkuComboboxProps {
  value: string;
  options: SkuOption[];
  onChange: (sku: string) => void;
  placeholder?: string;
  className?: string;
  autoOpen?: boolean;       // mount edilince doğrudan arama moduna geç (inline düzenleme)
  onClose?: () => void;     // menü kapandığında haber ver (inline düzenlemeyi sonlandır)
}

export function SkuCombobox({
  value,
  options,
  onChange,
  placeholder = 'SKU seç…',
  className = '',
  autoOpen = false,
  onClose,
}: SkuComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Alfabetik sıralı (TR) seçenekler.
  const sorted = useMemo(
    () => [...options].sort((a, b) => a.sku.localeCompare(b.sku, 'tr')),
    [options],
  );

  // SKU kodu veya ürün adında arama.
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    if (!q) return sorted;
    return sorted.filter(
      (o) =>
        o.sku.toLocaleLowerCase('tr').includes(q) ||
        (o.name ?? '').toLocaleLowerCase('tr').includes(q),
    );
  }, [sorted, query]);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 4, left: r.left, width: r.width });
  };

  const openMenu = () => {
    updatePosition();
    setQuery('');
    setHighlight(0);
    setOpen(true);
  };

  const closeMenu = () => {
    setOpen(false);
    setQuery('');
    onClose?.();
  };

  // Inline düzenleme: mount edilince doğrudan aç.
  useEffect(() => {
    if (autoOpen) openMenu();
  }, []);

  // Açıkken: input'a odaklan, scroll/resize'da yeniden konumla, dışarı tıklamada kapat.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const reposition = () => updatePosition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      document.removeEventListener('mousedown', onDocMouseDown);
    };
  }, [open]);

  // Filtre değişince highlight'ı sınırla.
  useEffect(() => {
    setHighlight((h) => Math.min(h, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  // Highlight'lı öğeyi görünür tut.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const select = (sku: string) => {
    onChange(sku);
    closeMenu();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) select(opt.sku);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    }
  };

  return (
    <div ref={triggerRef} className={`relative ${className}`}>
      {open ? (
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlight(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="SKU veya ürün adı ara…"
          className="w-full h-9 px-2 border border-border-strong rounded-radius-md text-body-sm text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong"
        />
      ) : (
        <button
          type="button"
          onClick={openMenu}
          className="w-full h-9 px-2 flex items-center justify-between gap-1 border border-border-default hover:border-border-strong rounded-radius-md bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong"
        >
          <span className={`truncate text-body-sm ${value ? 'text-text-primary font-mono' : 'text-text-muted'}`}>
            {value || placeholder}
          </span>
          {value ? (
            <span
              role="button"
              tabIndex={-1}
              title="Temizle"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="shrink-0 text-text-muted hover:text-text-primary"
            >
              <X size={14} />
            </span>
          ) : (
            <ChevronDown size={14} className="shrink-0 text-text-muted" />
          )}
        </button>
      )}

      {open &&
        rect &&
        createPortal(
          <ul
            ref={listRef}
            style={{ position: 'fixed', top: rect.top, left: rect.left, width: rect.width, zIndex: 100000 }}
            className="max-h-60 overflow-y-auto bg-surface-panel border border-border-default rounded-radius-md shadow-drop-lg py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-body-xs text-text-muted">Sonuç yok</li>
            ) : (
              filtered.map((o, i) => (
                <li key={o.sku}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => select(o.sku)}
                    className={`w-full text-left px-3 py-1.5 flex items-center gap-2 transition-colors ${
                      i === highlight ? 'bg-surface-subtle' : 'hover:bg-surface-subtle/60'
                    }`}
                  >
                    <span className="font-mono text-body-xs text-text-primary shrink-0">{o.sku}</span>
                    {o.name && (
                      <span className="text-body-xs text-text-muted truncate">{o.name}</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>,
          document.body,
        )}
    </div>
  );
}
