import { useState, useEffect } from "react";
import {
  Sliders,
  Zap,
  FlaskConical,
  CheckCircle2,
  Sparkles,
  Database,
  Trash2,
  UserCheck,
  Clock,
  ShieldCheck,
  Mail,
  Sun,
  Moon,
  Monitor,
  KeyRound,
  Shield,
  RotateCcw,
  Check,
  AlertTriangle,
  Send,
  Lock,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import {
  loadSimulationProfile,
  clearProfileData,
  getStoredStudentProfile,
  calculateProfileStrength,
  SIMULATION_DEMO_PROFILES,
} from "../../lib/eligibilityEngine";
import { forgotPassword } from "../../services/authService";

const BACKEND_URL = "http://localhost:5000";

export function SettingsSection({
  onNavigateTab,
  onUpdateSavedCount,
  onUpdateAppliedCount,
}) {
  const { user, updateUser, loadSimulationSession, clearSimulationSession } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState("mode"); // mode, notifications, appearance, security
  const [modeToast, setModeToast] = useState("");
  const [profileVersion, setProfileVersion] = useState(0);

  // 1. Operational System Mode: 'realtime' vs 'simulation'
  const [systemMode, setSystemMode] = useState(() => {
    return localStorage.getItem("scholarhub_system_mode") || "realtime";
  });

  // 2. Notification Preferences State
  const [emailNotifs, setEmailNotifs] = useState(() => {
    return localStorage.getItem("scholarhub_pref_email_notifs") !== "false";
  });
  const [aiAutoEval, setAiAutoEval] = useState(() => {
    return localStorage.getItem("scholarhub_pref_ai_auto_eval") !== "false";
  });
  const [deadlineReminders, setDeadlineReminders] = useState(() => {
    return localStorage.getItem("scholarhub_pref_deadline_reminders") !== "false";
  });

  // 3. Default Landing Tab preference
  const [defaultTabPref, setDefaultTabPref] = useState(() => {
    return localStorage.getItem("scholarhub_pref_default_tab") || "Dashboard";
  });

  // Test Email state
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState("");

  // Password reset trigger state
  const [isSendingResetOtp, setIsSendingResetOtp] = useState(false);
  const [resetOtpMsg, setResetOtpMsg] = useState("");

  // Listen for profile changes to keep sandbox snapshot real-time
  useEffect(() => {
    const handleProfileUpdate = () => setProfileVersion((v) => v + 1);
    window.addEventListener("scholarhub_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("scholarhub_profile_updated", handleProfileUpdate);
  }, []);

  const triggerToast = (msg, duration = 4000) => {
    setModeToast(msg);
    setTimeout(() => setModeToast(""), duration);
  };

  const handleToggleSystemMode = (newMode) => {
    setSystemMode(newMode);
    localStorage.setItem("scholarhub_system_mode", newMode);
    triggerToast(
      newMode === "realtime"
        ? "🟢 Switched to Real-Time Live Working Mode (PostgreSQL, Gemini AI & SMTP Active)"
        : "🧪 Switched to Simulation Sandbox Mode (Demo / Offline Testing Active)"
    );
  };

  // Simulation Profile Load & Clear Handlers
  const handleLoadSimulationData = (presetIdOrIndex = 0) => {
    const loaded = loadSimulationProfile(presetIdOrIndex);
    if (loadSimulationSession) {
      loadSimulationSession(loaded.user);
    } else {
      updateUser(loaded.user);
    }
    if (onUpdateSavedCount) onUpdateSavedCount(0);
    if (onUpdateAppliedCount) onUpdateAppliedCount(0);
    setProfileVersion((v) => v + 1);
    triggerToast(
      `⚡ Loaded Simulation Profile: ${loaded.user.name} (${loaded.currentEducation.currentCourse || "Incomplete Profile Sandbox"}) — Saved & Applied reset to 0`
    );
  };

  const handleClearSimulationData = () => {
    clearProfileData();
    if (clearSimulationSession) {
      clearSimulationSession();
    } else {
      updateUser({ name: "", fullName: "", avatar: "" });
    }
    if (onUpdateSavedCount) onUpdateSavedCount(0);
    if (onUpdateAppliedCount) onUpdateAppliedCount(0);
    setProfileVersion((v) => v + 1);
    triggerToast("🧹 Profile data cleared. Sandbox is now completely clean (0% strength).");
  };

  // Preference change handlers
  const handleEmailNotifChange = (e) => {
    const checked = e.target.checked;
    setEmailNotifs(checked);
    localStorage.setItem("scholarhub_pref_email_notifs", String(checked));
    triggerToast(checked ? "Email notifications enabled" : "Email notifications muted");
  };

  const handleAiAutoEvalChange = (e) => {
    const checked = e.target.checked;
    setAiAutoEval(checked);
    localStorage.setItem("scholarhub_pref_ai_auto_eval", String(checked));
    triggerToast(checked ? "AI Auto-Evaluation enabled" : "AI Auto-Evaluation paused");
  };

  const handleDeadlineRemindersChange = (e) => {
    const checked = e.target.checked;
    setDeadlineReminders(checked);
    localStorage.setItem("scholarhub_pref_deadline_reminders", String(checked));
    triggerToast(checked ? "Deadline reminders active (3 days prior)" : "Deadline reminders disabled");
  };

  const handleDefaultTabChange = (tabName) => {
    setDefaultTabPref(tabName);
    localStorage.setItem("scholarhub_pref_default_tab", tabName);
    triggerToast(`Default landing tab set to "${tabName}" for future logins.`);
  };

  // Send Test Deadline Alert Email via Gmail SMTP Backend
  const handleSendTestDeadlineEmail = async () => {
    setIsSendingTestEmail(true);
    const recipient = user?.email || "student@scholarhub.edu";
    const studentName = user?.fullName || user?.name || "Student";

    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/send-deadline-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recipient,
          studentName,
          scholarshipName: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (MahaDBT)",
          deadline: "31 Oct 2026",
          daysLeft: 5,
          amount: "₹50,000 / Year",
          portalUrl: "https://mahadbt.maharashtra.gov.in",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTestEmailMsg(`✓ Live deadline alert email sent to ${recipient} (Message ID: ${data.messageId || "SMTP-OK"})`);
      } else {
        setTestEmailMsg(`⚠ Notice: ${data.message || "Failed to deliver email"}`);
      }
    } catch {
      setTestEmailMsg(`✓ [Simulation] Deadline alert email simulated for ${recipient}`);
    } finally {
      setIsSendingTestEmail(false);
      setTimeout(() => setTestEmailMsg(""), 6000);
    }
  };

  // Password Reset Trigger
  const handleRequestPasswordReset = async () => {
    const email = user?.email;
    if (!email) {
      setResetOtpMsg("⚠ No registered email associated with this session.");
      return;
    }
    setIsSendingResetOtp(true);
    try {
      const result = await forgotPassword({ email });
      if (result.success) {
        setResetOtpMsg(`✓ Password reset instructions & OTP sent to ${email}!`);
      } else {
        setResetOtpMsg(`ℹ ${result.message || "Reset request initiated."}`);
      }
    } catch {
      setResetOtpMsg(`✓ [Simulation] Password reset request dispatched to ${email}`);
    } finally {
      setIsSendingResetOtp(false);
      setTimeout(() => setResetOtpMsg(""), 6000);
    }
  };

  const storedProfile = getStoredStudentProfile();
  const profileStrength = calculateProfileStrength(storedProfile);

  return (
    <div className="animate-fade-in space-y-6 w-full max-w-7xl mx-auto pb-8">
      {/* Settings Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
              <Sliders className="size-5" />
            </div>
            <span>System & Account Settings</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure working mode, notification alerts, visual theme, security, and student login defaults.
          </p>
        </div>

        {/* Current Active Mode Chip */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border transition-all ${
              systemMode === "realtime"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            }`}
          >
            <span
              className={`size-2 rounded-full animate-pulse ${
                systemMode === "realtime" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {systemMode === "realtime" ? "Live Production Mode" : "Simulation Mode Active"}
          </span>
        </div>
      </div>

      {/* Global Toast Alert */}
      {modeToast && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/80 p-3 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-2 animate-rise-in">
          <Sparkles className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{modeToast}</span>
        </div>
      )}

      {/* Settings Sub-Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 scrollbar-none">
        {[
          { id: "mode", label: "⚡ Operational Mode", icon: Zap },
          { id: "notifications", label: "🔔 Alerts & Email", icon: Mail },
          { id: "appearance", label: "🎨 Theme & Display", icon: Sun },
          { id: "security", label: "🛡️ Security & Privacy", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: OPERATIONAL WORKING MODE (REAL-TIME VS SIMULATION SANDBOX) */}
      {/* ========================================================================= */}
      {activeSubTab === "mode" && (
        <div className="space-y-5 animate-fade-in">
          {/* Operational Working Mode Selector */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="size-4 text-amber-500" />
                  Platform Operational Working Mode
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Toggle between Live Real-Time database synchronization and Simulation Sandbox mode.
                </p>
              </div>
            </div>

            {/* Mode Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Real-Time Working Mode Card */}
              <div
                onClick={() => handleToggleSystemMode("realtime")}
                className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer ${
                  systemMode === "realtime"
                    ? "border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                      <Zap className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Working Mode</h3>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Live Production Mode</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="op_mode"
                    checked={systemMode === "realtime"}
                    onChange={() => handleToggleSystemMode("realtime")}
                    className="size-4 accent-blue-600 cursor-pointer"
                  />
                </div>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Live PostgreSQL Database persistence</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Live Google Gemini AI Counselor model endpoints</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Live Gmail SMTP deadline email delivery</span>
                  </li>
                </ul>
              </div>

              {/* Simulation Mode Card */}
              <div
                onClick={() => handleToggleSystemMode("simulation")}
                className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer ${
                  systemMode === "simulation"
                    ? "border-amber-500 dark:border-amber-400 bg-amber-50/40 dark:bg-amber-950/30 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                      <FlaskConical className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Simulation Sandbox Mode</h3>
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Demo & Testing Sandbox</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="op_mode"
                    checked={systemMode === "simulation"}
                    onChange={() => handleToggleSystemMode("simulation")}
                    className="size-4 accent-amber-500 cursor-pointer"
                  />
                </div>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-amber-500 shrink-0" />
                    <span>Instant demo dataset & pre-filled profile</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-amber-500 shrink-0" />
                    <span>Simulated responses without API quotas</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-amber-500 shrink-0" />
                    <span>Risk-free sandbox testing & demonstrations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sandbox Demo Student Profile Preloader & Snapshot */}
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/50 dark:bg-amber-950/30 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/70 dark:border-amber-800/50 pb-3">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-bold text-amber-950 dark:text-amber-100">
                  Simulation Profiles & Sandbox Test Suite
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/80 px-2.5 py-0.5 rounded-full">
                5 Test Presets
              </span>
            </div>

            <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
              Select a test profile below to load mock student details into the Sandbox. <strong>No bookmarks or applications are preloaded</strong> — allowing you to test real-time recommendation updates, eligibility badges (% match), threshold gates, and AI matching:
            </p>

            {/* Profile Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {SIMULATION_DEMO_PROFILES.map((preset, pIdx) => {
                const isActive = storedProfile.name === preset.profile.user.name;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleLoadSimulationData(pIdx)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer ${
                      isActive
                        ? "border-amber-500 bg-amber-100/70 dark:bg-amber-900/40 ring-2 ring-amber-500/30 shadow-md"
                        : "border-amber-200/80 dark:border-amber-800/50 bg-white/90 dark:bg-slate-900/90 hover:border-amber-400 hover:shadow-sm"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {preset.label}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/80 px-2 py-0.5 rounded-md">
                            <Check className="size-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 leading-snug">
                        {preset.tagline}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadSimulationData(pIdx);
                      }}
                      className="mt-3 w-full rounded-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white py-1.5 text-[11px] font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Zap className="size-3" />
                      <span>{isActive ? "Reload Profile" : "Load Profile"}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Clear Sandbox Button */}
            <div className="pt-2 flex items-center justify-between border-t border-amber-200/70 dark:border-amber-800/50">
              <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Want a clean slate? Reset all profile details, bookmarks, and applications to 0%.
              </span>
              <button
                type="button"
                onClick={handleClearSimulationData}
                className="rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Reset Sandbox (0%)</span>
              </button>
            </div>

            {/* Live Sandbox Snapshot Card */}
            <div className="mt-3 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-amber-200/60 dark:border-amber-800/40 p-4 text-xs space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="size-4 text-amber-600 dark:text-amber-400" />
                  Live Sandbox Snapshot ({profileStrength}% Strength)
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    profileStrength >= 30
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {profileStrength >= 30 ? "✓ Matching Engine Active" : "Details Incomplete (<30%)"}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${profileStrength}%` }}
                  className={`h-full transition-all duration-500 rounded-full ${
                    profileStrength >= 80
                      ? "bg-emerald-500"
                      : profileStrength >= 30
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-amber-500"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 font-medium block">Name</span>
                  <strong className="text-slate-800 dark:text-slate-100 truncate block">{storedProfile.name || "—"}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 font-medium block">College / Course</span>
                  <strong className="text-slate-800 dark:text-slate-100 truncate block">
                    {storedProfile.collegeName || storedProfile.currentCourse || "—"}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 font-medium block">10th / 12th / Marks</span>
                  <strong className="text-slate-800 dark:text-slate-100 block">
                    {storedProfile.tenthPercentage || "—"} | {storedProfile.twelfthPercentage || "—"} | {storedProfile.marksPercentage || "—"}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 font-medium block">Living / Cat / State</span>
                  <strong className="text-slate-800 dark:text-slate-100 truncate block">
                    {storedProfile.livingType || "—"} | {storedProfile.category || "—"} ({storedProfile.domicileState || "—"})
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sandbox Event Triggers */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FlaskConical className="size-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Simulated Event Triggers
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Trigger simulated events to test urgency countdowns, new high-match grants (95%), or instant verification:
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  triggerToast("⏳ Simulation Triggered: Application deadline shifted 5 days closer (Urgent Status)!");
                  window.dispatchEvent(new Event("scholarhub_notifications_updated"));
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="size-3.5 text-amber-500" />
                <span>Simulate Urgent Deadline</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerToast("✨ Simulation Triggered: Injected 1 New High-Match Grant (95% Match)!");
                  window.dispatchEvent(new Event("scholarhub_notifications_updated"));
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="size-3.5 text-purple-500" />
                <span>Simulate New Grant Match (95%)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerToast("🛡️ Simulation Triggered: Student Profile Credentials Verified (100% Match Eligibility)!");
                  window.dispatchEvent(new Event("scholarhub_profile_updated"));
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Simulate Instant Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: NOTIFICATION CHANNELS & LIVE EMAIL ALERTS */}
      {/* ========================================================================= */}
      {activeSubTab === "notifications" && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Mail className="size-4 text-blue-600 dark:text-blue-400" />
              Notification Channels & Preferences
            </h2>

            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Email Notifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive alerts when new matching scholarships are released</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={handleEmailNotifChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* AI Auto-Evaluation Toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">AI Auto-Evaluation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow AI counselor to auto-evaluate match scores against 50%+ threshold</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={aiAutoEval}
                  onChange={handleAiAutoEvalChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Deadline Urgency Reminders Toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">3-Day Deadline Urgency Reminders</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Get automated reminders 3 days before scholarship deadlines close</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={deadlineReminders}
                  onChange={handleDeadlineRemindersChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Live Gmail SMTP Deadline Email Delivery Tester */}
            <div className="pt-2">
              <div className="rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 p-4 sm:p-5 border border-blue-200/70 dark:border-blue-900/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Live Gmail SMTP Delivery Tester</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  ScholarHub delivers automated deadline alerts via configured Gmail SMTP (<code className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">scholarhub34@gmail.com</code>). Test delivering a live deadline alert to <strong className="text-slate-800 dark:text-slate-200">{user?.email || "your registered email"}</strong>:
                </p>

                {testEmailMsg && (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-rise-in">
                    <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{testEmailMsg}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isSendingTestEmail}
                  onClick={handleSendTestDeadlineEmail}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="size-3.5" />
                  <span>{isSendingTestEmail ? "Sending Test Email..." : "Send Test Deadline Alert Email"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: THEME & INTERFACE DISPLAY */}
      {/* ========================================================================= */}
      {activeSubTab === "appearance" && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sun className="size-4 text-amber-500" />
              Theme & Interface Customization
            </h2>

            {/* Theme Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Color Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 border-2 transition-all cursor-pointer ${
                    theme === "light"
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100"
                  }`}
                >
                  <Sun className="size-4.5 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 border-2 transition-all cursor-pointer ${
                    theme === "dark"
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100"
                  }`}
                >
                  <Moon className="size-4.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dark Mode</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 rounded-2xl p-3.5 border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all cursor-pointer col-span-2 sm:col-span-1"
                >
                  <Monitor className="size-4.5 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Toggle Theme</span>
                </button>
              </div>
            </div>

            {/* Default Landing Tab Preference */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Landing Tab Preference
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure which tab opens by default on student login:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
                {["Dashboard", "Search", "Recommended", "Details"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleDefaultTabChange(tab)}
                    className={`rounded-xl p-2.5 text-xs font-semibold transition-all border cursor-pointer ${
                      defaultTabPref === tab
                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SECURITY & DATA PRIVACY GOVERNANCE */}
      {/* ========================================================================= */}
      {activeSubTab === "security" && (
        <div className="space-y-5 animate-fade-in">
          {/* Account Status & Security */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <KeyRound className="size-4 text-blue-600 dark:text-blue-400" />
              Account Status & Security
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-medium block">Registered Email</span>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate">{user?.email || "student@scholarhub.edu"}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-medium block">Account Role</span>
                <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{user?.role || "Student"}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-medium block">Session Status</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Authenticated via JWT
                </p>
              </div>
            </div>

            {resetOtpMsg && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-rise-in">
                <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{resetOtpMsg}</span>
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                disabled={isSendingResetOtp}
                onClick={handleRequestPasswordReset}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Lock className="size-3.5" />
                <span>{isSendingResetOtp ? "Sending Reset Instructions..." : "Send Password Reset OTP"}</span>
              </button>
            </div>
          </div>

          {/* Zero-Document Storage Policy & Data Privacy Notice */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Shield className="size-4 text-emerald-600 dark:text-emerald-400" />
              Zero-Document Storage Policy & Data Privacy Governance
            </h2>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                ScholarHub strictly complies with a <strong>Zero-Document Storage Policy</strong>. To safeguard student privacy and eliminate data exposure risks, official sensitive documents (such as caste validity certificates, annual income proof, and official marksheets) are <strong>never stored or uploaded</strong> to our servers.
              </p>
              <p>
                All match calculations and eligibility evaluations are computed purely on student-provided self-reported profile metrics. Official credential verification is completed directly through authoritative government portals (MahaDBT, NSP, MahaJYOTI, Vidyasaarathi) during actual grant disbursement.
              </p>
            </div>
          </div>

          {/* Danger Zone: Reset Profile & Storage Data */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-5 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 border-b border-rose-200/70 dark:border-rose-900/50 pb-3">
              <AlertTriangle className="size-4" />
              Danger Zone: Reset Profile & Session Storage Data
            </h2>

            <p className="text-xs text-rose-800/90 dark:text-rose-300/90 leading-relaxed">
              Resetting will clear all cached profile domains, living status records, saved scholarship bookmarks, and application tracking IDs from your local session.
            </p>

            <button
              type="button"
              onClick={handleClearSimulationData}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Profile & Clear Session Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsSection;
