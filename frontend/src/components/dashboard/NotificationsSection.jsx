import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  CalendarClock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sliders,
  CheckCheck,
  Clock,
  AlertTriangle,
  Mail,
  UserCheck,
  Bot,
  ChevronRight,
  Filter,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {
  evaluateAllScholarships,
  calculateProfileStrength,
  getStoredStudentProfile,
} from "../../lib/eligibilityEngine";

export function NotificationsSection({ onNavigateTab }) {
  const { user } = useAuth();
  const [filterCategory, setFilterCategory] = useState("all"); // all, deadline, match, system, unread
  const [readIds, setReadIds] = useState(() => {
    try {
      const uid = user?.id ? `_${user.id}` : "";
      const raw = localStorage.getItem(`scholarhub_read_notifications${uid}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const uid = user?.id ? `_${user.id}` : "";
      const raw = localStorage.getItem(`scholarhub_dismissed_notifications${uid}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Notification Preferences State (mirrored from settings)
  const [emailNotifs, setEmailNotifs] = useState(() => {
    return localStorage.getItem("scholarhub_pref_email_notifs") !== "false";
  });
  const [deadlineReminders, setDeadlineReminders] = useState(() => {
    return localStorage.getItem("scholarhub_pref_deadline_reminders") !== "false";
  });

  const [actionFeedback, setActionFeedback] = useState("");

  const triggerFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(""), 3500);
  };

  const studentName = (user?.fullName || user?.name || "Student").split(" ")[0];
  const profileStrength = calculateProfileStrength();
  const storedProfile = getStoredStudentProfile();

  // Generate dynamic notification items based on current scholarships and user profile
  const baseNotifications = useMemo(() => {
    const list = [];
    const evaluated = evaluateAllScholarships();

    // 1. High AI Match Schemes (>= 80%)
    const highMatches = evaluated.filter((s) => s.matchScore >= 80).slice(0, 3);
    highMatches.forEach((s) => {
      list.push({
        id: `match_${s.id}`,
        category: "match",
        type: "AI Grant Match",
        title: `High Match: ${s.name}`,
        message: `Your profile qualifies with a ${s.matchScore}% eligibility match. Eligible for ${s.amount || "grant funding"} with deadline on ${s.deadline || "upcoming"}.`,
        time: "Just now",
        timestamp: Date.now() - 1000 * 60 * 10,
        urgency: "high",
        scholarship: s,
        actionLabel: "View Scholarship",
        actionTab: "Search",
        icon: Sparkles,
        tint: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800",
      });
    });

    // 2. Urgent Deadlines
    const urgentSchemes = evaluated.filter((s) => s.deadlineUrgent || (s.daysLeft && s.daysLeft <= 10)).slice(0, 2);
    if (urgentSchemes.length > 0) {
      urgentSchemes.forEach((s) => {
        list.push({
          id: `deadline_${s.id}`,
          category: "deadline",
          type: "Deadline Alert",
          title: `Application Closing Soon: ${s.name}`,
          message: `Application portal closes in ${s.daysLeft || 3} days (${s.deadline}). Complete and submit your self-attested details on ${s.provider || "the official portal"}.`,
          time: "2 hours ago",
          timestamp: Date.now() - 1000 * 60 * 120,
          urgency: "urgent",
          scholarship: s,
          actionLabel: "Apply on Portal",
          externalUrl: s.applicationLink || s.portalUrl || "https://mahadbt.maharashtra.gov.in",
          icon: CalendarClock,
          tint: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
        });
      });
    } else {
      list.push({
        id: "deadline_default_stem",
        category: "deadline",
        type: "Deadline Alert",
        title: "National Merit STEM Research Fellowship",
        message: "Application submissions for the 2026 academic cycle close in 4 days (31 Oct 2026). Ensure your scholarship bookmarks are finalized.",
        time: "3 hours ago",
        timestamp: Date.now() - 1000 * 60 * 180,
        urgency: "urgent",
        actionLabel: "Explore Scheme",
        actionTab: "Search",
        icon: CalendarClock,
        tint: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
      });
    }

    // 3. Profile Completion Tip
    if (profileStrength < 80) {
      list.push({
        id: "profile_completion_tip",
        category: "system",
        type: "Profile Action",
        title: `Boost Profile Strength (${profileStrength}% Completed)`,
        message: `Hi ${studentName}, adding your 10th/12th marks, annual family income, and living status unlocks 15+ verified government and CSR grants.`,
        time: "5 hours ago",
        timestamp: Date.now() - 1000 * 60 * 300,
        urgency: "medium",
        actionLabel: "Complete Details",
        actionTab: "Details",
        icon: UserCheck,
        tint: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
      });
    }

    // 4. System Security & Operational Mode Alert
    list.push({
      id: "system_security_zero_doc",
      category: "system",
      type: "Security & Governance",
      title: "Zero-Document Storage Protocol Active",
      message: "ScholarHub operates on zero-document upload architecture. Your caste, income certificates, and marksheets remain private and are only uploaded directly on government portals.",
      time: "1 day ago",
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      urgency: "low",
      actionLabel: "View Privacy Policy",
      actionTab: "Settings",
      icon: ShieldCheck,
      tint: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
    });

    // 5. AI Scholarship Counselor Quick Assistant Prompt
    list.push({
      id: "ai_counselor_prompt",
      category: "match",
      type: "AI Counselor",
      title: "Ask Gemini AI about your eligibility criteria",
      message: "Not sure if your family income ceiling or college branch qualifies for MahaDBT or Vidyasaarathi? Chat with the AI Counselor for instant eligibility breakdowns.",
      time: "2 days ago",
      timestamp: Date.now() - 1000 * 60 * 60 * 48,
      urgency: "low",
      actionLabel: "Ask AI Counselor",
      actionTab: "AI",
      icon: Bot,
      tint: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
    });

    return list;
  }, [profileStrength, studentName]);

  // Persist read status
  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const next = [...readIds, id];
      setReadIds(next);
      const uid = user?.id ? `_${user.id}` : "";
      localStorage.setItem(`scholarhub_read_notifications${uid}`, JSON.stringify(next));
      window.dispatchEvent(new Event("scholarhub_notifications_updated"));
    }
  };

  const toggleRead = (id) => {
    let next;
    if (readIds.includes(id)) {
      next = readIds.filter((x) => x !== id);
    } else {
      next = [...readIds, id];
    }
    setReadIds(next);
    const uid = user?.id ? `_${user.id}` : "";
    localStorage.setItem(`scholarhub_read_notifications${uid}`, JSON.stringify(next));
    window.dispatchEvent(new Event("scholarhub_notifications_updated"));
  };

  const markAllAsRead = () => {
    const allIds = baseNotifications.map((n) => n.id);
    setReadIds(allIds);
    const uid = user?.id ? `_${user.id}` : "";
    localStorage.setItem(`scholarhub_read_notifications${uid}`, JSON.stringify(allIds));
    window.dispatchEvent(new Event("scholarhub_notifications_updated"));
    triggerFeedback("✓ All notifications marked as read.");
  };

  const dismissNotification = (id) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    const uid = user?.id ? `_${user.id}` : "";
    localStorage.setItem(`scholarhub_dismissed_notifications${uid}`, JSON.stringify(next));
    window.dispatchEvent(new Event("scholarhub_notifications_updated"));
    triggerFeedback("Notification dismissed from feed.");
  };

  const clearAllNotifications = () => {
    const allIds = baseNotifications.map((n) => n.id);
    setDismissedIds(allIds);
    const uid = user?.id ? `_${user.id}` : "";
    localStorage.setItem(`scholarhub_dismissed_notifications${uid}`, JSON.stringify(allIds));
    window.dispatchEvent(new Event("scholarhub_notifications_updated"));
    triggerFeedback("All notifications cleared.");
  };

  const restoreDismissedNotifications = () => {
    setDismissedIds([]);
    const uid = user?.id ? `_${user.id}` : "";
    localStorage.removeItem(`scholarhub_dismissed_notifications${uid}`);
    window.dispatchEvent(new Event("scholarhub_notifications_updated"));
    triggerFeedback("All notifications restored to inbox.");
  };

  // Filtered Notifications
  const activeList = useMemo(() => {
    return baseNotifications.filter((item) => {
      if (dismissedIds.includes(item.id)) return false;
      if (filterCategory === "all") return true;
      if (filterCategory === "unread") return !readIds.includes(item.id);
      return item.category === filterCategory;
    });
  }, [baseNotifications, dismissedIds, filterCategory, readIds]);

  const unreadCount = useMemo(() => {
    return baseNotifications.filter((n) => !dismissedIds.includes(n.id) && !readIds.includes(n.id)).length;
  }, [baseNotifications, dismissedIds, readIds]);

  const handleActionClick = (notif) => {
    markAsRead(notif.id);
    if (notif.externalUrl) {
      window.open(notif.externalUrl, "_blank", "noopener,noreferrer");
    } else if (notif.actionTab && onNavigateTab) {
      onNavigateTab(notif.actionTab);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 w-full max-w-7xl mx-auto">
      {/* Notifications Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-3 bg-rose-500" />
                </span>
              )}
            </div>
            <span>Notifications & Real-Time Alerts</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with upcoming scholarship deadlines, AI grant match alerts, and verification notices.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span>Mark all read</span>
            </button>
          )}

          {dismissedIds.length > 0 && (
            <button
              type="button"
              onClick={restoreDismissedNotifications}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
            >
              <span>Restore dismissed ({dismissedIds.length})</span>
            </button>
          )}

          {activeList.length > 0 && (
            <button
              type="button"
              onClick={clearAllNotifications}
              className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Clear feed</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/80 p-3 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-2 animate-rise-in">
          <Sparkles className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterCategory("all")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === "all"
              ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">All Alerts</span>
            <Bell className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {baseNotifications.filter((n) => !dismissedIds.includes(n.id)).length}
          </p>
        </div>

        <div
          onClick={() => setFilterCategory("deadline")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === "deadline"
              ? "border-rose-500 dark:border-rose-400 bg-rose-50/50 dark:bg-rose-950/40 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Deadlines</span>
            <CalendarClock className="size-4 text-rose-500" />
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {baseNotifications.filter((n) => n.category === "deadline" && !dismissedIds.includes(n.id)).length}
          </p>
        </div>

        <div
          onClick={() => setFilterCategory("match")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === "match"
              ? "border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-950/40 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">AI Matches</span>
            <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {baseNotifications.filter((n) => n.category === "match" && !dismissedIds.includes(n.id)).length}
          </p>
        </div>

        <div
          onClick={() => setFilterCategory("unread")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === "unread"
              ? "border-amber-500 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Unread</span>
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{unreadCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Filter className="size-3" /> Filter:
        </span>
        {[
          { id: "all", label: "All Alerts" },
          { id: "deadline", label: "⏰ Deadlines & Urgency" },
          { id: "match", label: "✨ AI Recommendations" },
          { id: "system", label: "🛡️ System & Privacy" },
          { id: "unread", label: `🔴 Unread (${unreadCount})` },
        ].map((tab) => {
          const isActive = filterCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Notifications Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Notifications Feed List */}
        <div className="lg:col-span-2 space-y-3">
          {activeList.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">You're all caught up!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No active notifications in this category. We will notify you immediately when new matching scholarships are released or deadlines approach.
              </p>
              {dismissedIds.length > 0 && (
                <button
                  type="button"
                  onClick={restoreDismissedNotifications}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Restore dismissed notifications
                </button>
              )}
            </div>
          ) : (
            activeList.map((notif) => {
              const Icon = notif.icon;
              const isRead = readIds.includes(notif.id);

              return (
                <div
                  key={notif.id}
                  className={`group relative rounded-2xl border transition-all p-4.5 ${
                    isRead
                      ? "border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 opacity-80"
                      : "border-blue-200 dark:border-blue-900/50 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-blue-500/10"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Category Icon Badge */}
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${notif.tint}`}
                    >
                      <Icon className="size-5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block size-2 rounded-full ${
                              isRead ? "bg-slate-300 dark:bg-slate-700" : "bg-blue-600 animate-pulse"
                            }`}
                          />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {notif.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock className="size-3" /> {notif.time}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-bold mt-1 ${
                          isRead ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {notif.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Action Bar */}
                      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleActionClick(notif)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 dark:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer hover:scale-105"
                          >
                            <span>{notif.actionLabel}</span>
                            {notif.externalUrl ? (
                              <ExternalLink className="size-3" />
                            ) : (
                              <ChevronRight className="size-3" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleRead(notif.id)}
                            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 transition-colors cursor-pointer"
                          >
                            {isRead ? "Mark as unread" : "Mark as read"}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => dismissNotification(notif.id)}
                          title="Dismiss notification"
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 1 Column: Notification Settings & Live Channels */}
        <div className="space-y-4">
          {/* Quick Alert Preference Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="size-4 text-blue-600 dark:text-blue-400" />
                Alert Channels
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab("Settings")}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Configure
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Email Alerts</p>
                  <p className="text-[11px] text-slate-400">Gmail SMTP notifications</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    emailNotifs
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {emailNotifs ? "Active" : "Muted"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Deadline Warnings</p>
                  <p className="text-[11px] text-slate-400">3-day cutoff reminders</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    deadlineReminders
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {deadlineReminders ? "Active" : "Muted"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <Mail className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Delivery email: <strong className="text-slate-900 dark:text-white">{user?.email || "student@scholarhub.edu"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* AI Matching Insights Card */}
          <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold text-purple-950 dark:text-purple-200">
                AI Match Radar Active
              </h3>
            </div>
            <p className="text-xs text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
              ScholarHub continuously scans government schemes (MahaDBT, AICTE, NSP) and private CSR endowments to find funding matching your profile.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("AI")}
              className="w-full rounded-xl bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 text-white p-2 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot className="size-3.5" />
              <span>Ask AI Counselor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsSection;
