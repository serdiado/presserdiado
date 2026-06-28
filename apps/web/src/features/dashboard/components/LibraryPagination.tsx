// Kütüphane sayfalarının ortak sayfalama footer'ı + dilimleme yardımcısı (client-side).
// Veri tek seferde çekilir ama yalnız geçerli sayfa çizilir → DOM/resim sayısı sınırlı kalır.

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE_OPTIONS } from './LibraryToolbar';

// Tam (sıralı/filtreli) listeyi geçerli sayfaya dilimler; page taşarsa klampler.
export function usePagedSlice<T>(
  list: T[],
  page: number,
  setPage: (p: number) => void,
  pageSize: number,
): { items: T[]; currentPage: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  // Silme/filtre sonrası page aralık dışına düşerse düzelt.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);

  const start = (currentPage - 1) * pageSize;
  return { items: list.slice(start, start + pageSize), currentPage, totalPages };
}

interface LibraryPaginationProps {
  total: number;
  page: number; // 1-tabanlı (klamplı) geçerli sayfa
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function LibraryPagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = '',
}: LibraryPaginationProps) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div
      className={`flex items-center justify-between gap-4 flex-wrap mt-4 pt-3 border-t border-border-default text-body-sm text-text-secondary ${className}`}
    >
      <label className="flex items-center gap-2 select-none">
        <span>Sayfa başına</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 px-2 rounded-radius-md border border-border-default bg-surface-panel text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-border-strong"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-4">
        <span className="tabular-nums">
          {start}–{end} / {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            title="Önceki sayfa"
            className="h-8 w-8 inline-flex items-center justify-center rounded-radius-md border border-border-default text-text-secondary hover:bg-surface-subtle transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-1 tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Sonraki sayfa"
            className="h-8 w-8 inline-flex items-center justify-center rounded-radius-md border border-border-default text-text-secondary hover:bg-surface-subtle transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
