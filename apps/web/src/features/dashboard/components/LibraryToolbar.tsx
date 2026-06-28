// Kütüphane sayfalarının (Ürün Listesi, Ürün Resimleri, Medya/Genel) ORTAK kontrol kümesi.
//
// TEK YER: Tüm bu bölümlerde görünmesini istediğiniz yeni bir kontrolü buraya bir kez eklersiniz
// — hepsinde belirir. Kontrolün state'i useLibraryView'da, görseli <LibraryToolbar>'da durur.
// Her sayfa kontrolün değerini kendi verisine/render'ına bağlar.

import { useState } from 'react';
import { List, LayoutGrid, Image as ImageIcon, Search } from 'lucide-react';
import { NameSortToggle, type NameSortDir } from './librarySort';

export type ViewMode = 'list' | 'small' | 'large';

export const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 50;

interface UseLibraryViewOptions {
  // Görünüm modunu/sayfa boyutunu bölüm bazlı localStorage'da hatırlamak için anahtar (ör. 'products').
  storageKey?: string;
  defaultViewMode?: ViewMode;
}

function readStoredViewMode(storageKey: string | undefined, fallback: ViewMode): ViewMode {
  if (!storageKey) return fallback;
  try {
    const v = localStorage.getItem(`lib-view:${storageKey}`);
    if (v === 'list' || v === 'small' || v === 'large') return v;
  } catch {
    /* localStorage erişilemezse varsayılana düş */
  }
  return fallback;
}

function readStoredPageSize(storageKey: string | undefined): number {
  if (!storageKey) return DEFAULT_PAGE_SIZE;
  try {
    const n = Number(localStorage.getItem(`lib-pagesize:${storageKey}`));
    if (PAGE_SIZE_OPTIONS.includes(n as (typeof PAGE_SIZE_OPTIONS)[number])) return n;
  } catch {
    /* yoksay */
  }
  return DEFAULT_PAGE_SIZE;
}

// Ortak görünüm/kontrol state'i — her sayfa kendi örneğini kullanır.
// Yeni ortak kontrol eklerken state'ini buraya ekleyin (tek yer).
export function useLibraryView(opts: UseLibraryViewOptions = {}) {
  const { storageKey, defaultViewMode = 'large' } = opts;
  const [sortDir, setSortDir] = useState<NameSortDir>('default');
  const [viewMode, setViewModeState] = useState<ViewMode>(() =>
    readStoredViewMode(storageKey, defaultViewMode),
  );
  const [pageSize, setPageSizeState] = useState<number>(() => readStoredPageSize(storageKey));
  const [page, setPage] = useState(1);
  // Arama sorgusu — geçici (persist edilmez). Her sayfa kendi verisinde uygular.
  const [query, setQuery] = useState('');

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (storageKey) {
      try {
        localStorage.setItem(`lib-view:${storageKey}`, mode);
      } catch {
        /* yoksay */
      }
    }
  };

  const setPageSize = (n: number) => {
    setPageSizeState(n);
    setPage(1); // sayfa boyutu değişince başa dön
    if (storageKey) {
      try {
        localStorage.setItem(`lib-pagesize:${storageKey}`, String(n));
      } catch {
        /* yoksay */
      }
    }
  };

  return { sortDir, setSortDir, viewMode, setViewMode, pageSize, setPageSize, page, setPage, query, setQuery };
}

const VIEW_META: Record<ViewMode, { label: string; Icon: typeof List }> = {
  list: { label: 'Liste', Icon: List },
  small: { label: 'Küçük resim', Icon: LayoutGrid },
  large: { label: 'Büyük resim', Icon: ImageIcon },
};

// Döngü: her tıkta sıradaki moda geç (A→Z sıralama butonu gibi tek buton).
const NEXT_VIEW: Record<ViewMode, ViewMode> = {
  list: 'small',
  small: 'large',
  large: 'list',
};

function ViewModeToggle({ value, onChange }: { value: ViewMode; onChange: (m: ViewMode) => void }) {
  const { label, Icon } = VIEW_META[value];
  return (
    <button
      type="button"
      onClick={() => onChange(NEXT_VIEW[value])}
      title="Görünüm modunu değiştir"
      className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-radius-md border border-border-default text-body-sm text-text-secondary hover:bg-surface-subtle transition-colors"
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

interface LibraryToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortDir: NameSortDir;
  onSortChange: (dir: NameSortDir) => void;
  allSelected: boolean;
  onToggleAll: () => void;
  // Arama — verilirse soldaki arama input'u render edilir; her sayfa kendi verisinde filtreler.
  query?: string;
  onQueryChange?: (q: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function LibraryToolbar({
  viewMode,
  onViewModeChange,
  sortDir,
  onSortChange,
  allSelected,
  onToggleAll,
  query,
  onQueryChange,
  searchPlaceholder = 'Ara...',
  className = '',
}: LibraryToolbarProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Yeni ortak kontroller buraya eklenir → tüm bölümlerde belirir. */}
      {onQueryChange && (
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={query ?? ''}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-radius-md border border-border-default hover:border-border-strong bg-surface-panel text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-strong"
          />
        </div>
      )}
      <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
      <NameSortToggle dir={sortDir} onChange={onSortChange} />
      <label className="flex items-center gap-2 text-body-sm text-text-secondary cursor-pointer select-none">
        <input
          type="checkbox"
          className="w-4 h-4 accent-primary cursor-pointer"
          checked={allSelected}
          onChange={onToggleAll}
        />
        Tümünü Seç
      </label>
    </div>
  );
}
