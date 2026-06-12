// Admin sipariş paneli — TÜM siparişler (gerçek veri). Veri tek kaynaktan: useAdminData.
// Çalışan mantık korunur: durum PATCH (context) + üretim PDF indirme (yerel).
// Durum dropdown'u ve StatusPill AYNI ADMIN_STATUS sabitinden okur.
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { useAdminData, type AdminOrder } from '../AdminLayout';
import {
  ADMIN_DISPLAY_FONT, ADMIN_STATUS_OPTIONS, StatusPill, type AdminOrderStatus,
} from '../adminTokens';

const TABLE_HEADERS = ['Sipariş', 'Müşteri', 'Adet', 'Tutar', 'Tarih', 'Durum', 'PDF'] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('tr-TR');
}

function formatAmount(value: string): string {
  const n = Number(value);
  return Number.isNaN(n) ? value : n.toLocaleString('tr-TR');
}

export default function AdminOrdersPage() {
  const { orders, loading, savingId, refetch, updateStatus } = useAdminData();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminOrderStatus>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        o.orderNumber,
        o.user?.companyName ?? '',
        o.user?.email ?? '',
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, query, statusFilter]);

  async function handleDownloadPdf(order: AdminOrder) {
    setDownloadingId(order.id);
    try {
      const res = await api.get(`/admin/orders/${order.id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 404) {
        toast.error('PDF henüz hazır değil');
      } else {
        toast.error('PDF indirilemedi');
      }
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Siparişler</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tüm siparişler · {orders.length} kayıt
            {filtered.length !== orders.length && ` · ${filtered.length} gösteriliyor`}
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          className="h-9 px-3 rounded-md bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
        >
          Yenile
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Filtre satırı */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-50">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sipariş kodu / müşteri…"
              className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-md text-sm placeholder-slate-400 outline-none focus:border-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | AdminOrderStatus)}
            className="h-9 px-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 outline-none"
          >
            <option value="all">Tüm Durumlar</option>
            {ADMIN_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-white border-b border-slate-200">
              {TABLE_HEADERS.map((h) => (
                <th key={h} className="text-left text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 px-4 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <span className="text-sm font-semibold text-slate-500 animate-pulse">Yükleniyor...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-sm text-slate-500">
                    {orders.length === 0 ? 'Henüz sipariş yok.' : 'Eşleşen sipariş yok.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((o, i) => {
                const qty = o.items.reduce((acc, it) => acc + (it.quantity ?? 0), 0);
                const hasPdf = o.items.some((it) => it.productionPdfKey);
                return (
                  <tr
                    key={o.id}
                    className={[
                      'hover:bg-slate-50 transition-colors',
                      i < filtered.length - 1 ? 'border-b border-slate-100' : '',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3">
                      <div className="text-[11px] text-slate-600 font-mono font-semibold">{o.orderNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-slate-800">
                        {o.user?.companyName || o.user?.email || '—'}
                      </div>
                      {o.user?.companyName && (
                        <div className="text-[11px] text-slate-500">{o.user.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 tabular-nums" style={ADMIN_DISPLAY_FONT}>
                      {qty.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800 tabular-nums" style={ADMIN_DISPLAY_FONT}>
                      {formatAmount(o.grandTotal)} {o.currency}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusPill status={o.status} sm />
                        <select
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) => void updateStatus(o.id, e.target.value as AdminOrderStatus)}
                          className="text-xs border border-slate-300 rounded-md px-1.5 py-1 bg-white text-slate-700 focus:border-slate-500 outline-none disabled:opacity-50"
                          aria-label="Durumu değiştir"
                        >
                          {ADMIN_STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void handleDownloadPdf(o)}
                        disabled={!hasPdf || downloadingId === o.id}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={hasPdf ? 'Üretim PDF indir' : 'PDF henüz dondurulmadı'}
                      >
                        {downloadingId === o.id ? 'İniyor...' : 'PDF ↓'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
