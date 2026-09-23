import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  UserX,
  UserCheck,
  Eye,
  Shield,
  AlertTriangle,
  X,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null); // User profile modal
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [blockingUser, setBlockingUser] = useState(null); // Block modal
  const [blockReason, setBlockReason] = useState("");
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorNotice("");
    const token = localStorage.getItem("scholarhub_token");
    try {
      const url = new URL(`${BACKEND_URL}/api/admin/users`);
      if (searchQuery) url.searchParams.append("q", searchQuery);
      if (roleFilter !== "all") url.searchParams.append("role", roleFilter);
      if (statusFilter !== "all") url.searchParams.append("status", statusFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setErrorNotice(data.message || "Failed to load users list.");
      }
    } catch (err) {
      setErrorNotice("Unable to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  // Open Full Profile Modal
  const handleOpenProfile = async (u) => {
    setSelectedUser(u);
    setProfileData(null);
    setLoadingProfile(true);
    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${u.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfileData(data);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Block Action
  const handleConfirmBlock = async (e) => {
    e.preventDefault();
    if (!blockingUser) return;
    setIsSubmittingBlock(true);
    setErrorNotice("");
    setSuccessNotice("");

    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${blockingUser.id}/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: blockReason }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessNotice(`User ${blockingUser.email} has been blocked.`);
        setBlockingUser(null);
        setBlockReason("");
        fetchUsers();
      } else {
        setErrorNotice(data.error?.message || data.message || "Failed to block user.");
      }
    } catch (err) {
      setErrorNotice("Error processing block action.");
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  // Unblock Action
  const handleUnblock = async (targetUser) => {
    setErrorNotice("");
    setSuccessNotice("");
    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${targetUser.id}/unblock`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuccessNotice(`User ${targetUser.email} has been unblocked.`);
        fetchUsers();
      } else {
        setErrorNotice(data.error?.message || data.message || "Failed to unblock user.");
      }
    } catch (err) {
      setErrorNotice("Error processing unblock action.");
    }
  };

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Registered Users</h2>
            <p className="text-sm text-slate-400">View user profiles, search accounts, and manage block status</p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Notices */}
        {errorNotice && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
            <span>{errorNotice}</span>
            <button onClick={() => setErrorNotice("")} className="text-red-400 hover:text-white"><X size={16} /></button>
          </div>
        )}
        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
            <span>{successNotice}</span>
            <button onClick={() => setSuccessNotice("")} className="text-emerald-400 hover:text-white"><X size={16} /></button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-300">
              <Filter size={16} className="text-slate-400" />
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none capitalize"
              >
                <option value="all" className="bg-slate-900 text-white">All Roles</option>
                <option value="user" className="bg-slate-900 text-white">User</option>
                <option value="admin" className="bg-slate-900 text-white">Admin</option>
                <option value="super_admin" className="bg-slate-900 text-white">Super Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-300">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none capitalize"
              >
                <option value="all" className="bg-slate-900 text-white">All Statuses</option>
                <option value="active" className="bg-slate-900 text-white">Active</option>
                <option value="blocked" className="bg-slate-900 text-white">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Loading users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No users match the search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuperAdmin = u.role === "super_admin";
                  const isAdmin = u.role === "admin";
                  const isBlocked = u.status === "blocked";
                  const canBlock = !isSuperAdmin && (!isAdmin || currentUser?.role === "super_admin");

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 font-semibold text-blue-400 flex items-center justify-center">
                            {u.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isSuperAdmin
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : isAdmin
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}>
                          <Shield size={12} />
                          <span className="capitalize">{u.role.replace("_", " ")}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                            <XCircle size={12} />
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle size={12} />
                            <span>Active</span>
                          </span>
                        )}
                        {isBlocked && u.blockReason && (
                          <div className="text-[11px] text-slate-400 mt-1 truncate max-w-xs" title={u.blockReason}>
                            Reason: {u.blockReason}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenProfile(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                          title="View Profile Details"
                        >
                          <Eye size={14} />
                          <span>Profile</span>
                        </button>

                        {isBlocked ? (
                          <button
                            onClick={() => handleUnblock(u)}
                            disabled={!canBlock}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition-colors disabled:opacity-40"
                          >
                            <UserCheck size={14} />
                            <span>Unblock</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => { setBlockingUser(u); setBlockReason(""); }}
                            disabled={!canBlock}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium border border-red-500/30 transition-colors disabled:opacity-40"
                            title={!canBlock ? "Cannot block admins/super admins" : "Block User"}
                          >
                            <UserX size={14} />
                            <span>Block</span>
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

      {/* Profile Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">
                  {selectedUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {loadingProfile ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                  <span>Loading profile details...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div>
                      <span className="text-xs text-slate-400 block">Status</span>
                      <span className="font-semibold text-white capitalize">{selectedUser.status}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Role</span>
                      <span className="font-semibold text-white capitalize">{selectedUser.role.replace("_", " ")}</span>
                    </div>
                    {profileData?.profile && (
                      <>
                        <div>
                          <span className="text-xs text-slate-400 block">College</span>
                          <span className="font-semibold text-white">{profileData.profile.college_name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Course</span>
                          <span className="font-semibold text-white">{profileData.profile.current_course || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Category</span>
                          <span className="font-semibold text-white">{profileData.profile.category || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Domicile State</span>
                          <span className="font-semibold text-white">{profileData.profile.domicile_state || "N/A"}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      <span>Uploaded Documents</span>
                    </h4>
                    {profileData?.documents?.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 text-xs">
                            <span className="font-medium text-white">{doc.doc_type}</span>
                            <span className="text-slate-400">{doc.file_name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No documents uploaded yet.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Block Account</h3>
                <p className="text-xs text-slate-400">{blockingUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Block Reason (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter reason for blocking this user..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBlock}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {isSubmittingBlock && <RefreshCw size={14} className="animate-spin" />}
                  <span>Block User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
