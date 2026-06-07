import { useState, useEffect, useCallback } from 'react';
import type { Order } from '../types';

/**
 * useOrders - Sipariş verilerini yöneten custom React hook.
 * Şimdiklik mock veri döner, durumlar tamamen Türkçe arayüzle (StatusPill) uyumludur.
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 300ms yapay ağ gecikmesi simüle ediyoruz
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockOrders: Order[] = [
        {
          id: 'order-1',
          code: 'SİP-2026-0341',
          name: 'Yaz Dönemi Süpermarket Kataloğu',
          type: 'Katalog · A4 · 16 Sayfa',
          qty: 500,
          totalPrice: '14.890',
          date: '04.06.2026',
          status: 'baskıda', // Türkçe durum (StatusPill.tsx ile birebir uyumlu)
        },
        {
          id: 'order-2',
          code: 'SİP-2026-0298',
          name: 'Serdiado Özel Restoran Menüsü',
          type: 'Menü · Özel Ölçü · Katlamalı',
          qty: 250,
          totalPrice: '6.450',
          date: '02.06.2026',
          status: 'kargoda', // Türkçe durum
        },
        {
          id: 'order-3',
          code: 'SİP-2026-0152',
          name: 'Presserdiado Tanıtım Broşürü',
          type: 'Broşür · A5 · 4 Sayfa',
          qty: 1000,
          totalPrice: '3.120',
          date: '28.05.2026',
          status: 'teslim', // Türkçe durum
        },
        {
          id: 'order-4',
          code: 'SİP-2026-0110',
          name: 'Minimalist Şirket Kartviziti',
          type: 'Kartvizit · 85x55 mm',
          qty: 200,
          totalPrice: '450',
          date: '15.05.2026',
          status: 'teslim', // Türkçe durum
        }
      ];

      setOrders(mockOrders);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Siparişler yüklenirken bir hata oluştu.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
}
