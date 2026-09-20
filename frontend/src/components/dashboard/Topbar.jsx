import { useState, useRef, useEffect } from "react";
import { User, ClipboardList, Settings, LogOut, ChevronDown, Menu, Sparkles, GraduationCap } from "lucide-react";
import {
  LatestNotificationsTicker,
  NotificationsBell,
} from "./LatestNotifications";
import ThemeToggle from "./ThemeToggle";
import useAuth from "../../hooks/useAuth";
import { SignOutConfirmModal } from "./SignOutConfirmModal";

export function Topbar({ onSelectTab, onToggleSidebar, isSidebarOpen = false }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
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
    <header className="sticky top-0 z-20 flex items-center gap-3 sm:gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c0f1d]/70 px-4 sm:px-6 py-3.5 backdrop-blur-xl transition-colors">
      {/* Left Group: Menu Toggle & Brand Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          aria-label="Toggle navigation menu"
          className="flex size-10 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400 shadow-sm transition-all shrink-0 hover:scale-105 active:scale-95 outline-none"
        >
          <Menu className="size-5" />
        </button>

        {/* Brand Logo & Name */}
        <div
          onClick={() => onSelectTab && onSelectTab("Dashboard")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="size-5" />
          </div>
          <span className="hidden sm:inline-block font-display text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            Scholar<span className="text-violet-600 dark:text-violet-400">Hub</span>
          </span>
        </div>
      </div>

      {/* Vertical Separator Divider */}
      <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-slate-800/80 shrink-0 mx-1" />

      {/* Latest Notifications Ticker Feed */}
      <LatestNotificationsTicker />

      {/* Right User Actions & Menu Pill */}
      <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-3.5">
        <ThemeToggle />
        <NotificationsBell />

        {/* Profile Menu Pill */}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="User Profile Menu"
            className="flex items-center gap-2.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-1.5 sm:px-3 sm:py-1.5 shadow-sm transition-all hover:border-violet-500/50 hover:shadow-md hover:scale-[1.02] outline-none"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-md overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={displayName} className="size-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                {displayName}
                <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </p>
              <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">{userRole}</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2.5 w-64 origin-top-right rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#151929]/95 p-2 shadow-2xl backdrop-blur-2xl animate-fade-in-up z-30">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {userEmail}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-950/80 px-2.5 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  <Sparkles className="size-3" />
                  {userRole} Account
                </span>
              </div>

              <div className="py-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleNavigate("Profile")}
                  className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <User className="size-4 text-violet-600 dark:text-violet-400" />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("Details")}
                  className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <ClipboardList className="size-4 text-indigo-500" />
                  Eligibility Form
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("Settings")}
                  className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <Settings className="size-4 text-slate-500" />
                  Settings
                </button>

                <div className="my-1 h-px bg-slate-100 dark:bg-slate-800/80" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowSignOutConfirm(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <LogOut className="size-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={() => {
          setShowSignOutConfirm(false);
          signOut();
        }}
      />
    </header>
  );
}

export default Topbar;
