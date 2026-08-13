"use client"

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
} from "lucide-react"
import { cn } from "@/lib/utils"

const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Search Scholarships", icon: Search },
  { label: "Recommended", icon: Sparkles },
  { label: "Eligibility Checker", icon: ShieldCheck },
  { label: "Saved Scholarships", icon: Bookmark },
  { label: "AI Assistant", icon: Bot },
  { label: "Notifications", icon: Bell },
]

const secondaryNav = [
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
  { label: "Logout", icon: LogOut },
]

function NavItem({
  label,
  icon: Icon,
  active,
}: {
  label: string
  icon: typeof LayoutDashboard
  active?: boolean
}) {
  return (
    <a
      href="#"
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
      <span className="truncate">{label}</span>
    </a>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-sidebar-foreground">
          Scholar<span className="text-primary">Hub</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {mainNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}

        <div className="my-3 h-px bg-sidebar-border" />

        {secondaryNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/70">
            Profile Strength
          </p>
          <p className="mt-1 font-display text-2xl font-bold">90%</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/25">
            <div className="h-full w-[90%] animate-grow-bar rounded-full bg-primary-foreground" />
          </div>
        </div>
      </div>
    </aside>
  )
}
