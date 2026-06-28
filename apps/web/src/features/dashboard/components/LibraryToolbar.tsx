// Kütüphane sayfalarının (Ürün Listesi, Ürün Resimleri, Medya/Genel) ORTAK kontrol kümesi.
//
// TEK YER: Tüm bu bölümlerde görünmesini istediğiniz yeni bir kontrolü (ör. ileride
// "görünüm modu": Liste/Küçük/Büyük) buraya bir kez eklemeniz yeterli — hepsinde belirir.
// Kontrolün state'i useLibraryView'da, görseli <LibraryToolbar>'da durur. Her sayfa kontrolün
// değerini kendi verisine bağlar (sıralama alanı, render biçimi sayfaya özeldir).

import { useState } from 'react';
import { NameSortToggle, type NameSortDir } from './librarySort';

// Ortak görünüm/kontrol state'i — her sayfa kendi örneğini kullanır.
// Yeni ortak kontrol eklerken (ör. viewMode) state'ini buraya ekleyin.
export function useLibraryView() {
  const [sortDir, setSortDir] = useState<NameSortDir>('default');
  return { sortDir, setSortDir };
}

interface LibraryToolbarProps {
  sortDir: NameSortDir;
  onSortChange: (dir: NameSortDir) => void;
  allSelected: boolean;
  onToggleAll: () => void;
  className?: string;
}

export function LibraryToolbar({
  sortDir,
  onSortChange,
  allSelected,
  onToggleAll,
  className = '',
}: LibraryToolbarProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Yeni ortak kontroller (ör. görünüm modu) buraya eklenir → tüm bölümlerde belirir. */}
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
