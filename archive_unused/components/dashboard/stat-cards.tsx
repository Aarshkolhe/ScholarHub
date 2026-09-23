import { Star, Clock, UserCheck, Bookmark } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const stats: {
  value: string
  label: string
  icon: LucideIcon
  tint: string
  anim: string
}[] = [
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
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          style={{ animationDelay: `${i * 90}ms` }}
          className="group animate-rise-in rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
        >
          <span
            className={`flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${stat.tint}`}
          >
            <stat.icon className={`size-5 ${stat.anim}`} />
          </span>
          <p className="mt-4 font-display text-3xl font-bold text-foreground">
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
