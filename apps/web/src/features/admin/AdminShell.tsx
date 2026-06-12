// Yönetici Paneli — App Shell. Koyu sol nav (slate-900) + topbar.
// Aktif menüler gerçek route'a gider; pasif menüler /admin/yakinda placeholder'ına.
// Tüm renk/ton seçimleri adminTokens.ADMIN_NAV'dan okunur (hardcode hex yok).
import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, ShoppingBag, Truck, Package, Tag, LayoutTemplate,
  Users, Briefcase, LifeBuoy, Receipt, BarChart3, Shield,
  Settings, Search, Bell, LogOut, type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { ADMIN_NAV } from './adminTokens';

type NavEntry = {
  label: string;
  icon: LucideIcon;
  // route verilirse aktif menü; verilmezse pasif ("Yakında").
  route?: string;
  badgeKey?: 'orders';
};

const ADMIN_MENU: { section: string; items: NavEntry[] }[] = [
  { section: 'Genel', items: [
    { label: 'Kontrol Paneli', icon: Home, route: '/admin' },
  ]},
  { section: 'Operasyon', items: [
    { label: 'Siparişler', icon: ShoppingBag, route: '/admin/orders', badgeKey: 'orders' },
    { label: 'Kargo',      icon: Truck },
  ]},
  { section: 'Katalog', items: [
    { label: 'Ürünler',       icon: Package },
    { label: 'Fiyatlandırma', icon: Tag },
    { label: 'Şablonlar',     icon: LayoutTemplate },
  ]},
  { section: 'Müşteri', items: [
    { label: 'Kullanıcılar',     icon: Users },
    { label: 'Müşteriler',       icon: Briefcase },
    { label: 'Destek Talepleri', icon: LifeBuoy },
  ]},
  { section: 'Finans', items: [
    { label: 'Faturalar', icon: Receipt },
    { label: 'Raporlar',  icon: BarChart3 },
  ]},
  { section: 'Sistem', items: [
    { label: 'Ekip ve Yetkiler', icon: Shield },
    { label: 'Sistem Ayarları',  icon: Settings, route: '/admin/theme' },
  ]},
];

function isItemActive(pathname: string, route?: string): boolean {
  if (!route) return false;
  if (route === '/admin') return pathname === '/admin' || pathname === '/admin/';
  return pathname === route || pathname.startsWith(route + '/');
}

export function AdminShell({ orderCount, children }: { orderCount: number; children: ReactNode }) {
  return (
    <div className={`min-h-screen flex ${ADMIN_NAV.shell}`}>
      <AdminSideNav orderCount={orderCount} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar orderCount={orderCount} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function AdminSideNav({ orderCount }: { orderCount: number }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className={`w-60 flex flex-col shrink-0 ${ADMIN_NAV.aside}`}>
      <div className={`h-14 px-5 flex items-center border-b shrink-0 ${ADMIN_NAV.asideBorder}`}>
        <div className="w-[22px] h-[22px] bg-white rounded-[4px] grid place-items-center text-slate-900 text-[10px] font-extrabold">
          P
        </div>
        <span className={`ml-2 font-extrabold tracking-tight text-base ${ADMIN_NAV.brand}`}>
          Presserdiado
        </span>
        <span className={`ml-2 text-[9px] font-bold tracking-[0.14em] uppercase rounded px-1.5 py-0.5 ${ADMIN_NAV.brandBadge}`}>
          Yön
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {ADMIN_MENU.map((sec) => (
          <div key={sec.section}>
            <div className={`text-[9px] font-bold tracking-[0.18em] uppercase mb-2 px-3 ${ADMIN_NAV.section}`}>
              {sec.section}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((m) => {
                const Icon = m.icon;
                const active = isItemActive(location.pathname, m.route);
                const passive = !m.route;
                const badge = m.badgeKey === 'orders' ? orderCount : undefined;

                const cls = [
                  'w-full inline-flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
                  active ? ADMIN_NAV.itemActive : passive ? ADMIN_NAV.itemPassive : ADMIN_NAV.itemIdle,
                ].join(' ');

                const inner = (
                  <>
                    <Icon size={16} className={active ? ADMIN_NAV.iconActive : ADMIN_NAV.iconIdle} />
                    <span className="flex-1 truncate">{m.label}</span>
                    {badge !== undefined && badge > 0 && (
                      <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded ${active ? ADMIN_NAV.badgeActive : ADMIN_NAV.badgeIdle}`}>
                        {badge}
                      </span>
                    )}
                    {passive && (
                      <span className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${ADMIN_NAV.badgeSoon}`}>
                        Yakında
                      </span>
                    )}
                  </>
                );

                // Pasif: placeholder route'a git (shell korunur). Aktif: gerçek Link.
                return m.route ? (
                  <Link key={m.label} to={m.route} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={m.label}
                    onClick={() => navigate('/admin/yakinda', { state: { title: m.label } })}
                    className={cls}
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t p-4 text-[11px] shrink-0 ${ADMIN_NAV.footer}`}>
        v2.4.1 · serdiado.de<br />
        <span className={ADMIN_NAV.online}>●</span> API çevrimiçi
      </div>
    </aside>
  );
}

function AdminTopBar({ orderCount }: { orderCount: number }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const displayName = user?.companyName || user?.email || 'Yönetici';
  const initials = (user?.companyName || user?.email || 'YÖ').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
      <span className="text-xs font-semibold text-slate-700">Yönetici Paneli</span>

      {/* Arama — görsel; client-side filtre Siparişler sayfasında. */}
      <div className="ml-8 relative w-96 hidden md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          disabled
          placeholder="Sipariş kodu, müşteri adı ara…"
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder-slate-400 outline-none cursor-not-allowed"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-right leading-tight pr-3 border-r border-slate-200 hidden sm:block">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Toplam</div>
          <div className="text-sm font-bold text-slate-800 tabular-nums">{orderCount} sipariş</div>
        </div>
        <button
          className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          aria-label="Bildirimler"
        >
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold ${ADMIN_NAV.avatar}`}>
            {initials}
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-xs font-bold text-slate-800 max-w-[140px] truncate">{displayName}</div>
            <div className="text-[10px] text-slate-500">Yönetici</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
            title="Çıkış Yap"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
