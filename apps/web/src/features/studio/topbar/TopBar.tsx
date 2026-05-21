import { useEffect } from 'react';
import { useCatalogStore, useHistoryStore, useUIStore } from '@/stores/studio';
import { DownloadMenu } from './DownloadMenu';
import { ProjectMenu } from './ProjectMenu';

export function TopBar() {
  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const setActiveFormaId = useCatalogStore((s) => s.setActiveFormaId);

  const userScale = useUIStore((s) => s.userScale);
  const resetZoom = useUIStore((s) => s.resetZoom);

  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const past = useHistoryStore((s) => s.past);
  const future = useHistoryStore((s) => s.future);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm relative z-1001">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Görünüm:
        </span>
        <select
          value={activeFormaId}
          onChange={(e) => setActiveFormaId(Number(e.target.value))}
          className="bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-300 cursor-pointer hover:bg-slate-100 transition-all min-w-45 h-8 outline-none"
        >
          {formas.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 mr-2 border-r pr-3 border-slate-200">
          <button
            onClick={undo}
            disabled={past.length === 0}
            title="Geri Al (Ctrl+Z)"
            className="h-8 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md text-xs font-medium disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ← Geri
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="İleri Al (Ctrl+Shift+Z)"
            className="h-8 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md text-xs font-medium disabled:opacity-30 disabled:hover:bg-transparent"
          >
            İleri →
          </button>
        </div>

        <button
          onClick={resetZoom}
          title="Fit / Sıfırla (zoom %)"
          className={`h-8 px-3.5 rounded-md text-xs font-semibold border transition-all min-w-20 ${
            userScale !== 1
              ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          🔍 {Math.round(userScale * 100)}%
        </button>

        <ProjectMenu />
        <DownloadMenu />
      </div>
    </div>
  );
}
