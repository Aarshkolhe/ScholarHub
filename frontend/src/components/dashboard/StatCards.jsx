import { Star, Clock, UserCheck, Bookmark, Send } from "lucide-react";
import { calculateProfileStrength } from "../../lib/eligibilityEngine";

export function StatCards({
  recommendedCount = 0,
  savedCount = 0,
  appliedCount = 0,
  profileStrength = null,
  onSelectStatFilter,
}) {
  const dynamicStrength = profileStrength !== null ? profileStrength : calculateProfileStrength();

  const stats = [
    {
      id: "recommended",
      value: String(recommendedCount),
      label: "Recommended Grants",
      icon: Star,
      tint: "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
      anim: "animate-icon-twinkle",
      targetTab: "Recommended",
    },
    {
      id: "applied",
      value: String(appliedCount),
      label: "Applications Submitted",
      icon: Send,
      tint: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
      anim: "animate-icon-float",
      targetTab: "Search",
    },
    {
      id: "profile",
      value: `${dynamicStrength}%`,
      label: "Details Strength",
      icon: UserCheck,
      tint: "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
      anim: "animate-icon-tick",
      targetTab: "Details",
    },
    {
      id: "saved",
      value: String(savedCount),
      label: "Saved Scholarships",
      icon: Bookmark,
      tint: "bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400",
      anim: "animate-icon-bounce",
      targetTab: "Saved",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            onClick={() => onSelectStatFilter && onSelectStatFilter(stat.targetTab || stat.id)}
            style={{ animationDelay: `${i * 90}ms` }}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-300 ease-out hover:scale-[1.025] hover:shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${stat.tint}`}
              >
                <Icon className={`size-5 ${stat.anim}`} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
                View &rarr;
              </span>
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export default StatCards;
