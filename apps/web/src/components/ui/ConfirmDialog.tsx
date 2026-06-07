import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const btnConfirmColor =
    confirmVariant === 'danger'
      ? 'bg-danger hover:bg-danger-hover text-white focus:ring-danger/20'
      : 'bg-primary hover:bg-primary-hover text-white focus:ring-primary/20';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl p-6 w-full max-w-md shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative">
        <div className="flex gap-4">
          <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-full ${confirmVariant === 'danger' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
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
            className="px-4 py-2 text-xs font-semibold bg-surface-subtle hover:bg-border-default border border-border-strong text-text-secondary rounded-radius-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-border-strong"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-radius-md transition-all cursor-pointer focus:outline-none focus:ring-2 ${btnConfirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
