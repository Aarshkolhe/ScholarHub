const ALL_SCHOLARSHIPS = [
  {
    name: "National Merit STEM Grant",
    deadline: "18 Aug 2026",
    amount: "₹50,000",
    match: "98% Match",
    category: "STEM",
  },
  {
    name: "State Girls in Tech Fund",
    deadline: "12 Sep 2026",
    amount: "₹35,000",
    match: "93% Match",
    category: "Technology",
  },
  {
    name: "First-Gen Excellence Award",
    deadline: "30 Sep 2026",
    amount: "₹40,000",
    match: "89% Match",
    category: "General",
  },
  {
    name: "Global Engineering Fellowship",
    deadline: "15 Oct 2026",
    amount: "₹75,000",
    match: "95% Match",
    category: "Engineering",
  },
  {
    name: "Higher Education Merit Scholarship",
    deadline: "01 Nov 2026",
    amount: "₹60,000",
    match: "91% Match",
    category: "Merit",
  },
];

export function RecentScholarships({ searchQuery = "" }) {
  const filtered = ALL_SCHOLARSHIPS.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
          {searchQuery ? `Matching Scholarships (${filtered.length})` : "Recently Added Scholarships"}
        </h2>
        <a
          href="#"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all
        </a>
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No scholarships found matching "{searchQuery}". Try a different search term.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((s, i) => (
            <li
              key={s.name}
              style={{ animationDelay: `${i * 100 + 150}ms` }}
              className="group flex animate-rise-in items-center justify-between gap-4 rounded-lg px-2 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {s.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Deadline: {s.deadline} &middot; {s.amount} &middot; <span className="font-medium text-slate-600 dark:text-slate-300">{s.category}</span>
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-105">
                {s.match}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentScholarships;
