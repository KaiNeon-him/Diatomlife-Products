import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from './ui/spinner';

/** Requires a logged-in user. Redirects to /login?redirect=<path> */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (!user) {
    const current = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(current)}`} replace />;
  }
  return <>{children}</>;
}

/** Requires an admin role. Non-admins get sent home. */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (!user) {
    const current = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(current)}`} replace />;
  }
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
