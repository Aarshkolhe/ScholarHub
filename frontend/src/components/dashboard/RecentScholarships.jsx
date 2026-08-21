import { useState, useEffect } from "react";
import { Bookmark, CheckCircle2, FileText, Send, Sparkles, X, Filter, ExternalLink, ShieldCheck, Building2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const INITIAL_SCHOLARSHIPS = [
  {
    id: "nsp-1",
    name: "Central Sector Scheme of Scholarships for College & University Students (CSSS)",
    deadline: "31 Oct 2026",
    amount: "₹20,000 / yr",
    match: "98% Match",
    category: "Govt Scheme",
    provider: "Ministry of Education (Govt of India) — NSP",
    portalUrl: "https://scholarships.gov.in",
    isGovt: true,
    description: "Financial assistance for meritorious students from low-income families pursuing regular graduate and post-graduate courses.",
    requirements: "Above 80th percentile in Class 12 board exam. Annual family income below ₹4.5 Lakhs.",
  },
  {
    id: "aicte-1",
    name: "AICTE Pragati Scholarship Scheme for Girl Students",
    deadline: "15 Nov 2026",
    amount: "₹50,000 / yr",
    match: "96% Match",
    category: "Govt Scheme",
    provider: "AICTE & Ministry of Education (Govt of India)",
    portalUrl: "https://scholarships.gov.in",
    isGovt: true,
    description: "Empowering female technical students admitted to 1st year AICTE-approved Degree/Diploma institutions.",
    requirements: "Up to 2 girl children per family. Annual family income below ₹8 Lakhs.",
  },
  {
    id: "nsp-2",
    name: "PM-YASASVI Post-Matric Scholarship for OBC, EBC & DNT Students",
    deadline: "15 Oct 2026",
    amount: "₹75,000 / yr",
    match: "94% Match",
    category: "Govt Scheme",
    provider: "Ministry of Social Justice & Empowerment",
    portalUrl: "https://yet.nta.ac.in",
    isGovt: true,
    description: "Comprehensive tuition and hostel allowance grant for OBC, EBC, and De-notified Tribe college students.",
    requirements: "Belonging to OBC/EBC/DNT category. Annual family income below ₹2.5 Lakhs.",
  },
  {
    id: "dst-1",
    name: "INSPIRE Scholarship for Higher Education (SHE)",
    deadline: "31 Dec 2026",
    amount: "₹80,000 / yr",
    match: "95% Match",
    category: "STEM",
    provider: "Department of Science & Technology (DST Govt of India)",
    portalUrl: "https://online-inspire.gov.in",
    isGovt: true,
    description: "Prestigious fellowship for students pursuing Natural & Basic Sciences (B.Sc / M.Sc integrated) at top universities.",
    requirements: "Top 1% in Class 12 board exams or rank in JEE/NEET. Enrolled in Basic & Natural Sciences.",
  },
  {
    id: "min-1",
    name: "Merit-cum-Means Scholarship for Professional & Technical Courses",
    deadline: "05 Nov 2026",
    amount: "₹30,000 / yr",
    match: "93% Match",
    category: "Govt Scheme",
    provider: "Ministry of Minority Affairs (Govt of India)",
    portalUrl: "https://scholarships.gov.in",
    isGovt: true,
    description: "Financial assistance for minority students pursuing technical or professional courses at recognized colleges.",
    requirements: "Belonging to notified minority community (Muslim, Christian, Sikh, Buddhist, Jain, Parsi). Income < ₹2.5 Lakhs.",
  },
  {
    id: "mahadbt-1",
    name: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojana",
    deadline: "15 Dec 2026",
    amount: "₹60,000 / yr",
    match: "91% Match",
    category: "Govt Scheme",
    provider: "Government of Maharashtra (MahaDBT Portal)",
    portalUrl: "https://mahadbt.maharashtra.gov.in",
    isGovt: true,
    description: "50% to 100% tuition fee reimbursement for EBC & General category students in professional streams.",
    requirements: "Domicile of Maharashtra State. Annual family income below ₹8 Lakhs.",
  },
];

const CATEGORIES = ["All", "Govt Scheme", "STEM", "Technology", "Engineering"];

export function RecentScholarships({ searchQuery = "", onViewAllClick, onUpdateSavedCount, onUpdateAppliedCount }) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedIds, setSavedIds] = useState(() => {
    const stored = localStorage.getItem("scholarhub_saved_ids");
    return stored ? JSON.parse(stored) : ["nsp-1", "aicte-1"];
  });
  const [appliedIds, setAppliedIds] = useState(() => {
    const stored = localStorage.getItem("scholarhub_applied_ids");
    return stored ? JSON.parse(stored) : [];
  });

  const [activeModalItem, setActiveModalItem] = useState(null); // details modal
  const [applyModalItem, setApplyModalItem] = useState(null); // application form modal
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

  const filtered = INITIAL_SCHOLARSHIPS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || s.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="size-5 text-blue-600 dark:text-blue-400" />
            Official Government & National Scholarships
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {filtered.length} verified government portal opportunities matched to your profile
          </p>
        </div>

        {/* Category Pills & View All */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat === "Govt Scheme" ? "🏛️ Govt Schemes" : cat}
            </button>
          ))}
          {onViewAllClick && (
            <button
              type="button"
              onClick={onViewAllClick}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-1"
            >
              View All &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Scholarship List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          No government scholarships found matching "{searchQuery || selectedCategory}". Try clearing your filter.
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((s) => {
            const isSaved = savedIds.includes(s.id);
            const isApplied = appliedIds.includes(s.id);

            return (
              <li
                key={s.id}
                onClick={() => setActiveModalItem(s)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl p-3.5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {s.match}
                    </span>
                    {s.isGovt && (
                      <span className="shrink-0 rounded-full bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        🏛️ Govt Scheme
                      </span>
                    )}
                    <span className="text-xs text-slate-400 dark:text-slate-500">&bull;</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                      {s.provider}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Award: <span className="font-semibold text-slate-700 dark:text-slate-200">{s.amount}</span> &middot; Deadline: {s.deadline}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => toggleBookmark(s.id, e)}
                    title={isSaved ? "Remove from saved" : "Save scholarship"}
                    className={`rounded-lg p-2 transition-colors ${
                      isSaved
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                        : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                    }`}
                  >
                    <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} />
                  </button>

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
              </li>
            );
          })}
        </ul>
      )}

      {/* Details Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {activeModalItem.category} &bull; {activeModalItem.match}
                  </span>
                  {activeModalItem.isGovt && (
                    <span className="inline-block rounded-full bg-amber-50 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      🏛️ Govt Scheme
                    </span>
                  )}
                </div>
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
                  <p className="text-base font-bold text-slate-900 dark:text-white">{activeModalItem.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Deadline</p>
                  <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{activeModalItem.deadline}</p>
                </div>
              </div>

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
              {activeModalItem.portalUrl && (
                <a
                  href={activeModalItem.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1"
                >
                  Visit Govt Portal <ExternalLink className="size-3" />
                </a>
              )}
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
                  {isSubmitting ? "Submitting..." : <><Send className="size-3.5" /> Submit Application</>}
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
    </section>
  );
}

export default RecentScholarships;
