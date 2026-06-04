import { useEffect } from 'react';
import { X, Columns2 } from 'lucide-react';
import { useCatalogStore, useUIStore } from '@/stores/studio';

const FLYOUT_ID = 'formas';

export function FormasFlyoutPanel() {
  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);

  const formas = useCatalogStore((s) => s.formas);
  const activeFormaId = useCatalogStore((s) => s.activeFormaId);
  const setActiveFormaId = useCatalogStore((s) => s.setActiveFormaId);

  const isOpen = activeFlyout === FLYOUT_ID;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveFlyout(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setActiveFlyout]);

  return (
    <div
      className="absolute top-4 bottom-4 w-60 bg-surface-panel rounded-xl shadow-xl border border-border-default flex flex-col overflow-hidden transition-transform duration-200 ease-out z-10"
      style={{
        left: '80px',
        transform: isOpen ? 'translateX(0)' : 'translateX(calc(-100% - 80px))',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between px-3 py-2.5 bg-surface-subtle border-b border-border-default shrink-0">
        <div className="flex items-center gap-2 text-text-primary">
          <span className="text-heading-md">Formalar</span>
        </div>
        <button
          type="button"
          onClick={() => setActiveFlyout(null)}
          className="text-text-secondary hover:text-text-primary p-1 rounded transition-colors"
          title="Kapat"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {formas.map((f) => {
          const isActive = f.id === activeFormaId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFormaId(f.id)}
              className={`w-full flex flex-col items-center justify-center gap-3 p-5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-drop-sm font-semibold'
                  : 'border-border-default bg-surface-panel text-text-secondary hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary'
              }`}
            >
              <Columns2 size={40} strokeWidth={1.25} />
              <span className="text-body-sm text-center">{f.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
