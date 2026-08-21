import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import useAuth from "./hooks/useAuth";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/auth/AuthPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

function LogoutHandler() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    signOut().then(() => navigate("/login", { replace: true }));
  }, [signOut, navigate]);

  return null;
}

function DashboardRedirect() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const targetPath = user?.role === "Admin" ? "/admin/dashboard" : "/student/dashboard";
  return <Navigate to={`${targetPath}${location.search}`} replace />;
}

function AuthRoute({ initialMode }) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return null;

  // If already authenticated, redirect to Step 2: Landing Page
  if (isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return <AuthPage initialMode={initialMode} />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Step 1: Login / Register Page (Website Entry Point) */}
            <Route path="/" element={<AuthRoute initialMode="login" />} />
            <Route path="/login" element={<AuthRoute initialMode="login" />} />
            <Route path="/register" element={<AuthRoute initialMode="register" />} />
            <Route path="/auth" element={<AuthRoute initialMode="login" />} />
            <Route path="/logout" element={<LogoutHandler />} />

            {/* Step 2: Landing Page */}
            <Route
              path="/landing"
              element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              }
            />

            {/* Step 3: Dashboard Page */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
