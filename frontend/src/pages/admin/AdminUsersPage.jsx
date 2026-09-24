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
  RefreshCw,
  Bell,
  Send,
  GraduationCap,
  IndianRupee,
  MapPin,
  Clock,
  Check,
  AlertCircle
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

  // Direct Alert Modal State
  const [alertingUser, setAlertingUser] = useState(null);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("alert");
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Block Modal State
  const [blockingUser, setBlockingUser] = useState(null);
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

  // Open Direct Alert Modal for specific student
  const handleOpenAlertModal = (u, defaultTemplate = null) => {
    setAlertingUser(u);
    if (defaultTemplate === "profile") {
      setAlertTitle("Action Required: Please complete your profile details");
      setAlertMessage(`Hello ${u.name || "Student"}, please complete your academic, category, and income details on ScholarHub Finder to unlock 100% matched scholarships and government grants.`);
      setAlertType("profile_reminder");
    } else if (defaultTemplate === "documents") {
      setAlertTitle("Action Required: Upload pending verification documents");
      setAlertMessage(`Hello ${u.name || "Student"}, please upload your income certificate and marksheets to verify your eligibility for active scholarship applications.`);
      setAlertType("document_reminder");
    } else {
      setAlertTitle(`Important Alert for ${u.name || "Student"}`);
      setAlertMessage("");
      setAlertType("alert");
    }
  };

  const handleSendDirectAlert = async (e) => {
    e.preventDefault();
    if (!alertingUser || !alertTitle.trim() || !alertMessage.trim()) {
      setErrorNotice("Alert title and message are required.");
      return;
    }

    setIsSendingAlert(true);
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
          title: alertTitle.trim(),
          message: alertMessage.trim(),
          type: alertType,
          targetType: "single_user",
          targetUserId: alertingUser.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessNotice(`Alert notification queued for ${alertingUser.name} (${alertingUser.email}).`);
        setAlertingUser(null);
        setAlertTitle("");
        setAlertMessage("");
      } else {
        setErrorNotice(data.error?.message || data.message || "Failed to send alert.");
      }
    } catch (err) {
      setErrorNotice("Error sending alert notification.");
    } finally {
      setIsSendingAlert(false);
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

  // Helper formatting for values
  const fmtCurrency = (val) => {
    if (val === null || val === undefined || val === "") return "Not provided";
    const num = Number(val);
    return isNaN(num) ? val : `₹${num.toLocaleString("en-IN")}`;
  };

  const fmtDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Registered Users</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">View complete user profiles, inspect stored records, send alerts, and manage account statuses</p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
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

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
              <Filter size={16} className="text-slate-400" />
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none capitalize cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Roles</option>
                <option value="user" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">User</option>
                <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Admin</option>
                <option value="super_admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Super Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none capitalize cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Statuses</option>
                <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Active</option>
                <option value="blocked" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
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
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            {u.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isSuperAdmin
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                            : isAdmin
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}>
                          <Shield size={12} />
                          <span className="capitalize">{u.role.replace("_", " ")}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                            <XCircle size={12} />
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle size={12} />
                            <span>Active</span>
                          </span>
                        )}
                        {isBlocked && u.blockReason && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-xs" title={u.blockReason}>
                            Reason: {u.blockReason}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Profile Button */}
                        <button
                          onClick={() => handleOpenProfile(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                          title="View Full Profile Details"
                        >
                          <Eye size={14} />
                          <span>View Profile</span>
                        </button>

                        {/* Send Alert Button */}
                        <button
                          onClick={() => handleOpenAlertModal(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/30 transition-colors"
                          title="Send In-App Alert to this Student"
                        >
                          <Bell size={14} />
                          <span>Alert</span>
                        </button>

                        {/* Block / Unblock */}
                        {isBlocked ? (
                          <button
                            onClick={() => handleUnblock(u)}
                            disabled={!canBlock}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/30 transition-colors disabled:opacity-40"
                          >
                            <UserCheck size={14} />
                            <span>Unblock</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => { setBlockingUser(u); setBlockReason(""); }}
                            disabled={!canBlock}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium border border-red-500/30 transition-colors disabled:opacity-40"
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

      {/* Comprehensive User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl my-8 transition-colors">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-extrabold text-lg flex items-center justify-center border border-blue-500/30">
                  {selectedUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedUser.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAlertModal(selectedUser)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-md shadow-blue-600/20"
                >
                  <Bell size={14} />
                  <span>Send Alert</span>
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-6 max-h-[75vh] overflow-y-auto pr-1">
              {loadingProfile ? (
                <div className="py-16 text-center text-slate-400">
                  <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-blue-500" />
                  <span className="text-sm">Fetching complete student profile & documents...</span>
                </div>
              ) : (
                <>
                  {/* Section 1: Account Information */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 flex items-center gap-2">
                      <Shield size={14} className="text-blue-500" />
                      <span>Account Information</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">User ID (UUID)</span>
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{profileData?.user?.id || selectedUser.id}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Role</span>
                        <span className="font-semibold text-slate-900 dark:text-white capitalize">{profileData?.user?.role || selectedUser.role}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Email Verified</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {profileData?.user?.is_email_verified ? "Yes (Verified)" : "No"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Account Created</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{fmtDate(profileData?.user?.created_at || selectedUser.createdAt)}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Last Updated</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{fmtDate(profileData?.user?.updated_at)}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Account Status</span>
                        <span className="font-semibold text-slate-900 dark:text-white capitalize">{profileData?.user?.status || selectedUser.status}</span>
                      </div>
                    </div>

                    {profileData?.user?.status === "blocked" && (
                      <div className="mt-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs space-y-1">
                        <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <AlertTriangle size={14} />
                          <span>This account is currently blocked</span>
                        </div>
                        <p className="text-red-600 dark:text-red-300">
                          <strong>Blocked At:</strong> {fmtDate(profileData.user.blocked_at)} | <strong>By:</strong> {profileData.user.blocked_by_name || "Admin"} ({profileData.user.blocked_by_email || "N/A"})
                        </p>
                        {profileData.user.block_reason && (
                          <p className="text-red-600 dark:text-red-300">
                            <strong>Reason:</strong> {profileData.user.block_reason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 2: Academic Qualifications */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 flex items-center gap-2">
                      <GraduationCap size={14} className="text-emerald-500" />
                      <span>Academic Information</span>
                    </h4>
                    {profileData?.profile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Qualification Level</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.qualification || "Not provided"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Current Course</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.current_course || "Not provided"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Stream / Branch</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.stream_branch || "Not provided"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">College / Institution Name</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.college_name || "Not provided"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Year / Semester</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.year_semester || "Not provided"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Expected Passing Year</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.passing_year || "Not provided"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Current Marks % / CGPA</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{profileData.profile.marks_percentage || "Not provided"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Class 10th Marks %</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{profileData.profile.tenth_percentage || "Not provided"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Class 12th / Diploma %</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{profileData.profile.twelfth_percentage || "Not provided"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
                        <span>No academic profile details filled yet by this student.</span>
                        <button
                          onClick={() => handleOpenAlertModal(selectedUser, "profile")}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-500 transition-colors"
                        >
                          Alert Student to Fill
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Financial & Living Details */}
                  {profileData?.profile && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 flex items-center gap-2">
                        <IndianRupee size={14} className="text-amber-500" />
                        <span>Financial & Living Information</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Annual Family Income</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtCurrency(profileData.profile.annual_income)}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Living Status / Type</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.living_type || "Day Scholar at Home"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Monthly Living Cost</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{fmtCurrency(profileData.profile.monthly_living_cost)}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Guardian / Parent Occupation</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.guardian_occupation || "Not specified"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Income Certificate No.</span>
                          <span className="font-mono text-xs text-slate-900 dark:text-white">{profileData.profile.income_cert_no || "Not provided"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Income Issuing Authority</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.income_issuing_auth || "Not specified"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 4: Social Category & Domicile */}
                  {profileData?.profile && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 flex items-center gap-2">
                        <MapPin size={14} className="text-purple-500" />
                        <span>Category, Domicile & Reservations</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Social Category</span>
                          <span className="font-bold text-slate-900 dark:text-white">{profileData.profile.category || "Not specified"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Domicile State</span>
                          <span className="font-bold text-slate-900 dark:text-white">{profileData.profile.domicile_state || "Not specified"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Minority Status</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.is_minority || "No"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Person with Disability (PwD)</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.is_disability || "No"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Special Criteria / Eligibility Notes</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{profileData.profile.special_criteria || "None"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 5: Activity & Uploaded Documents */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText size={14} className="text-blue-500" />
                        <span>Uploaded Documents & Activity</span>
                      </span>
                      {profileData?.stats && (
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {profileData.stats.applicationsCount} Applications • {profileData.stats.savedCount} Saved Schemes
                        </span>
                      )}
                    </h4>

                    {profileData?.documents?.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <FileText size={16} className="text-blue-500" />
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-white block">{doc.doc_type}</span>
                                <span className="text-slate-500 dark:text-slate-400">{doc.file_name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30">
                                {doc.status || "Uploaded"}
                              </span>
                              <span className="text-slate-400">{fmtDate(doc.created_at)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>No student verification documents uploaded yet.</span>
                        <button
                          onClick={() => handleOpenAlertModal(selectedUser, "documents")}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          Request Documents
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Direct Alert Modal */}
      {alertingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-amber-500">
                <Bell size={20} />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send Direct In-App Alert</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Targeting: {alertingUser.name} ({alertingUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => setAlertingUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAlertTitle("Action Required: Please complete your profile details");
                  setAlertMessage(`Hello ${alertingUser.name || "Student"}, please complete your academic, category, and income details on ScholarHub Finder to unlock 100% matched scholarships and government grants.`);
                  setAlertType("profile_reminder");
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20"
              >
                + Complete Profile Template
              </button>
              <button
                type="button"
                onClick={() => {
                  setAlertTitle("Action Required: Upload verification documents");
                  setAlertMessage(`Hello ${alertingUser.name || "Student"}, please upload your required income and marksheet documents in the Documents tab for scholarship verification.`);
                  setAlertType("document_reminder");
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              >
                + Upload Documents Template
              </button>
            </div>

            <form onSubmit={handleSendDirectAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Title
                </label>
                <input
                  type="text"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="e.g. Action Required: Fill your profile details"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Type
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="alert">Direct Alert</option>
                  <option value="profile_reminder">Profile Details Reminder</option>
                  <option value="document_reminder">Document Upload Reminder</option>
                  <option value="announcement">Announcement</option>
                  <option value="deadline_reminder">Deadline Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content
                </label>
                <textarea
                  rows="4"
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Enter message visible on the student's dashboard and notifications..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAlertingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingAlert}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSendingAlert ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Send Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Block Account</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{blockingUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Block Reason (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter reason for blocking this user..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
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
