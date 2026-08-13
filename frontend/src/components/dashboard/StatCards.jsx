import { Star, Clock, UserCheck, Bookmark } from "lucide-react";

const stats = [
  {
    value: "5",
    label: "Recommended (Top 5)",
    icon: Star,
    tint: "bg-amber-100 text-amber-600",
    anim: "animate-icon-twinkle",
  },
  {
    value: "3",
    label: "Upcoming Deadlines",
    icon: Clock,
    tint: "bg-rose-100 text-rose-600",
    anim: "animate-icon-tick",
  },
  {
    value: "90%",
    label: "Profile Completion",
    icon: UserCheck,
    tint: "bg-blue-100 text-blue-600",
    anim: "animate-icon-float",
  },
  {
    value: "12",
    label: "Saved Scholarships",
    icon: Bookmark,
    tint: "bg-violet-100 text-violet-600",
    anim: "animate-icon-bounce",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            style={{ animationDelay: `${i * 90}ms` }}
            className="group animate-rise-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5"
          >
            <span
              className={`flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${stat.tint}`}
            >
              <Icon className={`size-5 ${stat.anim}`} />
            </span>
            <p className="mt-4 font-display text-3xl font-bold text-slate-900">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export default StatCards;
