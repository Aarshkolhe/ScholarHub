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

const mainNav = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "Search", label: "Search Scholarships", icon: Search },
  { id: "Recommended", label: "Recommended", icon: Sparkles },
  { id: "Eligibility", label: "Eligibility Checker", icon: ShieldCheck },
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
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1",
        active
          ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/60 dark:text-blue-400"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
      )}
    >
      <Icon className="size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
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
  const [profileStrength, setProfileStrength] = useState(90);

  // Dynamic Profile Strength calculation
  useEffect(() => {
    try {
      const savedEd = JSON.parse(localStorage.getItem("scholarhub_profile_education") || "{}");
      const savedFin = JSON.parse(localStorage.getItem("scholarhub_profile_financial") || "{}");
      const savedEl = JSON.parse(localStorage.getItem("scholarhub_profile_eligibility") || "{}");

      let count = 0;
      if (savedEd.currentCourse) count++;
      if (savedEd.collegeName) count++;
      if (savedEd.marksPercentage) count++;
      if (savedFin.annualIncome) count++;
      if (savedFin.guardianOccupation) count++;
      if (savedEl.category) count++;
      if (savedEl.domicileState) count++;

      const percent = Math.min(Math.max(Math.round((count / 7) * 100), 75), 100);
      setProfileStrength(percent);
    } catch {
      setProfileStrength(90);
    }
  }, [user, activeTab]);

  const handleSelect = (id) => {
    if (onTabChange) onTabChange(id);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Collapsible Sidebar */}
      <aside
        className={cn(
          "sticky top-0 h-screen shrink-0 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out z-40",
          // Mobile styling (Fixed Drawer)
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
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
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

          {/* Dynamic Details Strength Card */}
          <div className="p-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSelect("Details")}
              className="w-full text-left rounded-2xl bg-blue-600 dark:bg-blue-700 p-4 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-[1.02]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">
                Details Strength
              </p>
              <p className="mt-1 font-display text-2xl font-bold">{profileStrength}%</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/30">
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
