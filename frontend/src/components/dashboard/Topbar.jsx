import {
  LatestNotificationsTicker,
  NotificationsBell,
} from "./LatestNotifications";
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
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-slate-200 bg-white/80 px-6 py-3.5 backdrop-blur">
      <LatestNotificationsTicker />

      <div className="ml-auto flex shrink-0 items-center gap-4">
        <NotificationsBell />

        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
            {initials}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
