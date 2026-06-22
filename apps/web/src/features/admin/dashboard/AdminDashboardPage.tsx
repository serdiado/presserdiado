// Yönetici Paneli — Kontrol Paneli. KPI'lar gerçek /admin/orders verisinden hesaplanır.
// Üretim/makine hat bloğu YOK (aracı firmayız). Veri tek kaynaktan: useAdminData.
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminData } from '../AdminLayout';
import {
  ADMIN_DISPLAY_FONT, ADMIN_ORDER_STATUSES, ADMIN_STATUS, KPI_TONE,
  SectionHead, StatusPill, type KpiTone,
} from '../adminTokens';

function isToday(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatMoney(n: number): string {
  return n.toLocaleString('tr-TR', { maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

export default function AdminDashboardPage() {
  const { orders, loading } = useAdminData();

  const kpi = useMemo(() => {
    const total = orders.length;
    const sum = (list: typeof orders) =>
      list.reduce((acc, o) => acc + (Number(o.grandTotal) || 0), 0);
    const todayOrders = orders.filter((o) => isToday(o.createdAt));
    const counts = ADMIN_ORDER_STATUSES.reduce(
      (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }),
      {} as Record<string, number>,
    );
    // Para birimi karışık olabilir; tek sembol göstermek için baskın olanı al.
    const currency = orders[0]?.currency ?? 'TRY';
    return {
      total,
      totalRevenue: sum(orders),
      todayRevenue: sum(todayOrders),
      inProduction: counts.in_production ?? 0,
      shipped: counts.shipped ?? 0,
      counts,
      currency,
    };
  }, [orders]);

  const recent = orders.slice(0, 8);
  const dist = ADMIN_ORDER_STATUSES.filter((s) => (kpi.counts[s] ?? 0) > 0);

  return (
    <div className="px-8 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kontrol Paneli</h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? 'Yükleniyor…' : `${kpi.total} sipariş · genel bakış`}
          </p>
        </div>
      </div>

      {/* KPI satırı */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <KPICell label="Toplam Sipariş" value={String(kpi.total)} hint="tüm zaman" />
        <KPICell
          label="Bugünkü Ciro"
          value={`${formatMoney(kpi.todayRevenue)} ${kpi.currency}`}
          hint="bugün alınan"
          tone="success"
        />
        <KPICell
          label="Toplam Ciro"
          value={`${formatMoney(kpi.totalRevenue)} ${kpi.currency}`}
          hint="tüm siparişler"
        />
        <KPICell
          label="Üretimde"
          value={String(kpi.inProduction)}
          hint="baskı sürecinde"
          tone={kpi.inProduction > 0 ? 'warning' : 'default'}
        />
        <KPICell label="Kargoda" value={String(kpi.shipped)} hint="sevkiyatta" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son siparişler */}
        <div className="lg:col-span-2">
          <SectionHead title="SON SİPARİŞLER" />
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Sipariş', 'Müşteri', 'Tutar', 'Tarih', 'Durum'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold tracking-widest uppercase text-slate-500 px-4 py-2.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && orders.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500 animate-pulse">Yükleniyor…</td></tr>
                ) : recent.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">Henüz sipariş yok.</td></tr>
                ) : (
                  recent.map((o) => (
                    <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 text-[11px] font-mono text-slate-600">{o.orderNumber}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-slate-800 max-w-45 truncate">
                        {o.user?.companyName || o.user?.email || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-bold text-slate-800 tabular-nums" style={ADMIN_DISPLAY_FONT}>
                        {formatMoney(Number(o.grandTotal) || 0)} {o.currency}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-2.5"><StatusPill status={o.status} sm /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <Link to="/admin/orders" className="text-xs font-semibold text-blue-700 hover:underline">
                Tüm siparişleri gör →
              </Link>
            </div>
          </div>
        </div>

        {/* Duruma göre dağılım */}
        <div>
          <SectionHead title="DURUMA GÖRE DAĞILIM" />
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {dist.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500 text-center">Veri yok.</div>
            ) : (
              dist.map((s) => {
                const count = kpi.counts[s] ?? 0;
                const pct = kpi.total > 0 ? Math.round((count / kpi.total) * 100) : 0;
                return (
                  <div key={s} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${ADMIN_STATUS[s].dot}`} />
                        <span className="text-sm font-semibold text-slate-800">{ADMIN_STATUS[s].label}</span>
                      </div>
                      <span className="text-xs font-bold tabular-nums text-slate-700" style={ADMIN_DISPLAY_FONT}>
                        {count} · %{pct}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ADMIN_STATUS[s].dot}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICell({ label, value, hint, tone = 'default' }: {
  label: string; value: string; hint: string; tone?: KpiTone;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-500">{label}</div>
      <div className={`text-3xl font-bold tabular-nums tracking-tight mt-1 ${KPI_TONE[tone]}`} style={ADMIN_DISPLAY_FONT}>
        {value}
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>
    </div>
  );
}
