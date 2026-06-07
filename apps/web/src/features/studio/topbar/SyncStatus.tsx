import React from 'react';
import { Cloud } from 'lucide-react';

export function SyncStatus() {
  return (
    <div
      title="Bulut Kaydı — Yakında"
      className="inline-flex items-center select-none text-text-tertiary opacity-50 cursor-help transition-all hover:text-text-secondary hover:opacity-80 ml-1"
    >
      <Cloud size={16} className="shrink-0" />
    </div>
  );
}
