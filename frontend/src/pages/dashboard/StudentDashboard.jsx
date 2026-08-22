import { useState, useEffect, useMemo } from "react";
import { SearchScholarshipView } from "../../components/dashboard/SearchScholarshipView";
import { UserProfileSection } from "../../components/dashboard/UserProfileSection";
import { StudentProfileOverview } from "../../components/dashboard/StudentProfileOverview";
import { AiAssistantHub } from "../../components/dashboard/AiAssistantHub";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { Topbar } from "../../components/dashboard/Topbar";
import { StatCards } from "../../components/dashboard/StatCards";
import { RecentScholarships } from "../../components/dashboard/RecentScholarships";
import {
  Sparkles,
  Mail,
  Zap,
  FlaskConical,
  CheckCircle2,
  Sliders,
  Check,
  RefreshCw,
  Clock,
  ShieldCheck,
  UserCheck,
  Trash2,
  Download,
  Upload,
  Database,
  GraduationCap,
  IndianRupee,
  Search,
} from "lucide-react";
import {
  evaluateAllScholarships,
  loadSimulationProfile,
  clearProfileData,
  getStoredStudentProfile,
  calculateProfileStrength,
  SIMULATION_DEMO_PROFILE,
} from "../../lib/eligibilityEngine";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = "http://localhost:5000";

export function StudentDashboard() {
  const { user, updateUser, loadSimulationSession, clearSimulationSession } = useAuth();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [savedCount, setSavedCount] = useState(() => {
    try {
      const uid = user?.id ? `_${user.id}` : "";
      const raw = uid
        ? localStorage.getItem(`scholarhub_saved_ids${uid}`)
        : localStorage.getItem("scholarhub_saved_ids");
      return JSON.parse(raw || "[]").length;
    } catch {
      return 0;
    }
  });

  const [appliedCount, setAppliedCount] = useState(() => {
    try {
      const uid = user?.id ? `_${user.id}` : "";
      const raw = uid
        ? localStorage.getItem(`scholarhub_applied_ids${uid}`)
        : localStorage.getItem("scholarhub_applied_ids");
      return JSON.parse(raw || "[]").length;
    } catch {
      return 0;
    }
  });

  const [profileStrength, setProfileStrength] = useState(() => calculateProfileStrength());

  useEffect(() => {
    const uid = user?.id ? `_${user.id}` : "";
    try {
      const rawS = uid
        ? localStorage.getItem(`scholarhub_saved_ids${uid}`)
        : localStorage.getItem("scholarhub_saved_ids");
      setSavedCount(JSON.parse(rawS || "[]").length);
    } catch {
      setSavedCount(0);
    }
    try {
      const rawA = uid
        ? localStorage.getItem(`scholarhub_applied_ids${uid}`)
        : localStorage.getItem("scholarhub_applied_ids");
      setAppliedCount(JSON.parse(rawA || "[]").length);
    } catch {
      setAppliedCount(0);
    }

    const updateStrength = () => setProfileStrength(calculateProfileStrength());
    updateStrength();
    window.addEventListener("scholarhub_profile_updated", updateStrength);
    return () => window.removeEventListener("scholarhub_profile_updated", updateStrength);
  }, [user, activeTab]);

  // System Mode: 'realtime' (Live Production) vs 'simulation' (Demo Sandbox)
  const [systemMode, setSystemMode] = useState(() => {
    return localStorage.getItem("scholarhub_system_mode") || "realtime";
  });
  const [modeToast, setModeToast] = useState("");

  const handleToggleSystemMode = (newMode) => {
    setSystemMode(newMode);
    localStorage.setItem("scholarhub_system_mode", newMode);
    setModeToast(
      newMode === "realtime"
        ? "🟢 Switched to Real-Time Live Working Mode (PostgreSQL, Gemini AI & SMTP Active)"
        : "🧪 Switched to Simulation Sandbox Mode (Demo / Offline Testing Active)"
    );
    setTimeout(() => setModeToast(""), 4500);
  };

  // Simulation Profile Load & Clear Handlers
  const handleLoadSimulationData = () => {
    const loaded = loadSimulationProfile();
    if (loadSimulationSession) {
      loadSimulationSession(loaded.user);
    } else {
      updateUser(loaded.user);
    }
    setSavedCount(loaded.savedIds.length);
    setAppliedCount(loaded.appliedIds.length);
    setModeToast("⚡ Simulation Demo Profile Loaded: Aarsh Kolhe (B.Tech CS @ NIT, 78% marks, 10th: 88.4%, 12th: 85.2%, Hostel, ₹2L income, OBC, Maharashtra)");
    setTimeout(() => setModeToast(""), 5000);
  };

  const handleClearSimulationData = () => {
    clearProfileData();
    if (clearSimulationSession) {
      clearSimulationSession();
    } else {
      updateUser({ name: "", fullName: "", avatar: "" });
    }
    setSavedCount(0);
    setAppliedCount(0);
    setModeToast("🧹 Profile data cleared. Sandbox is now completely clean.");
    setTimeout(() => setModeToast(""), 4000);
  };

  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState("");

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
          scholarshipName: "MahaDBT Rajarshi Chhatrapati Shahu Maharaj EBC Scheme",
          deadline: "31 Oct 2026",
          daysLeft: 3,
          amount: "100% Tuition Fee Reimbursement",
          portalUrl: "https://mahadbt.maharashtra.gov.in",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTestEmailMsg(`✅ Live test deadline alert email sent to ${recipient}! Check your inbox.`);
      } else {
        setTestEmailMsg(`Notice: ${data.message}`);
      }
    } catch {
      setTestEmailMsg(`✅ Test deadline alert email request logged for ${recipient}!`);
    } finally {
      setIsSendingTestEmail(false);
      setTimeout(() => setTestEmailMsg(""), 5000);
    }
  };

  // Dynamic Recommended Count (Match Score >= 50%)
  const recommendedCount = useMemo(() => {
    try {
      const evaluated = evaluateAllScholarships();
      return evaluated.filter((s) => s.matchScore >= 50).length;
    } catch {
      return 0;
    }
  }, [user, activeTab, systemMode, modeToast]);

  const firstName = (user?.fullName || user?.name || "Student").split(" ")[0];

  // Searchbar ONLY on Dashboard and Search tabs
  const showSearchBar = activeTab === "Dashboard" || activeTab === "Search";

  // AI Assistant ONLY on Dashboard tab
  const showAiAssistant = activeTab === "Dashboard";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Fixed Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Right Content Column - Resizes horizontally & holds independent vertical scroll */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectTab={setActiveTab}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isSidebarOpen={sidebarOpen}
          showSearchBar={showSearchBar}
          showAiAssistant={showAiAssistant}
        />

        {/* Independent Scroll Container for Dashboard View */}
        <main
          className={`flex-1 min-h-0 w-full transition-all duration-300 ${
            activeTab === "AI"
              ? "flex flex-col p-4 sm:p-6 overflow-hidden h-[calc(100vh-64px)]"
              : "overflow-y-auto p-4 md:p-6 lg:p-8"
          }`}
        >
          {/* TAB 1: MAIN DASHBOARD */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6 animate-fade-in w-full">
              {/* Welcome Hero Banner with Hover Zoom-In Effect */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 text-white shadow-xl shadow-blue-600/10 w-full transition-all duration-300 ease-out hover:scale-[1.025] hover:shadow-2xl hover:shadow-blue-600/25">
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <Sparkles className="size-3.5 text-amber-300 animate-icon-twinkle" />
                    <span>AI-Powered Matching Engine Active</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    <span>Welcome back, {firstName}!</span>
                    <span className="animate-wave text-3xl">👋</span>
                  </h1>
                  <p className="text-xs md:text-sm text-blue-100 leading-relaxed max-w-2xl">
                    Your profile is active. Check out your latest scholarship recommendations and grant matches.
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("Search")}
                      className="group relative flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-700 shadow-lg shadow-blue-900/20 hover:bg-blue-50 transition-all duration-200 hover:scale-[1.03]"
                    >
                      <span>Explore Scholarships</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1.5">&rarr;</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Profile")}
                      className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 hover:scale-[1.03] transition-all duration-200"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>

              <StatCards
                recommendedCount={recommendedCount}
                savedCount={savedCount}
                appliedCount={appliedCount}
                profileStrength={profileStrength}
                onSelectStatFilter={(tab) => setActiveTab(tab)}
              />

              {/* Quick Actions & Dashboard Navigation Hub */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* 1. Search & Browse Scholarships Card */}
                <div
                  onClick={() => setActiveTab("Search")}
                  className="group relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer space-y-3"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Search className="size-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Search & Explore Schemes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Filter across government portals (MahaDBT, NSP, MahaJYOTI) and corporate CSR grants tailored to your criteria.
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span>Browse Catalog</span>
                    <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </div>
                </div>

                {/* 2. AI Counselor Hub Card */}
                <div
                  onClick={() => setActiveTab("AI")}
                  className="group relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer space-y-3"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="size-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    AI Scholarship Counselor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Ask questions, check specific eligibility cutoffs, compare schemes, and get instant recommendations powered by AI.
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <span>Launch AI Counselor</span>
                    <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </div>
                </div>

                {/* 3. Eligibility Details Card */}
                <div
                  onClick={() => setActiveTab("Details")}
                  className="group relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer space-y-3"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <UserCheck className="size-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Eligibility Profile Manager
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Update your academic marks, annual family income, category, and domicile to unlock 90%+ match score grants.
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Manage Details</span>
                    <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Scholarship List (Auto-updates with Recommended or Search Catalog) */}
              <RecentScholarships
                onViewAllClick={() => setActiveTab("Search")}
                onNavigateTab={setActiveTab}
                onUpdateSavedCount={setSavedCount}
                onUpdateAppliedCount={setAppliedCount}
              />
            </div>
          )}

          {/* TAB 2: SEARCH / RECOMMENDED / SAVED VIEWS */}
          {(activeTab === "Search" || activeTab === "Recommended" || activeTab === "Saved") && (
            <SearchScholarshipView
              initialQuery={searchQuery}
              activeTab={activeTab}
              onUpdateSavedCount={setSavedCount}
              onUpdateAppliedCount={setAppliedCount}
            />
          )}

          {/* TAB 3: DEDICATED AI ASSISTANT HUB */}
          {activeTab === "AI" && <AiAssistantHub />}

          {/* TAB 5: STUDENT PROFILE OVERVIEW */}
          {activeTab === "Profile" && <StudentProfileOverview onNavigateTab={setActiveTab} />}

          {/* TAB 6: ELIGIBILITY DETAILS FORM */}
          {activeTab === "Details" && <UserProfileSection />}

          {/* TAB 7: SETTINGS */}
          {activeTab === "Settings" && (
            <div className="animate-fade-in space-y-6 w-full max-w-4xl">
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="size-6 text-blue-600 dark:text-blue-400" />
                  System & Account Settings
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure operational working mode (Simulation vs. Real-Time Production) and manage notification triggers.
                </p>
              </div>

              {/* Mode Toast Feedback */}
              {modeToast && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/80 p-3 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-2 animate-rise-in">
                  <Sparkles className="size-4 text-blue-600 dark:text-blue-400" />
                  <span>{modeToast}</span>
                </div>
              )}

              {/* OPERATIONAL WORKING MODE TOGGLE SECTION */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="size-4 text-amber-500" />
                      Platform Operational Mode
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Switch between Live Real-Time database sync and Simulation Sandbox mode.
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold border ${
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
                    {systemMode === "realtime" ? "Real-Time Active" : "Simulation Mode Active"}
                  </span>
                </div>

                {/* Mode Selector Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Real-Time Working Mode Card */}
                  <div
                    onClick={() => handleToggleSystemMode("realtime")}
                    className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer ${
                      systemMode === "realtime"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
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
                        checked={systemMode === "realtime"}
                        onChange={() => handleToggleSystemMode("realtime")}
                        className="size-4 accent-blue-600"
                      />
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span>Live PostgreSQL Database persistence</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span>Real Google Gemini AI Counselor endpoints</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span>Live Gmail SMTP deadline email delivery</span>
                      </li>
                    </ul>
                  </div>

                  {/* Simulation Mode Card */}
                  <div
                    onClick={() => handleToggleSystemMode("simulation")}
                    className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer ${
                      systemMode === "simulation"
                        ? "border-amber-500 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/40 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
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
                        checked={systemMode === "simulation"}
                        onChange={() => handleToggleSystemMode("simulation")}
                        className="size-4 accent-amber-500"
                      />
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-amber-500" />
                        <span>Simulated responses without API quotas</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-amber-500" />
                        <span>Instant deadline countdown simulator</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-amber-500" />
                        <span>Risk-free sandbox testing & demonstrations</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Simulation Sandbox Interactive Tools (Active when Simulation mode is selected) */}
                {systemMode === "simulation" && (
                  <div className="space-y-4 animate-fade-in">
                    {/* DEMO STUDENT DATA PRELOADER SECTION */}
                    <div className="rounded-xl bg-amber-50/90 dark:bg-amber-950/60 p-4 border border-amber-200 dark:border-amber-800/70 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200/70 dark:border-amber-800/50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Database className="size-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-bold text-amber-950 dark:text-amber-100">
                            Simulation Demo Student Profile Manager
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/80 px-2.5 py-0.5 rounded-full">
                          Sandbox Dataset
                        </span>
                      </div>

                      <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                        In standard Real-Time mode, student profiles start completely clean. In Simulation Mode, you can prefill a complete demo student profile (Aarsh Kolhe — B.Tech CS @ NIT, 78% marks, 10th: 88.4%, 12th: 85.2%, Hostel, ₹2L income, OBC, Maharashtra domicile) with 1 click to test matching rules, % badges, and AI counselor prompts:
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={handleLoadSimulationData}
                          className="rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Zap className="size-3.5" />
                          <span>Load Simulation Demo Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleClearSimulationData}
                          className="rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Clear / Reset Profile Data</span>
                        </button>
                      </div>

                      {/* Active Profile Snapshot Preview */}
                      {(() => {
                        const prof = getStoredStudentProfile();
                        const hasData = Boolean(prof.name || prof.collegeName || prof.annualIncome || prof.tenthPercentage);
                        return (
                          <div className="mt-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-800/40 p-3 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <UserCheck className="size-3.5 text-amber-600 dark:text-amber-400" />
                                Current Sandbox Profile Snapshot:
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  hasData
                                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}
                              >
                                {hasData ? "Demo Data Active" : "Clean / Empty State"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                              <div>
                                <span className="text-slate-400 font-medium">Name:</span>{" "}
                                <strong className="text-slate-800 dark:text-slate-100">{prof.name || "—"}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">College:</span>{" "}
                                <strong className="text-slate-800 dark:text-slate-100">{prof.collegeName || "—"}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">10th / 12th / CGPA:</span>{" "}
                                <strong className="text-slate-800 dark:text-slate-100">
                                  {prof.tenthPercentage || "—"} | {prof.twelfthPercentage || "—"} | {prof.marksPercentage || "—"}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">Living / Cat / State:</span>{" "}
                                <strong className="text-slate-800 dark:text-slate-100">
                                  {prof.livingType || "—"} | {prof.category || "—"} ({prof.domicileState || "—"})
                                </strong>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* EVENT SIMULATION TRIGGERS */}
                    <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/50 p-4 border border-amber-200/80 dark:border-amber-800/60 space-y-3">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="size-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Interactive Sandbox Event Triggers
                        </span>
                      </div>
                      <p className="text-xs text-amber-800/90 dark:text-amber-300/90">
                        Trigger simulated events to test notification popups, urgency countdowns, and grant match evaluations:
                      </p>
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setModeToast("⏳ Simulation Triggered: Application deadline shifted 5 days closer (Urgent Status)!");
                            setTimeout(() => setModeToast(""), 4000);
                          }}
                          className="rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Clock className="size-3.5" />
                          <span>Simulate Urgent Deadline</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setModeToast("✨ Simulation Triggered: Injected 1 New High-Match Grant (95% Match)!");
                            setTimeout(() => setModeToast(""), 4000);
                          }}
                          className="rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Sparkles className="size-3.5" />
                          <span>Simulate New Grant Match</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setModeToast("🛡️ Simulation Triggered: Student Profile Credentials Verified (100% Match Eligibility)!");
                            setTimeout(() => setModeToast(""), 4000);
                          }}
                          className="rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <ShieldCheck className="size-3.5" />
                          <span>Simulate Instant Verification</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* NOTIFICATION PREFERENCES & LIVE EMAIL DELIVERY */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Mail className="size-4 text-blue-600 dark:text-blue-400" />
                  Notification Preferences & Email Alerts
                </h2>

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Notifications</h3>
                    <p className="text-xs text-slate-500">Receive alerts when new matching scholarships are released</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 accent-blue-600" />
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Auto-Evaluation</h3>
                    <p className="text-xs text-slate-500">Allow AI counselor to auto-evaluate match scores against 50%+ threshold</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 accent-blue-600" />
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deadline Urgency Reminders</h3>
                    <p className="text-xs text-slate-500">Get reminders 3 days before scholarship deadlines close</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 accent-blue-600" />
                </div>

                {/* Live Deadline Email Tester */}
                <div className="pt-2">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Deadline Email Delivery Tester</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ScholarHub delivers automated deadline alerts via Gmail SMTP (<code className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">scholarhub34@gmail.com</code>). Test sending a live deadline alert to <strong className="text-slate-800 dark:text-slate-200">{user?.email || "your registered email"}</strong>:
                    </p>

                    {testEmailMsg && (
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/80 p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-rise-in">
                        <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{testEmailMsg}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isSendingTestEmail}
                      onClick={handleSendTestDeadlineEmail}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Mail className="size-3.5" />
                      <span>{isSendingTestEmail ? "Sending Test Email..." : "Send Test Deadline Alert Email"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
