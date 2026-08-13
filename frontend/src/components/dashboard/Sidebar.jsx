import {
  LayoutDashboard,
  Search,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Bot,
  Bell,
  User,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "../../lib/utils";
import useAuth from "../../hooks/useAuth";

const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Search Scholarships", icon: Search },
  { label: "Recommended", icon: Sparkles },
  { label: "Eligibility Checker", icon: ShieldCheck },
  { label: "Saved Scholarships", icon: Bookmark },
  { label: "AI Assistant", icon: Bot },
  { label: "Notifications", icon: Bell },
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

export function Sidebar() {
  const { signOut, user } = useAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <GraduationCap className="size-5" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Scholar<span className="text-blue-600 dark:text-blue-400">Hub</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {mainNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}

        <div className="my-3 h-px bg-slate-100 dark:bg-slate-800" />

        <NavItem label="Profile" icon={User} />
        <NavItem label="Settings" icon={Settings} />
        <NavItem
          label="Logout"
          icon={LogOut}
          onClick={signOut}
        />
      </nav>

      <div className="p-3">
        <div className="rounded-2xl bg-blue-600 dark:bg-blue-700 p-4 text-white shadow-lg shadow-blue-600/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">
            Profile Strength
          </p>
          <p className="mt-1 font-display text-2xl font-bold">90%</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/30">
            <div className="h-full w-[90%] animate-grow-bar rounded-full bg-white" />
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
