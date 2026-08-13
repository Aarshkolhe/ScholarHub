const scholarships = [
  {
    name: "National Merit STEM Grant",
    deadline: "18 Aug 2026",
    amount: "\u20B950,000",
    match: "98% Match",
  },
  {
    name: "State Girls in Tech Fund",
    deadline: "12 Sep 2026",
    amount: "\u20B935,000",
    match: "93% Match",
  },
  {
    name: "First-Gen Excellence Award",
    deadline: "30 Sep 2026",
    amount: "\u20B940,000",
    match: "89% Match",
  },
]

export function RecentScholarships() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-foreground">
          Recently Added Scholarships
        </h2>
        <a
          href="#"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </a>
      </div>

      <ul className="mt-4 divide-y divide-border">
        {scholarships.map((s, i) => (
          <li
            key={s.name}
            style={{ animationDelay: `${i * 100 + 150}ms` }}
            className="group flex animate-rise-in items-center justify-between gap-4 rounded-lg px-2 py-3.5 transition-colors hover:bg-accent/60"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {s.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Deadline: {s.deadline} &middot; {s.amount}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-transform duration-300 group-hover:scale-105">
              {s.match}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
