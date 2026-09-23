import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Users,
  Filter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Award,
  Volume2
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [category, setCategory] = useState("all");
  const [state, setState] = useState("all");
  const [qualification, setQualification] = useState("all");

  const [previewCount, setPreviewCount] = useState(0);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Live Recipient Count Preview
  const fetchRecipientPreview = async () => {
    setIsLoadingPreview(true);
    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notifications/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, state, qualification }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewCount(data.count);
      }
    } catch (err) {
      console.error("Error previewing recipients:", err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    const token = localStorage.getItem("scholarhub_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notifications/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Error fetching notification history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchRecipientPreview();
  }, [category, state, qualification]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorNotice("Notification title and message are required.");
      return;
    }

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
          title,
          message,
          type,
          filters: { category, state, qualification },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessNotice(`Notification queued! Delivering asynchronously to ~${previewCount} user(s).`);
        setTitle("");
        setMessage("");
        setType("announcement");
        fetchHistory();
      } else {
        setErrorNotice(data.error?.message || data.message || "Failed to send notification.");
      }
    } catch (err) {
      setErrorNotice("Error sending notification.");
    } finally {
      setIsSending(false);
    }
  };

  const getTypeBadge = (t) => {
    switch (t) {
      case "new_scholarship":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30"><Award size={12} /> New Scholarship</span>;
      case "deadline_reminder":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30"><Clock size={12} /> Deadline Alert</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><Volume2 size={12} /> Announcement</span>;
    }
  };

  return (
    <AdminLayout title="Notification Broadcasting">
      <div className="space-y-6">
        {/* Title Header */}
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Compose & Broadcast Notifications</h2>
          <p className="text-sm text-slate-400">Send in-app notifications to all users or target specific student profiles</p>
        </div>

        {/* Notices */}
        {errorNotice && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorNotice}</span>
          </div>
        )}
        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle size={18} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSendNotification} className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell size={20} className="text-blue-400" />
              <span>Notification Details</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notification Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="announcement">Announcement</option>
                <option value="new_scholarship">New Scholarship</option>
                <option value="deadline_reminder">Deadline Reminder</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="e.g. MahaDBT Scholarship Applications Now Open!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Message Body
              </label>
              <textarea
                rows="4"
                placeholder="Write clear notification content for students..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Recipient Targeting Filters */}
            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Filter size={14} className="text-blue-400" />
                <span>Recipient Targeting Filters</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none capitalize"
                  >
                    <option value="all">All Categories</option>
                    <option value="OBC">OBC</option>
                    <option value="VJNT">VJNT</option>
                    <option value="SBC">SBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EBC">EBC</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">State Domicile</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none capitalize"
                  >
                    <option value="all">All States</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Education Level</label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none capitalize"
                  >
                    <option value="all">All Levels</option>
                    <option value="10th">10th Class</option>
                    <option value="12th">12th Class</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending || previewCount === 0}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-40"
            >
              {isSending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
              <span>Send Notification ({previewCount} recipients)</span>
            </button>
          </form>

          {/* Live Preview Box Side Panel */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-purple-400" />
                <span>Recipient Preview</span>
              </h3>
              <p className="text-xs text-slate-400">
                Live recipient count calculated based on selected category, state, and qualification criteria.
              </p>

              <div className="p-6 rounded-xl bg-blue-600/10 border border-blue-500/30 text-center my-4">
                <div className="text-4xl font-extrabold text-blue-400 mb-1">
                  {isLoadingPreview ? "..." : previewCount.toLocaleString()}
                </div>
                <div className="text-xs font-medium text-slate-300">Target Active Recipients</div>
              </div>

              <div className="text-xs space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-semibold text-white capitalize">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span>State:</span>
                  <span className="font-semibold text-white capitalize">{state}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education:</span>
                  <span className="font-semibold text-white capitalize">{qualification}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400">
              ⚡ <strong>Non-blocking queue</strong>: Notifications are processed asynchronously without slowing down your request. Duplicate delivery to the same user is automatically prevented.
            </div>
          </div>
        </div>

        {/* Sent History Table */}
        <div className="space-y-3 pt-4">
          <h3 className="text-lg font-bold text-white">Broadcast History</h3>

          <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Recipients</th>
                  <th className="px-6 py-4">Date Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                      <span>Loading history...</span>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No past broadcast notifications recorded.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{h.title}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{h.message}</div>
                      </td>

                      <td className="px-6 py-4">
                        {getTypeBadge(h.type)}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-300">
                        {h.createdByName || "System Admin"}
                      </td>

                      <td className="px-6 py-4 font-semibold text-blue-400 text-xs">
                        {h.recipientCount.toLocaleString()} users
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(h.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
