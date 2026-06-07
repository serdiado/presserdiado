import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Kaydet ve Devam Et',
  cancelLabel = 'Çalışmaya Geri Dön',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const btnConfirmColor =
    confirmVariant === 'danger'
      ? 'bg-danger hover:bg-danger-hover text-white border-transparent focus:ring-danger/20'
      : 'bg-primary hover:bg-primary-hover text-white border-transparent focus:ring-primary/20';

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
    } catch (err) {
      console.error('ConfirmModal onConfirm error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl p-6 w-full max-w-md shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative">
        <div className="flex gap-4">
          <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-full ${confirmVariant === 'danger' ? 'bg-danger-subtle text-danger' : 'bg-warning/10 text-warning'}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-text-primary mb-1">
              {title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="h-9 px-4 text-xs font-semibold bg-surface-subtle hover:bg-border-default border border-border-strong text-text-secondary rounded-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-border-strong disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`h-9 px-4 text-xs font-semibold border rounded-md transition-all cursor-pointer focus:outline-none focus:ring-2 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${btnConfirmColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
