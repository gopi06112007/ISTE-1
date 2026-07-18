import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { AuthCheckSkeleton } from './ui/SkeletonLoaders';

/**
 * Protected Route wrapper — redirects to /login if not authenticated.
 * Shows a skeleton loader while checking auth state.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthCheckSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
