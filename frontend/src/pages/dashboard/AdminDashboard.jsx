import { useState, useEffect } from "react";
import { Users, GraduationCap, FileCheck, AlertCircle, Globe, Plus, ToggleLeft, ToggleRight, Trash2, Edit3, ExternalLink, RefreshCw } from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function AdminDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statsData, setStatsData] = useState({
    totalApplicants: 0,
    activeScholarships: 0,
    pendingApprovals: 0,
    totalApplications: 0,
  });

  // Portal Management State
  const [portals, setPortals] = useState([]);
  const [loadingPortals, setLoadingPortals] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [editingPortal, setEditingPortal] = useState(null);
  const [portalForm, setPortalForm] = useState({ name: "", description: "", url: "", logoUrl: "", isActive: true });
  const [portalError, setPortalError] = useState("");
  const [portalNotice, setPortalNotice] = useState("");

  const name = user?.fullName || user?.name || "Admin User";

  const fetchAdminStats = () => {
    const token = localStorage.getItem("scholarhub_token");
    if (token) {
      fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.stats) {
            setStatsData(data.stats);
          }
        })
        .catch(() => {});
    }
  };

  const fetchPortals = () => {
    const token = localStorage.getItem("scholarhub_token");
    if (!token) return;
    setLoadingPortals(true);
    fetch(`${BACKEND_URL}/api/admin/portals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.portals)) {
          setPortals(data.portals);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPortals(false));
  };

  useEffect(() => {
    fetchAdminStats();
    fetchPortals();
  }, []);

  const handleOpenAddPortal = () => {
    setEditingPortal(null);
    setPortalForm({ name: "", description: "", url: "https://", logoUrl: "", isActive: true });
    setPortalError("");
    setPortalNotice("");
    setShowPortalModal(true);
  };

  const handleOpenEditPortal = (portal) => {
    setEditingPortal(portal);
    setPortalForm({
      name: portal.name,
      description: portal.description || "",
      url: portal.url,
      logoUrl: portal.logoUrl || "",
      isActive: portal.isActive,
    });
    setPortalError("");
    setPortalNotice("");
    setShowPortalModal(true);
  };

  const handleSavePortal = async (e) => {
    e.preventDefault();
    setPortalError("");
    const token = localStorage.getItem("scholarhub_token");

    if (!portalForm.name.trim()) {
      setPortalError("Portal name is required.");
      return;
    }
    if (!portalForm.url.trim() || !portalForm.url.startsWith("http")) {
      setPortalError("Valid URL starting with http:// or https:// is required.");
      return;
    }

    const endpoint = editingPortal
      ? `${BACKEND_URL}/api/admin/portals/${editingPortal.id}`
      : `${BACKEND_URL}/api/admin/portals`;

    const method = editingPortal ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(portalForm),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setPortalError(data.error?.message || data.message || "Failed to save portal.");
        return;
      }

      setShowPortalModal(false);
      fetchPortals();
    } catch (err) {
      setPortalError("Network error while saving portal.");
    }
  };

  const handleTogglePortalStatus = async (portal) => {
    const token = localStorage.getItem("scholarhub_token");
    const newStatus = !portal.isActive;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/portals/${portal.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        fetchPortals();
      }
    } catch (err) {}
  };

  const handleDeletePortal = async (portal) => {
    if (!window.confirm(`Are you sure you want to delete portal "${portal.name}"?`)) return;

    const token = localStorage.getItem("scholarhub_token");
    setPortalError("");
    setPortalNotice("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/portals/${portal.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error?.code === "PORTAL_IN_USE") {
          setPortalError(data.error.message);
        } else {
          setPortalError(data.error?.message || data.message || "Failed to delete portal.");
        }
        return;
      }

      setPortalNotice(`Portal "${portal.name}" deleted successfully.`);
      fetchPortals();
    } catch (err) {
      setPortalError("Network error while deleting portal.");
    }
  };

  const adminStats = [
    { label: "Total Applicants", value: statsData.totalApplicants.toLocaleString(), icon: Users, tint: "bg-blue-100 text-blue-600" },
    { label: "Active Scholarships", value: statsData.activeScholarships.toLocaleString(), icon: GraduationCap, tint: "bg-emerald-100 text-emerald-600" },
    { label: "Pending Approvals", value: statsData.pendingApprovals.toLocaleString(), icon: FileCheck, tint: "bg-amber-100 text-amber-600" },
    { label: "Total Applications", value: statsData.totalApplications.toLocaleString(), icon: AlertCircle, tint: "bg-indigo-100 text-indigo-600" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isSidebarOpen={sidebarOpen}
          onSelectTab={(tab) => console.log("Admin tab selected:", tab)}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto space-y-6">
          <div className="animate-rise-in">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Admin Portal Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Logged in as <span className="font-semibold text-slate-700 dark:text-slate-200">{name}</span>. Manage applications, review student submissions, and update listings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {adminStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className={`flex size-10 items-center justify-center rounded-xl ${stat.tint}`}>
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Scholarship Portals Management Section (Phase 7) */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="size-4 text-blue-500" /> Scholarship Portal Management
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage external government and trust portals linked to scholarship schemes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchPortals}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className={`size-3.5 ${loadingPortals ? "animate-spin" : ""}`} /> Refresh
                </button>
                <button
                  onClick={handleOpenAddPortal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  <Plus className="size-4" /> Add Portal
                </button>
              </div>
            </div>

            {portalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                ⚠️ {portalError}
              </div>
            )}

            {portalNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                ✓ {portalNotice}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Portal Name</th>
                    <th className="py-2.5 px-3">Official URL</th>
                    <th className="py-2.5 px-3">Linked Schemes</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {portals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 dark:text-slate-500">
                        {loadingPortals ? "Loading portals..." : "No scholarship portals found."}
                      </td>
                    </tr>
                  ) : (
                    portals.map((portal) => (
                      <tr key={portal.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                          {portal.name}
                          {portal.description && (
                            <p className="text-[11px] font-normal text-slate-400 line-clamp-1">{portal.description}</p>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <a
                            href={portal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-mono text-[11px]"
                          >
                            {portal.url} <ExternalLink className="size-3" />
                          </a>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                          <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {portal.scholarshipsCount || 0} schemes
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleTogglePortalStatus(portal)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                              portal.isActive
                                ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30"
                                : "bg-slate-500/15 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/30"
                            }`}
                          >
                            {portal.isActive ? <ToggleRight className="size-3.5 text-emerald-600" /> : <ToggleLeft className="size-3.5 text-slate-400" />}
                            {portal.isActive ? "Active" : "Disabled"}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditPortal(portal)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Portal"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePortal(portal)}
                              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Portal"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Add / Edit Portal Modal */}
          {showPortalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white">
                    {editingPortal ? "Edit Scholarship Portal" : "Add Scholarship Portal"}
                  </h3>
                  <button
                    onClick={() => setShowPortalModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSavePortal} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Portal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MahaDBT Portal"
                      value={portalForm.name}
                      onChange={(e) => setPortalForm({ ...portalForm, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Portal URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://mahadbt.maharashtra.gov.in"
                      value={portalForm.url}
                      onChange={(e) => setPortalForm({ ...portalForm, url: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief description of government or trust portal..."
                      value={portalForm.description}
                      onChange={(e) => setPortalForm({ ...portalForm, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActiveCheck"
                      checked={portalForm.isActive}
                      onChange={(e) => setPortalForm({ ...portalForm, isActive: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActiveCheck" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Enable Portal for Active Student Display
                    </label>
                  </div>

                  {portalError && (
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                      ⚠️ {portalError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowPortalModal(false)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                      {editingPortal ? "Update Portal" : "Create Portal"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
