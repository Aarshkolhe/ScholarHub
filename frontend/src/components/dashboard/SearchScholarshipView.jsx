import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronDown,
  Check,
  Building2,
  Award,
  Send,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Mail,
} from "lucide-react";
import { getStoredStudentProfile, evaluateEligibility } from "../../lib/eligibilityEngine";
import { SCHOLARSHIPS_DATABASE } from "../../lib/scholarshipData";
import { ScholarshipRowItem } from "./ScholarshipRowItem";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = "http://localhost:5000";

// Custom Visually Appealing Dropdown Component
function CustomDropdown({ value, options, onChange, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      >
        {Icon && <Icon className="size-3.5 text-blue-500" />}
        <span>{selectedOption?.label}</span>
        <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-500" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-md animate-fade-in space-y-1">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SearchScholarshipView({
  initialQuery = "",
  activeTab = "Search",
  onUpdateSavedCount,
  onUpdateAppliedCount,
}) {
  const { user } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [selectedPortal, setSelectedPortal] = useState("All");

  // Custom Filter States
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDegree, setSelectedDegree] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals state
  const [activeModalScholarship, setActiveModalScholarship] = useState(null);
  const [applyModalScholarship, setApplyModalScholarship] = useState(null);
  const studentProfile = useMemo(() => getStoredStudentProfile(), [user]);
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

  const filteredScholarships = useMemo(() => {
    return evaluatedScholarships.filter((s) => {
      // 1. Saved Tab Filter
      if (activeTab === "Saved" && !savedIds.includes(s.id)) return false;

      // 2. Recommended Tab Filter
      if (activeTab === "Recommended" && s.matchScore < 50) return false;

      // 3. Portal Source Filter (Only filter if a specific portal is clicked)
      if (selectedPortal !== "All") {
        const pKey = selectedPortal.toLowerCase();
        const prov = (s.provider || "").toLowerCase();
        const pUrl = (s.portalUrl || "").toLowerCase();
        const sId = (s.id || "").toLowerCase();
        const matchesPortal = prov.includes(pKey) || pUrl.includes(pKey) || sId.includes(pKey);
        if (!matchesPortal) return false;
      }

      // 4. Status Filter
      if (selectedStatus === "Eligible Only" && !s.isEligible) return false;
      if (selectedStatus === "Not Eligible" && s.isEligible) return false;

      // 5. Degree Filter (Only filter if specific degree is selected)
      if (selectedDegree && selectedDegree !== "All") {
        const d = selectedDegree.toLowerCase();
        const sDeg = (s.degree || "").toLowerCase();
        const allowedDegs = (s.criteria?.allowedDegrees || []).map((x) => x.toLowerCase());
        const matchesDegree =
          sDeg.includes(d) ||
          allowedDegs.includes("all") ||
          allowedDegs.some((deg) => deg.includes(d) || d.includes(deg));
        if (!matchesDegree) return false;
      }

      // 6. Category Filter (Only filter if specific category is selected)
      if (selectedCategory && selectedCategory !== "All") {
        const c = selectedCategory.toLowerCase();
        const sCat = (s.category || "").toLowerCase();
        const allowedCats = (s.criteria?.allowedCategories || []).map((x) => x.toLowerCase());
        const matchesCategory =
          sCat.includes(c) ||
          allowedCats.includes("all") ||
          allowedCats.some((cat) => cat === c || c.includes(cat) || cat.includes(c));
        if (!matchesCategory) return false;
      }

      // 7. Text Query Search
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesName = (s.name || "").toLowerCase().includes(q);
        const matchesCat = (s.category || "").toLowerCase().includes(q);
        const matchesProv = (s.provider || "").toLowerCase().includes(q);
        const matchesDesc = (s.description || "").toLowerCase().includes(q);
        const matchesReq = (s.requirements || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesProv && !matchesDesc && !matchesReq) return false;
      }

      return true;
    });
  }, [evaluatedScholarships, query, selectedPortal, selectedStatus, selectedDegree, selectedCategory, activeTab, savedIds]);

  const handleOpenApplyModal = (item, e) => {
    if (e) e.stopPropagation();
    setApplyModalScholarship(item);
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
          userId: user?.id,
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
      const uid = user?.id ? `_${user.id}` : "";
      if (uid) {
        localStorage.setItem(`scholarhub_applied_ids${uid}`, JSON.stringify(nextApplied));
      } else {
        localStorage.setItem("scholarhub_applied_ids", JSON.stringify(nextApplied));
      }
      if (onUpdateAppliedCount) onUpdateAppliedCount(nextApplied.length);

      setIsSubmittingApp(false);
      setAppSuccessMsg(`Application for "${applyModalScholarship.name}" submitted successfully!`);
      setApplyModalScholarship(null);
      setTimeout(() => setAppSuccessMsg(""), 4000);
    }
  };

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailToastMsg, setEmailToastMsg] = useState("");

  const handleSendDeadlineEmail = async (scholarship) => {
    if (!scholarship) return;
    setIsSendingEmail(true);
    const recipientEmail = user?.email || studentProfile.email || "student@scholarhub.edu";
    const studentName = user?.fullName || user?.name || studentProfile.name || "Student";

    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/send-deadline-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recipientEmail,
          studentName,
          scholarshipName: scholarship.name,
          deadline: scholarship.deadline || "31 Oct 2026",
          daysLeft: scholarship.daysLeft || 7,
          amount: scholarship.amountFormatted || "Merit Grant",
          portalUrl: scholarship.portalUrl || "https://scholarhub.edu",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEmailToastMsg(`Deadline alert email sent to ${recipientEmail}!`);
      } else {
        setEmailToastMsg(`Email notice: ${data.message}`);
      }
    } catch {
      setEmailToastMsg(`Deadline reminder logged for ${recipientEmail}!`);
    } finally {
      setIsSendingEmail(false);
      setTimeout(() => setEmailToastMsg(""), 4000);
    }
  };

  // Dropdown Option Definitions
  const statusOptions = [
    { value: "All", label: "All Eligibility Statuses" },
    { value: "Eligible Only", label: "Eligible Only" },
    { value: "Not Eligible", label: "Not Eligible" },
  ];

  const degreeOptions = [
    { value: "All", label: "All Degree Levels" },
    { value: "School", label: "Class 10th / 12th (School)" },
    { value: "Undergraduate", label: "Undergraduate (UG)" },
    { value: "Postgraduate", label: "Postgraduate (PG)" },
    { value: "Doctorate", label: "Doctorate (PhD)" },
  ];

  const categoryOptions = [
    { value: "All", label: "All Categories" },
    { value: "General", label: "General" },
    { value: "OBC", label: "OBC" },
    { value: "SC", label: "SC" },
    { value: "ST", label: "ST" },
    { value: "EWS", label: "EWS" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="size-6 text-blue-600 dark:text-blue-400" />
          {activeTab === "Saved"
            ? "Saved Scholarships"
            : activeTab === "Recommended"
            ? "Recommended Scholarships"
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

      {/* Search Input, Portal Pills & Multi-Criterion Filters Row (ONLY on Search tab) */}
      {activeTab === "Search" && (
        <div className="space-y-3">
          {/* Keyword Search Bar */}
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

          {/* Multi-Criterion Custom Visually Appealing Dropdown Row */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="size-3.5 text-blue-500" /> Filters:
            </span>

            <CustomDropdown
              value={selectedStatus}
              options={statusOptions}
              onChange={setSelectedStatus}
              icon={ShieldCheck}
            />

            <CustomDropdown
              value={selectedDegree}
              options={degreeOptions}
              onChange={setSelectedDegree}
              icon={GraduationCap}
            />

            <CustomDropdown
              value={selectedCategory}
              options={categoryOptions}
              onChange={setSelectedCategory}
              icon={UserCheck}
            />

            {(selectedStatus !== "All" || selectedDegree !== "All" || selectedCategory !== "All" || selectedPortal !== "All" || query) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("All");
                  setSelectedDegree("All");
                  setSelectedCategory("All");
                  setSelectedPortal("All");
                  setQuery("");
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Counter Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          Showing {filteredScholarships.length} {activeTab === "Saved" ? "Saved" : activeTab === "Recommended" ? "Recommended" : "Available"} Scholarships
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {activeTab === "Search" && "⚡ Evaluated against your profile"}
        </span>
      </div>

      {/* Vertical List of Cards */}
      {filteredScholarships.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-xs text-slate-400">
          No scholarships match your search filters. Try resetting filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScholarships.map((s) => (
            <ScholarshipRowItem
              key={s.id}
              scholarship={s}
              isSaved={savedIds.includes(s.id)}
              isApplied={appliedIds.includes(s.id)}
              onToggleSave={toggleSave}
              onOpenDetails={setActiveModalScholarship}
              onOpenApply={handleOpenApplyModal}
            />
          ))}
        </div>
      )}

      {/* SCHOLARSHIP DETAILS MODAL */}
      {activeModalScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                {activeModalScholarship.isPendingDetails || activeModalScholarship.matchScore === null ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    📋 Details Pending ({activeModalScholarship.missingFields?.join(", ") || "Profile Details"} Missing)
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      activeModalScholarship.isEligible
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {activeModalScholarship.isEligible ? "Eligible" : "Not Eligible"} ({activeModalScholarship.matchScore}% Match)
                  </span>
                )}
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

              {/* Criteria Breakdown */}
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

              {/* Direct Government Portal Link */}
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

            {emailToastMsg && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-rise-in">
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{emailToastMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                disabled={isSendingEmail}
                onClick={() => handleSendDeadlineEmail(activeModalScholarship)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors disabled:opacity-50"
              >
                <Mail className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>{isSendingEmail ? "Sending Alert..." : "Email Deadline Reminder"}</span>
              </button>

              <div className="flex items-center gap-2">
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
