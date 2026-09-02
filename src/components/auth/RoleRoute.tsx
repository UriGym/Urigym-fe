import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/api/types';

interface RoleRouteProps {
  children: ReactNode;
  /** Roles allowed through. Omit to require only that the user is signed in. */
  allow?: AppRole[];
}

/**
 * Client-side gate for role-specific pages. The backend enforces the same rules on
 * every request — this only keeps users out of screens they cannot use.
 */
export const RoleRoute = ({ children, allow }: RoleRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const denied = !isLoading && isAuthenticated && allow && user && !allow.includes(user.role);

  useEffect(() => {
    if (denied) {
      toast.error('접근 권한이 없습니다.');
    }
  }, [denied]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (denied) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
