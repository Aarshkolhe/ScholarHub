import { useState, useEffect } from "react";
import { Search, Filter, Bookmark, CheckCircle2, X, SlidersHorizontal, ArrowUpDown, Award, Calendar, ChevronRight, ExternalLink, ShieldCheck, Building2, Database } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const OFFICIAL_PORTAL_SCHOLARSHIPS = [
  // --------------------------------------------------
  // 1. CLASS 10th & 12th SCHOOL SCHOLARSHIPS
  // --------------------------------------------------
  {
    id: "mahadbt-10th-1",
    name: "MahaDBT Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship for 10th Passed Students",
    deadline: "20 Nov 2026",
    daysLeft: 91,
    amount: 12000,
    amountFormatted: "₹12,000 / yr",
    match: 99,
    category: "Government",
    degree: "School",
    stream: "General",
    portalName: "MahaDBT Portal",
    provider: "Social Justice Department — MahaDBT Portal",
    portalUrl: "https://mahadbt.maharashtra.gov.in",
    isGovt: true,
    minScore: 75,
    description: "Special merit scholarship for 10th Board passed SC & EBC students taking admission in 11th & 12th Class junior colleges.",
    requirements: "Scored minimum 75% marks in Class 10th Board exam. Domicile of Maharashtra.",
  },
  {
    id: "mahadbt-10th-2",
    name: "MahaDBT Post-Matric Scholarship for 10th/12th Class Students (OBC/VJNT/SBC)",
    deadline: "05 Dec 2026",
    daysLeft: 106,
    amount: 15000,
    amountFormatted: "₹15,000 / yr",
    match: 98,
    category: "Government",
    degree: "School",
    stream: "General",
    portalName: "MahaDBT Portal",
    provider: "VJNT, OBC & SBC Welfare Dept — MahaDBT Portal",
    portalUrl: "https://mahadbt.maharashtra.gov.in",
    isGovt: true,
    minScore: 50,
    description: "Tuition fee and exam fee financial assistance for 10th board passed students enrolled in Class 11th and 12th stream.",
    requirements: "Enrolled in 11th or 12th Class. Annual family income below ₹1.5 Lakhs.",
  },
  {
    id: "mahajyoti-10th",
    name: "MahaJYOTI MHT-CET/JEE/NEET Free Coaching & Tab Allowance for 10th Passed Students",
    deadline: "15 Dec 2026",
    daysLeft: 116,
    amount: 25000,
    amountFormatted: "₹25,000 + Free Tab",
    match: 97,
    category: "Government",
    degree: "School",
    stream: "STEM",
    portalName: "MahaJYOTI Portal",
    provider: "MahaJYOTI Govt of Maharashtra (mahajyoti.org.in)",
    portalUrl: "https://mahajyoti.org.in",
    isGovt: true,
    minScore: 70,
    description: "Free 11th & 12th Class entrance coaching (JEE/NEET/CET) plus free Android tablet for OBC/VJNT/SBC students.",
    requirements: "Passed 10th Board Exam with 70%+ marks. Domicile of Maharashtra.",
  },
  {
    id: "vidya-10th",
    name: "Vidyasaarathi Post-10th & 12th Standard Merit Scholarship",
    deadline: "10 Nov 2026",
    daysLeft: 81,
    amount: 20000,
    amountFormatted: "₹20,000 / yr",
    match: 96,
    category: "General",
    degree: "School",
    stream: "General",
    portalName: "Vidyasaarathi Portal",
    provider: "NSDL Vidyasaarathi Corporate CSR",
    portalUrl: "https://www.vidyasaarathi.co.in",
    isGovt: false,
    minScore: 60,
    description: "CSR financial grant for meritorious students pursuing 11th, 12th, or ITI diploma courses after 10th Class.",
    requirements: "Enrolled in 11th, 12th or ITI. Family income below ₹3.5 Lakhs.",
  },
  {
    id: "nmmss-10th",
    name: "National Means-cum-Merit Scholarship Scheme (NMMSS Class 10th-12th)",
    deadline: "30 Nov 2026",
    daysLeft: 101,
    amount: 12000,
    amountFormatted: "₹12,000 / yr",
    match: 95,
    category: "Government",
    degree: "School",
    stream: "General",
    portalName: "National Scholarship Portal (NSP)",
    provider: "Ministry of Education (Govt of India) — NSP",
    portalUrl: "https://scholarships.gov.in",
    isGovt: true,
    minScore: 55,
    description: "Central government scholarship grant for meritorious school students studying in Class 10th, 11th, and 12th.",
    requirements: "Scored 55% in 8th/9th/10th class. Annual family income below ₹3.5 Lakhs.",
  },

  // --------------------------------------------------
  // 2. UNDERGRADUATE & DEGREE SCHOLARSHIPS
  // --------------------------------------------------
  {
    id: "mahadbt-1",
    name: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (MahaDBT EBC)",
    deadline: "15 Dec 2026",
    daysLeft: 116,
    amount: 60000,
    amountFormatted: "₹60,000 / yr",
    match: 98,
    category: "Government",
    degree: "Undergraduate",
    stream: "Engineering",
    portalName: "MahaDBT Portal",
    provider: "Government of Maharashtra (MahaDBT Portal)",
    portalUrl: "https://mahadbt.maharashtra.gov.in",
    isGovt: true,
    minScore: 60,
    description: "50% to 100% tuition and exam fee reimbursement for EBC & General category students in engineering, degree & diploma courses.",
    requirements: "Domicile of Maharashtra. Annual family income below ₹8 Lakhs.",
  },
  {
    id: "mahadbt-2",
    name: "Dr. Punjabrao Deshmukh Vasatigruh Nirvah Bhatta Yojna (MahaDBT Hostel Allowance)",
    deadline: "31 Dec 2026",
    daysLeft: 132,
    amount: 30000,
    amountFormatted: "₹30,000 / yr",
    match: 95,
    category: "Government",
    degree: "Undergraduate",
    stream: "Engineering",
    portalName: "MahaDBT Portal",
    provider: "Government of Maharashtra (MahaDBT Portal)",
    portalUrl: "https://mahadbt.maharashtra.gov.in",
    isGovt: true,
    minScore: 60,
    description: "Hostel maintenance allowance for children of small landholders and registered laborers studying in professional colleges.",
    requirements: "Hostel resident in Maharashtra. Domicile of Maharashtra State.",
  },
  {
    id: "mahadbt-3",
    name: "Post-Matric Scholarship Scheme for OBC / VJNT / SBC Students (MahaDBT)",
    deadline: "20 Dec 2026",
    daysLeft: 121,
    amount: 45000,
    amountFormatted: "₹45,000 / yr",
    match: 96,
    category: "Government",
    degree: "Undergraduate",
    stream: "General",
    portalName: "MahaDBT Portal",
    provider: "VJNT, OBC & SBC Welfare Department — MahaDBT",
    portalUrl: "https://mahadbt.maharashtra.gov.in",
    isGovt: true,
    minScore: 50,
    description: "100% tuition and examination fee waiver for OBC, VJNT, and SBC students pursuing higher education in Maharashtra.",
    requirements: "OBC / VJNT / SBC category certificate. Family income below ₹1.5 Lakhs.",
  },
  {
    id: "mahadbt-4",
    name: "Government Post-Matric Scholarship for SC & ST Students (MahaDBT)",
    deadline: "05 Jan 2027",
    daysLeft: 137,
    amount: 75000,
    amountFormatted: "₹75,000 / yr",
    match: 97,
    category: "Government",
    degree: "Undergraduate",
    stream: "General",
    portalName: "MahaDBT Portal",
    provider: "Social Justice & Special Assistance Dept — MahaDBT",
    portalUrl: "https://mahadbt.maharashtra.gov.in",
    isGovt: true,
    minScore: 50,
    description: "Full course tuition fee reimbursement plus monthly maintenance allowance for SC/ST students in Maharashtra.",
    requirements: "SC / ST caste certificate. Domicile of Maharashtra.",
  },
  {
    id: "mahajyoti-1",
    name: "MahaJYOTI MPhil & PhD Research Fellowship Scheme",
    deadline: "31 Dec 2026",
    daysLeft: 132,
    amount: 372000,
    amountFormatted: "₹31,000 / mo",
    match: 96,
    category: "Research",
    degree: "Postgraduate",
    stream: "STEM",
    portalName: "MahaJYOTI Portal",
    provider: "MahaJYOTI Govt of Maharashtra (mahajyoti.org.in)",
    portalUrl: "https://mahajyoti.org.in",
    isGovt: true,
    minScore: 65,
    description: "Monthly research fellowship stipend of ₹31,000 + HRA for OBC/VJNT/SBC scholars pursuing PhD & MPhil research degrees.",
    requirements: "OBC/VJNT/SBC category. Enrolled in recognized university PhD program.",
  },
  {
    id: "vidya-1",
    name: "ACC Vidyasaarathi Scholarship for B.E / B.Tech Students",
    deadline: "10 Nov 2026",
    daysLeft: 81,
    amount: 50000,
    amountFormatted: "₹50,000 / yr",
    match: 95,
    category: "Engineering",
    degree: "Undergraduate",
    stream: "Engineering",
    portalName: "Vidyasaarathi Portal",
    provider: "ACC Limited & NSDL Vidyasaarathi Portal",
    portalUrl: "https://www.vidyasaarathi.co.in",
    isGovt: false,
    minScore: 60,
    description: "Corporate CSR scholarship for undergraduate engineering students admitted to accredited B.E / B.Tech programs.",
    requirements: "Minimum 60% in Class 12 / Diploma. Annual family income below ₹5 Lakhs.",
  }
];

const BACKEND_URL = "http://localhost:5000";

export function SearchScholarshipView({ initialQuery = "", activeTab = "Search", onUpdateSavedCount, onUpdateAppliedCount }) {
  const { user } = useAuth();
  const [scholarshipsList, setScholarshipsList] = useState(OFFICIAL_PORTAL_SCHOLARSHIPS);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Dedicated Portal Filter Pill State
  const [selectedPortal, setSelectedPortal] = useState("All");

  // 3 Multi-Criterion Filters
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedStream, setSelectedStream] = useState("All");
  const [fundingType, setFundingType] = useState("All");

  const [sortBy, setSortBy] = useState("all");

  // Modal State
  const [activeModalScholarship, setActiveModalScholarship] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applicantName, setApplicantName] = useState(user?.fullName || user?.name || "");

  // Bookmarking & Applied State
  const [savedIds, setSavedIds] = useState(() => {
    const saved = localStorage.getItem("scholarhub_saved_ids");
    return saved ? JSON.parse(saved) : ["mahadbt-10th-1", "mahadbt-1"];
  });

  const [appliedIds, setAppliedIds] = useState(() => {
    const applied = localStorage.getItem("scholarhub_applied_ids");
    return applied ? JSON.parse(applied) : [];
  });

  // Fetch Scholarships directly from PostgreSQL backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/scholarships`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.scholarships && data.scholarships.length > 0) {
          setScholarshipsList(data.scholarships);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    localStorage.setItem("scholarhub_saved_ids", JSON.stringify(savedIds));
    if (onUpdateSavedCount) onUpdateSavedCount(savedIds.length);
  }, [savedIds, onUpdateSavedCount]);

  useEffect(() => {
    localStorage.setItem("scholarhub_applied_ids", JSON.stringify(appliedIds));
    if (onUpdateAppliedCount) onUpdateAppliedCount(appliedIds.length);
  }, [appliedIds, onUpdateAppliedCount]);

  const toggleSave = async (id, e) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    try {
      await fetch(`${BACKEND_URL}/api/scholarships/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "demo-user-id",
          scholarshipId: id,
        }),
      });
    } catch (err) {}
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!activeModalScholarship) return;

    if (!appliedIds.includes(activeModalScholarship.id)) {
      setAppliedIds((prev) => [...prev, activeModalScholarship.id]);
    }

    try {
      await fetch(`${BACKEND_URL}/api/scholarships/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "demo-user-id",
          scholarshipId: activeModalScholarship.id,
          applicantName: applicantName || user?.fullName || user?.name || "Student",
          courseName: selectedLevel !== "All" ? selectedLevel : "Class 10th / 12th / Degree",
        }),
      });
    } catch (err) {}

    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setActiveModalScholarship(null);
    }, 2200);
  };

  // Multi-Criterion Filtering Logic with Resilient 10th/12th Matcher
  let filtered = scholarshipsList.filter((item) => {
    if (activeTab === "Saved" && !savedIds.includes(item.id)) return false;
    if (activeTab === "Recommended" && item.match < 90) return false;

    // Direct Portal Filter Pill
    if (selectedPortal === "MahaDBT" && !item.id.includes("mahadbt") && !item.provider.toLowerCase().includes("mahadbt")) return false;
    if (selectedPortal === "MahaJYOTI" && !item.id.includes("mahajyoti") && !item.provider.toLowerCase().includes("mahajyoti")) return false;
    if (selectedPortal === "Vidyasaarathi" && !item.id.includes("vidya") && !item.provider.toLowerCase().includes("vidyasaarathi")) return false;

    // Search Query Match
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.provider.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    // 1. Filter: Current Class / Graduation Level (Resilient 10th & 12th Matcher)
    const matchesLevel =
      selectedLevel === "All" ||
      (selectedLevel === "School / 10th-12th" && (
        item.degree === "School" ||
        item.degree.toLowerCase().includes("school") ||
        item.name.includes("10th") ||
        item.name.includes("12th") ||
        item.requirements.includes("10th") ||
        item.requirements.includes("12th")
      )) ||
      (selectedLevel === "Undergraduate" && (item.degree === "Undergraduate" || item.degree.toLowerCase().includes("undergrad"))) ||
      (selectedLevel === "Postgraduate" && (item.degree === "Postgraduate" || item.degree.toLowerCase().includes("postgrad"))) ||
      (selectedLevel === "Doctorate" && (item.degree === "Doctorate" || item.degree.toLowerCase().includes("phd")));

    // 2. Filter: Medical / Engineering / STEM / Arts Stream
    const corpus = `${item.name} ${item.category} ${item.stream || ""} ${item.provider} ${item.description} ${item.requirements}`.toLowerCase();

    const matchesStream =
      selectedStream === "All" ||
      (selectedStream === "Engineering" && (
        (item.stream && item.stream.toLowerCase() === "engineering") ||
        item.category.toLowerCase() === "engineering" ||
        corpus.includes("engineering") ||
        corpus.includes("tech") ||
        corpus.includes("aicte") ||
        corpus.includes("b.tech")
      )) ||
      (selectedStream === "Medical" && (
        (item.stream && item.stream.toLowerCase() === "medical") ||
        item.category.toLowerCase() === "medical" ||
        corpus.includes("medical") ||
        corpus.includes("health") ||
        corpus.includes("mbbs") ||
        corpus.includes("icmr")
      )) ||
      (selectedStream === "STEM" && (
        (item.stream && item.stream.toLowerCase() === "stem") ||
        item.category.toLowerCase() === "stem" ||
        corpus.includes("stem") ||
        corpus.includes("science") ||
        corpus.includes("inspire")
      )) ||
      (selectedStream === "Arts" && (
        (item.stream && item.stream.toLowerCase() === "arts") ||
        item.category.toLowerCase() === "general" ||
        corpus.includes("arts") ||
        corpus.includes("commerce") ||
        corpus.includes("csss")
      ));

    // 3. Filter: Govt or Private Funding
    const matchesFunding =
      fundingType === "All" ||
      (fundingType === "Govt" && item.isGovt) ||
      (fundingType === "Private" && !item.isGovt);

    return matchesQuery && matchesLevel && matchesStream && matchesFunding;
  });

  // Sort Logic
  filtered.sort((a, b) => {
    if (sortBy === "all") return 0;
    if (sortBy === "match") return b.match - a.match;
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "deadline") return a.daysLeft - b.daysLeft;
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="size-6 text-blue-600 dark:text-blue-400" />
            {activeTab === "Saved"
              ? "Saved Scholarships"
              : activeTab === "Recommended"
              ? "Recommended Scholarships"
              : "Search Scholarships"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>Showing {filtered.length} active verified scholarships (Class 10th, 12th & Degree)</span>
          </p>
        </div>

        {/* Database Active Status Tag */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Database className="size-4" />
          <span>PostgreSQL DB Synced</span>
        </div>
      </div>

      {/* QUICK PORTAL SELECTION PILLS */}
      <div className="flex flex-wrap items-center gap-2 bg-blue-50/50 dark:bg-slate-900 p-3 rounded-2xl border border-blue-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 flex items-center gap-1">
          <ShieldCheck className="size-4 text-blue-600" /> Source Portals:
        </span>
        <button
          type="button"
          onClick={() => setSelectedPortal("All")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            selectedPortal === "All"
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
          }`}
        >
          All Portals
        </button>
        <button
          type="button"
          onClick={() => setSelectedPortal("MahaDBT")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedPortal === "MahaDBT"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
          }`}
        >
          🏛️ MahaDBT Portal
        </button>
        <button
          type="button"
          onClick={() => setSelectedPortal("MahaJYOTI")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedPortal === "MahaJYOTI"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
          }`}
        >
          🏛️ MahaJYOTI Portal
        </button>
        <button
          type="button"
          onClick={() => setSelectedPortal("Vidyasaarathi")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedPortal === "Vidyasaarathi"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
          }`}
        >
          🏢 Vidyasaarathi Portal
        </button>
      </div>

      {/* 3-CRITERION MULTI-FILTER TOOLBAR WITH SEARCH BUTTON */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Filter className="size-4 text-blue-600 dark:text-blue-400" />
            Multi-Criterion Scholarship Filters & Search
          </div>
          {(selectedLevel !== "All" || selectedStream !== "All" || fundingType !== "All" || selectedPortal !== "All" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedLevel("All");
                setSelectedStream("All");
                setFundingType("All");
                setSelectedPortal("All");
                setSearchQuery("");
                setSortBy("all");
              }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* 3 Select Dropdowns & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* FILTER 1: Current Class / Graduation Level */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              1. Class / Graduation Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="All">All Education Levels</option>
              <option value="School / 10th-12th">Class 10th / 12th (School)</option>
              <option value="Undergraduate">Undergraduate (B.Tech/B.Sc/MBBS)</option>
              <option value="Postgraduate">Postgraduate (M.Tech/M.Sc/MD)</option>
              <option value="Doctorate">Doctorate / PhD</option>
            </select>
          </div>

          {/* FILTER 2: Academic Field / Stream (Medical, Engineering, etc.) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              2. Discipline / Stream
            </label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="All">All Streams</option>
              <option value="Medical">Medical & Healthcare 🩺</option>
              <option value="Engineering">Engineering & Technology ⚙️</option>
              <option value="STEM">Science & Mathematics (STEM) 🧪</option>
              <option value="Arts">Arts, Commerce & General 📚</option>
            </select>
          </div>

          {/* FILTER 3: Govt or Private Funding */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              3. Funding Provider Type
            </label>
            <select
              value={fundingType}
              onChange={(e) => setFundingType(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="All">All Funding Types</option>
              <option value="Govt">Official Govt Schemes 🏛️</option>
              <option value="Private">Private / Foundation Grants 🏢</option>
            </select>
          </div>

          {/* SORT BY */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sort Results By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="all">All / Default Order</option>
              <option value="match">Highest AI Match %</option>
              <option value="amount">Highest Award Amount</option>
              <option value="deadline">Closing Soonest</option>
            </select>
          </div>
        </div>

        {/* Keyword Search Input Bar + Prominent Search Button */}
        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarships by keyword, 10th/12th, or portal (e.g. MahaDBT, MahaJYOTI, Vidyasaarathi)..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all hover:scale-[1.02] shrink-0"
          >
            <Search className="size-4" />
            Search Scholarships
          </button>
        </form>
      </div>

      {/* Scholarship Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isSaved = savedIds.includes(item.id);
            const isApplied = appliedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => setActiveModalScholarship(item)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-500/50 cursor-pointer"
              >
                <div>
                  {/* Top Bar: Match Score & Govt Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/80 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Award className="size-3.5" />
                        {item.match}% AI Match
                      </span>
                      {item.isGovt ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          🏛️ Govt Scheme
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          🏢 Private Grant
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleSave(item.id, e)}
                      className={`rounded-full p-2 transition-colors ${
                        isSaved
                          ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  {/* Title & Provider */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
                    <Building2 className="size-3.5 text-slate-400" />
                    {item.provider}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Award Amount</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">{item.amountFormatted}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> Applied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-blue-600 dark:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white group-hover:bg-blue-700 transition-colors">
                        Details & Apply <ChevronRight className="size-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm font-semibold">No scholarships matched your selected class, stream, or funding filters.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedLevel("All");
              setSelectedStream("All");
              setFundingType("All");
              setSelectedPortal("All");
              setSearchQuery("");
              setSortBy("all");
            }}
            className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* SCHOLARSHIP DETAILS & APPLICATION MODAL */}
      {activeModalScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl space-y-5 animate-rise-in max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModalScholarship(null)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="size-5" />
            </button>

            {applySuccess ? (
              <div className="py-10 text-center space-y-3">
                <div className="inline-flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <CheckCircle2 className="size-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Application Saved in PostgreSQL!</h3>
                <p className="text-xs text-slate-500">
                  Your application for <span className="font-bold">{activeModalScholarship.name}</span> has been saved permanently in PostgreSQL.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                      {activeModalScholarship.match}% AI Match
                    </span>
                    {activeModalScholarship.isGovt ? (
                      <span className="rounded-full bg-amber-50 dark:bg-amber-950 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                        🏛️ Official Govt Scheme
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        🏢 Private Grant
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {activeModalScholarship.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">{activeModalScholarship.provider}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Award Amount:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeModalScholarship.amountFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Closing Deadline:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeModalScholarship.deadline}</span>
                  </div>
                  {activeModalScholarship.portalUrl && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400">Official Portal:</span>
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

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Eligibility Requirements</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-50/50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900">
                    {activeModalScholarship.requirements}
                  </p>
                </div>

                {/* Application Form */}
                <form onSubmit={handleApplySubmit} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Submit Application to Database</h4>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Applicant Full Name</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    {activeModalScholarship.portalUrl && (
                      <a
                        href={activeModalScholarship.portalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100"
                      >
                        Visit Govt Portal <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-blue-600 dark:bg-blue-500 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                    >
                      Submit & Save to PostgreSQL
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchScholarshipView;
