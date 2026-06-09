import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import { DashboardLayout } from '@/features/dashboard/DashboardLayout';
import { AnaSayfa } from '@/features/dashboard/pages/AnaSayfa';
import { Projelerim } from '@/features/dashboard/pages/Projelerim';
import { Siparislerim } from '@/features/dashboard/pages/Siparislerim';
import { UrunListelerim } from '@/features/dashboard/pages/UrunListelerim';
import { ComingSoon } from '@/features/dashboard/pages/ComingSoon';
import StudioPage from '@/features/studio/StudioPage';
import NewStudioWizard from '@/features/wizard/NewStudioWizard';
import PrintView from '@/features/print-view/PrintView';
import AdminThemePage from '@/features/admin/theme/AdminThemePage';
import Layout from '@/features/auth/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
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
      <Route path="/admin/theme" element={<AdminThemePage />} />
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
        <Route path="coming-soon" element={<ComingSoon />} />
      </Route>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
