// Yönetici Paneli — Layout + veri context'i.
// /admin/orders'ı BİR KEZ çeker; Kontrol Paneli (KPI) ve Siparişler aynı kaynaktan beslenir.
// Status PATCH burada yapılır → KPI'lar otomatik tazelenir. AdminShell içinde <Outlet/>.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AdminShell } from './AdminShell';
import type { AdminOrderStatus } from './adminTokens';

export interface AdminOrderItem {
  id: string;
  quantity: number;
  productTypeKey: string | null;
  productionPdfKey: string | null;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: AdminOrderStatus;
  grandTotal: string;
  currency: string;
  createdAt: string;
  user: { id: string; email: string; companyName: string | null } | null;
  items: AdminOrderItem[];
}

interface AdminDataContextType {
  orders: AdminOrder[];
  loading: boolean;
  savingId: string | null;
  refetch: () => Promise<void>;
  updateStatus: (orderId: string, status: AdminOrderStatus) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | null>(null);

export function useAdminData(): AdminDataContextType {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData, AdminLayout içinde kullanılmalıdır.');
  return ctx;
}

export default function AdminLayout() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
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
    void refetch();
  }, [refetch]);

  const updateStatus = useCallback(
    async (orderId: string, status: AdminOrderStatus) => {
      setSavingId(orderId);
      // Optimistik güncelleme + hata halinde geri al.
      let prev: AdminOrder[] = [];
      setOrders((list) => {
        prev = list;
        return list.map((o) => (o.id === orderId ? { ...o, status } : o));
      });
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
    },
    [],
  );

  const value: AdminDataContextType = { orders, loading, savingId, refetch, updateStatus };

  return (
    <AdminDataContext.Provider value={value}>
      <AdminShell orderCount={orders.length}>
        <Outlet />
      </AdminShell>
    </AdminDataContext.Provider>
  );
}
