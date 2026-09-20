import { Star, UserCheck, Bookmark, Send, TrendingUp } from "lucide-react";
import { calculateProfileStrength } from "../../lib/eligibilityEngine";
import { cn } from "../../lib/utils";
import SpotlightCard from "../ui/SpotlightCard";

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
      sublabel: "Match Score 90%+",
      icon: Star,
      accentGradient: "from-amber-400 via-amber-500 to-orange-500",
      bgBubble: "bg-amber-500/10 text-amber-500 dark:bg-amber-400/15 dark:text-amber-300",
      spotlight: "rgba(245, 158, 11, 0.22)",
      glow: "hover:shadow-amber-500/20",
      barColor: "bg-gradient-to-r from-amber-400 to-orange-500",
      percent: Math.min(100, (recommendedCount / 10) * 100 || 65),
      targetTab: "Recommended",
    },
    {
      id: "applied",
      value: String(appliedCount),
      label: "Applications Submitted",
      sublabel: "Active Tracked",
      icon: Send,
      accentGradient: "from-emerald-400 via-teal-500 to-cyan-500",
      bgBubble: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300",
      spotlight: "rgba(16, 185, 129, 0.22)",
      glow: "hover:shadow-emerald-500/20",
      barColor: "bg-gradient-to-r from-emerald-400 to-teal-500",
      percent: Math.min(100, (appliedCount / 5) * 100 || 40),
      targetTab: "Search",
    },
    {
      id: "profile",
      value: `${dynamicStrength}%`,
      label: "Details Strength",
      sublabel: dynamicStrength >= 80 ? "Verified Profile" : "Requires Input",
      icon: UserCheck,
      accentGradient: "from-indigo-500 via-purple-500 to-pink-500",
      bgBubble: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300",
      spotlight: "rgba(99, 102, 241, 0.22)",
      glow: "hover:shadow-indigo-500/20",
      barColor: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
      percent: dynamicStrength,
      targetTab: "Details",
    },
    {
      id: "saved",
      value: String(savedCount),
      label: "Saved Scholarships",
      sublabel: "Bookmarked Items",
      icon: Bookmark,
      accentGradient: "from-violet-500 via-fuchsia-500 to-pink-500",
      bgBubble: "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
      spotlight: "rgba(168, 85, 247, 0.22)",
      glow: "hover:shadow-violet-500/20",
      barColor: "bg-gradient-to-r from-violet-500 to-fuchsia-500",
      percent: Math.min(100, (savedCount / 8) * 100 || 50),
      targetTab: "Saved",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <SpotlightCard
            key={stat.id}
            spotlightColor={stat.spotlight}
            onClick={() => onSelectStatFilter && onSelectStatFilter(stat.targetTab || stat.id)}
            style={{ animationDelay: `${i * 80}ms` }}
            className={cn(
              "group relative overflow-hidden rounded-3xl p-5 cursor-pointer transition-all duration-300 ease-out",
              "bg-white/80 dark:bg-[#151929]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80",
              "shadow-lg hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.02]",
              stat.glow
            )}
          >
            {/* Top Subtle Color Ambient Glow */}
            <div
              className={cn(
                "absolute -top-12 -right-12 size-28 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none",
                `bg-gradient-to-br ${stat.accentGradient}`
              )}
            />

            <div className="relative z-10 flex items-start justify-between">
              {/* Icon Bubble */}
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                  stat.bgBubble
                )}
              >
                <Icon className="size-6" />
              </div>

              {/* Action pill / indicator */}
              <span className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-200">
                <span>View</span>
                <TrendingUp className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>

            {/* Main Value & Labels */}
            <div className="relative z-10 mt-4">
              <p className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {stat.label}
                </p>
              </div>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">
                {stat.sublabel}
              </p>

              {/* Progress Bar Widget */}
              <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  style={{ width: `${Math.max(12, stat.percent)}%` }}
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", stat.barColor)}
                />
              </div>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}

export default StatCards;
