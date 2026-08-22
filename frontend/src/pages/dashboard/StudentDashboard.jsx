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
import {
  Sparkles,
  UserCheck,
  Search,
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

  // Dynamic Recommended Count (Match Score >= 50% only when profile passes 30% threshold)
  const recommendedCount = useMemo(() => {
    try {
      const strength = calculateProfileStrength();
      if (strength < 30) return 0;
      const evaluated = evaluateAllScholarships();
      return evaluated.filter((s) => (s.eligibilityPercent ?? s.matchScore) >= 50).length;
    } catch {
      return 0;
    }
  }, [user, activeTab, profileStrength]);

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
