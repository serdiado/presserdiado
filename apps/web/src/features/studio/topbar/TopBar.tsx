import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogStore, useHistoryStore, useUIStore } from '@/stores/studio';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { Undo2, Redo2, Home } from 'lucide-react';
import { DownloadMenu } from './DownloadMenu';
import { ProjectMenu } from './ProjectMenu';
import { PriceCalculator } from '../pricing/PriceCalculator';

export function TopBar() {
  const navigate = useNavigate();
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
    <div className="h-14 bg-surface-panel border-b border-border-default flex items-center justify-between px-4 shrink-0 shadow-drop-sm relative z-1001">
      {/* Sol Grup */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          title="Kullanıcı Paneli"
          className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-strong rounded-radius-md transition-colors"
        >
          <Home size={16} />
        </button>
        <div className="flex items-center gap-1 border-l pl-3 border-border-default">
          <button
            onClick={undo}
            disabled={past.length === 0}
            title="Geri Al (Ctrl+Z)"
            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border-default rounded-radius-md disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="İleri Al (Ctrl+Shift+Z)"
            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border-default rounded-radius-md disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {/* Orta Grup */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="text-sm font-bold text-text-primary">Katalog 2026 - Taslak</span>
      </div>

      {/* Sağ Grup */}
      <div className="flex items-center gap-3">
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
        <PriceCalculator />
        <DownloadMenu />
        <ThemeToggle compact />
      </div>
    </div>
  );
}
