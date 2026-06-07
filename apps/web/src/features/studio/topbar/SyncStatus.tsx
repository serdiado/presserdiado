import React from 'react';
import { Cloud } from 'lucide-react';

export function SyncStatus() {
  return (
    <div
      title="Bulut Kaydı — Yakında"
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-radius-md bg-surface-subtle border border-border-strong/40 select-none text-text-tertiary cursor-help transition-colors hover:text-text-secondary"
    >
      <Cloud size={14} className="shrink-0" />
      <span className="text-[10px] font-semibold tracking-wide uppercase">Yakında</span>
    </div>
  );
}
