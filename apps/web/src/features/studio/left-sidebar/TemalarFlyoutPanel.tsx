import { useEffect, useState } from 'react';
import { X, LayoutTemplate } from 'lucide-react';
import type { StudioPreset } from '@matbaapro/shared';
import { useCatalogStore, useUIStore } from '@/stores/studio';
import { ConfirmModal } from '@/components/ui';
import { listStudioPresets } from '../presets/studioPresets';

const FLYOUT_ID = 'temalar';

export function TemalarFlyoutPanel() {
  const activeFlyout = useUIStore((s) => s.activeFlyout);
  const setActiveFlyout = useUIStore((s) => s.setActiveFlyout);

  const applyPreset = useCatalogStore((s) => s.applyPreset);

  const [pendingPreset, setPendingPreset] = useState<StudioPreset | null>(null);

  const isOpen = activeFlyout === FLYOUT_ID;
  const presets = listStudioPresets();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveFlyout(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setActiveFlyout]);

  const confirmApply = () => {
    if (pendingPreset) applyPreset(pendingPreset);
    setPendingPreset(null);
  };

  return (
    <>
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
            <span className="text-heading-md">Temalar</span>
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
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex flex-col gap-2 p-3 rounded-xl border border-border-default bg-surface-panel"
            >
              <div className="flex items-center justify-center aspect-424/301 rounded-lg bg-surface-subtle border border-border-default overflow-hidden">
                {preset.thumbnail ? (
                  <img src={preset.thumbnail} alt={preset.name} className="h-full w-full object-cover" />
                ) : (
                  <LayoutTemplate size={28} strokeWidth={1.25} className="text-text-muted" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-body-sm font-semibold text-text-primary truncate">{preset.name}</div>
                {preset.description && (
                  <p className="text-[11px] text-text-secondary leading-snug mt-0.5">{preset.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPendingPreset(preset)}
                className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Uygula
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal, transform'lu flyout'un DIŞINDA (kardeş) — fixed overlay viewport'a göre çalışır. */}
      <ConfirmModal
        isOpen={pendingPreset !== null}
        title="Şablon Uygulansın mı?"
        description="Bu şablon mevcut grid ve stil ayarlarını değiştirecek, slotlar yeniden dizilecek. Ürünleriniz korunur."
        confirmLabel="Uygula"
        cancelLabel="Vazgeç"
        onConfirm={confirmApply}
        onCancel={() => setPendingPreset(null)}
      />
    </>
  );
}
