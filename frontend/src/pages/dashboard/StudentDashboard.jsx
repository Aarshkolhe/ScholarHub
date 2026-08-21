import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, ShieldCheck, CheckCircle2, Save } from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import AiAssistantPill from "../../components/dashboard/AiAssistantPill";
import StatCards from "../../components/dashboard/StatCards";
import RecentScholarships from "../../components/dashboard/RecentScholarships";
import SearchScholarshipView from "../../components/dashboard/SearchScholarshipView";
import useAuth from "../../hooks/useAuth";

export function StudentDashboard() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const initialQuery = queryParams.get("q") || queryParams.get("name") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Dynamic Counters
  const [savedCount, setSavedCount] = useState(1);
  const [appliedCount, setAppliedCount] = useState(0);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.fullName || user?.name || "Student");
  const [profileEmail, setProfileEmail] = useState(user?.email || "student@scholarhub.edu");
  const [profileCourse, setProfileCourse] = useState("B.Tech Computer Science");
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Eligibility Calculator State
  const [elGpa, setElGpa] = useState("85");
  const [elIncome, setElIncome] = useState("450000");
  const [elCategory, setElCategory] = useState("STEM");
  const [elResult, setElResult] = useState(null);

  useEffect(() => {
    if (user?.fullName || user?.name) {
      setProfileName(user.fullName || user.name);
    }
  }, [user]);

  const firstName = profileName.split(" ")[0] || "Student";

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUser({ name: profileName, fullName: profileName, email: profileEmail });
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 2500);
  };

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

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onSelectTab={setActiveTab} />

        <main className="flex-1 space-y-6 px-6 py-6 max-w-7xl w-full mx-auto">
          {/* Header Search & AI Pill */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "Dashboard" && activeTab !== "Search") setActiveTab("Search");
                }}
                placeholder="Search scholarships by keyword, field, or organization..."
                aria-label="Search scholarships"
                className="w-full rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 outline-none shadow-sm transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <AiAssistantPill />
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "Dashboard" && (
            <>
              <div className="animate-rise-in flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    Welcome back, {firstName}{" "}
                    <span className="animate-wave" aria-hidden="true">
                      {"\u{1F44B}"}
                    </span>
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Here&apos;s what&apos;s happening with your scholarship applications today.
                  </p>
                </div>
              </div>

              <StatCards
                savedCount={savedCount}
                appliedCount={appliedCount}
                onSelectStatFilter={(id) => {
                  if (id === "saved") setActiveTab("Saved");
                  if (id === "recommended") setActiveTab("Recommended");
                }}
              />

              <RecentScholarships
                searchQuery={searchQuery}
                onUpdateSavedCount={setSavedCount}
                onUpdateAppliedCount={setAppliedCount}
              />
            </>
          )}

          {/* TAB 2: SEARCH SCHOLARSHIPS (DEDICATED SEARCH VIEW) */}
          {(activeTab === "Search" || activeTab === "Recommended" || activeTab === "Saved") && (
            <SearchScholarshipView
              initialQuery={searchQuery}
              onUpdateSavedCount={setSavedCount}
              onUpdateAppliedCount={setAppliedCount}
            />
          )}

          {/* TAB 3: ELIGIBILITY CHECKER */}
          {activeTab === "Eligibility" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="text-blue-600 dark:text-blue-400" />
                    AI Eligibility Checker
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Calculate your match score and grant eligibility in seconds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("Dashboard")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  &larr; Back to Dashboard
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={handleCalculateEligibility} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white">Academic & Income Inputs</h3>
                  
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Previous Score (%) / CGPA</label>
                    <input
                      type="number"
                      value={elGpa}
                      onChange={(e) => setElGpa(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Annual Family Income (₹)</label>
                    <input
                      type="number"
                      value={elIncome}
                      onChange={(e) => setElIncome(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Course Stream</label>
                    <select
                      value={elCategory}
                      onChange={(e) => setElCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    >
                      <option value="STEM">Science / STEM</option>
                      <option value="Engineering">Engineering & Technology</option>
                      <option value="General">Arts & Commerce</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold py-2.5 text-sm shadow-md hover:bg-blue-700 transition-colors"
                  >
                    Calculate Match Score
                  </button>
                </form>

                {/* Score Output */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-white">Calculated Match Results</h3>
                    {elResult ? (
                      <div className="mt-6 text-center">
                        <div className="inline-flex size-24 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-display text-3xl font-bold border-4 border-blue-500">
                          {elResult.score}%
                        </div>
                        <p className="mt-4 font-bold text-slate-900 dark:text-white">
                          {elResult.eligible ? "High Qualification Match" : "Standard Qualification Match"}
                        </p>
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-4">
                          {elResult.recommendation}
                        </p>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-xs text-slate-400">
                        Enter your academic details on the left and click "Calculate Match Score" to see your eligibility analysis.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE TAB */}
          {activeTab === "Profile" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Profile Settings</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your account details and contact information.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("Dashboard")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  &larr; Back to Dashboard
                </button>
              </div>

              <form onSubmit={handleProfileSave} className="max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                {profileSavedMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="size-4" /> Profile details saved successfully!
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Current Degree / Institution</label>
                  <input
                    type="text"
                    value={profileCourse}
                    onChange={(e) => setProfileCourse(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold py-2.5 text-sm shadow-md hover:bg-blue-700 transition-colors"
                >
                  <Save className="size-4" /> Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: SETTINGS & NOTIFICATIONS */}
          {(activeTab === "Settings" || activeTab === "Notifications") && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Preferences</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure notifications and system parameters.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("Dashboard")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  &larr; Back to Dashboard
                </button>
              </div>

              <div className="max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Email Deadline Alerts</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Receive alerts 3 days before scholarship deadlines close.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 rounded text-blue-600" />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">New Match Recommendations</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Get notified when a new scholarship matches over 90% of your profile.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 rounded text-blue-600" />
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
