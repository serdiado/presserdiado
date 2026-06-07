// Baskı Siparişlerim — sipariş tablosu
// apps/web/src/features/dashboard/pages/Siparislerim.tsx

import { StatusPill } from '../components/StatusPill';
import { useDashboardContext } from '../DashboardLayout';
import type { Order } from '../types';

const TABLE_HEADERS = ['Sipariş', 'Tür', 'Adet', 'Tutar', 'Tarih', 'Durum', ''] as const;

export function Siparislerim() {
  const { orders, loading } = useDashboardContext();

  // Yıllık toplam ve adet dinamik hesaplama
  const currentYear = new Date().getFullYear();
  const yearCount = orders.length;
  
  const totalSum = orders.reduce((acc, o) => {
    // "14.890" -> 14890
    const priceNum = parseFloat(o.totalPrice.replace(/\./g, '').replace(/,/g, '.'));
    return acc + (isNaN(priceNum) ? 0 : priceNum);
  }, 0);
  
  const yearTotal = totalSum.toLocaleString('tr-TR') + ' ₺';

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="text-sm font-semibold text-slate-500 animate-pulse">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Başlık */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Baskı Siparişlerim
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {currentYear} yılı: {yearCount} sipariş · {yearTotal} toplam
          </p>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-bold tracking-[0.12em] uppercase
                             text-slate-500 px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-sm text-slate-500">Henüz siparişiniz yok.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tasarımınızı tamamladıktan sonra baskı siparişi oluşturabilirsiniz.
                  </p>
                </td>
              </tr>
            ) : (
              orders.map((o, i) => (
                <tr
                  key={o.id}
                  className={[
                    'hover:bg-slate-50 transition-colors',
                    i < orders.length - 1 ? 'border-b border-slate-100' : '',
                  ].join(' ')}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-slate-800">{o.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{o.code}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{o.type}</td>
                  <td
                    className="px-4 py-3 text-sm font-semibold text-slate-800 tabular-nums"
                    style={{ fontFamily: 'Oswald, Inter, sans-serif' }}
                  >
                    {o.qty.toLocaleString('tr-TR')}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-semibold text-slate-800 tabular-nums"
                    style={{ fontFamily: 'Oswald, Inter, sans-serif' }}
                  >
                    {o.totalPrice} ₺
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{o.date}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => alert(`${o.code} detayları yakında eklenecektir.`)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Detay →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
