import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getModuleById } from '@/data/modules';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

interface ModuleProtectedRouteProps {
  children: React.ReactNode;
}

export function ModuleProtectedRoute({ children }: ModuleProtectedRouteProps) {
  const { isAuthenticated, allowedModules, isAdmin } = useAuthStore();
  const moduleId = window.location.pathname.split('/').pop() || '';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const module = getModuleById(moduleId);
  
  if (!module) {
    return <Navigate to="/404" replace />;
  }

  // Admin can access all modules
  if (isAdmin || allowedModules.includes('all')) {
    return <>{children}</>;
  }

  // Check if user has permission for this module
  if (!allowedModules.includes(moduleId)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
