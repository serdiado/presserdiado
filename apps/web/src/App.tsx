import { useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { safeNext } from '@/features/auth/safeNext';
import api from '@/lib/api';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import { DashboardLayout } from '@/features/dashboard/DashboardLayout';
import { AnaSayfa } from '@/features/dashboard/pages/AnaSayfa';
import { Projelerim } from '@/features/dashboard/pages/Projelerim';
import { Siparislerim } from '@/features/dashboard/pages/Siparislerim';
import { UrunListelerim } from "@/features/dashboard/pages/UrunListelerim";
import { UrunResimleriPage } from '@/features/dashboard/pages/UrunResimleriPage';
import { GenelMedyaPage } from '@/features/dashboard/pages/GenelMedyaPage';
import { FaturaBilgileriPage } from '@/features/settings/pages/FaturaBilgileriPage';

import { ComingSoon } from '@/features/dashboard/pages/ComingSoon';
import StudioPage from '@/features/studio/StudioPage';
import NewStudioWizard from '@/features/wizard/NewStudioWizard';
import PrintView from '@/features/print-view/PrintView';
import PresetPreview from '@/features/preset-preview/PresetPreview';
import AdminLayout from '@/features/admin/AdminLayout';
import AdminDashboardPage from '@/features/admin/dashboard/AdminDashboardPage';
import AdminThemePage from '@/features/admin/theme/AdminThemePage';
import AdminOrdersPage from '@/features/admin/orders/AdminOrdersPage';
import AdminPlaceholder from '@/features/admin/AdminPlaceholder';
import StorefrontPage from '@/features/storefront/StorefrontPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Misafir rotaları (login/register). Zaten girişliyse next'e (varsa, güvenli) yoksa
// /dashboard'a yönlendirir. next'i burada onurlandırmak login()/store güncellemesi
// ile oluşan declaratif yönlendirme yarışını çözer (LoginPage'in navigate'ini ezmesin).
function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const [params] = useSearchParams();
  if (isAuthenticated) return <Navigate to={safeNext(params.get('next'))} replace />;
  return <>{children}</>;
}

// Admin alanı koruması — token YOKsa login'e, admin DEĞİLse dashboard'a yönlendirir.
// Güvenlik backend authorizeAdmin guard'ında; bu yalnızca UX/erişim gating'i.
function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  // Açılışta token varsa /auth/me ile store.user'ı (role dahil) tazele.
  // Eski oturumlarda role yoktu; promote sonrası logout/login gerekmeden admin açılır.
  useEffect(() => {
    if (!useAuthStore.getState().accessToken) return;
    api
      .get('/auth/me')
      .then((r) => useAuthStore.getState().setUser(r.data))
      .catch(() => {});
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route path="/print-view" element={<PrintView />} />
      {/* Hazır şablon önizleme üreticisi — chrome'suz izole render; gen:preset-thumbs
          Puppeteer ile buraya gelip screenshot alır. /print-view gibi guard YOK. */}
      <Route path="/preset-preview" element={<PresetPreview />} />
      {/* Tüm /admin/* rotaları TEK guard (AdminRoute) + tek layout (AdminLayout) altında.
          Guard layout seviyesinde olduğundan alt rotaların HEPSİ (dashboard, orders,
          theme, yakinda) admin değilse engellenir — theme dahil. */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="theme" element={<AdminThemePage />} />
        <Route path="yakinda" element={<AdminPlaceholder />} />
      </Route>
      <Route
        path="/new"
        element={
          <ProtectedRoute>
            <NewStudioWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studio"
        element={
          <ProtectedRoute>
            <StudioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studio/:projectId"
        element={
          <ProtectedRoute>
            <StudioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AnaSayfa />} />
        <Route path="projeler" element={<Projelerim />} />
        <Route path="siparisler" element={<Siparislerim />} />
        <Route path="urunler" element={<UrunListelerim />} />
        <Route path="medya/urun-resimleri" element={<UrunResimleriPage />} />
        <Route path="medya/genel" element={<GenelMedyaPage />} />
        <Route path="fatura" element={<FaturaBilgileriPage />} />
        <Route path="coming-soon" element={<ComingSoon />} />
      </Route>
      {/* Public broşür vitrini — giriş kapısı. Guard YOK; giriş yapmış kullanıcı da görür
          (otomatik /dashboard'a atılmaz). Dashboard /dashboard'da, korumalı kalır. */}
      <Route path="/" element={<StorefrontPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
