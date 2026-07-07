import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Explore } from './pages/Explore';
import { Upcoming } from './pages/Upcoming';
import { Past } from './pages/Past';
import { Account } from './pages/Account';
import { Dashboard } from './pages/Dashboard';
import { useAuth } from './context/AuthContext';

export function landingPathFor(profile: { role: string; onboarding_completed: boolean }) {
  if (profile.role === 'staff') return '/dashboard';
  return profile.onboarding_completed ? '/explore' : '/onboarding';
}

function LoginRoute() {
  const { profile } = useAuth();
  if (profile) return <Navigate to={landingPathFor(profile)} replace />;
  return <Login />;
}

function OnboardingRoute() {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/" replace />;
  if (profile.onboarding_completed) return <Navigate to={landingPathFor(profile)} replace />;
  return <Onboarding />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LoginRoute />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route
          path="/explore"
          element={
            <RequireAuth>
              <Explore />
            </RequireAuth>
          }
        />
        <Route
          path="/upcoming"
          element={
            <RequireAuth>
              <Upcoming />
            </RequireAuth>
          }
        />
        <Route
          path="/past"
          element={
            <RequireAuth>
              <Past />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
