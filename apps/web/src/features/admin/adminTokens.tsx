// Yönetici Paneli — TEK-KAYNAK görsel sabit katmanı.
// Admin iç araçtır; kendi görsel dili (koyu nav, operasyonel durum renkleri) olabilir
// AMA hardcode hex/renk bileşenlere SAÇILMAZ — durum renkleri, nav tonları, KPI tonları
// yalnızca BU dosyada toplanır. StatusPill ve durum-değiştirme <select> AYNI ADMIN_STATUS'tan okur.

import type { ReactNode } from 'react';

// ─── Sipariş durumu (backend orders.status enum'u ile birebir) ───────────────────
// Hem StatusPill hem dropdown bu listeden beslenir → iki yerde farklı etiket olamaz.
export const ADMIN_ORDER_STATUSES = [
  'draft',
  'submitted',
  'in_production',
  'shipped',
  'completed',
  'cancelled',
] as const;

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

interface StatusToken {
  label: string;
  // Pill (rozet) için Tailwind sınıf grubu — operasyonel durum renkleri.
  pill: string;
  // KPI/nokta gibi yerlerde kullanılan düz renk noktası.
  dot: string;
}

export const ADMIN_STATUS: Record<AdminOrderStatus, StatusToken> = {
  draft:         { label: 'Taslak',   pill: 'bg-slate-100 text-slate-700 border-slate-300',     dot: 'bg-slate-400'   },
  submitted:     { label: 'Alındı',   pill: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-500'    },
  in_production: { label: 'Üretimde', pill: 'bg-amber-50 text-amber-700 border-amber-200',      dot: 'bg-amber-500'   },
  shipped:       { label: 'Kargoda',  pill: 'bg-orange-50 text-orange-700 border-orange-200',   dot: 'bg-orange-500'  },
  completed:     { label: 'Teslim',   pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled:     { label: 'İptal',    pill: 'bg-red-50 text-red-700 border-red-200',            dot: 'bg-red-500'     },
};

// Dropdown <option> listesi — ADMIN_STATUS ile aynı kaynak (etiket tek yerden).
export const ADMIN_STATUS_OPTIONS = ADMIN_ORDER_STATUSES.map((value) => ({
  value,
  label: ADMIN_STATUS[value].label,
}));

export function statusLabel(status: string): string {
  return (ADMIN_STATUS as Record<string, StatusToken>)[status]?.label ?? status;
}

// ─── StatusPill ──────────────────────────────────────────────────────────────────
export function StatusPill({ status, sm }: { status: string; sm?: boolean }) {
  const token = (ADMIN_STATUS as Record<string, StatusToken>)[status] ?? ADMIN_STATUS.draft;
  return (
    <span
      className={[
        'inline-flex items-center font-bold uppercase border rounded',
        sm ? 'text-[9px] tracking-wider px-1.5 py-0.5' : 'text-[10px] tracking-wider px-2 py-1',
        token.pill,
      ].join(' ')}
    >
      {token.label}
    </span>
  );
}

// ─── KPI tonları ───────────────────────────────────────────────────────────────
export type KpiTone = 'default' | 'success' | 'warning' | 'danger';

export const KPI_TONE: Record<KpiTone, string> = {
  default: 'text-slate-900',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger:  'text-red-600',
};

// ─── Koyu sol nav tonları (operasyonel his — slate-900 zemin) ────────────────────
export const ADMIN_NAV = {
  shell:        'bg-stone-100',
  aside:        'bg-slate-900 text-slate-300',
  asideBorder:  'border-slate-800',
  brand:        'text-white',
  brandBadge:   'text-slate-500 bg-slate-800',
  section:      'text-slate-500',
  itemActive:   'bg-slate-800 text-white font-semibold',
  itemIdle:     'text-slate-400 hover:bg-slate-800/60 hover:text-white',
  itemPassive:  'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300',
  iconActive:   'text-white',
  iconIdle:     'text-slate-500',
  badgeActive:  'bg-slate-700 text-white',
  badgeIdle:    'bg-slate-800 text-slate-300',
  badgeSoon:    'bg-slate-800 text-slate-500',
  footer:       'border-slate-800 bg-slate-950/50 text-slate-500',
  online:       'text-emerald-400',
  avatar:       'bg-slate-900 text-white',
} as const;

// Vurgu (CTA) ve display font — admin içinde tek yerden.
export const ADMIN_ACCENT = {
  cta:        'bg-blue-600 hover:bg-blue-700 text-white',
  ctaSoft:    'border-slate-700 text-slate-800',
} as const;

export const ADMIN_DISPLAY_FONT = { fontFamily: 'Oswald, Inter, sans-serif' };

// SectionHead / küçük yardımcılar — sayfalar arası tutarlılık için tek yerde.
export function SectionHead({ title, className = '' }: { title: ReactNode; className?: string }) {
  return (
    <h2 className={`text-sm font-bold tracking-[0.12em] uppercase text-slate-500 mb-3 ${className}`}>
      {title}
    </h2>
  );
}
