import { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  X,
} from "lucide-react";
import {
  getStoredStudentProfile,
  evaluateEligibility,
} from "../../lib/eligibilityEngine";
import { SCHOLARSHIPS_DATABASE } from "../../lib/scholarshipData";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = "http://localhost:5000";

export function SearchScholarshipView({
  initialQuery = "",
  activeTab = "Search",
  onUpdateSavedCount,
  onUpdateAppliedCount,
}) {
  const { user } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [selectedPortal, setSelectedPortal] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDegree, setSelectedDegree] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [activeModalScholarship, setActiveModalScholarship] = useState(null);
  const [applyModalScholarship, setApplyModalScholarship] = useState(null);
  const [applicantName, setApplicantName] = useState(user?.fullName || user?.name || "");
  const [applicantCourse, setApplicantCourse] = useState("B.Tech Computer Science");
  const [applicantStatement, setApplicantStatement] = useState("");
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSuccessMsg, setAppSuccessMsg] = useState("");

  const studentProfile = useMemo(() => getStoredStudentProfile(), [user]);

  // Saved IDs tracking
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("scholarhub_saved_ids") || "[]");
    } catch {
      return [1];
    }
  });

  // Applied IDs tracking
  const [appliedIds, setAppliedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("scholarhub_applied_ids") || "[]");
    } catch {
      return [];
    }
  });

  const toggleSave = (id, e) => {
    if (e) e.stopPropagation();
    let next;
    if (savedIds.includes(id)) {
      next = savedIds.filter((item) => item !== id);
    } else {
      next = [...savedIds, id];
    }
    setSavedIds(next);
    localStorage.setItem("scholarhub_saved_ids", JSON.stringify(next));
    if (onUpdateSavedCount) onUpdateSavedCount(next.length);
  };

  // Evaluated database scholarships
  const evaluatedScholarships = useMemo(() => {
    return SCHOLARSHIPS_DATABASE.map((s) => {
      const evalResult = evaluateEligibility(s, studentProfile);
      return {
        ...s,
        ...evalResult,
      };
    });
  }, [studentProfile]);

  const filteredList = useMemo(() => {
    return evaluatedScholarships.filter((s) => {
      // Tab filter
      if (activeTab === "Saved" && !savedIds.includes(s.id)) return false;
      if (activeTab === "Recommended" && (!s.isEligible || s.matchScore < 85)) return false;

      // Keyword query
      if (query.trim()) {
        const q = query.toLowerCase();
        const mName = s.name.toLowerCase().includes(q);
        const mCat = s.category.toLowerCase().includes(q);
        const mProv = s.provider.toLowerCase().includes(q);
        if (!mName && !mCat && !mProv) return false;
      }

      // Portal pill filter
      if (selectedPortal === "MahaDBT" && !s.portalUrl?.includes("mahadbt")) return false;
      if (selectedPortal === "MahaJYOTI" && !s.portalUrl?.includes("mahajyoti")) return false;
      if (selectedPortal === "Vidyasaarathi" && !s.portalUrl?.includes("vidyasaarathi")) return false;

      // Eligibility Status filter
      if (selectedStatus === "Eligible Only" && !s.isEligible) return false;
      if (selectedStatus === "Not Eligible" && s.isEligible) return false;

      // Degree filter
      if (selectedDegree !== "All" && s.degreeLevel && s.degreeLevel !== selectedDegree) return false;

      // Category filter
      if (selectedCategory !== "All" && s.category !== selectedCategory) return false;

      return true;
    });
  }, [evaluatedScholarships, query, selectedPortal, selectedStatus, selectedDegree, selectedCategory, activeTab, savedIds]);

  const handleOpenApplyModal = (s, e) => {
    if (e) e.stopPropagation();
    setApplyModalScholarship(s);
    setActiveModalScholarship(null);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyModalScholarship) return;

    setIsSubmittingApp(true);
    const nextApplied = [...appliedIds, applyModalScholarship.id];

    try {
      await fetch(`${BACKEND_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scholarshipId: applyModalScholarship.id,
          scholarshipName: applyModalScholarship.name,
          applicantName,
          course: applicantCourse,
          statement: applicantStatement,
        }),
      });
    } catch {
      // Local fallback
    } finally {
      setAppliedIds(nextApplied);
      localStorage.setItem("scholarhub_applied_ids", JSON.stringify(nextApplied));
      if (onUpdateAppliedCount) onUpdateAppliedCount(nextApplied.length);

      setIsSubmittingApp(false);
      setAppSuccessMsg(`Application for "${applyModalScholarship.name}" saved successfully!`);
      setApplyModalScholarship(null);
      setTimeout(() => setAppSuccessMsg(""), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {activeTab === "Saved"
            ? "Bookmarked Scholarships"
            : activeTab === "Recommended"
            ? "Top AI Recommended Grants"
            : "Search Scholarship Directory"}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore government schemes (MahaDBT, MahaJYOTI) and private CSR grants evaluated directly against your student profile.
        </p>
      </div>

      {/* Success Toast */}
      {appSuccessMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-rise-in">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{appSuccessMsg}</span>
        </div>
      )}

      {/* Search Input & Portal Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, scheme name, or provider (e.g. MahaDBT, STEM, Post-Matric)..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 outline-none shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Portal Source Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">Portals:</span>
          {[
            { id: "All", label: "All Portals" },
            { id: "MahaDBT", label: "🏛️ MahaDBT Portal" },
            { id: "MahaJYOTI", label: "🏛️ MahaJYOTI Portal" },
            { id: "Vidyasaarathi", label: "🏢 Vidyasaarathi Portal" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPortal(p.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selectedPortal === p.id
                  ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Multi-Criterion Dropdown Filter Row */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <SlidersHorizontal className="size-3.5 text-blue-600" /> Filters:
          </span>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-100 outline-none"
          >
            <option value="All">All Eligibility Statuses</option>
            <option value="Eligible Only">Eligible Only</option>
            <option value="Not Eligible">Not Eligible</option>
          </select>

          <select
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-100 outline-none"
          >
            <option value="All">All Degree Levels</option>
            <option value="Undergraduate">Undergraduate (UG)</option>
            <option value="Postgraduate">Postgraduate (PG)</option>
            <option value="Doctorate">Doctorate (PhD)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-100 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredList.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400">
          No scholarships found matching your specified filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((s) => {
            const isSaved = savedIds.includes(s.id);
            const isApplied = appliedIds.includes(s.id);

            return (
              <div
                key={s.id}
                onClick={() => setActiveModalScholarship(s)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        s.isEligible
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                      }`}
                    >
                      {s.isEligible ? (
                        <>
                          <CheckCircle2 className="size-3" /> Eligible ({s.matchScore}%)
                        </>
                      ) : (
                        <>
                          <AlertCircle className="size-3" /> Not Eligible ({s.matchScore}%)
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => toggleSave(s.id, e)}
                      title={isSaved ? "Saved" : "Save scholarship"}
                      className={`rounded-full p-1.5 transition-colors ${
                        isSaved
                          ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                      }`}
                    >
                      <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <h3 className="mt-3 font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {s.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {s.provider}
                  </p>

                  {!s.isEligible && s.reasons.length > 0 && (
                    <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium line-clamp-1">
                      &bull; {s.reasons[0]}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Award Amount</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{s.amountFormatted}</p>
                  </div>

                  {isApplied ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> Applied
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleOpenApplyModal(s, e)}
                      className="rounded-xl bg-blue-600 dark:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCHOLARSHIP DETAIL MODAL */}
      {activeModalScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    activeModalScholarship.isEligible
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {activeModalScholarship.isEligible ? "Eligible" : "Not Eligible"} ({activeModalScholarship.matchScore}% Match)
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {activeModalScholarship.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeModalScholarship.provider}</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalScholarship(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Overview</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeModalScholarship.description}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                  Criteria Breakdown
                </p>
                {activeModalScholarship.criteriaBreakdown?.map((crit, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-slate-600 dark:text-slate-400">{crit.label}</span>
                    <span className={`font-semibold ${crit.status === "passed" ? "text-emerald-600" : "text-rose-600"}`}>
                      {crit.status === "passed" ? "✓ Passed" : "✕ Failed"} ({crit.detail})
                    </span>
                  </div>
                ))}
              </div>

              {activeModalScholarship.portalUrl && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Official Portal Link:</span>
                  <a
                    href={activeModalScholarship.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {activeModalScholarship.portalUrl} <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setActiveModalScholarship(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={(e) => handleOpenApplyModal(activeModalScholarship, e)}
                className="rounded-xl bg-blue-600 dark:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION FORM MODAL */}
      {applyModalScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Apply for {applyModalScholarship.name}
              </h3>
              <button
                type="button"
                onClick={() => setApplyModalScholarship(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Applicant Full Name</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Current Course / Degree</label>
                <input
                  type="text"
                  required
                  value={applicantCourse}
                  onChange={(e) => setApplicantCourse(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Brief Statement of Purpose</label>
                <textarea
                  rows={3}
                  value={applicantStatement}
                  onChange={(e) => setApplicantStatement(e.target.value)}
                  placeholder="Explain briefly why you need this scholarship funding..."
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalScholarship(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="flex items-center gap-1 rounded-xl bg-blue-600 dark:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="size-3.5" />
                  {isSubmittingApp ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchScholarshipView;
