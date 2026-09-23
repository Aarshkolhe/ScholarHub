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
  Send
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // "Notify Users" Modal State
  const [notifyingScholarship, setNotifyingScholarship] = useState(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchScholarships = async () => {
    setIsLoading(true);
    setErrorNotice("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/scholarships`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setScholarships(data);
      } else if (data.success && Array.isArray(data.scholarships)) {
        setScholarships(data.scholarships);
      }
    } catch (err) {
      setErrorNotice("Unable to load scholarships.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const filteredScholarships = scholarships.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenNotifyModal = (s) => {
    setNotifyingScholarship(s);
    setNotifTitle(`New Scholarship Match: ${s.name}`);
    setNotifMessage(
      `Apply now for ${s.name} offering ${s.amount_formatted || s.amount}. Deadline: ${s.deadline}. Requirement: ${s.requirements || "Check eligibility"}`
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
    <AdminLayout title="Scholarships Directory">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Scholarships List</h2>
            <p className="text-sm text-slate-400">Inspect listed scholarships and trigger targeted student notifications</p>
          </div>
          <button
            onClick={fetchScholarships}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh List</span>
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

        {/* Search Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search scholarships by name, provider, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Scholarships Table */}
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Scholarship</th>
                <th className="px-6 py-4">Award Amount</th>
                <th className="px-6 py-4">Category / Level</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
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
                  <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.provider}</div>
                    </td>

                    <td className="px-6 py-4 font-bold text-emerald-400">
                      {s.amount_formatted || `₹${s.amount}`}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {s.category} • {s.degree}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-amber-400 font-medium">
                      {s.deadline} ({s.days_left} days left)
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenNotifyModal(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-colors"
                      >
                        <Bell size={14} />
                        <span>Notify Users</span>
                      </button>

                      {s.portal_url && (
                        <a
                          href={s.portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
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

      {/* Notify Users Modal */}
      {notifyingScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-blue-400">
                <Bell size={20} />
                <h3 className="text-lg font-bold text-white">Broadcast Scholarship Alert</h3>
              </div>
              <button
                onClick={() => setNotifyingScholarship(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendScholarshipNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notification Message
                </label>
                <textarea
                  rows="3"
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/30 text-xs text-slate-300">
                Targeting: All active students matching <strong>{notifyingScholarship.category}</strong> category.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNotifyingScholarship(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
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
