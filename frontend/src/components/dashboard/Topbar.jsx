import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown, Check } from "lucide-react";
import {
  LatestNotificationsTicker,
  NotificationsBell,
} from "./LatestNotifications";
import ThemeToggle from "./ThemeToggle";
import useAuth from "../../hooks/useAuth";

export function Topbar({ onSelectTab }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  const displayName = user?.fullName || user?.name || "Student";
  const userEmail = user?.email || "student@scholarhub.edu";
  const userRole = user?.role || "Student";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .substring(0, 2)
    .toUpperCase() || "ST";

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleNavigate = (tabId) => {
    setMenuOpen(false);
    if (onSelectTab) onSelectTab(tabId);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 px-6 py-3.5 backdrop-blur transition-colors">
      <LatestNotificationsTicker />

      <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
        <ThemeToggle />
        <NotificationsBell />

        {/* Accessible Profile Menu Button */}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="User Profile Menu"
            className="flex items-center gap-2.5 rounded-full p-1 sm:px-2.5 sm:py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60 text-sm font-bold text-blue-600 dark:text-blue-300 ring-2 ring-blue-500/20">
              {initials}
            </span>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                {displayName}
                <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{userRole}</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl animate-rise-in z-30">
              {/* User Header */}
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {userEmail}
                </p>
                <span className="mt-2 inline-block rounded-full bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {userRole} Account
                </span>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleNavigate("Profile")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="size-4 text-blue-600 dark:text-blue-400" />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("Settings")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="size-4 text-slate-500" />
                  Account Settings
                </button>

                <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <LogOut className="size-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
