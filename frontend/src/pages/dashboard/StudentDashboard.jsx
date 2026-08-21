import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import AiAssistantPill from "../../components/dashboard/AiAssistantPill";
import StatCards from "../../components/dashboard/StatCards";
import RecentScholarships from "../../components/dashboard/RecentScholarships";
import useAuth from "../../hooks/useAuth";

export function StudentDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const initialQuery = queryParams.get("q") || queryParams.get("name") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const displayName = user?.fullName || user?.name || "Student";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 space-y-6 px-6 py-6 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholarships by keyword, field, or organization..."
                aria-label="Search scholarships"
                className="w-full rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 outline-none shadow-sm transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <AiAssistantPill />
          </div>

          <div className="animate-rise-in">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {firstName}{" "}
              <span className="animate-wave" aria-hidden="true">
                {"\u{1F44B}"}
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Here&apos;s what&apos;s happening with your scholarship applications today.
            </p>
          </div>

          <StatCards />
          <RecentScholarships searchQuery={searchQuery} />
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
