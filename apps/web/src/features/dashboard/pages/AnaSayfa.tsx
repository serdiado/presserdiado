// Ana Sayfa — KPI'lar + son projeler + hızlı erişim + sipariş durumu
// apps/web/src/features/dashboard/pages/AnaSayfa.tsx

import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { NAV_ROUTES } from '../Shell';
import { ProjectCard } from '../components/ProjectCard';
import { StatusPill } from '../components/StatusPill';
import { useDashboardContext } from '../DashboardLayout';
import { useAuthStore } from '../../../stores/auth.store';

export function AnaSayfa() {
  const navigate = useNavigate();
  const { projects, orders, stats, loading } = useDashboardContext();
  const { user } = useAuthStore();

  const firstName = user?.companyName 
    ? user.companyName.split(' ')[0] 
    : (user?.email ? user.email.split('@')[0] : 'Kullanıcı');

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="text-sm font-semibold text-slate-500 animate-pulse">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Başlık */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Merhaba {firstName},
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {stats.activeOrders} baskı siparişin matbaada · onay bekleyenler var.
          </p>
        </div>
      </div>

      {/* KPI satırı — sade beyaz kartlar */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <KPICard label="Aktif Projeler"    value={stats.activeProjects} hint="son 7 günde güncellendi" />
        <KPICard label="Hazır Şablonlar"   value={stats.savedTemplates} hint="kişisel kütüphane" />
        <KPICard label="Baskıdaki Sipariş" value={stats.activeOrders}   hint="kargoda + üretimde" />
        <KPICard label="Toplam Çıktı"      value={stats.totalOutput}    hint="bu yılki proje sayısı" />
      </div>

      {/* İki kolon */}
      <div className="grid grid-cols-3 gap-6">
        {/* Sol: son tasarımlar */}
        <div className="col-span-2">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-bold tracking-[0.12em] uppercase text-slate-500">
              Son Tasarımlar
            </h2>
            <Link
              to={NAV_ROUTES.projects}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Tümünü gör →
            </Link>
          </div>
          
          {projects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
              <p className="text-sm text-slate-500">Henüz tasarım projeniz yok.</p>
              <button
                onClick={() => navigate('/new')}
                className="mt-3 inline-flex items-center gap-1.5 px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors"
              >
                <Plus size={14} /> İlk Tasarımını Oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {projects.slice(0, 3).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>

        {/* Sağ: hızlı erişim + sipariş durumu */}
        <aside>
          <h2 className="text-sm font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">
            Hızlı Erişim
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            <QuickItem label="Yeni Broşür"           hint="A4 · 8 sayfa"            onClick={() => navigate('/new')} />
            <QuickItem label="Süpermarket Kataloğu"  hint="Excel'den yerleştir"      onClick={() => navigate('/new')} />
            <QuickItem label="Etiket Tasarımı"        hint="Özel ölçü"               onClick={() => navigate('/new')} />
            <QuickItem label="Kartvizit"              hint="85 × 55 mm"              onClick={() => navigate('/new')} />
          </div>

          <h2 className="text-sm font-bold tracking-[0.12em] uppercase text-slate-500 mt-6 mb-3">
            Sipariş Durumu
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {orders.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Kayıtlı siparişiniz bulunmamaktadır.
              </div>
            ) : (
              orders.slice(0, 3).map((o) => (
                <div key={o.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{o.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{o.code}</div>
                  </div>
                  <StatusPill status={o.status} />
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Alt bileşenler ───────────────────────────────────────────────────────────

function KPICard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
        {label}
      </div>
      <div
        className="text-3xl font-bold text-slate-900 tabular-nums mt-1"
        style={{ fontFamily: 'Oswald, Inter, sans-serif' }}
      >
        {value}
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>
    </div>
  );
}

function QuickItem({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
    >
      <div className="w-8 h-8 rounded bg-slate-100 grid place-items-center text-slate-500 shrink-0">
        <Plus size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        <div className="text-[11px] text-slate-500">{hint}</div>
      </div>
    </button>
  );
}
