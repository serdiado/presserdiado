import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-surface-app text-text-primary">
      <nav className="bg-surface-panel border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-nav-label text-primary">
                MatbaaPro
              </Link>
              <div className="hidden sm:flex gap-4">
                <Link
                  to="/dashboard"
                  className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Çalışmalarım
                </Link>
                <Link
                  to="/admin/theme"
                  className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Tema editörü
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-body-sm text-text-muted">
                {user?.companyName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-body-sm text-text-muted hover:text-danger transition-colors"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
