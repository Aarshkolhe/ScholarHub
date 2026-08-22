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
  ArrowUpDown,
  Layers,
  Sparkles,
  ClipboardList,
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
        <div className="absolute left-0 top-full mt-1.5 z-50 w-60 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-md animate-fade-in space-y-1">
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
  onNavigateTab,
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
  const [selectedFunding, setSelectedFunding] = useState("All");
  const [selectedSort, setSelectedSort] = useState("default");

  // Modals state
  const [activeModalScholarship, setActiveModalScholarship] = useState(null);
  const [applyModalScholarship, setApplyModalScholarship] = useState(null);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    const handleProfileUpdate = () => setProfileVersion((v) => v + 1);
    window.addEventListener("scholarhub_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("scholarhub_profile_updated", handleProfileUpdate);
  }, []);

  const studentProfile = useMemo(() => getStoredStudentProfile(), [user, profileVersion]);
  const profileStrength = useMemo(() => calculateProfileStrength(studentProfile), [studentProfile]);
  const hasFilledDetails = profileStrength >= 30;
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
  }, [user, studentProfile, profileVersion]);

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
    const list = evaluatedScholarships.filter((s) => {
      // 1. Saved Tab Filter
      if (activeTab === "Saved" && !savedIds.includes(s.id)) return false;

      // 2. Recommended Tab Filter (requires profile strength >= 30% threshold and match score >= 50%)
      if (activeTab === "Recommended") {
        if (!hasFilledDetails) return false;
        if ((s.eligibilityPercent ?? s.matchScore) < 50) return false;
      }

      // 3. Portal Source Filter
      if (selectedPortal !== "All") {
        const pKey = selectedPortal.toLowerCase();
        const prov = (s.provider || "").toLowerCase();
        const pUrl = (s.portalUrl || "").toLowerCase();
        const sId = (s.id || "").toLowerCase();
        const matchesPortal = prov.includes(pKey) || pUrl.includes(pKey) || sId.includes(pKey);
        if (!matchesPortal) return false;
      }

      // 4. Status / Eligibility Filter
      if (selectedStatus === "Eligible Only" && (s.eligibilityPercent < 75 && !s.isEligible)) return false;
      if (selectedStatus === "Moderate" && (s.eligibilityPercent < 50 || s.eligibilityPercent >= 75)) return false;
      if (selectedStatus === "Not Eligible" && (s.eligibilityPercent >= 50 && s.isEligible)) return false;

      // 5. Degree Filter
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

      // 6. Category Filter
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

      // 7. Funding Type Filter
      if (selectedFunding === "Govt" && !s.isGovt) return false;
      if (selectedFunding === "Corporate" && s.isGovt) return false;

      // 8. Text Query Search
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

    // Apply Sorting
    return [...list].sort((a, b) => {
      if (selectedSort === "eligibility-desc") {
        return (b.eligibilityPercent || 0) - (a.eligibilityPercent || 0);
      }
      if (selectedSort === "amount-desc") {
        return (b.amount || 0) - (a.amount || 0);
      }
      if (selectedSort === "deadline-asc") {
        return (a.daysLeft || 999) - (b.daysLeft || 999);
      }
      if (selectedSort === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [
    evaluatedScholarships,
    query,
    selectedPortal,
    selectedStatus,
    selectedDegree,
    selectedCategory,
    selectedFunding,
    selectedSort,
    activeTab,
    savedIds,
  ]);

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
    { value: "All", label: "All Statuses" },
    { value: "Eligible Only", label: "High Match (≥75%)" },
    { value: "Moderate", label: "Moderate (50-74%)" },
    { value: "Not Eligible", label: "Low Match (<50%)" },
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
    { value: "General", label: "General / Open" },
    { value: "OBC", label: "OBC" },
    { value: "SC", label: "SC" },
    { value: "ST", label: "ST" },
    { value: "EWS", label: "EWS / EBC" },
    { value: "VJNT", label: "VJNT / SBC" },
  ];

  const fundingOptions = [
    { value: "All", label: "All Funding" },
    { value: "Govt", label: "🏛️ Govt Schemes" },
    { value: "Corporate", label: "🏢 Corporate CSR" },
  ];

  const sortOptions = [
    { value: "default", label: "Sort: Default" },
    { value: "eligibility-desc", label: "Sort: Highest %" },
    { value: "amount-desc", label: "Sort: Award ₹" },
    { value: "deadline-asc", label: "Sort: Deadline" },
    { value: "name-asc", label: "Sort: Name A-Z" },
  ];

  const hasActiveFilters =
    selectedStatus !== "All" ||
    selectedDegree !== "All" ||
    selectedCategory !== "All" ||
    selectedFunding !== "All" ||
    selectedSort !== "default" ||
    selectedPortal !== "All" ||
    query.trim() !== "";

  const handleResetFilters = () => {
    setSelectedStatus("All");
    setSelectedDegree("All");
    setSelectedCategory("All");
    setSelectedFunding("All");
    setSelectedSort("default");
    setSelectedPortal("All");
    setQuery("");
  };

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
          {activeTab === "Search"
            ? "Browse the complete directory of government schemes and private CSR scholarships. Use filters and keyword search to explore all opportunities with live eligibility match percentages."
            : activeTab === "Recommended"
            ? "Scholarships with high match scores based on your current profile."
            : "Scholarships you have saved or bookmarked for later application."}
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
              { id: "NSP", label: "🇮🇳 National Portal (NSP)" },
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
          <div className="flex flex-wrap items-center gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mr-0.5">
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

            <CustomDropdown
              value={selectedFunding}
              options={fundingOptions}
              onChange={setSelectedFunding}
              icon={Layers}
            />

            <CustomDropdown
              value={selectedSort}
              options={sortOptions}
              onChange={setSelectedSort}
              icon={ArrowUpDown}
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Counter Banner (Only for Search and valid Recommended / Saved tabs) */}
      {activeTab === "Search" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Showing {filteredScholarships.length} of {SCHOLARSHIPS_DATABASE.length} Available Scholarships
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            All scholarships listed • Live eligibility % calculated
          </span>
        </div>
      )}

      {activeTab === "Recommended" && hasFilledDetails && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Showing {filteredScholarships.length} Recommended Scholarships
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Filtered for ≥50% match based on your {profileStrength}% completed profile
          </span>
        </div>
      )}

      {activeTab === "Saved" && filteredScholarships.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Showing {filteredScholarships.length} Saved {filteredScholarships.length === 1 ? "Scholarship" : "Scholarships"}
          </span>
        </div>
      )}

      {/* 1. If on Saved tab and no scholarships are saved yet */}
      {activeTab === "Saved" && filteredScholarships.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 shadow-md">
            <Bookmark className="size-8 animate-icon-bounce" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No Saved Scholarships Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              You haven't saved any scholarships yet. Browse the scholarship directory and click the bookmark icon on any scholarship card to save it here for quick tracking and application.
            </p>
          </div>

          {onNavigateTab && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab("Search")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-bold px-6 py-3 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Browse & Save Scholarships</span>
                <span>&rarr;</span>
              </button>
            </div>
          )}
        </div>
      ) : activeTab === "Recommended" && !hasFilledDetails ? (
        /* 2. If on Recommended tab and profile is below the 30% threshold */
        <div className="rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/80 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 shadow-md">
            <Sparkles className="size-8 animate-icon-twinkle" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Profile Below Recommendation Threshold
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your profile strength is currently <strong>{profileStrength}%</strong>. To see personalized scholarship recommendations, please complete your profile details above the <strong>30% threshold</strong> (e.g. current stream, marks %, annual family income, category, and domicile state).
            </p>
          </div>

          {/* Progress Meter */}
          <div className="max-w-md mx-auto bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-amber-200/60 dark:border-slate-700/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400">Current Profile Strength</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{profileStrength}% / 30% Required</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                style={{ width: `${Math.min(100, Math.round((profileStrength / 30) * 100))}%` }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Complete your profile details to unlock high-match AI recommendations.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("Details")}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-bold px-6 py-3 shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ClipboardList className="size-4" />
                <span>Fill Details Profile &rarr;</span>
              </button>
            )}
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("Search")}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
              >
                <span>Browse Full Search Directory</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredScholarships.length === 0 ? (
        /* 3. General empty state */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-xs text-slate-400">
          No scholarships match your criteria. Try adjusting your filters.
        </div>
      ) : (
        /* 4. Scholarship cards list */
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
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    (activeModalScholarship.eligibilityPercent ?? activeModalScholarship.matchScore) >= 75
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                      : (activeModalScholarship.eligibilityPercent ?? activeModalScholarship.matchScore) >= 50
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800"
                      : "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800"
                  }`}
                >
                  {(activeModalScholarship.eligibilityPercent ?? activeModalScholarship.matchScore)}% Eligible (
                  {activeModalScholarship.isEligible ? "Fully Qualified" : "Partial Criteria Match"}
                  )
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
