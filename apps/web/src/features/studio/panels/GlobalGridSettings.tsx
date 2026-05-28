import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCatalogStore } from '@/stores/studio';

function NumberSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full appearance-none bg-white border border-border-default rounded-lg px-3 py-2.5 text-xs font-normal text-text-primary pr-8 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 cursor-pointer transition-colors"
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 text-sm">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className="text-xs font-normal text-text-primary">{value}</span>
    </div>
  );
}

export function GlobalGridSettings() {
  const globalSettings = useCatalogStore((s) => s.globalSettings);
  const updateGridSettings = useCatalogStore((s) => s.updateGridSettings);
  const applyGridChanges = useCatalogStore((s) => s.applyGridChanges);
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const applyPageGridChange = useCatalogStore((s) => s.applyPageGridChange);
  const revertToGlobalGrid = useCatalogStore((s) => s.revertToGlobalGrid);

  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const activeForma = formas.find((f) => f.id === activeFormaId);
  const grid = globalSettings.defaultGrid ?? { rows: 4, cols: 4 };

  const formaLabel = activeFormaId != null ? `F${activeFormaId}` : '-';

  const selectedPageObj =
    selectedPage !== null
      ? activeForma?.pages.find((p) => p.pageNumber === selectedPage)
      : null;
  const pageGrid = selectedPageObj?.gridSettings ?? grid;
  const hasCustomGrid = !!selectedPageObj?.gridSettings;

  const customPageCount =
    activeForma?.pages.filter((p) => !!p.gridSettings).length ?? 0;

  const handleApplyGlobal = () => {
    if (
      window.confirm(
        'DİKKAT: Tüm sayfalardaki birleştirmeler/serbest alanlar sıfırlanacak ve ürünler yeniden dizilecek. Onaylıyor musunuz?',
      )
    ) {
      applyGridChanges();
      setSelectedPage(null);
    }
  };

  return (
    <div className="space-y-3">

      {/* ─── 1 · IZGARA BİLGİSİ ─────────────────────────────── */}
      <div className="border border-border-default rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2 bg-surface-subtle border-b border-border-default">
          <span className="text-[11px] font-medium text-text-secondary tracking-normal">
            Izgara Bilgisi
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          <InfoRow label="Genel Izgara" value={`${grid.rows} × ${grid.cols}`} />
          <InfoRow label="Sayfa başına alan" value={String(grid.rows * grid.cols)} />
          <InfoRow label="Aktif sayfa" value={formaLabel} />
          <div className="flex items-center justify-between px-3 py-2.5 text-sm">
            <span className="text-xs font-medium text-text-secondary">Durum</span>
            <span
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                customPageCount > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {customPageCount > 0
                ? `${customPageCount} özel sayfa`
                : 'Genel izgarayı kullanıyor'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2 · GENEL IZGARA YAPISI ────────────────────────── */}
      <div className="border border-border-default rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2 bg-surface-subtle border-b border-border-default">
          <span className="text-[11px] font-medium text-text-secondary tracking-normal">
            Genel Izgara Yapısı
          </span>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Satır</label>
              <NumberSelect
                value={grid.rows}
                onChange={(v) => updateGridSettings('global', { ...grid, rows: v })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Sütun</label>
              <NumberSelect
                value={grid.cols}
                onChange={(v) => updateGridSettings('global', { ...grid, cols: v })}
              />
            </div>
          </div>
          <button
            onClick={handleApplyGlobal}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Genel Izgarayı Uygula
          </button>
          <p className="text-[11px] font-normal text-text-muted leading-relaxed">
            Özel ayarı olmayan sayfalara uygulanır.
          </p>
        </div>
      </div>

      {/* ─── 3 · SAYFAYA ÖZEL IZGARA ────────────────────────── */}
      <div className="border border-border-default rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2 bg-surface-subtle border-b border-border-default">
          <span className="text-[11px] font-medium text-text-secondary tracking-normal">
            Sayfaya Özel Izgara
          </span>
        </div>
        <div className="p-3 space-y-3">
          {/* Aktif forma etiketi */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-xs font-medium text-text-secondary">Aktif sayfa</span>
            <span className="text-xs font-normal text-text-primary">{formaLabel}</span>
          </div>

          {/* Sayfa seçici */}
          {activeForma && activeForma.pages.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeForma.pages.map((page) => {
                const isCustom = !!page.gridSettings;
                const isSelected = selectedPage === page.pageNumber;
                return (
                  <button
                    key={page.pageNumber}
                    onClick={() =>
                      setSelectedPage(isSelected ? null : page.pageNumber)
                    }
                    className={`relative min-w-8 h-8 px-2 rounded-md border text-xs transition-colors ${
                      isSelected
                        ? 'font-medium bg-[#1e293b] border-[#1e293b] text-white shadow-sm'
                        : isCustom
                          ? 'font-medium bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                          : 'font-normal bg-white border-border-default text-text-secondary hover:border-slate-400 hover:bg-surface-subtle'
                    }`}
                  >
                    {page.pageNumber}
                    {isCustom && !isSelected && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sayfa seçilmemiş → durum metni */}
          {selectedPage === null && (
            <p className="text-xs font-normal text-text-secondary">
              {customPageCount > 0
                ? `${customPageCount} sayfada özel ızgara tanımlandı.`
                : 'Bu sayfa genel izgarayı kullanıyor.'}
            </p>
          )}

          {/* Sayfa seçildi + henüz özel ızgara yok */}
          {selectedPage !== null && !hasCustomGrid && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <p className="text-xs font-normal text-text-secondary">
                Bu sayfa genel izgarayı kullanıyor.
              </p>
              <button
                onClick={() => updateGridSettings(selectedPage, grid)}
                className="w-full py-2.5 border border-blue-500 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-lg transition-colors"
              >
                Bu Sayfayı Özelleştir
              </button>
            </div>
          )}

          {/* Sayfa seçildi + özel ızgara var → düzenleyici */}
          {selectedPage !== null && selectedPageObj && hasCustomGrid && (
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Satır</label>
                  <NumberSelect
                    value={pageGrid.rows}
                    onChange={(v) =>
                      updateGridSettings(selectedPage, { ...pageGrid, rows: v })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Sütun</label>
                  <NumberSelect
                    value={pageGrid.cols}
                    onChange={(v) =>
                      updateGridSettings(selectedPage, { ...pageGrid, cols: v })
                    }
                  />
                </div>
              </div>
              <button
                onClick={() => applyPageGridChange(selectedPage)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Sayfaya Uygula
              </button>
              <button
                onClick={() => {
                  revertToGlobalGrid(selectedPage);
                  setSelectedPage(null);
                }}
                className="w-full py-2.5 border border-border-default text-text-secondary hover:bg-surface-subtle text-sm font-medium rounded-lg transition-colors"
              >
                Genel Izgaraya Dön
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
