import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/auth/LoadingSpinner";

/**
 * Guards a route behind authentication, and optionally behind a role.
 * Usage:
 *   <ProtectedRoute allowedRoles={["Student"]}><StudentDashboard /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
