import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useCatalogOptions } from '@/features/print-order/hooks/useCatalogOptions';
import { buildOptionLabelMap, describeOrderItem, type OrderApi } from '@/features/print-order/orderTypes';
import { parseApiDate } from '@/lib/date';
import type { Order, OrderStatus } from '../types';

// Backend orders.status enum → Türkçe StatusPill sözlüğü (proje durumlarıyla aynı desen,
// bkz. DashboardLayout.tsx STATUS_TRANSLATION).
const STATUS_TR: Record<string, OrderStatus> = {
  draft: 'yeni',
  submitted: 'yeni',
  in_production: 'baskıda',
  shipped: 'kargoda',
  completed: 'teslim',
  cancelled: 'iptal',
};

function toDisplayOrder(o: OrderApi, labels: Record<string, string>, productTypeName: string): Order {
  const firstItem = o.items[0];
  const qty = o.items.reduce((acc, it) => acc + (it.quantity ?? 0), 0);
  return {
    id: o.id,
    code: o.orderNumber,
    // Siparişin kimliği TASARIM ADIDIR. Eskiden burada ürün tipi ("Broşür") yazıyordu ve
    // pilotta tek ürün tipi olduğu için bütün siparişler aynı görünüyordu — müşteri hangi
    // işini sipariş ettiğini listeden ayırt edemiyordu. Ad sipariş anında dondurulmuş
    // (order_items.projectName); bu alan eklenmeden önceki siparişlerde boş olduğu için
    // eski davranışa düşülür.
    name: firstItem?.projectName || productTypeName,
    type: firstItem ? describeOrderItem(firstItem, labels) : '—',
    qty,
    totalPrice: Number(o.grandTotal).toLocaleString('tr-TR'),
    date: parseApiDate(o.createdAt).toLocaleDateString('tr-TR'),
    status: STATUS_TR[o.status] ?? 'yeni',
    items: o.items,
    billingSnapshot: o.billingSnapshot,
  };
}

/**
 * useOrders — müşterinin kendi siparişlerini (GET /orders) çeker. Baskı özeti etiketleri
 * (kırım/kağıt/kaplama) broşür kataloğundan (useCatalogOptions) çözülür — pilot tek-niş
 * olduğundan sabit 'brochure' anahtarı yeterli.
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { data: catalog, loading: catalogLoading } = useCatalogOptions('brochure');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<OrderApi[]>('/orders');
      const labels = buildOptionLabelMap(catalog);
      const productTypeName = catalog?.productType.name ?? 'Broşür';
      setOrders(res.data.map((o) => toDisplayOrder(o, labels, productTypeName)));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Siparişler yüklenirken bir hata oluştu.'));
    } finally {
      setLoading(false);
    }
  }, [catalog]);

  useEffect(() => {
    // Katalog etiketleri gelmeden liste çekilirse baskı özeti ham anahtarla kısa süreliğine
    // yanıp söner ve /orders iki kez çağrılır; katalog isteği çözülene kadar bekle.
    if (catalogLoading) return;
    fetchOrders();
  }, [fetchOrders, catalogLoading]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
}
