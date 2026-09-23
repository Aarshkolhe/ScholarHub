import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  UserMinus,
  Search,
  AlertCircle,
  Shield,
  ShieldAlert,
  X,
  CheckCircle,
  RefreshCw,
  Info
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminAdminsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Promote User Modal state
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteSearch, setPromoteSearch] = useState("");
  const [selectedPromoteUser, setSelectedPromoteUser] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);

  // Demote Confirmation Modal state
  const [demotingAdmin, setDemotingAdmin] = useState(null);
  const [isDemoting, setIsDemoting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorNotice("");
    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setErrorNotice(data.message || "Failed to load user list.");
      }
    } catch (err) {
      setErrorNotice("Unable to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const adminUsers = users.filter(
    (u) => u.role === "admin" || u.role === "super_admin"
  );
  const regularUsers = users.filter((u) => u.role === "user");

  const filteredAdmins = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPromoteCandidates = regularUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(promoteSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(promoteSearch.toLowerCase())
  );

  // Execute Promote User
  const handlePromote = async () => {
    if (!selectedPromoteUser) return;
    setIsPromoting(true);
    setErrorNotice("");
    setSuccessNotice("");

    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/users/${selectedPromoteUser.id}/promote`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setSuccessNotice(
          `Successfully promoted ${selectedPromoteUser.email} to Admin!`
        );
        setShowPromoteModal(false);
        setSelectedPromoteUser(null);
        fetchUsers();
      } else {
        setErrorNotice(data.error?.message || data.message || "Failed to promote user.");
      }
    } catch (err) {
      setErrorNotice("Error promoting user.");
    } finally {
      setIsPromoting(false);
    }
  };

  // Execute Demote Admin
  const handleDemote = async () => {
    if (!demotingAdmin) return;
    setIsDemoting(true);
    setErrorNotice("");
    setSuccessNotice("");

    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/users/${demotingAdmin.id}/demote`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setSuccessNotice(
          `Admin privileges removed for ${demotingAdmin.email}.`
        );
        setDemotingAdmin(null);
        fetchUsers();
      } else {
        setErrorNotice(data.error?.message || data.message || "Failed to remove admin access.");
      }
    } catch (err) {
      setErrorNotice("Error removing admin access.");
    } finally {
      setIsDemoting(false);
    }
  };

  if (currentUser?.role !== "super_admin") {
    return (
      <AdminLayout title="Manage Admins">
        <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-center space-y-3">
          <ShieldAlert size={48} className="mx-auto text-red-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Super Admin Access Only</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Managing administrator access is restricted exclusively to Super Admin accounts.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Management">
      <div className="space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Administrators</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Promote trusted users to Admin or revoke administrative access</p>
          </div>
          <button
            onClick={() => {
              setShowPromoteModal(true);
              setPromoteSearch("");
              setSelectedPromoteUser(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20"
          >
            <UserPlus size={18} />
            <span>Promote New Admin</span>
          </button>
        </div>

        {/* Notices */}
        {errorNotice && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {errorNotice}
            </span>
            <button onClick={() => setErrorNotice("")} className="text-red-500 hover:text-red-700 dark:hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}
        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle size={16} />
              {successNotice}
            </span>
            <button onClick={() => setSuccessNotice("")} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search administrators by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Admins Table */}
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Role Tier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-purple-500" />
                    <span>Loading admin list...</span>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    No administrators found matching search.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((u) => {
                  const isSuperAdmin = u.role === "super_admin";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full font-bold flex items-center justify-center border ${
                            isSuperAdmin
                              ? "bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30"
                              : "bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                          }`}>
                            {u.name?.[0]?.toUpperCase() || "A"}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            isSuperAdmin
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                          }`}
                        >
                          <Shield size={13} />
                          <span className="capitalize">{u.role.replace("_", " ")}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle size={12} />
                          <span>Active</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 italic">
                            <Info size={14} />
                            <span>Protected Super Admin</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDemotingAdmin(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium border border-red-500/30 transition-colors"
                          >
                            <UserMinus size={14} />
                            <span>Remove Admin Access</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promote User Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400">
                <ShieldCheck size={22} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Promote User to Admin</h3>
              </div>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a regular user account from the list below to grant administrator privileges.
            </p>

            {/* Candidate Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search regular users..."
                value={promoteSearch}
                onChange={(e) => setPromoteSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Candidates List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              {filteredPromoteCandidates.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No eligible regular users found.
                </div>
              ) : (
                filteredPromoteCandidates.map((u) => {
                  const isSelected = selectedPromoteUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelectedPromoteUser(u)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle size={18} className="text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromote}
                disabled={!selectedPromoteUser || isPromoting}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {isPromoting && <RefreshCw size={14} className="animate-spin" />}
                <span>Confirm Promotion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demote Confirmation Modal */}
      {demotingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revoke Admin Access</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{demotingAdmin.email}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to demote <strong>{demotingAdmin.name}</strong> back to a regular user? They will immediately lose access to the Admin Portal.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDemotingAdmin(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDemote}
                disabled={isDemoting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
              >
                {isDemoting && <RefreshCw size={14} className="animate-spin" />}
                <span>Revoke Privileges</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
