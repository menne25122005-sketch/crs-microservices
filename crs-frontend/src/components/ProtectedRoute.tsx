import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'STUDENT';
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const {
    user,
    isAuthenticated,
    authReady,
  } = useAuth();

  if (!authReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    requiredRole &&
    user?.role !== requiredRole
  ) {
    return <Navigate to="/courses" replace />;
  }

  return <>{children}</>;
}