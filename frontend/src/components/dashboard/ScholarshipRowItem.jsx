import { Bookmark } from "lucide-react";

export function ScholarshipRowItem({
  scholarship,
  isSaved,
  isApplied,
  onToggleSave,
  onOpenDetails,
  onOpenApply,
}) {
  return (
    <div
      onClick={() => onOpenDetails(scholarship)}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
    >
      {/* Main Left Content */}
      <div className="space-y-1.5 min-w-0 flex-1">
        {/* Badges & Provider Line */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Match Score Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
              scholarship.isEligible
                ? "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/30"
                : "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30"
            }`}
          >
            {scholarship.isEligible ? `${scholarship.matchScore}% Match` : `Not Eligible (${scholarship.matchScore}%)`}
          </span>

          {/* Govt Scheme Badge */}
          {scholarship.isGovt ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold">
              🏛️ Govt Scheme
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-500/15 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/30 px-2 py-0.5 text-[11px] font-semibold">
              🏢 Private Grant
            </span>
          )}

          <span className="text-slate-400 dark:text-slate-600">•</span>

          {/* Provider / Ministry */}
          <span className="text-slate-600 dark:text-slate-400 text-xs truncate max-w-md">
            {scholarship.provider}
          </span>
        </div>

        {/* Scholarship Name */}
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
          {scholarship.name}
        </h3>

        {/* Award & Deadline Details */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <span>
            Award: <strong className="font-bold text-slate-800 dark:text-slate-200">{scholarship.amountFormatted}</strong>
          </span>
          <span>•</span>
          <span>
            Deadline: <span className="font-medium text-slate-700 dark:text-slate-300">{scholarship.deadline || "31 Oct 2026"}</span>
          </span>
          {!scholarship.isEligible && scholarship.reasons?.length > 0 && (
            <>
              <span>•</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Note: {scholarship.reasons[0]}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: Bookmark & Apply Now Pill Button */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0">
        <button
          type="button"
          onClick={(e) => onToggleSave(scholarship.id, e)}
          title={isSaved ? "Bookmarked" : "Bookmark scholarship"}
          className={`rounded-full p-2 transition-colors ${
            isSaved
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} />
        </button>

        {isApplied ? (
          <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 px-4 py-1.5 text-xs font-bold">
            Applied
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => onOpenApply(scholarship, e)}
            className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}

export default ScholarshipRowItem;
