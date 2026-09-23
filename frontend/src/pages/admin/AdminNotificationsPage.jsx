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
  Volume2,
  UserCheck,
  AlertTriangle,
  FileText,
  X,
  Search
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setAlertType] = useState("alert"); // alert | profile_reminder | document_reminder | announcement | deadline_reminder
  
  // Target Audience
  const [targetType, setTargetType] = useState("all"); // "all" | "incomplete_profile" | "single_user" | "filters"
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);

  // Filters for targetType === "filters"
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

  // Search students for single_user targeting
  useEffect(() => {
    if (targetType !== "single_user" || !studentSearchQuery.trim()) {
      setStudentSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingStudents(true);
      const token = localStorage.getItem("scholarhub_token");
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/users?q=${encodeURIComponent(studentSearchQuery)}&role=user&status=active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setStudentSearchResults(data.users.slice(0, 8));
        }
      } catch (err) {
        console.error("Student search error:", err);
      } finally {
        setIsSearchingStudents(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearchQuery, targetType]);

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
        body: JSON.stringify({
          targetType,
          targetUserId: selectedStudent?.id || null,
          filters: { category, state, qualification },
        }),
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
  }, [targetType, selectedStudent, category, state, qualification]);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Quick Preset Handlers
  const applyPreset = (presetKey) => {
    if (presetKey === "incomplete_profile") {
      setTargetType("incomplete_profile");
      setAlertType("profile_reminder");
      setTitle("Action Required: Complete your profile details");
      setMessage("Your student profile has incomplete fields (academic course, marks, annual income, or domicile state). Complete your full details in the Details section now to unlock 100% matched scholarships and government grant recommendations!");
    } else if (presetKey === "document_reminder") {
      setTargetType("incomplete_profile");
      setAlertType("document_reminder");
      setTitle("Action Required: Upload verification documents");
      setMessage("Please upload your required income certificate, caste certificate, and academic marksheets to verify your eligibility for active scholarship schemes.");
    } else if (presetKey === "deadline_alert") {
      setTargetType("all");
      setAlertType("deadline_reminder");
      setTitle("Urgent Reminder: Upcoming Scholarship Application Deadlines");
      setMessage("Several state and central government scholarship scheme deadlines are approaching soon. Please review your matched grants and submit your applications before the portal closes.");
    } else if (presetKey === "general_announcement") {
      setTargetType("all");
      setAlertType("announcement");
      setTitle("Important Announcement from ScholarHub Administration");
      setMessage("ScholarHub has added new government grant schemes for the 2026-2027 academic session. Check your dashboard for newly available scholarship opportunities.");
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorNotice("Notification title and message are required.");
      return;
    }

    if (targetType === "single_user" && !selectedStudent) {
      setErrorNotice("Please search and select a specific student.");
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
          title: title.trim(),
          message: message.trim(),
          type,
          targetType,
          targetUserId: selectedStudent?.id || null,
          filters: { category, state, qualification },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessNotice(`Notification queued! Delivering asynchronously to ${previewCount} student(s).`);
        setTitle("");
        setMessage("");
        setAlertType("alert");
        if (targetType === "single_user") {
          setSelectedStudent(null);
          setStudentSearchQuery("");
        }
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
      case "profile_reminder":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <UserCheck size={12} /> Profile Reminder
          </span>
        );
      case "document_reminder":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            <FileText size={12} /> Document Alert
          </span>
        );
      case "new_scholarship":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Award size={12} /> New Scheme
          </span>
        );
      case "deadline_reminder":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
            <Clock size={12} /> Deadline Alert
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Volume2 size={12} /> Announcement
          </span>
        );
    }
  };

  return (
    <AdminLayout title="Notification Broadcasting">
      <div className="space-y-6">
        {/* Title Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Notification Center & Alerts
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Send targeted alerts to students with incomplete profiles, broadcast scholarship reminders, or address individual users
          </p>
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

        {/* Quick Presets / Templates Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Action Templates
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => applyPreset("incomplete_profile")}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20 font-medium transition-colors flex items-center gap-1.5"
            >
              <UserCheck size={14} />
              <span>Alert: Incomplete Profiles</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("document_reminder")}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-500/20 font-medium transition-colors flex items-center gap-1.5"
            >
              <FileText size={14} />
              <span>Alert: Upload Pending Documents</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("deadline_alert")}
              className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20 font-medium transition-colors flex items-center gap-1.5"
            >
              <Clock size={14} />
              <span>Broadcast: Application Deadlines</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("general_announcement")}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 font-medium transition-colors flex items-center gap-1.5"
            >
              <Volume2 size={14} />
              <span>Broadcast: New Announcement</span>
            </button>
          </div>
        </div>

        {/* Composer Form */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <form onSubmit={handleSendNotification} className="space-y-5">
            {/* 1. Recipient Target Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                1. Select Target Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetType("all")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    targetType === "all"
                      ? "bg-blue-50 dark:bg-blue-600/15 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <Users size={16} />
                    <span>All Active Students</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Broadcast to all registered and active student accounts.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("incomplete_profile")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    targetType === "incomplete_profile"
                      ? "bg-amber-50 dark:bg-amber-600/15 border-amber-500 text-amber-700 dark:text-amber-400 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <AlertTriangle size={16} />
                    <span>Incomplete Profiles</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target students missing course, marks, income, or category.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("single_user")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    targetType === "single_user"
                      ? "bg-purple-50 dark:bg-purple-600/15 border-purple-500 text-purple-700 dark:text-purple-400 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <UserCheck size={16} />
                    <span>Specific Student</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Send personal direct alert to one selected student.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("filters")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    targetType === "filters"
                      ? "bg-emerald-50 dark:bg-emerald-600/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <Filter size={16} />
                    <span>Filter by Demographics</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target by Social Category, State, or Qualification.</p>
                </button>
              </div>
            </div>

            {/* Single Student Selector (if targetType === 'single_user') */}
            {targetType === "single_user" && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Search & Select Student
                </label>
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">
                        {selectedStudent.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{selectedStudent.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{selectedStudent.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="px-2.5 py-1 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      Change Student
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Type student name or email to search..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {isSearchingStudents && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 pl-1">
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Searching active students...</span>
                      </div>
                    )}
                    {studentSearchResults.length > 0 && (
                      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 shadow-lg max-h-48 overflow-y-auto">
                        {studentSearchResults.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setSelectedStudent(s);
                              setStudentSearchQuery("");
                              setStudentSearchResults([]);
                            }}
                            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <span className="font-semibold text-slate-900 dark:text-white">{s.name}</span>
                            <span className="text-slate-500 dark:text-slate-400">{s.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Demographic Filter Selectors (if targetType === 'filters') */}
            {targetType === "filters" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Social Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="General">General / Open</option>
                    <option value="EWS">EWS</option>
                    <option value="VJNT">VJNT / SBC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Domicile State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All States</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Level
                  </label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="Class 10">Class 10 (Secondary)</option>
                    <option value="Class 12">Class 12 (Higher Secondary)</option>
                    <option value="Undergraduate">Undergraduate (B.Tech/B.Sc/BA)</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2. Message Composition */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Action Required: Fill your profile details"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notification Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="alert">Direct Alert</option>
                  <option value="profile_reminder">Profile Completion Reminder</option>
                  <option value="document_reminder">Document Upload Reminder</option>
                  <option value="announcement">Announcement</option>
                  <option value="deadline_reminder">Deadline Alert</option>
                  <option value="new_scholarship">New Scholarship</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notification Message
              </label>
              <textarea
                rows="4"
                placeholder="Write message details that will appear on student notification center..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Recipient Count Preview & Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Users size={16} className="text-blue-500" />
                <span>Targeted Recipients:</span>
                {isLoadingPreview ? (
                  <RefreshCw size={12} className="animate-spin text-slate-400" />
                ) : (
                  <strong className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold">
                    {previewCount} Student(s)
                  </strong>
                )}
              </div>

              <button
                type="submit"
                disabled={isSending || (targetType === "single_user" && !selectedStudent)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                <span>Send Alert Notification</span>
              </button>
            </div>
          </form>
        </div>

        {/* Broadcast History Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Broadcast History</h3>
            <button
              onClick={fetchHistory}
              disabled={isLoadingHistory}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              <RefreshCw size={12} className={isLoadingHistory ? "animate-spin" : ""} />
              <span>Refresh History</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Recipients</th>
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4 text-right">Sent Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                      <span>Loading notification broadcast history...</span>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No notifications have been sent yet.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-semibold text-slate-900 dark:text-white">{h.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{h.message}</div>
                      </td>

                      <td className="px-6 py-4">
                        {getTypeBadge(h.type)}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">
                        {h.recipientCount || 0} user(s)
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {h.createdByName || "Admin"}
                      </td>

                      <td className="px-6 py-4 text-right text-xs text-slate-500 dark:text-slate-400">
                        {new Date(h.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
