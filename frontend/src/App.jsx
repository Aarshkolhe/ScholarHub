import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import useAuth from "./hooks/useAuth";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/auth/AuthPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminScholarshipsPage from "./pages/admin/AdminScholarshipsPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import AdminAdminsPage from "./pages/admin/AdminAdminsPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";

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

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const targetPath = isAdmin ? "/admin/dashboard" : "/student/dashboard";
  return <Navigate to={`${targetPath}${location.search}`} replace />;
}

function AuthRoute({ initialMode }) {
  const { user, isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return null;

  if (isAuthenticated) {
    if (user?.role === "admin" || user?.role === "super_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
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
                <ProtectedRoute allowedRoles={["user", "Student"]}>
                  <LandingPage />
                </ProtectedRoute>
              }
            />

            {/* Step 3: Dashboard Page */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["user", "Student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/scholarships"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminScholarshipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminNotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/admins"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <AdminAdminsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-log"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <AdminAuditLogPage />
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
