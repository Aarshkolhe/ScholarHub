import { useState, useEffect } from "react";
import { SearchScholarshipView } from "../../components/dashboard/SearchScholarshipView";
import { UserProfileSection } from "../../components/dashboard/UserProfileSection";
import { StudentProfileOverview } from "../../components/dashboard/StudentProfileOverview";
import { AiAssistantHub } from "../../components/dashboard/AiAssistantHub";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { Topbar } from "../../components/dashboard/Topbar";
import { StatCards } from "../../components/dashboard/StatCards";
import { RecentScholarships } from "../../components/dashboard/RecentScholarships";
import { ShieldCheck, Sparkles } from "lucide-react";
import useAuth from "../../hooks/useAuth";

export function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [savedCount, setSavedCount] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);

  // Eligibility Calculator State
  const [elGpa, setElGpa] = useState("85");
  const [elIncome, setElIncome] = useState("450000");
  const [elCategory, setElCategory] = useState("STEM");
  const [elResult, setElResult] = useState(null);

  const firstName = (user?.fullName || user?.name || "Student").split(" ")[0];

  // Dynamically sync Eligibility inputs with updated profile data
  useEffect(() => {
    try {
      const savedEd = JSON.parse(localStorage.getItem("scholarhub_profile_education") || "{}");
      const savedFin = JSON.parse(localStorage.getItem("scholarhub_profile_financial") || "{}");
      if (savedEd.marksPercentage) {
        const parsed = parseFloat(savedEd.marksPercentage.replace("%", ""));
        if (!isNaN(parsed)) setElGpa(parsed.toString());
      }
      if (savedFin.annualIncome) {
        setElIncome(savedFin.annualIncome.toString());
      }
    } catch {}
  }, [activeTab, user]);

  const handleCalculateEligibility = (e) => {
    e.preventDefault();
    const gpa = parseFloat(elGpa) || 0;
    const income = parseFloat(elIncome) || 0;
    let score = 70;
    if (gpa >= 80) score += 20;
    if (income <= 500000) score += 10;
    setElResult({
      score: Math.min(score, 98),
      eligible: score >= 75,
      recommendation: score >= 75 ? "High match! You qualify for National Merit STEM Grant & State Tech Fund." : "Moderate match. Consider applying for First-Gen Excellence Award.",
    });
  };

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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all duration-300">
          {/* TAB 1: MAIN DASHBOARD */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 text-white shadow-xl shadow-blue-600/10">
                <div className="relative z-10 max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                    <Sparkles className="size-3.5 text-amber-300" />
                    <span>AI-Powered Matching Engine Active</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Welcome back, {firstName}! 👋
                  </h1>
                  <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
                    Your profile is active. Check out your latest scholarship recommendations and grant matches.
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("Search")}
                      className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-700 shadow-md hover:bg-blue-50 transition-colors"
                    >
                      Explore Scholarships &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Profile")}
                      className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>

              <StatCards savedCount={savedCount} appliedCount={appliedCount} />
              <RecentScholarships
                onViewAllClick={() => setActiveTab("Search")}
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

          {/* TAB 4: ELIGIBILITY CHECKER */}
          {activeTab === "Eligibility" && (
            <div className="animate-fade-in space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="size-6 text-blue-600 dark:text-blue-400" />
                  Scholarship Eligibility Engine
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Test your qualification match score against active grants using your academic and financial criteria.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <form onSubmit={handleCalculateEligibility} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    Eligibility Criteria Inputs
                  </h3>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Previous Semester / Class Score (%)</label>
                    <input
                      type="number"
                      value={elGpa}
                      onChange={(e) => setElGpa(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Annual Family Income (₹)</label>
                    <input
                      type="number"
                      value={elIncome}
                      onChange={(e) => setElIncome(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Course Stream / Discipline</label>
                    <select
                      value={elCategory}
                      onChange={(e) => setElCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    >
                      <option value="STEM">Engineering / STEM</option>
                      <option value="Medical">Medical & Healthcare</option>
                      <option value="General">Arts & Commerce</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold py-3 text-xs shadow-md hover:bg-blue-700 transition-colors"
                  >
                    Calculate Qualification Score
                  </button>
                </form>

                {/* Score Output */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                      Match Results
                    </h3>
                    {elResult ? (
                      <div className="mt-6 text-center space-y-3">
                        <div className="inline-flex size-24 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-display text-3xl font-bold border-4 border-blue-500 shadow-md">
                          {elResult.score}%
                        </div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {elResult.eligible ? "High Qualification Match" : "Standard Qualification Match"}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-4">
                          {elResult.recommendation}
                        </p>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-xs text-slate-400">
                        Click &quot;Calculate Qualification Score&quot; to evaluate your eligibility across active grants.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("Recommended")}
                    className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold py-2.5 text-xs shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <Sparkles className="size-4 text-amber-300" /> View Recommended Grants &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STUDENT PROFILE OVERVIEW */}
          {activeTab === "Profile" && <StudentProfileOverview onNavigateTab={setActiveTab} />}

          {/* TAB 6: ELIGIBILITY DETAILS FORM */}
          {activeTab === "Details" && <UserProfileSection />}

          {/* TAB 7: SETTINGS */}
          {activeTab === "Settings" && (
            <div className="animate-fade-in space-y-6 max-w-2xl">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
                Account Settings
              </h1>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Notifications</h3>
                    <p className="text-xs text-slate-500">Receive alerts when new matching scholarships are released</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 accent-blue-600" />
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Matching System</h3>
                    <p className="text-xs text-slate-500">Allow AI assistant to auto-evaluate profile criteria</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 accent-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deadline Alerts</h3>
                    <p className="text-xs text-slate-500">Get reminders 3 days before scholarship deadlines close</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 accent-blue-600" />
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
