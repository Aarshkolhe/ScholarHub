import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, UserX, ShieldCheck, Bell, ArrowRight, RefreshCw, AlertCircle, Globe, GraduationCap } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    blockedUsers: 0,
    adminsCount: 0,
    notificationsSent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setIsLoading(true);
    setError("");
    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to load dashboard metrics.");
      }
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500/10 dark:from-blue-500/20 to-blue-600/5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
      link: "/admin/users",
    },
    {
      title: "Blocked Accounts",
      value: stats.blockedUsers,
      icon: UserX,
      color: "from-red-500/10 dark:from-red-500/20 to-red-600/5 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
      link: "/admin/users?status=blocked",
    },
    {
      title: "Administrative Staff",
      value: stats.adminsCount,
      icon: ShieldCheck,
      color: "from-purple-500/10 dark:from-purple-500/20 to-purple-600/5 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
      link: "/admin/users?role=admin",
    },
    {
      title: "Alerts Broadcasted",
      value: stats.notificationsSent,
      icon: Bell,
      color: "from-emerald-500/10 dark:from-emerald-500/20 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
      link: "/admin/notifications",
    },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-y-6">
        {/* Header Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Dashboard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">High-level statistics, portals status, and administrative operations</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh Metrics</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} bg-white dark:bg-slate-900 border p-5 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{card.title}</span>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 shadow-xs">
                    <Icon size={20} />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                    {isLoading ? "..." : card.value.toLocaleString()}
                  </div>
                  <Link
                    to={card.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                  >
                    <span>View details</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* Card 1: Users */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                <span>Users & Profile Inspect</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse student accounts, inspect full academic and financial details, and manage block or alert statuses.
              </p>
            </div>
            <div>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/20"
              >
                <span>Manage Users</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 2: Portals & Scholarships */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe size={18} className="text-purple-500" />
                <span>Scholarships & Portals</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage MahaDBT, NSP, and Vidyasaarathi portal configurations and broadcast scholarship scheme matches.
              </p>
            </div>
            <div>
              <Link
                to="/admin/scholarships"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-md shadow-purple-600/20"
              >
                <span>Scholarships & Portals</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 3: Notifications */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell size={18} className="text-emerald-500" />
                <span>Broadcasting & Alerts</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trigger targeted alerts for incomplete profiles, upcoming deadlines, or individual students.
              </p>
            </div>
            <div>
              <Link
                to="/admin/notifications"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
              >
                <span>Broadcast Center</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
