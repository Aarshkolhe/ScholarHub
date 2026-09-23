import { Search } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { AiAssistantPill } from "@/components/dashboard/ai-assistant-pill"
import { StatCards } from "@/components/dashboard/stat-cards"
import { RecentScholarships } from "@/components/dashboard/recent-scholarships"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 space-y-6 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search scholarships..."
                aria-label="Search scholarships"
                className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <AiAssistantPill />
          </div>

          <div className="animate-rise-in">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome back, Riya{" "}
              <span className="animate-wave" aria-hidden="true">
                {"\u{1F44B}"}
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s what&apos;s happening with your scholarships today.
            </p>
          </div>

          <StatCards />
          <RecentScholarships />
        </main>
      </div>
    </div>
  )
}
