import { useState, useEffect } from "react";
import {
  GraduationCap,
  Bell,
  Search,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Send,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Globe,
  Shield,
  Layers,
  Lock
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminScholarshipsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [activeTab, setActiveTab] = useState("portals"); // "portals" | "scholarships"

  // Portals State
  const [portals, setPortals] = useState([]);
  const [isLoadingPortals, setIsLoadingPortals] = useState(true);
  const [portalSearch, setPortalSearch] = useState("");

  // Portal Modals (Super Admin Only)
  const [editingPortal, setEditingPortal] = useState(null); // null or portal obj
  const [isAddingPortal, setIsAddingPortal] = useState(false);
  const [portalForm, setPortalForm] = useState({
    name: "",
    description: "",
    url: "",
    isActive: true,
  });
  const [isSavingPortal, setIsSavingPortal] = useState(false);

  // Scholarships State
  const [scholarships, setScholarships] = useState([]);
  const [isLoadingScholarships, setIsLoadingScholarships] = useState(true);
  const [scholarshipSearch, setScholarshipSearch] = useState("");

  // Notifications Modal State
  const [notifyingScholarship, setNotifyingScholarship] = useState(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // General Notices
  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Fetch Portals from Database
  const fetchPortals = async () => {
    setIsLoadingPortals(true);
    setErrorNotice("");
    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/portals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.portals)) {
        setPortals(data.portals);
      } else {
        setErrorNotice(data.message || "Failed to load portals from database.");
      }
    } catch (err) {
      setErrorNotice("Unable to connect to server for portals.");
    } finally {
      setIsLoadingPortals(false);
    }
  };

  // Fetch Scholarships
  const fetchScholarships = async () => {
    setIsLoadingScholarships(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/scholarships`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setScholarships(data);
      } else if (data.success && Array.isArray(data.scholarships)) {
        setScholarships(data.scholarships);
      }
    } catch (err) {
      console.error("Unable to load scholarships:", err);
    } finally {
      setIsLoadingScholarships(false);
    }
  };

  useEffect(() => {
    fetchPortals();
    fetchScholarships();
  }, []);

  // Filtered lists
  const filteredPortals = portals.filter(
    (p) =>
      p.name.toLowerCase().includes(portalSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(portalSearch.toLowerCase())) ||
      p.url.toLowerCase().includes(portalSearch.toLowerCase())
  );

  const filteredScholarships = scholarships.filter(
    (s) =>
      s.name.toLowerCase().includes(scholarshipSearch.toLowerCase()) ||
      s.provider.toLowerCase().includes(scholarshipSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(scholarshipSearch.toLowerCase())
  );

  // Portal Super Admin Actions
  const handleOpenAddPortal = () => {
    setPortalForm({ name: "", description: "", url: "", isActive: true });
    setIsAddingPortal(true);
  };

  const handleOpenEditPortal = (portal) => {
    setEditingPortal(portal);
    setPortalForm({
      name: portal.name,
      description: portal.description || "",
      url: portal.url,
      isActive: portal.isActive !== false,
    });
  };

  const handleSavePortal = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setErrorNotice("Access denied: Only Super Admins can add or modify portals.");
      return;
    }

    if (!portalForm.name.trim() || !portalForm.url.trim()) {
      setErrorNotice("Portal name and valid URL are required.");
      return;
    }

    setIsSavingPortal(true);
    setErrorNotice("");
    setSuccessNotice("");

    const token = localStorage.getItem("scholarhub_token");
    const isEdit = Boolean(editingPortal);
    const endpoint = isEdit
      ? `${BACKEND_URL}/api/admin/portals/${editingPortal.id}`
      : `${BACKEND_URL}/api/admin/portals`;

    try {
      const res = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(portalForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessNotice(
          isEdit
            ? `Portal '${portalForm.name}' updated successfully!`
            : `Portal '${portalForm.name}' created in database!`
        );
        setIsAddingPortal(false);
        setEditingPortal(null);
        fetchPortals();
      } else {
        setErrorNotice(data.error?.message || data.message || "Failed to save portal.");
      }
    } catch (err) {
      setErrorNotice("Error saving portal to database.");
    } finally {
      setIsSavingPortal(false);
    }
  };

  const handleTogglePortalStatus = async (portal) => {
    if (!isSuperAdmin) {
      setErrorNotice("Access denied: Only Super Admins can enable/disable portals.");
      return;
    }

    const nextStatus = !portal.isActive;
    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/portals/${portal.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessNotice(`Portal '${portal.name}' ${nextStatus ? "enabled" : "disabled"}.`);
        fetchPortals();
      } else {
        setErrorNotice(data.error?.message || data.message || "Failed to toggle portal status.");
      }
    } catch (err) {
      setErrorNotice("Error updating portal status.");
    }
  };

  const handleDeletePortal = async (portal) => {
    if (!isSuperAdmin) {
      setErrorNotice("Access denied: Only Super Admins can delete portals.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete portal '${portal.name}' from the database?`)) {
      return;
    }

    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/portals/${portal.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessNotice(`Portal '${portal.name}' deleted successfully.`);
        fetchPortals();
      } else {
        setErrorNotice(data.error?.message || data.message || "Cannot delete portal.");
      }
    } catch (err) {
      setErrorNotice("Error deleting portal.");
    }
  };

  // Scholarship Notification Action
  const handleOpenNotifyModal = (s) => {
    setNotifyingScholarship(s);
    setNotifTitle(`New Scholarship Opportunity: ${s.name}`);
    setNotifMessage(
      `Apply now for ${s.name} offering ${s.amount_formatted || s.amount}. Application deadline is ${s.deadline}. Requirement: ${s.requirements || "Check eligibility"}`
    );
  };

  const handleSendScholarshipNotification = async (e) => {
    e.preventDefault();
    if (!notifyingScholarship) return;
    setIsSending(true);
    setErrorNotice("");
    setSuccessNotice("");

    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: notifTitle,
          message: notifMessage,
          type: "new_scholarship",
          scholarshipId: notifyingScholarship.id,
          targetType: "filters",
          filters: { category: notifyingScholarship.category },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessNotice(`Notification for '${notifyingScholarship.name}' queued successfully!`);
        setNotifyingScholarship(null);
      } else {
        setErrorNotice(data.error?.message || data.message || "Failed to trigger notification.");
      }
    } catch (err) {
      setErrorNotice("Error sending scholarship notification.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout title="Scholarships & Portals">
      <div className="space-y-6">
        {/* Header Title & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Scholarship Operations
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage scholarship provider portals in the database and monitor live scholarship schemes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
              <button
                onClick={() => setActiveTab("portals")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "portals"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Globe size={14} />
                <span>Scholarship Portals ({portals.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("scholarships")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "scholarships"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers size={14} />
                <span>Scholarships Directory ({scholarships.length})</span>
              </button>
            </div>

            <button
              onClick={() => {
                fetchPortals();
                fetchScholarships();
              }}
              disabled={isLoadingPortals || isLoadingScholarships}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={isLoadingPortals || isLoadingScholarships ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Notices */}
        {errorNotice && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {errorNotice}
            </span>
            <button onClick={() => setErrorNotice("")} className="text-red-500 hover:text-red-700 dark:hover:text-white"><X size={16} /></button>
          </div>
        )}
        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle size={16} />
              {successNotice}
            </span>
            <button onClick={() => setSuccessNotice("")} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-white"><X size={16} /></button>
          </div>
        )}

        {/* TAB 1: SCHOLARSHIP PORTALS (Source of Truth in Database) */}
        {activeTab === "portals" && (
          <div className="space-y-4">
            {/* Super Admin Notice / Add Portal Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search portals by name or URL..."
                  value={portalSearch}
                  onChange={(e) => setPortalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                {isSuperAdmin ? (
                  <button
                    onClick={handleOpenAddPortal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
                  >
                    <Plus size={16} />
                    <span>Add New Portal</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <Lock size={14} className="text-amber-500" />
                    <span>Super Admin required to add/edit portals</span>
                  </div>
                )}
              </div>
            </div>

            {/* Portals Grid / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingPortals ? (
                <div className="col-span-full py-16 text-center text-slate-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                  <span>Loading scholarship portals from database...</span>
                </div>
              ) : filteredPortals.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Globe size={32} className="mx-auto mb-2 text-slate-400 opacity-60" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No scholarship portals found</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search query or add a new portal.</p>
                </div>
              ) : (
                filteredPortals.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-200 dark:border-blue-500/20">
                            <Globe size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.name}</h3>
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <span>{p.url}</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                        }`}>
                          {p.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {p.description || "Official government / institutional scholarship portal configured in ScholarHub Finder database."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        <strong className="text-slate-900 dark:text-slate-200">{p.scholarshipsCount || 0}</strong> scholarships linked
                      </div>

                      {/* Super Admin Controls */}
                      {isSuperAdmin ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePortalStatus(p)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              p.isActive
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            }`}
                            title={p.isActive ? "Disable Portal" : "Enable Portal"}
                          >
                            {p.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>

                          <button
                            onClick={() => handleOpenEditPortal(p)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                            title="Edit Portal Details"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeletePortal(p)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 transition-colors"
                            title="Delete Portal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Read-only</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SCHOLARSHIPS DIRECTORY */}
        {activeTab === "scholarships" && (
          <div className="space-y-4">
            {/* Search Toolbar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search scholarships by name, provider, or category..."
                  value={scholarshipSearch}
                  onChange={(e) => setScholarshipSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Scholarships Table */}
            <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Scholarship Scheme</th>
                    <th className="px-6 py-4">Award Amount</th>
                    <th className="px-6 py-4">Category / Level</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {isLoadingScholarships ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                        <span>Loading scholarships...</span>
                      </td>
                    </tr>
                  ) : filteredScholarships.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        No scholarships found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredScholarships.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{s.provider}</div>
                        </td>

                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {s.amount_formatted || `₹${s.amount}`}
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {s.category} • {s.degree}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-amber-600 dark:text-amber-400 font-medium">
                          {s.deadline} ({s.days_left} days left)
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenNotifyModal(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
                          >
                            <Bell size={14} />
                            <span>Notify Users</span>
                          </button>

                          {s.portal_url && (
                            <a
                              href={s.portal_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 transition-colors"
                              title="Open External Portal"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Super Admin Add / Edit Portal Modal */}
      {(isAddingPortal || editingPortal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <Globe size={20} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingPortal ? "Edit Scholarship Portal" : "Add New Scholarship Portal"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddingPortal(false);
                  setEditingPortal(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePortal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Portal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. MahaDBT Portal, NSP Central Portal"
                  value={portalForm.name}
                  onChange={(e) => setPortalForm({ ...portalForm, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Portal Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={portalForm.url}
                  onChange={(e) => setPortalForm({ ...portalForm, url: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Brief description of schemes provided by this portal..."
                  value={portalForm.description}
                  onChange={(e) => setPortalForm({ ...portalForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="portalActive"
                  checked={portalForm.isActive}
                  onChange={(e) => setPortalForm({ ...portalForm, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="portalActive" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Portal is Active & Visible in ScholarHub Finder
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPortal(false);
                    setEditingPortal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPortal}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSavingPortal && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editingPortal ? "Update Portal" : "Save Portal"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notify Users Modal */}
      {notifyingScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <Bell size={20} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Broadcast Scholarship Alert</h3>
              </div>
              <button
                onClick={() => setNotifyingScholarship(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendScholarshipNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notification Message
                </label>
                <textarea
                  rows="3"
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/30 text-xs text-slate-700 dark:text-slate-300">
                Targeting: Active students matching <strong>{notifyingScholarship.category}</strong> category.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNotifyingScholarship(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {isSending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Send Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
