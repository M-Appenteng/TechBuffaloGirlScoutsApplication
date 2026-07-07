import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from './OfflineBanner';

export function Layout() {
  const { profile } = useAuth();
  const { pathname } = useLocation();
  const showAppChrome = Boolean(profile) && pathname !== '/onboarding';

  return (
    <div className="shell">
      <OfflineBanner />
      <header className="site-header">
        <Link to={profile ? '/explore' : '/'} className="wordmark">
          InFormation
        </Link>
      </header>
      <main className="content">
        <Outlet />
      </main>
      {showAppChrome && <BottomNav />}
    </div>
  );
}
