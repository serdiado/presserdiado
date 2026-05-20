import { useState } from 'react';
import { useCatalogStore } from '@/stores/studio';

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

  const handleApply = () => {
    if (
      window.confirm(
        'DİKKAT: Tüm sayfalardaki birleştirmeler/serbest alanlar sıfırlanacak ve ürünler yeniden dizilecek. Onaylıyor musunuz?',
      )
    ) {
      applyGridChanges();
      setSelectedPage(null);
    }
  };

  const selectedPageObj =
    selectedPage !== null
      ? activeForma?.pages.find((p) => p.pageNumber === selectedPage)
      : null;
  const pageGrid = selectedPageObj?.gridSettings ?? grid;

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 tracking-widest">
          VARSAYILAN GRID
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="text-[9px] font-bold text-slate-400">Satır</span>
            <input
              type="number"
              min={1}
              max={10}
              value={grid.rows}
              onChange={(e) =>
                updateGridSettings('global', { ...grid, rows: parseInt(e.target.value) || 1 })
              }
              className="w-full mt-1 text-sm font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
            />
          </label>
          <label>
            <span className="text-[9px] font-bold text-slate-400">Sütun</span>
            <input
              type="number"
              min={1}
              max={10}
              value={grid.cols}
              onChange={(e) =>
                updateGridSettings('global', { ...grid, cols: parseInt(e.target.value) || 1 })
              }
              className="w-full mt-1 text-sm font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 tracking-widest">
          SAYFA BAZLI ÖZELLEŞTİRME
        </h4>
        <div className="flex flex-wrap gap-2">
          {activeForma?.pages.map((page) => {
            const isCustom = !!page.gridSettings;
            const isSelected = selectedPage === page.pageNumber;
            return (
              <button
                key={page.pageNumber}
                onClick={() =>
                  setSelectedPage(isSelected ? null : page.pageNumber)
                }
                className={`relative min-w-9 h-9 rounded border text-xs font-black ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md z-10'
                    : isCustom
                      ? 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {page.pageNumber}
                {isCustom && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white" />
                )}
              </button>
            );
          })}
        </div>

        {selectedPage !== null && selectedPageObj && (
          <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="text-[9px] font-bold text-slate-400">Satır</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={pageGrid.rows}
                  onChange={(e) =>
                    updateGridSettings(selectedPage, {
                      ...pageGrid,
                      rows: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full mt-1 text-xs font-bold border border-slate-200 rounded p-1.5"
                />
              </label>
              <label>
                <span className="text-[9px] font-bold text-slate-400">Sütun</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={pageGrid.cols}
                  onChange={(e) =>
                    updateGridSettings(selectedPage, {
                      ...pageGrid,
                      cols: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full mt-1 text-xs font-bold border border-slate-200 rounded p-1.5"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => applyPageGridChange(selectedPage)}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded"
              >
                Uygula
              </button>
              {selectedPageObj.gridSettings && (
                <button
                  onClick={() => revertToGlobalGrid(selectedPage)}
                  className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded"
                >
                  Globale Dön
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleApply}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md shadow-md"
      >
        Tüm Ayarları Uygula
      </button>
    </div>
  );
}
