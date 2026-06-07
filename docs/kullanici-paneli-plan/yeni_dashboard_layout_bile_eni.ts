import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { DashboardShell } from './Shell';
import { useAuthStore } from '../../stores/auth.store';
import { useOrders } from './hooks/useOrders';
import { api } from '../../lib/api';
import type { User, UsageStat, Project, Order } from './types';

export interface DashboardContextType {
  projects: Project[];
  orders: Order[];
  loading: boolean;
  stats: {
    activeProjects: number;
    savedTemplates: number;
    activeOrders: number;
    totalOutput: number;
  };
  refetchProjects: () => Promise<void>;
  refetchOrders: () => Promise<void>;
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useOrders();

  const usageStats: UsageStat = {
    used: 24,
    limit: 100,
    period: 'Aylık Tasarım Limiti',
  };

  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await api.get('/projects');
      
      // Backend şemasını Claude Design arayüz şemasına pürüzsüzce haritalandırıyoruz
      const formattedProjects = response.data.map((p: any) => ({
        id: p.id,
        name: p.name || 'İsimsiz Proje',
        type: p.productType ? `${p.productType.name} · ${p.productType.width}x${p.productType.height} mm` : 'Özel Tasarım',
        updatedAt: p.updatedAt || p.createdAt,
        status: p.status || 'taslak',
        coverColor: p.coverColor || '#e7e5e4', // stone-200 sıcak zemin rengi
      }));
      setProjects(formattedProjects);
    } catch (err) {
      console.error('Projeler yüklenirken hata oluştu:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProjects();
  }, [user, navigate]);

  const activeProjectsCount = projects.filter(p => p.status === 'taslak' || p.status === 'onayda').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'teslim' && o.status !== 'iptal').length;
  
  const stats = {
    activeProjects: activeProjectsCount,
    savedTemplates: 12, // Şimdilik statik mock
    activeOrders: activeOrdersCount,
    totalOutput: projects.length + orders.filter(o => o.status === 'teslim').length,
  };

  const dashboardUser: User = {
    id: user?.id || '1',
    email: user?.email || '',
    displayName: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Misafir Kullanıcı',
    companyName: user?.companyName || 'Serdiado Matbaa',
    avatarInitials: user?.firstName ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'MK',
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate('/login');
  };

  const handleNewDesign = () => {
    navigate('/new');
  };

  const globalLoading = projectsLoading || ordersLoading;

  if (projectsLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-stone-100 grid place-items-center">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Claude Design yükleniyor...
        </div>
      </div>
    );
  }

  const contextValue: DashboardContextType = {
    projects,
    orders,
    loading: globalLoading,
    stats,
    refetchProjects: loadProjects,
    refetchOrders,
  };

  return (
    <DashboardShell
      user={dashboardUser}
      usage={usageStats}
      onLogout={handleLogout}
      onNewDesign={handleNewDesign}
    >
      {/* 
        React Router v7 sarmalayıcısı: Alt sayfaların her biri 
        const { projects, orders, stats } = useOutletContext<DashboardContextType>()
        yazarak buradaki güncel verilere doğrudan erişebilecektir.
      */}
      <div style={{ display: 'none' }} data-context-holder={JSON.stringify(contextValue)} />
    </DashboardShell>
  );
}

/**
 * useDashboardContext - Alt sayfaların (AnaSayfa, Projelerim vb.) layout verilerine
 * erişmesi için güvenli bir yardımcı hook.
 */
export function useDashboardContext() {
  return useOutletContext<DashboardContextType>();
}