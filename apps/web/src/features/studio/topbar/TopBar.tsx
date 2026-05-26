import { useEffect } from 'react';
import { useCatalogStore, useHistoryStore, useUIStore } from '@/stores/studio';
import { ThemeToggle } from '../../../components/ThemeToggle';
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
    <div className="h-12 bg-surface-panel border-b border-border-default flex items-center justify-between px-4 shrink-0 shadow-drop-sm relative z-1001">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Görünüm:
        </span>
        <select
          value={activeFormaId}
          onChange={(e) => setActiveFormaId(Number(e.target.value))}
          className="bg-surface-subtle text-text-secondary text-xs font-semibold px-3 py-1.5 rounded-radius-md border border-border-strong cursor-pointer hover:bg-border-default transition-all min-w-45 h-8 outline-none"
        >
          {formas.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 mr-2 border-r pr-3 border-border-default">
          <button
            onClick={undo}
            disabled={past.length === 0}
            title="Geri Al (Ctrl+Z)"
            className="h-8 px-3 text-text-secondary hover:text-text-primary hover:bg-border-default rounded-radius-md text-xs font-medium disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ← Geri
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="İleri Al (Ctrl+Shift+Z)"
            className="h-8 px-3 text-text-secondary hover:text-text-primary hover:bg-border-default rounded-radius-md text-xs font-medium disabled:opacity-30 disabled:hover:bg-transparent"
          >
            İleri →
          </button>
        </div>

        <button
          onClick={resetZoom}
          title="Fit / Sıfırla (zoom %)"
          className={`h-8 px-3.5 rounded-radius-md text-xs font-semibold border transition-all min-w-20 ${
            userScale !== 1
              ? 'bg-surface-subtle border-border-strong text-text-primary hover:bg-border-default'
              : 'bg-surface-panel border-border-strong text-text-secondary hover:bg-surface-subtle'
          }`}
        >
          🔍 {Math.round(userScale * 100)}%
        </button>

        <ProjectMenu />
        <DownloadMenu />
        <ThemeToggle compact />
      </div>
    </div>
  );
}
