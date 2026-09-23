"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, CalendarClock, Sparkles, FileWarning } from "lucide-react"

type LucideIcon = typeof Bell

type Feed = {
  icon: LucideIcon
  label: string
  text: string
  tint: string
}

// Public feed shown inline in the topbar: upcoming deadlines, new releases, etc.
const latestFeed: Feed[] = [
  {
    icon: CalendarClock,
    label: "Deadline",
    text: "STEM Grant closes in 3 days",
    tint: "text-chart-4",
  },
  {
    icon: Sparkles,
    label: "New",
    text: "State Girls in Tech Fund just released",
    tint: "text-chart-3",
  },
  {
    icon: FileWarning,
    label: "Action",
    text: "Profile update pending for better matches",
    tint: "text-chart-2",
  },
]

// Personal notifications shown in the bell dropdown.
const personalNotifications = [
  { text: "Your application to National Merit STEM Grant was received", time: "2h ago" },
  { text: "Riya, your profile matched 4 new scholarships", time: "5h ago" },
  { text: "Reminder: upload your income certificate", time: "1d ago" },
]

export function LatestNotificationsTicker() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((v) => (v + 1) % latestFeed.length)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const active = latestFeed[index]
  const Icon = active.icon

  return (
    <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Latest
      </span>
      <div className="relative flex min-w-0 items-center gap-2.5 rounded-full border border-border bg-muted/40 px-3.5 py-2">
        <span
          key={index}
          className={`flex size-6 shrink-0 animate-rise-in items-center justify-center rounded-full bg-card ${active.tint}`}
        >
          <Icon className="size-3.5" />
        </span>
        <p
          key={`text-${index}`}
          className="animate-rise-in truncate text-sm text-foreground"
        >
          <span className={`font-semibold ${active.tint}`}>{active.label}:</span>{" "}
          <span className="text-muted-foreground">{active.text}</span>
        </p>
        <span className="ml-1 flex shrink-0 gap-1">
          {latestFeed.map((_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full transition-colors ${
                i === index ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Bell className="size-5" />
        <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive ring-2 ring-card" />
      </button>

      {open && (
        <div className="animate-rise-in absolute right-0 top-full z-20 mt-2 w-80 origin-top-right rounded-2xl border border-border bg-card p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground">
              Your notifications
            </h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {personalNotifications.length} new
            </span>
          </div>

          <ul className="mt-3 space-y-2">
            {personalNotifications.map((note, i) => (
              <li
                key={note.text}
                style={{ animationDelay: `${i * 80 + 60}ms` }}
                className="group flex animate-rise-in items-start gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5 transition-colors hover:bg-accent/70"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{note.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{note.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
