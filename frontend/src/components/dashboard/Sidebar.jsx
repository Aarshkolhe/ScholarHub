import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Bookmark,
  Bot,
  Bell,
  ClipboardList,
  User,
  Settings,
  LogOut,
  GraduationCap,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../../lib/utils";
import useAuth from "../../hooks/useAuth";
import { calculateProfileStrength } from "../../lib/eligibilityEngine";
import { SignOutConfirmModal } from "./SignOutConfirmModal";
import VerticalDock from "../ui/VerticalDock";

const mainNav = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "Search", label: "Search Grants", icon: Search },
  { id: "Recommended", label: "Recommended", icon: Sparkles },
  { id: "Saved", label: "Saved Items", icon: Bookmark },
  { id: "AI", label: "AI Counselor", icon: Bot },
  { id: "Notifications", label: "Notifications", icon: Bell },
];

const secondaryNav = [
  { id: "Profile", label: "My Profile", icon: User },
  { id: "Details", label: "Eligibility Form", icon: ClipboardList },
  { id: "Settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  isOpen = false,
  onClose,
  activeTab = "Dashboard",
  onTabChange,
}) {
  const { signOut, user } = useAuth();
  const [profileStrength, setProfileStrength] = useState(() => calculateProfileStrength());
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    const updateStrength = () => setProfileStrength(calculateProfileStrength());
    updateStrength();
    window.addEventListener("scholarhub_profile_updated", updateStrength);
    return () => window.removeEventListener("scholarhub_profile_updated", updateStrength);
  }, [user, activeTab]);

  const handleSelect = (id) => {
    if (id === "Logout") {
      setShowSignOutConfirm(true);
      return;
    }
    if (onTabChange) onTabChange(id);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  const navItems = [
    ...mainNav,
    ...secondaryNav,
    { id: "Logout", label: "Log Out", icon: LogOut },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden transition-opacity duration-300 animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Floating Glass Capsule Sidebar */}
      <aside
        className={cn(
          "sticky top-0 h-[calc(100vh-65px)] shrink-0 transition-all duration-300 ease-in-out z-40",
          "fixed inset-y-0 left-0 lg:sticky",
          isOpen
            ? "w-72 opacity-100 pointer-events-auto translate-x-0 p-2 sm:p-3 lg:p-4"
            : "w-0 -translate-x-full lg:translate-x-0 border-0 p-0 opacity-0 pointer-events-none overflow-hidden"
        )}
      >
        <div className="flex h-full w-64 flex-col justify-between overflow-hidden rounded-[2.2rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#111425]/90 backdrop-blur-2xl shadow-2xl">
          {/* Header with Logo */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 text-white shadow-lg shadow-violet-500/30">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
                  Scholar<span className="text-violet-600 dark:text-violet-400">Hub</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Match Portal
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors outline-none"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Animated Vertical Proximity Dock Navigation Links */}
          <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-3 scrollbar-none">
            <VerticalDock
              items={navItems}
              activeTab={activeTab}
              onSelectTab={handleSelect}
              magnificationScale={1.07}
              distance={130}
            />
          </nav>

          {/* Modern Profile Strength Capsule Widget */}
          <div className="p-3 shrink-0">
            <div
              onClick={() => handleSelect("Details")}
              className={cn(
                "relative overflow-hidden rounded-2xl p-4 text-white shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group",
                profileStrength >= 80
                  ? "bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 shadow-teal-600/25"
                  : profileStrength >= 40
                  ? "bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 shadow-violet-600/25"
                  : "bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 shadow-amber-600/25"
              )}
            >
              {/* Glow Accent */}
              <div className="absolute -top-10 -right-10 size-24 rounded-full bg-white/20 blur-xl group-hover:scale-125 transition-transform" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-white/90" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Profile Strength
                  </span>
                </div>
                <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                  {profileStrength >= 80 ? "Verified" : profileStrength >= 40 ? "In Progress" : "Setup"}
                </span>
              </div>

              <div className="relative z-10 mt-2 flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold tracking-tight">{profileStrength}%</span>
                <span className="text-[11px] text-white/80 font-medium">
                  {profileStrength >= 80 ? "Matched for 90%+ grants" : "Click to complete profile"}
                </span>
              </div>

              <div className="relative z-10 mt-3 h-2 w-full overflow-hidden rounded-full bg-black/25">
                <div
                  style={{ width: `${profileStrength}%` }}
                  className="h-full rounded-full bg-white shadow-sm transition-all duration-700 ease-out"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={() => {
          setShowSignOutConfirm(false);
          signOut();
        }}
      />
    </>
  );
}

export default Sidebar;
