import { Search, Users, GraduationCap, FileCheck, AlertCircle } from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import useAuth from "../../hooks/useAuth";

export function AdminDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || user?.name || "Admin User";

  const adminStats = [
    { label: "Total Applicants", value: "1,248", icon: Users, tint: "bg-blue-100 text-blue-600" },
    { label: "Active Scholarships", value: "42", icon: GraduationCap, tint: "bg-emerald-100 text-emerald-600" },
    { label: "Pending Approvals", value: "18", icon: FileCheck, tint: "bg-amber-100 text-amber-600" },
    { label: "Flagged Queries", value: "4", icon: AlertCircle, tint: "bg-rose-100 text-rose-600" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onSelectTab={(tab) => console.log("Admin tab selected:", tab)} />

        <main className="flex-1 space-y-6 px-6 py-6 max-w-7xl w-full mx-auto">
          <div className="animate-rise-in">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Admin Portal Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Logged in as <span className="font-semibold text-slate-700 dark:text-slate-200">{name}</span>. Manage applications, review student submissions, and update listings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {adminStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className={`flex size-10 items-center justify-center rounded-xl ${stat.tint}`}>
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              System Health & Management Actions
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex flex-col items-start p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors text-left">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Post New Scholarship</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add a new grant or funding opportunity to the database.</span>
              </button>
              <button className="flex flex-col items-start p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors text-left">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Review Applications</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">18 applications currently awaiting verification.</span>
              </button>
              <button className="flex flex-col items-start p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors text-left">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Export Student Reports</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Download CSV/PDF reports of student matches.</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
