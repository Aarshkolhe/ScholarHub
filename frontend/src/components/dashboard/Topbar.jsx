import {
  LatestNotificationsTicker,
  NotificationsBell,
} from "./LatestNotifications";
import ThemeToggle from "./ThemeToggle";
import useAuth from "../../hooks/useAuth";

export function Topbar() {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.name || "Riya Sharma";
  const userRole = user?.role || "Student";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 px-6 py-3.5 backdrop-blur transition-colors">
      <LatestNotificationsTicker />

      <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
        <ThemeToggle />
        <NotificationsBell />

        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-semibold text-blue-600 dark:text-blue-400">
            {initials}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{displayName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
