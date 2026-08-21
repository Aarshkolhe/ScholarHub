import { useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  IndianRupee,
  ShieldCheck,
  Award,
  Bookmark,
  Send,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getStoredStudentProfile } from "../../lib/eligibilityEngine";

export function StudentProfileOverview({ onNavigateTab }) {
  const { user } = useAuth();
  const profile = useMemo(() => getStoredStudentProfile(), [user]);

  const initials =
    (profile.name || "Student")
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase() || "ST";

  const savedIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("scholarhub_saved_ids") || "[]");
    } catch {
      return [];
    }
  }, []);

  const appliedIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("scholarhub_applied_ids") || "[]");
    } catch {
      return [];
    }
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="size-6 text-blue-600 dark:text-blue-400" />
            Student Profile Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal student account, view saved activity, and verify your credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("Details")}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Edit Eligibility Details <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* Main Profile Hero Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-display text-2xl font-bold shadow-lg shadow-blue-500/20 ring-4 ring-blue-50 dark:ring-blue-950">
            {initials}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {profile.name}
              </h2>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Student Account
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" /> Active
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="size-3.5" /> {profile.email}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="size-3.5" /> {profile.collegeName || "National Institute of Technology"} &bull; {profile.currentCourse} ({profile.yearSemester || "1st Year"})
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Applications</p>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">{appliedIds.length}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Bookmarked</p>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">{savedIds.length}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Score / CGPA</p>
            <p className="font-display text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{profile.marksPercentage || "78%"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Profile Status</p>
            <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Verified</p>
          </div>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Summary */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
              Credentials & Category Summary
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("Details")}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Update
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Social Category</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.category}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Domicile State</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.domicileState}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Annual Family Income</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ₹{parseFloat(profile.annualIncome || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Gender & Age</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.gender || "Male"} &bull; {profile.age || "21"} yrs</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Special Criteria</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.specialCriteria || "None"}</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Quick Navigation
          </h3>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("Details")}
              className="w-full flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors text-left"
            >
              <span>Manage Academic & Financial Details</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("Eligibility")}
              className="w-full flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors text-left"
            >
              <span>Run Eligibility Checker & Simulator</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("Saved")}
              className="w-full flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors text-left"
            >
              <span>View Bookmarked Scholarships ({savedIds.length})</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileOverview;
