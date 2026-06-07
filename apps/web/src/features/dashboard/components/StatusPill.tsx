// Durum etiketi (badge) — proje + sipariş durumları için
// apps/web/src/features/dashboard/components/StatusPill.tsx

import type { ProjectStatus, OrderStatus } from '../types';

type AnyStatus = ProjectStatus | OrderStatus;

const STATUS_MAP: Record<AnyStatus, { label: string; className: string }> = {
  taslak:  { label: 'Taslak',  className: 'bg-emerald-50 text-emerald-700'  },
  baskıda: { label: 'Baskıda', className: 'bg-blue-50 text-blue-700'        },
  kargoda: { label: 'Kargoda', className: 'bg-amber-50 text-amber-700'      },
  teslim:  { label: 'Teslim',  className: 'bg-slate-100 text-slate-600'     },
  onayda:  { label: 'Onayda',  className: 'bg-stone-100 text-slate-700'     },
  yeni:    { label: 'Yeni',    className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  onay:    { label: 'Onayda',  className: 'bg-stone-100 text-slate-700'     },
  iptal:   { label: 'İptal',   className: 'bg-red-50 text-red-700'          },
};

interface StatusPillProps {
  status: AnyStatus;
  sm?: boolean;   // daha küçük varyant
}

export function StatusPill({ status, sm }: StatusPillProps) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.taslak;
  return (
    <span
      className={[
        'font-bold uppercase tracking-wider rounded',
        sm ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1',
        cfg.className,
      ].join(' ')}
    >
      {cfg.label}
    </span>
  );
}
