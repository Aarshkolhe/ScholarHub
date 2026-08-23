import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Send,
  X,
  Sparkles,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import {
  getStoredStudentProfile,
  evaluateEligibility,
  calculateProfileStrength,
} from "../../lib/eligibilityEngine";
import { SCHOLARSHIPS_DATABASE } from "../../lib/scholarshipData";
import { ScholarshipRowItem } from "./ScholarshipRowItem";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = "http://localhost:5000";

export function RecentScholarships({
  searchQuery = "",
  onViewAllClick,
  onNavigateTab,
  onUpdateSavedCount,
  onUpdateAppliedCount,
}) {
  const { user } = useAuth();
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    const handleProfileUpdate = () => setProfileVersion((v) => v + 1);
    window.addEventListener("scholarhub_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("scholarhub_profile_updated", handleProfileUpdate);
  }, []);

  // Application Modal state
  const studentProfile = useMemo(() => getStoredStudentProfile(), [user, profileVersion]);
  const profileStrength = useMemo(() => calculateProfileStrength(studentProfile), [studentProfile]);
  const hasFilledDetails = profileStrength >= 30;

  // Evaluate database scholarships against profile
  const evaluatedScholarships = useMemo(() => {
    return SCHOLARSHIPS_DATABASE.map((s) => {
      const evalResult = evaluateEligibility(s, studentProfile);
      return {
        ...s,
        ...evalResult,
      };
    });
  }, [studentProfile]);

  // Recommended scholarships count (only 100% eligible scholarships)
  const recommendedList = useMemo(() => {
    return evaluatedScholarships.filter((s) => s.isEligible);
  }, [evaluatedScholarships]);

  const [filter, setFilter] = useState(() => (hasFilledDetails && recommendedList.length > 0 ? "Recommended" : "All"));

  useEffect(() => {
    if (hasFilledDetails && recommendedList.length > 0) {
      setFilter("Recommended");
    } else {
      setFilter("All");
    }
  }, [hasFilledDetails, recommendedList.length]);

  const [applyModalItem, setApplyModalItem] = useState(null);
  const [applicantName, setApplicantName] = useState(user?.fullName || user?.name || "");
  const [applicantCourse, setApplicantCourse] = useState(studentProfile.currentCourse || "");
  const [applicantStatement, setApplicantStatement] = useState("");
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSuccessMsg, setAppSuccessMsg] = useState("");

  // Saved IDs tracking
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const uid = user?.id ? `_${user.id}` : "";
      const raw = uid
        ? localStorage.getItem(`scholarhub_saved_ids${uid}`)
        : localStorage.getItem("scholarhub_saved_ids");
      return JSON.parse(raw || "[]");
    } catch {
      return [];
    }
  });

  // Applied IDs tracking
  const [appliedIds, setAppliedIds] = useState(() => {
    try {
      const uid = user?.id ? `_${user.id}` : "";
      const raw = uid
        ? localStorage.getItem(`scholarhub_applied_ids${uid}`)
        : localStorage.getItem("scholarhub_applied_ids");
      return JSON.parse(raw || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const uid = user?.id ? `_${user.id}` : "";
    try {
      const rawS = uid
        ? localStorage.getItem(`scholarhub_saved_ids${uid}`)
        : localStorage.getItem("scholarhub_saved_ids");
      setSavedIds(JSON.parse(rawS || "[]"));
    } catch {}
    try {
      const rawA = uid
        ? localStorage.getItem(`scholarhub_applied_ids${uid}`)
        : localStorage.getItem("scholarhub_applied_ids");
      setAppliedIds(JSON.parse(rawA || "[]"));
    } catch {}
    setApplicantName(user?.fullName || user?.name || "");
    setApplicantCourse(studentProfile.currentCourse || "");
  }, [user, studentProfile]);

  const toggleSave = (id, e) => {
    if (e) e.stopPropagation();
    let next;
    if (savedIds.includes(id)) {
      next = savedIds.filter((item) => item !== id);
    } else {
      next = [...savedIds, id];
    }
    setSavedIds(next);
    const uid = user?.id ? `_${user.id}` : "";
    if (uid) {
      localStorage.setItem(`scholarhub_saved_ids${uid}`, JSON.stringify(next));
    } else {
      localStorage.setItem("scholarhub_saved_ids", JSON.stringify(next));
    }
    if (onUpdateSavedCount) onUpdateSavedCount(next.length);
  };

  const filteredScholarships = useMemo(() => {
    return evaluatedScholarships.filter((s) => {
      // Keyword Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesCat = s.category?.toLowerCase().includes(q);
        const matchesProv = s.provider?.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesProv) return false;
      }

      // Filter chips
      if (filter === "Recommended") {
        return s.matchScore !== null && s.matchScore >= 50;
      }
      if (filter === "Govt Schemes" && !s.isGovt) return false;
      if (filter === "Engineering" && s.category !== "Engineering" && !s.name?.toLowerCase().includes("engineering") && !s.name?.toLowerCase().includes("b.tech") && !s.description?.toLowerCase().includes("engineering")) return false;
      if (filter === "Research" && s.category !== "Research" && !s.name?.toLowerCase().includes("fellowship") && !s.name?.toLowerCase().includes("research") && !s.description?.toLowerCase().includes("science")) return false;

      return true;
    });
  }, [evaluatedScholarships, searchQuery, filter]);

  const handleOpenApplyModal = (item, e) => {
    if (e) e.stopPropagation();
    setApplyModalItem(item);
    setActiveModalItem(null);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyModalItem) return;

    setIsSubmittingApp(true);
    const nextApplied = [...appliedIds, applyModalItem.id];

    try {
      await fetch(`${BACKEND_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          scholarshipId: applyModalItem.id,
          scholarshipName: applyModalItem.name,
          applicantName,
          course: applicantCourse,
          statement: applicantStatement,
        }),
      });
    } catch {
      // Local fallback
    } finally {
      setAppliedIds(nextApplied);
      const uid = user?.id ? `_${user.id}` : "";
      if (uid) {
        localStorage.setItem(`scholarhub_applied_ids${uid}`, JSON.stringify(nextApplied));
      } else {
        localStorage.setItem("scholarhub_applied_ids", JSON.stringify(nextApplied));
      }
      if (onUpdateAppliedCount) onUpdateAppliedCount(nextApplied.length);

      setIsSubmittingApp(false);
      setAppSuccessMsg(`Application for "${applyModalItem.name}" submitted successfully!`);
      setApplyModalItem(null);
      setTimeout(() => setAppSuccessMsg(""), 4000);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-md p-5 sm:p-6 space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {hasFilledDetails && recommendedList.length > 0 ? (
              <>
                <span>🎯</span> Recommended Scholarships for You
              </>
            ) : (
              <>
                <span>🎓</span> Available Scholarship Directory
              </>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {hasFilledDetails && recommendedList.length > 0
              ? `${recommendedList.length} matching grant opportunities evaluated from your ${profileStrength}% completed profile`
              : `${filteredScholarships.length} verified government & portal schemes — Fill details to calculate match score`}
          </p>
        </div>

        {/* View All Action Link */}
        {onViewAllClick && (
          <button
            type="button"
            onClick={onViewAllClick}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start lg:self-auto cursor-pointer"
          >
            <span>Explore Full Search Directory</span> &rarr;
          </button>
        )}
      </div>

      {/* Incomplete Profile Prompt Banner */}
      {!hasFilledDetails && onNavigateTab && (
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Profile Below Recommendation Threshold:</strong> Your profile strength is at <strong>{profileStrength}%</strong>. Complete your profile details above the <strong>30% threshold</strong> in the <strong>Details</strong> tab to unlock 100% eligible recommendations.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("Details")}
            className="shrink-0 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 transition-colors cursor-pointer shadow-xs"
          >
            Complete Profile &rarr;
          </button>
        </div>
      )}

      {/* Max Accuracy Recommendation Banner */}
      {hasFilledDetails && filter === "Recommended" && (
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Showing <strong>{recommendedList.length} 100% eligible scholarships</strong> for your verified profile (<strong>{profileStrength}% complete</strong>). Complete your full details for maximum recommendation accuracy!
            </span>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("Details")}
              className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 transition-colors cursor-pointer shadow-xs"
            >
              Complete Full Profile &rarr;
            </button>
          )}
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          ...(hasFilledDetails && recommendedList.length > 0
            ? [{ id: "Recommended", label: `✨ Recommended (${recommendedList.length})` }]
            : []),
          { id: "All", label: "All Scholarships" },
          { id: "Govt Schemes", label: "🏛️ Govt Schemes" },
          { id: "Engineering", label: "⚙️ Engineering & Tech" },
          { id: "Research", label: "🔬 Research & Fellowships" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filter === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Application Success Toast */}
      {appSuccessMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-rise-in">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{appSuccessMsg}</span>
        </div>
      )}

      {/* Vertical List of Scholarship Cards */}
      {filteredScholarships.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No scholarships match your search criteria. Try adjusting your filters.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredScholarships.map((s) => (
            <ScholarshipRowItem
              key={s.id}
              scholarship={s}
              isSaved={savedIds.includes(s.id)}
              isApplied={appliedIds.includes(s.id)}
              onToggleSave={toggleSave}
              onOpenDetails={setActiveModalItem}
              onOpenApply={handleOpenApplyModal}
            />
          ))}
        </div>
      )}

      {/* SCHOLARSHIP DETAILS MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    (activeModalItem.eligibilityPercent ?? activeModalItem.matchScore) >= 75
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                      : (activeModalItem.eligibilityPercent ?? activeModalItem.matchScore) >= 50
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
                      : "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800"
                  }`}
                >
                  {(activeModalItem.eligibilityPercent ?? activeModalItem.matchScore)}% Eligible (
                  {activeModalItem.isEligible ? "Fully Qualified" : "Partial Criteria Match"}
                  )
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {activeModalItem.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeModalItem.provider}</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Overview</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeModalItem.description}
                </p>
              </div>

              {/* Criteria Breakdown */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                  Criteria Breakdown
                </p>
                {activeModalItem.criteriaBreakdown?.map((crit, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-slate-600 dark:text-slate-400">{crit.label}</span>
                    <span className={`font-semibold ${crit.status === "passed" ? "text-emerald-600" : "text-rose-600"}`}>
                      {crit.status === "passed" ? "✓ Passed" : "✕ Failed"} ({crit.detail})
                    </span>
                  </div>
                ))}
              </div>

              {/* Direct Government Portal Link */}
              {activeModalItem.portalUrl && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Official Portal Link:</span>
                  <a
                    href={activeModalItem.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {activeModalItem.portalUrl} <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={(e) => handleOpenApplyModal(activeModalItem, e)}
                className="rounded-xl bg-blue-600 dark:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION FORM MODAL */}
      {applyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Apply for {applyModalItem.name}
              </h3>
              <button
                type="button"
                onClick={() => setApplyModalItem(null)}
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
                  onClick={() => setApplyModalItem(null)}
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
    </section>
  );
}

export default RecentScholarships;
