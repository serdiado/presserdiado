// Medya kütüphanesi sayfaları (Ürün Resimleri + Medya) için ortak isme göre sıralama.
// 3 durumlu: 'default' (API sırası, en yeni üstte) → 'asc' (A→Z) → 'desc' (Z→A).

import { ArrowDownUp, ArrowDownAZ, ArrowDownZA } from 'lucide-react';

export type NameSortDir = 'default' | 'asc' | 'desc';

// fileName'e göre Türkçe locale ile sıralı KOPYA döndürür. 'default' → diziyi olduğu gibi
// (liste zaten createdAt desc geliyor). İsimsiz öğeler sona alınır.
export function sortByName<T extends { fileName?: string | null }>(
  items: T[],
  dir: NameSortDir,
): T[] {
  if (dir === 'default') return items;
  const sorted = [...items].sort((a, b) => {
    const an = a.fileName?.trim() ?? '';
    const bn = b.fileName?.trim() ?? '';
    if (!an && !bn) return 0;
    if (!an) return 1; // isimsizler sona
    if (!bn) return -1;
    return an.localeCompare(bn, 'tr', { numeric: true, sensitivity: 'base' });
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
}

const NEXT: Record<NameSortDir, NameSortDir> = {
  default: 'asc',
  asc: 'desc',
  desc: 'default',
};

const LABEL: Record<NameSortDir, string> = {
  default: 'Sırala',
  asc: 'A→Z',
  desc: 'Z→A',
};

interface NameSortToggleProps {
  dir: NameSortDir;
  onChange: (dir: NameSortDir) => void;
}

// "Tümünü Seç" yanında küçük sıralama butonu — tıklayınca durumlar arasında döner.
export function NameSortToggle({ dir, onChange }: NameSortToggleProps) {
  const Icon = dir === 'asc' ? ArrowDownAZ : dir === 'desc' ? ArrowDownZA : ArrowDownUp;
  const active = dir !== 'default';
  return (
    <button
      type="button"
      onClick={() => onChange(NEXT[dir])}
      title="İsme göre sırala"
      className={`h-8 px-2.5 inline-flex items-center gap-1.5 rounded-radius-md border text-body-sm transition-colors ${
        active
          ? 'border-border-strong bg-surface-subtle text-text-primary'
          : 'border-border-default text-text-secondary hover:bg-surface-subtle'
      }`}
    >
      <Icon size={15} />
      {LABEL[dir]}
    </button>
  );
}
