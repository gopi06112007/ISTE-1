import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Protected Route wrapper — redirects to /login if not authenticated.
 * Shows a loading spinner while checking auth state.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
          <p className="text-gray-500  font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
