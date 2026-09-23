import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Bell,
  ShieldCheck,
  FileText,
  Globe,
  LogOut,
  Shield,
  X
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === "super_admin";

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users List", path: "/admin/users", icon: Users },
    { label: "Scholarships", path: "/admin/scholarships", icon: GraduationCap },
    { label: "Notifications", path: "/admin/notifications", icon: Bell },
    ...(isSuperAdmin
      ? [
          { label: "Manage Admins", path: "/admin/admins", icon: ShieldCheck, superOnly: true },
          { label: "Audit Log", path: "/admin/audit-log", icon: FileText, superOnly: true },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Shield size={20} />
            </div>
            <span>Scholar<span className="text-blue-600 dark:text-blue-500">Admin</span></span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Identity Banner */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name || "Admin"}</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className={`inline-block h-2 w-2 rounded-full ${isSuperAdmin ? "bg-purple-500" : "bg-emerald-500"}`} />
              <span className="capitalize">{user?.role?.replace("_", " ") || "Admin"}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{item.label}</span>
                {item.superOnly && (
                  <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                    SUPER
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link
            to="/student/dashboard"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Globe size={18} />
            <span>View website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
