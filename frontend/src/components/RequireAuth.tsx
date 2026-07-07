import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/" replace />;
  if (!profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
