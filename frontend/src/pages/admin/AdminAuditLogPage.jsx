import { useState, useEffect } from "react";
import { FileText, ShieldAlert, RefreshCw, AlertCircle, Clock, User, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminAuditLogPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    setError("");
    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/audit-log`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      } else {
        setError(data.error?.message || data.message || "Failed to load audit logs.");
      }
    } catch (err) {
      setError("Unable to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const getActionBadge = (action) => {
    switch (action) {
      case "BLOCK_USER":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">BLOCK USER</span>;
      case "UNBLOCK_USER":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">UNBLOCK USER</span>;
      case "PROMOTE_ADMIN":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">PROMOTE ADMIN</span>;
      case "DEMOTE_ADMIN":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">DEMOTE ADMIN</span>;
      case "SEND_NOTIFICATION":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">NOTIFICATION SENT</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{action}</span>;
    }
  };

  if (user?.role !== "super_admin") {
    return (
      <AdminLayout title="Audit Log">
        <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-center space-y-3">
          <ShieldAlert size={48} className="mx-auto text-red-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">The Audit Log is restricted to Super Admin accounts only.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Security Audit Log">
      <div className="space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Security Audit Log</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Immutable history of administrative actions, block events, portal changes, and role changes</p>
          </div>
          <button
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target User</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-blue-500" />
                        <div>
                          <div>{log.actorName || "System"}</div>
                          <div className="text-xs text-slate-400">{log.actorEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {log.targetEmail ? (
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{log.targetName || "User"}</div>
                          <div className="text-xs text-slate-400">{log.targetEmail}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
