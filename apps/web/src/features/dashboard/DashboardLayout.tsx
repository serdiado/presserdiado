import { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { DashboardShell } from '@/features/dashboard/Shell';
import { useAuthStore } from '@/stores/auth.store';
import { useOrders } from './hooks/useOrders';
import api from '@/lib/api'; // Default import
import type { User, Project, Order } from './types';

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

// React Context oluşturuyoruz (Tüm sayfalar için tam kararlılık sağlar)
export const DashboardContext = createContext<DashboardContextType | null>(null);

const STATUS_TRANSLATION: Record<string, any> = {
  draft: 'taslak',
  pending: 'onayda',
  printing: 'baskıda',
  shipped: 'kargoda',
  completed: 'teslim',
  cancelled: 'iptal',
};

const COVER_COLORS = ['#e7e5e4', '#e2e8f0', '#e4e4e7', '#f5f5f4'];

const getCoverColor = (id: string | number) => {
  const strId = String(id);
  const index = strId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COVER_COLORS[index % COVER_COLORS.length];
};

const getProductTypeName = (productTypeId?: string) => {
  if (!productTypeId) return 'Özel Tasarım';
  return 'Özel Ölçü Baskı';
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useOrders();

  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await api.get('/projects');
      
      // Backend şemasını Claude Design arayüz şemasına pürüzsüzce haritalandırıyoruz
      const formattedProjects = response.data.map((p: any) => {
        const rawStatus = p.status?.toLowerCase();
        const translatedStatus = STATUS_TRANSLATION[rawStatus] || 'taslak';
        
        return {
          id: p.id,
          name: p.name || 'İsimsiz Proje',
          type: p.productType 
            ? `${p.productType.name} · ${p.productType.width}x${p.productType.height} mm` 
            : getProductTypeName(p.productTypeId),
          updatedAt: p.updatedAt || p.createdAt,
          status: translatedStatus,
          coverColor: getCoverColor(p.id),
          thumbnailKey: p.thumbnailKey,
        };
      });
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

  // AuthStore'daki eksik firstName/lastName şeması için güvenli fallback'ler
  const dashboardUser: User = {
    id: user?.id || '1',
    email: user?.email || '',
    displayName: user?.companyName || user?.email || 'Değerli Kullanıcı',
    companyName: user?.companyName || 'Serdiado Matbaa',
    avatarInitials: (user?.companyName || user?.email || 'US').slice(0, 2).toUpperCase(),
  };

  const handleLogout = () => {
    logout({ clearLocalDrafts: true }); // Senkron logout çağrısı — bilinçli çıkış, paylaşılan makine koruması
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
          Presserdiado yükleniyor...
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
    <DashboardContext.Provider value={contextValue}>
      <DashboardShell
        user={dashboardUser}
        badgeCounts={{ projects: projects.length, orders: orders.length }}
        onLogout={handleLogout}
        onNewDesign={handleNewDesign}
      >
        {/* React Router v7 Outlet'ine context'i de aktaralım */}
        <Outlet context={contextValue} />
      </DashboardShell>
    </DashboardContext.Provider>
  );
}

/**
 * useDashboardContext - Alt sayfaların (AnaSayfa, Projelerim vb.) layout verilerine
 * erişmesi için güvenli bir yardımcı hook.
 */
export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context) return context;
  
  throw new Error('useDashboardContext, bir DashboardLayout içinde kullanılmalıdır.');
}
