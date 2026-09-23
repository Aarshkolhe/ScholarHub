import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, UserX, ShieldCheck, Bell, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
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
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30",
      link: "/admin/users",
    },
    {
      title: "Blocked Users",
      value: stats.blockedUsers,
      icon: UserX,
      color: "from-red-500/20 to-red-600/5 text-red-400 border-red-500/30",
      link: "/admin/users?status=blocked",
    },
    {
      title: "Admins",
      value: stats.adminsCount,
      icon: ShieldCheck,
      color: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30",
      link: "/admin/users?role=admin",
    },
    {
      title: "Notifications Sent",
      value: stats.notificationsSent,
      icon: Bell,
      color: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30",
      link: "/admin/notifications",
    },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-y-6">
        {/* Header Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">System Dashboard</h2>
            <p className="text-sm text-slate-400">High-level statistics and administrative overview</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
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
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} border p-5 flex flex-col justify-between transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-300">{card.title}</span>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <Icon size={20} />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-white mb-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-blue-400" />
              <span>User & Status Management</span>
            </h3>
            <p className="text-sm text-slate-400">
              Browse registered users, inspect detailed profile submissions, and block or unblock accounts as needed.
            </p>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
            >
              <span>Manage Users</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell size={20} className="text-emerald-400" />
              <span>Broadcasting & Notifications</span>
            </h3>
            <p className="text-sm text-slate-400">
              Compose in-app announcements or trigger targeted scholarship alerts to specific recipient criteria.
            </p>
            <Link
              to="/admin/notifications"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20"
            >
              <span>Compose Notification</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
