// Kullanıcı Paneli — App Shell (TopBar + SideNav + layout wrapper)
// apps/web/src/features/dashboard/Shell.tsx

import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, FileText, LayoutTemplate, List, Palette,
  Package, Folder, Users, CreditCard, Settings,
  HelpCircle, Bell, Search, Plus, LogOut,
} from 'lucide-react';
import type { NavItem, NavItemId, User, UsageStat } from './types';

// ─── Navigasyon tanımı ────────────────────────────────────────────────────────
export const NAV_ITEMS: NavItem[] = [
  { id: 'home',      label: 'Ana Sayfa'            },
  { id: 'projects',  label: 'Tasarım Projelerim',  badge: 24  },
  { id: 'templates', label: 'Kayıtlı Şablonlarım'  },
  { id: 'lists',     label: 'Ürün Listelerim'       },
  { id: 'brand',     label: 'Marka Varlıklarım'     },
  { id: 'orders',    label: 'Baskı Siparişlerim',   badge: 3  },
  { id: 'files',     label: 'Dosyalarım'            },
  { id: 'team',      label: 'Ekip ve Paylaşım'      },
  { id: 'billing',   label: 'Fatura ve Ödeme'       },
  { id: 'account',   label: 'Hesap Ayarları'        },
  { id: 'help',      label: 'Yardım Merkezi'        },
];

// Route map
export const NAV_ROUTES: Record<NavItemId, string> = {
  home:      '/dashboard',
  projects:  '/dashboard/projeler',
  templates: '/dashboard/coming-soon',
  lists:     '/dashboard/urunler',
  brand:     '/dashboard/coming-soon',
  orders:    '/dashboard/siparisler',
  files:     '/dashboard/coming-soon',
  team:      '/dashboard/coming-soon',
  billing:   '/dashboard/coming-soon',
  account:   '/dashboard/coming-soon',
  help:      '/dashboard/coming-soon',
};

const NAV_ICONS: Record<NavItemId, React.ElementType> = {
  home:      Home,
  projects:  FileText,
  templates: LayoutTemplate,
  lists:     List,
  brand:     Palette,
  orders:    Package,
  files:     Folder,
  team:      Users,
  billing:   CreditCard,
  account:   Settings,
  help:      HelpCircle,
};

// ─── Prop tipleri ──────────────────────────────────────────────────────────────
interface ShellProps {
  children: ReactNode;
  user: User;
  usage?: UsageStat;
  onLogout?: () => void;
  onNewDesign?: () => void;
}

// ─── Shell ─────────────────────────────────────────────────────────────────────
export function DashboardShell({
  children,
  user,
  usage,
  onLogout,
  onNewDesign,
}: ShellProps) {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <DashboardTopBar user={user} onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSideNav
          user={user}
          usage={usage}
          onNewDesign={onNewDesign}
        />
        <main className="flex-1 overflow-auto bg-stone-100">{children}</main>
      </div>
    </div>
  );
}

// ─── TopBar ────────────────────────────────────────────────────────────────────
function DashboardTopBar({
  user,
  onLogout,
}: {
  user: User;
  onLogout?: () => void;
}) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-6 h-6 bg-slate-900 rounded-[4px] grid place-items-center text-white text-[10px] font-extrabold">
          P
        </div>
        <span className="text-base font-extrabold text-slate-900 tracking-tight">
          Presserdiado
        </span>
      </Link>

      {/* Arama */}
      <div className="ml-8 relative w-80">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Projelerimde, şablonlarımda veya siparişlerimde ara…"
          className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white border border-slate-200
                     hover:border-slate-300 rounded-md text-sm placeholder-slate-400
                     focus:bg-white focus:border-slate-400 outline-none transition-colors"
        />
      </div>

      {/* Sağ alan */}
      <div className="ml-auto flex items-center gap-3">
        {/* Bildirimler */}
        <button
          className="relative h-9 w-9 grid place-items-center rounded-md
                     hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Bildirimler"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* Kullanıcı */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-200 grid place-items-center
                          text-xs font-bold text-slate-700 select-none">
            {user.avatarInitials ?? user.displayName?.slice(0, 2).toUpperCase() ?? '??'}
          </div>
          <div className="text-left leading-tight mr-2">
            <div className="text-xs font-bold text-slate-800">
              {user.displayName ?? user.email}
            </div>
            {user.companyName && (
              <div className="text-[10px] text-slate-500">{user.companyName}</div>
            )}
          </div>
          
          {/* Çıkış Yap butonu */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── SideNav ───────────────────────────────────────────────────────────────────
function DashboardSideNav({
  user,
  usage,
  onNewDesign,
}: {
  user: User;
  usage?: UsageStat;
  onNewDesign?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Aktif route'dan active id bul (home için tam eşleşme, diğerleri için startswith kontrolü)
  let activeId: NavItemId = 'home';
  if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
    activeId = 'home';
  } else {
    activeId = (Object.entries(NAV_ROUTES).find(
      ([id, route]) => id !== 'home' && (location.pathname === route || location.pathname.startsWith(route + '/'))
    )?.[0] ?? 'home') as NavItemId;
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col">
      {/* Yeni Tasarım — birincil CTA, sayfada tek mavi buton */}
      <div className="p-4">
        <button
          onClick={onNewDesign ?? (() => navigate('/new'))}
          className="w-full inline-flex items-center justify-center gap-2 h-10 px-4
                     rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm
                     font-semibold transition-colors"
        >
          <Plus size={16} />
          Yeni Tasarım
        </button>
      </div>

      {/* Menü */}
      <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeId;
          const Icon = NAV_ICONS[item.id];
          return (
            <Link
              key={item.id}
              to={NAV_ROUTES[item.id]}
              className={[
                'w-full inline-flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              <Icon
                size={18}
                className={isActive ? 'text-slate-800' : 'text-slate-500'}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={[
                    'text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded',
                    isActive
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Kullanım kotası */}
      {usage && (
        <div className="border-t border-slate-200 p-4 bg-slate-50 shrink-0">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2">
            {usage.period}
          </div>
          <div className="text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Kullanılan</span>
              <b className="text-slate-800">
                {usage.used} / {usage.limit}
              </b>
            </div>
            <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-700 rounded-full transition-all"
                style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
              />
            </div>
            <Link
              to="/dashboard/coming-soon"
              className="text-[11px] text-blue-700 hover:underline mt-2 inline-block font-medium"
            >
              Planı Yükselt →
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
