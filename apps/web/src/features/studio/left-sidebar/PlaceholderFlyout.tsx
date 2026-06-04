import { useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { useUIStore } from '@/stores/studio';

interface PlaceholderFlyoutProps {
  flyoutId: string;
  title: string;
  description?: string;
}

export function PlaceholderFlyout({ flyoutId, title, description }: PlaceholderFlyoutProps) {
  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);
  const isOpen = activeFlyout === flyoutId;

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
        <span className="text-heading-md text-text-primary">{title}</span>
        <button
          type="button"
          onClick={() => setActiveFlyout(null)}
          className="text-text-secondary hover:text-text-primary p-1 rounded transition-colors"
          title="Kapat"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <Clock size={32} strokeWidth={1.25} className="text-text-muted opacity-50" />
        <p className="text-body-sm text-text-muted">
          {description ?? 'Bu bölüm yakında kullanıma açılacak.'}
        </p>
      </div>
    </div>
  );
}
