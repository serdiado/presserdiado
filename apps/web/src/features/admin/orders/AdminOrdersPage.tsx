// Admin sipariş paneli — TÜM siparişler (gerçek veri, mock değil).
// Durum güncelleme + üretim PDF indirme. Görsel cila (Design Referans 2) sonra.
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// Backend orders.status enum'u ile birebir.
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Taslak' },
  { value: 'submitted', label: 'Alındı' },
  { value: 'in_production', label: 'Baskıda' },
  { value: 'shipped', label: 'Kargoda' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal' },
] as const;

type OrderStatus = (typeof STATUS_OPTIONS)[number]['value'];

interface AdminOrderItem {
  id: string;
  quantity: number;
  productTypeKey: string | null;
  productionPdfKey: string | null;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  grandTotal: string;
  currency: string;
  createdAt: string;
  user: { id: string; email: string; companyName: string | null } | null;
  items: AdminOrderItem[];
}

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
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<AdminOrder[]>('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setSavingId(orderId);
    // Optimistik güncelleme + hata halinde geri al.
    const prev = orders;
    setOrders((list) => list.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      toast.success('Durum güncellendi');
    } catch (err) {
      console.error(err);
      setOrders(prev);
      toast.error('Durum güncellenemedi');
    } finally {
      setSavingId(null);
    }
  }

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sipariş Yönetimi
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Tüm siparişler · {orders.length} kayıt
            </p>
          </div>
          <button
            onClick={() => void fetchOrders()}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md px-3 py-1.5"
          >
            Yenile
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <span className="text-sm font-semibold text-slate-500 animate-pulse">
                      Yükleniyor...
                    </span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm text-slate-500">Henüz sipariş yok.</p>
                  </td>
                </tr>
              ) : (
                orders.map((o, i) => {
                  const qty = o.items.reduce((acc, it) => acc + (it.quantity ?? 0), 0);
                  const hasPdf = o.items.some((it) => it.productionPdfKey);
                  return (
                    <tr
                      key={o.id}
                      className={[
                        'hover:bg-slate-50 transition-colors',
                        i < orders.length - 1 ? 'border-b border-slate-100' : '',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3">
                        <div className="text-[11px] text-slate-500 font-mono">{o.orderNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-800">
                          {o.user?.companyName || o.user?.email || '—'}
                        </div>
                        {o.user?.companyName && (
                          <div className="text-[11px] text-slate-500">{o.user.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 tabular-nums">
                        {qty.toLocaleString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 tabular-nums">
                        {formatAmount(o.grandTotal)} {o.currency}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) => void handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700 focus:border-slate-500 outline-none disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
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
    </div>
  );
}
