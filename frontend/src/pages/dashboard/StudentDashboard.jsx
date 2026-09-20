import { useState, useEffect, useMemo } from "react";
import { SearchScholarshipView } from "../../components/dashboard/SearchScholarshipView";
import { UserProfileSection } from "../../components/dashboard/UserProfileSection";
import { StudentProfileOverview } from "../../components/dashboard/StudentProfileOverview";
import { AiAssistantHub } from "../../components/dashboard/AiAssistantHub";
import { NotificationsSection } from "../../components/dashboard/NotificationsSection";
import { SettingsSection } from "../../components/dashboard/SettingsSection";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { Topbar } from "../../components/dashboard/Topbar";
import { StatCards } from "../../components/dashboard/StatCards";
import { RecentScholarships } from "../../components/dashboard/RecentScholarships";
import Aurora from "../../components/ui/Aurora";
import SpotlightCard from "../../components/ui/SpotlightCard";
import {
  Sparkles,
  UserCheck,
  Search,
  ArrowRight,
} from "lucide-react";
import {
  evaluateAllScholarships,
  calculateProfileStrength,
} from "../../lib/eligibilityEngine";
import useAuth from "../../hooks/useAuth";

export function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("scholarhub_pref_default_tab") || "Dashboard";
  });
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

  const recommendedCount = useMemo(() => {
    try {
      const strength = calculateProfileStrength();
      if (strength < 30) return 0;
      const evaluated = evaluateAllScholarships();
      return evaluated.filter((s) => s.isEligible).length;
    } catch {
      return 0;
    }
  }, [user, activeTab, profileStrength]);

  const firstName = (user?.fullName || user?.name || "Student").split(" ")[0];

  const showSearchBar = activeTab === "Dashboard" || activeTab === "Search";
  const showAiAssistant = activeTab === "Dashboard";

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 dark:bg-[#0b0e1b] font-sans text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* Dynamic WebGL Aurora Background Canvas */}
      <div className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-60 z-0 overflow-hidden">
        <Aurora
          colorStops={["#6366f1", "#a855f7", "#ec4899"]}
          blend={0.6}
          amplitude={1.15}
          speed={0.8}
        />
      </div>

      {/* Radial Glow Layer for Ambient Depth */}
      <div className="absolute top-0 left-1/4 size-[600px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 size-[600px] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none z-0" />

      {/* 1. Full-Width Edge-to-Edge Topbar Header */}
      <div className="relative z-30 w-full">
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectTab={setActiveTab}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isSidebarOpen={sidebarOpen}
          showSearchBar={showSearchBar}
          showAiAssistant={showAiAssistant}
        />
      </div>

      {/* 2. Main Workspace Body Container */}
      <div className="relative z-10 flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Floating Capsule Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Scrollable Workspace Container */}
        <main
          className={`flex-1 min-h-0 w-full transition-all duration-300 ${
            activeTab === "AI"
              ? "flex flex-col p-4 sm:p-6 overflow-hidden h-[calc(100vh-65px)]"
              : "overflow-y-auto p-4 md:p-6 lg:p-8"
          }`}
        >
          {/* TAB 1: MAIN DASHBOARD */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto">
              {/* Ultra-Modern Hero Banner */}
              <div className="group relative overflow-hidden rounded-[2.2rem] bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 p-6 md:p-8 text-white shadow-2xl shadow-indigo-500/20 w-full transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-indigo-500/30">
                {/* Abstract Glass Geometric Accents */}
                <div className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold backdrop-blur-xl border border-white/20 hover:bg-white/25 transition-all duration-300 shadow-sm">
                    <Sparkles className="size-3.5 text-amber-300 animate-icon-twinkle" />
                    <span>AI-Powered Grant Engine Active</span>
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight flex items-center gap-3">
                    <span>Welcome back, {firstName}!</span>
                    <span className="animate-wave text-4xl">🖐️</span>
                  </h1>

                  <p className="text-xs md:text-sm text-indigo-100 leading-relaxed max-w-2xl font-medium">
                    Your profile is active and synced. Explore your personalized scholarship recommendations, application statuses, and grant matches below.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("Search")}
                      className="group/btn relative flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3 text-xs font-extrabold text-violet-700 shadow-xl shadow-indigo-950/20 hover:bg-violet-50 transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    >
                      <span>Explore Scholarships</span>
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Profile")}
                      className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-xl hover:bg-white/20 hover:scale-[1.03] active:scale-95 transition-all duration-300"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Glassmorphic Stat Cards Section with Cursor Spotlight */}
              <StatCards
                recommendedCount={recommendedCount}
                savedCount={savedCount}
                appliedCount={appliedCount}
                profileStrength={profileStrength}
                onSelectStatFilter={(tab) => setActiveTab(tab)}
              />

              {/* Vibrant Neomorphic Quick Action Spotlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                {/* Card 1: Search & Browse (Sky Blue / Violet Theme Spotlight) */}
                <SpotlightCard
                  spotlightColor="rgba(56, 189, 248, 0.25)"
                  onClick={() => setActiveTab("Search")}
                  className="group relative rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#151929]/85 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] cursor-pointer space-y-4 overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 size-24 rounded-full bg-blue-500/10 blur-xl group-hover:scale-150 transition-transform pointer-events-none" />
                  <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Search className="size-7" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Search & Explore Schemes
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5">
                      Filter government portals (MahaDBT, NSP, MahaJYOTI) and corporate CSR grants tailored to your domicile.
                    </p>
                  </div>
                  <div className="relative z-10 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span>Browse Catalog</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
                  </div>
                </SpotlightCard>

                {/* Card 2: AI Counselor Hub (Coral / Pink Spotlight) */}
                <SpotlightCard
                  spotlightColor="rgba(244, 114, 182, 0.25)"
                  onClick={() => setActiveTab("AI")}
                  className="group relative rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#151929]/85 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] cursor-pointer space-y-4 overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 size-24 rounded-full bg-purple-500/10 blur-xl group-hover:scale-150 transition-transform pointer-events-none" />
                  <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Sparkles className="size-7" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      AI Scholarship Counselor
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5">
                      Ask questions, check specific eligibility cutoffs, compare schemes, and get instant recommendations powered by AI.
                    </p>
                  </div>
                  <div className="relative z-10 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-pink-600 dark:text-pink-400">
                    <span>Launch AI Counselor</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
                  </div>
                </SpotlightCard>

                {/* Card 3: Eligibility Manager (Emerald / Teal Spotlight) */}
                <SpotlightCard
                  spotlightColor="rgba(45, 212, 191, 0.25)"
                  onClick={() => setActiveTab("Details")}
                  className="group relative rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#151929]/85 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] cursor-pointer space-y-4 overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 size-24 rounded-full bg-teal-500/10 blur-xl group-hover:scale-150 transition-transform pointer-events-none" />
                  <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <UserCheck className="size-7" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Eligibility Profile Manager
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5">
                      Update your academic marks, annual family income, category, and domicile to unlock 90%+ match score grants.
                    </p>
                  </div>
                  <div className="relative z-10 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-teal-600 dark:text-teal-400">
                    <span>Manage Details</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
                  </div>
                </SpotlightCard>
              </div>

              {/* Dynamic Scholarship Directory */}
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
              onNavigateTab={setActiveTab}
              onUpdateSavedCount={setSavedCount}
              onUpdateAppliedCount={setAppliedCount}
            />
          )}

          {/* TAB 3: DEDICATED AI ASSISTANT HUB */}
          {activeTab === "AI" && <AiAssistantHub />}

          {/* TAB 4: NOTIFICATIONS & ALERTS */}
          {activeTab === "Notifications" && (
            <NotificationsSection onNavigateTab={setActiveTab} />
          )}

          {/* TAB 5: STUDENT PROFILE OVERVIEW */}
          {activeTab === "Profile" && <StudentProfileOverview onNavigateTab={setActiveTab} />}

          {/* TAB 6: ELIGIBILITY DETAILS FORM */}
          {activeTab === "Details" && <UserProfileSection />}

          {/* TAB 7: SETTINGS & SYSTEM SANDBOX */}
          {activeTab === "Settings" && (
            <SettingsSection
              onNavigateTab={setActiveTab}
              onUpdateSavedCount={setSavedCount}
              onUpdateAppliedCount={setAppliedCount}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
