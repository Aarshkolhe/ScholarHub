import { useState, useEffect } from "react";
import { Search, Filter, Bookmark, CheckCircle2, X, SlidersHorizontal, ArrowUpDown, Award, Calendar, ChevronRight } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const SCHOLARSHIP_DATABASE = [
  {
    id: "s1",
    name: "National Merit STEM Grant",
    deadline: "18 Aug 2026",
    daysLeft: 12,
    amount: 50000,
    amountFormatted: "₹50,000",
    match: 98,
    category: "STEM",
    degree: "Undergraduate",
    provider: "National Science Foundation",
    minScore: 75,
    description: "Financial grant for undergraduate students pursuing Science, Technology, and Mathematics degrees.",
    requirements: "Minimum 75% aggregate score in 12th/previous semester. Annual family income below ₹6 Lakhs.",
  },
  {
    id: "s2",
    name: "State Girls in Tech Fund",
    deadline: "12 Sep 2026",
    daysLeft: 37,
    amount: 35000,
    amountFormatted: "₹35,000",
    match: 93,
    category: "Technology",
    degree: "Undergraduate",
    provider: "State Education Council",
    minScore: 70,
    description: "Empowering female students enrolled in Computer Science, IT, and Artificial Intelligence programs.",
    requirements: "Enrolled in accredited IT/CS course. Open to female candidates across all states.",
  },
  {
    id: "s3",
    name: "First-Gen Excellence Award",
    deadline: "30 Sep 2026",
    daysLeft: 55,
    amount: 40000,
    amountFormatted: "₹40,000",
    match: 89,
    category: "General",
    degree: "Undergraduate",
    provider: "Global Higher Ed Trust",
    minScore: 65,
    description: "Dedicated scholarship award for first-generation university students with demonstrated merit.",
    requirements: "First person in immediate family to pursue higher university education.",
  },
  {
    id: "s4",
    name: "Global Engineering Fellowship",
    deadline: "15 Oct 2026",
    daysLeft: 70,
    amount: 75000,
    amountFormatted: "₹75,000",
    match: 95,
    category: "Engineering",
    degree: "Postgraduate",
    provider: "International Tech Alliance",
    minScore: 80,
    description: "Prestige scholarship for outstanding engineering students specializing in Robotics & AI.",
    requirements: "Minimum 8.0 CGPA or equivalent 80% mark in previous semester.",
  },
  {
    id: "s5",
    name: "Higher Education Merit Scholarship",
    deadline: "01 Nov 2026",
    daysLeft: 87,
    amount: 60000,
    amountFormatted: "₹60,000",
    match: 91,
    category: "Merit",
    degree: "Undergraduate",
    provider: "Ministry of Education",
    minScore: 85,
    description: "Merit-cum-means scholarship for post-secondary education across recognized institutions.",
    requirements: "Demonstrated academic excellence and top rank in institutional admissions.",
  },
  {
    id: "s6",
    name: "AI & Machine Learning Research Grant",
    deadline: "10 Nov 2026",
    daysLeft: 96,
    amount: 90000,
    amountFormatted: "₹90,000",
    match: 97,
    category: "Technology",
    degree: "Postgraduate",
    provider: "Advanced AI Research Institute",
    minScore: 85,
    description: "Research funding for students conducting projects in Deep Learning, Computer Vision, or NLP.",
    requirements: "Published research paper or approved thesis proposal in AI/ML domain.",
  },
  {
    id: "s7",
    name: "Rural Student Empowerment Fund",
    deadline: "25 Sep 2026",
    daysLeft: 50,
    amount: 30000,
    amountFormatted: "₹30,000",
    match: 87,
    category: "General",
    degree: "High School",
    provider: "Rural Advancement Foundation",
    minScore: 60,
    description: "Support for talented students from rural districts entering higher education.",
    requirements: "Proof of residence in designated rural district and family income under ₹3 Lakhs.",
  },
  {
    id: "s8",
    name: "Biomedical & Healthcare Innovation Scholarship",
    deadline: "05 Dec 2026",
    daysLeft: 121,
    amount: 80000,
    amountFormatted: "₹80,000",
    match: 92,
    category: "STEM",
    degree: "Postgraduate",
    provider: "Healthcare Tech Foundation",
    minScore: 75,
    description: "Funding for students pursuing degrees in Biotechnology, Pharmacy, or Bioengineering.",
    requirements: "Enrolled in 2nd year or higher of Biomedical/Pharma program.",
  },
];

const CATEGORIES = ["All", "STEM", "Technology", "Engineering", "General", "Merit"];
const DEGREES = ["All Degrees", "High School", "Undergraduate", "Postgraduate"];
const AMOUNT_RANGES = [
  { label: "All Amounts", value: "all" },
  { label: "Under ₹40,000", value: "under40" },
  { label: "₹40,000 - ₹60,000", value: "40to60" },
  { label: "Above ₹60,000", value: "above60" },
];

export function SearchScholarshipView({ initialQuery = "", activeTab = "Search", onUpdateSavedCount, onUpdateAppliedCount }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDegree, setSelectedDegree] = useState("All Degrees");
  const [selectedAmount, setSelectedAmount] = useState("all");
  const [minScoreFilter, setMinScoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match");

  const [savedIds, setSavedIds] = useState(() => {
    const stored = localStorage.getItem("scholarhub_saved_ids");
    return stored ? JSON.parse(stored) : ["s1"];
  });
  const [appliedIds, setAppliedIds] = useState(() => {
    const stored = localStorage.getItem("scholarhub_applied_ids");
    return stored ? JSON.parse(stored) : [];
  });

  const [activeModalItem, setActiveModalItem] = useState(null);
  const [applyModalItem, setApplyModalItem] = useState(null);
  const [applySuccessItem, setApplySuccessItem] = useState(null);

  // Application form fields
  const [courseName, setCourseName] = useState("");
  const [gpaScore, setGpaScore] = useState("");
  const [statement, setStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem("scholarhub_saved_ids", JSON.stringify(savedIds));
    if (onUpdateSavedCount) onUpdateSavedCount(savedIds.length);
  }, [savedIds, onUpdateSavedCount]);

  useEffect(() => {
    localStorage.setItem("scholarhub_applied_ids", JSON.stringify(appliedIds));
    if (onUpdateAppliedCount) onUpdateAppliedCount(appliedIds.length);
  }, [appliedIds, onUpdateAppliedCount]);

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenApply = (scholarship, e) => {
    e.stopPropagation();
    setApplyModalItem(scholarship);
    setActiveModalItem(null);
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!applyModalItem) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAppliedIds((prev) => [...new Set([...prev, applyModalItem.id])]);
      setApplySuccessItem(applyModalItem);
      setApplyModalItem(null);
      setCourseName("");
      setGpaScore("");
      setStatement("");
    }, 600);
  };

  // Filter & Sort Logic
  const filteredScholarships = SCHOLARSHIP_DATABASE.filter((item) => {
    // If in Saved tab, only show bookmarked items
    if (activeTab === "Saved" && !savedIds.includes(item.id)) return false;

    // If in Recommended tab, only show match >= 90%
    if (activeTab === "Recommended" && item.match < 90) return false;

    const query = activeTab === "Search" ? searchTerm.toLowerCase().trim() : "";
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.provider.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesDegree =
      selectedDegree === "All Degrees" || item.degree.toLowerCase() === selectedDegree.toLowerCase();

    let matchesAmount = true;
    if (selectedAmount === "under40") matchesAmount = item.amount < 40000;
    if (selectedAmount === "40to60") matchesAmount = item.amount >= 40000 && item.amount <= 60000;
    if (selectedAmount === "above60") matchesAmount = item.amount > 60000;

    let matchesScore = true;
    if (minScoreFilter === "70") matchesScore = item.minScore <= 70;
    if (minScoreFilter === "80") matchesScore = item.minScore <= 80;

    return matchesSearch && matchesCategory && matchesDegree && matchesAmount && matchesScore;
  }).sort((a, b) => {
    if (sortBy === "match") return b.match - a.match;
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "deadline") return a.daysLeft - b.daysLeft;
    return 0;
  });

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedDegree("All Degrees");
    setSelectedAmount("all");
    setMinScoreFilter("all");
    setSortBy("match");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {activeTab === "Saved" && <Bookmark className="size-6 text-amber-500" />}
            {activeTab === "Recommended" && <Award className="size-6 text-blue-600 dark:text-blue-400" />}
            {activeTab === "Search" && <Search className="size-6 text-blue-600 dark:text-blue-400" />}
            {activeTab === "Saved" ? "Saved Scholarships" : activeTab === "Recommended" ? "Recommended Scholarships (Top Matches)" : "Search Scholarships"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === "Saved"
              ? "Your bookmarked scholarships ready for application."
              : activeTab === "Recommended"
              ? "High-match scholarships tailored to your academic profile."
              : "Browse through active funding opportunities filtered by your preferences."}
          </p>
        </div>

        <button
          type="button"
          onClick={clearAllFilters}
          className="self-start sm:self-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* Main Filters Container: Search bar ONLY visible when activeTab === 'Search' */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-4">
        {activeTab === "Search" && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by scholarship title, provider, field, or degree..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Category */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Degree Level */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Degree Level</label>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            >
              {DEGREES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Award Amount */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Award Amount</label>
            <select
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            >
              {AMOUNT_RANGES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="match">Highest Match %</option>
              <option value="amount">Highest Award Amount</option>
              <option value="deadline">Closing Soonest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredScholarships.length}</span> scholarships
        </p>
      </div>

      {/* Scholarship Cards Grid */}
      {filteredScholarships.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-sm text-slate-500 dark:text-slate-400">
          No scholarships found matching your selection.
          <div className="mt-3">
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScholarships.map((s) => {
            const isSaved = savedIds.includes(s.id);
            const isApplied = appliedIds.includes(s.id);

            return (
              <div
                key={s.id}
                onClick={() => setActiveModalItem(s)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {s.match}% Match
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {s.degree}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(s.id, e)}
                        title={isSaved ? "Remove bookmark" : "Save scholarship"}
                        className={`rounded-lg p-1.5 transition-colors ${
                          isSaved
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                            : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                        }`}
                      >
                        <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Provider */}
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.provider}</p>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
                    {s.description}
                  </p>
                </div>

                {/* Footer Info & Action */}
                <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Award Amount</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{s.amountFormatted}</p>
                  </div>

                  {isApplied ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="size-3.5" /> Applied
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleOpenApply(s, e)}
                      className="rounded-xl bg-blue-600 dark:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105 hover:bg-blue-700"
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

      {/* Details Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {activeModalItem.category} &bull; {activeModalItem.match}% Match
                </span>
                <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                  {activeModalItem.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeModalItem.provider}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <div>
                  <p className="text-xs text-slate-400">Award Amount</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{activeModalItem.amountFormatted}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Deadline</p>
                  <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{activeModalItem.deadline}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Description</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {activeModalItem.description}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Eligibility Criteria</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {activeModalItem.requirements}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>

              {appliedIds.includes(activeModalItem.id) ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> Already Applied
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleOpenApply(activeModalItem, e)}
                  className="rounded-xl bg-blue-600 dark:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {applyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Apply for Scholarship
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate max-w-[260px]">
                  {applyModalItem.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyModalItem(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Applicant Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.fullName || user?.name || "Student"}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Degree / Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">CGPA / Previous Score (%)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8.5 CGPA or 85%"
                  value={gpaScore}
                  onChange={(e) => setGpaScore(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Personal Statement (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brief statement explaining why you are applying..."
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalItem(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {applySuccessItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm text-center rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
              Application Submitted!
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your application for <span className="font-semibold text-slate-700 dark:text-slate-200">{applySuccessItem.name}</span> has been submitted successfully.
            </p>
            <button
              type="button"
              onClick={() => setApplySuccessItem(null)}
              className="mt-5 w-full rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold shadow-md hover:bg-emerald-700"
            >
              Great, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchScholarshipView;
