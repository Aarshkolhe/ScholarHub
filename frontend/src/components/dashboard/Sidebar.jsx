import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Bot,
  Bell,
  ClipboardList,
  User,
  Settings,
  LogOut,
  GraduationCap,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import useAuth from "../../hooks/useAuth";
import { calculateProfileStrength } from "../../lib/eligibilityEngine";

const mainNav = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "Search", label: "Search Scholarships", icon: Search },
  { id: "Recommended", label: "Recommended", icon: Sparkles },
  { id: "Saved", label: "Saved Scholarships", icon: Bookmark },
  { id: "AI", label: "AI Assistant", icon: Bot },
  { id: "Notifications", label: "Notifications", icon: Bell },
];

function NavItem({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active
          ? "bg-blue-50/80 text-blue-600 font-semibold dark:bg-blue-950/70 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400 shadow-xs"
          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
          active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
        )}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function Sidebar({
  isOpen = false,
  onClose,
  activeTab = "Dashboard",
  onTabChange,
}) {
  const { signOut, user } = useAuth();
  const [profileStrength, setProfileStrength] = useState(() => calculateProfileStrength());

  // Dynamic Profile Strength calculation
  useEffect(() => {
    const updateStrength = () => setProfileStrength(calculateProfileStrength());
    updateStrength();
    window.addEventListener("scholarhub_profile_updated", updateStrength);
    return () => window.removeEventListener("scholarhub_profile_updated", updateStrength);
  }, [user, activeTab]);

  const handleSelect = (id) => {
    if (onTabChange) onTabChange(id);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (< 1024px) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Collapsible Sidebar Container */}
      <aside
        className={cn(
          "sticky top-0 h-screen shrink-0 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out z-40",
          // Mobile styling (Fixed drawer overlay) vs Desktop (Push/rescale layout)
          "fixed inset-y-0 left-0 lg:sticky",
          isOpen
            ? "w-64 border-r border-slate-200 dark:border-slate-800 opacity-100 pointer-events-auto translate-x-0 shadow-2xl lg:shadow-none"
            : "w-0 -translate-x-full lg:translate-x-0 border-0 p-0 opacity-0 pointer-events-none overflow-hidden"
        )}
      >
        <div className="flex h-full w-64 flex-col justify-between overflow-hidden">
          {/* Header with Logo & Close Button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="size-5" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Scholar<span className="text-blue-600 dark:text-blue-400">Hub</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              title="Close sidebar"
              aria-label="Close sidebar"
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
            {mainNav.map((item) => (
              <NavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                active={activeTab === item.id}
                onClick={() => handleSelect(item.id)}
              />
            ))}

            <div className="my-3 h-px bg-slate-100 dark:bg-slate-800" />

            <NavItem
              label="Profile"
              icon={User}
              active={activeTab === "Profile"}
              onClick={() => handleSelect("Profile")}
            />
            <NavItem
              label="Details"
              icon={ClipboardList}
              active={activeTab === "Details"}
              onClick={() => handleSelect("Details")}
            />
            <NavItem
              label="Settings"
              icon={Settings}
              active={activeTab === "Settings"}
              onClick={() => handleSelect("Settings")}
            />
            <NavItem
              label="Logout"
              icon={LogOut}
              onClick={signOut}
            />
          </nav>

          {/* Details Strength Card */}
          <div className="p-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSelect("Details")}
              className={cn(
                "w-full text-left rounded-2xl p-4 text-white shadow-lg transition-all hover:scale-[1.02] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 group cursor-pointer",
                profileStrength >= 80
                  ? "bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-600/20"
                  : profileStrength >= 40
                  ? "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-600/20"
                  : "bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-600/20"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
                  Details Strength
                </p>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {profileStrength >= 80 ? "Complete" : profileStrength >= 40 ? "In Progress" : "Setup"}
                </span>
              </div>
              <p className="mt-1 font-display text-2xl font-bold">{profileStrength}%</p>
              <p className="text-[10px] text-white/80 mt-0.5">
                {profileStrength >= 80
                  ? "✓ Verified for high-match grants"
                  : profileStrength >= 40
                  ? "Click to complete remaining details"
                  : "Click to set up eligibility profile"}
              </p>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-black/20">
                <div
                  style={{ width: `${profileStrength}%` }}
                  className="h-full rounded-full bg-white transition-all duration-500"
                />
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
