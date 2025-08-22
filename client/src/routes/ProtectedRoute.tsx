import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // Do NOT call me() here. App initializes it once.
  if (loading) return <div className="px-4 py-6 opacity-60">Loading…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
