import { useEffect, useRef, useState } from "react";
import { Bell, CalendarClock, Sparkles, FileWarning } from "lucide-react";

const latestFeed = [
  {
    icon: CalendarClock,
    label: "Deadline",
    text: "STEM Grant closes in 3 days",
    tint: "text-rose-500 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400",
  },
  {
    icon: Sparkles,
    label: "New",
    text: "State Girls in Tech Fund just released",
    tint: "text-amber-500 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400",
  },
  {
    icon: FileWarning,
    label: "Action",
    text: "Profile update pending for better matches",
    tint: "text-blue-500 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400",
  },
];

const personalNotifications = [
  { text: "Your application to National Merit STEM Grant was received", time: "2h ago" },
  { text: "Riya, your profile matched 4 new scholarships", time: "5h ago" },
  { text: "Reminder: upload your income certificate", time: "1d ago" },
];

export function LatestNotificationsTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((v) => (v + 1) % latestFeed.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const active = latestFeed[index];
  const Icon = active.icon;

  return (
    <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
      <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800/80 px-2.5 py-1 rounded-full shadow-2xs">
        Latest
      </span>
      <div className="relative flex min-w-0 items-center gap-2.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 shadow-2xs backdrop-blur-md">
        <span
          key={index}
          className={`flex size-5 shrink-0 animate-rise-in items-center justify-center rounded-full ${active.tint}`}
        >
          <Icon className="size-3" />
        </span>
        <p
          key={`text-${index}`}
          className="animate-rise-in truncate text-xs text-slate-700 dark:text-slate-200 font-medium"
        >
          <span className="font-bold">{active.label}:</span>{" "}
          <span className="text-slate-500 dark:text-slate-400">{active.text}</span>
        </p>
        <span className="ml-1 flex shrink-0 gap-1">
          {latestFeed.map((_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full transition-colors ${
                i === index ? "bg-violet-600 dark:bg-violet-400" : "bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-xs transition-all outline-none"
      >
        <Bell className="size-4.5" />
        <span className="absolute right-2 top-2 flex size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
      </button>

      {open && (
        <div className="animate-fade-in-up absolute right-0 top-full z-20 mt-2.5 w-80 origin-top-right rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#151929]/95 p-4 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Notifications
            </h2>
            <span className="rounded-full bg-violet-50 dark:bg-violet-950/80 px-2.5 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-400">
              {personalNotifications.length} new
            </span>
          </div>

          <ul className="mt-3 space-y-2">
            {personalNotifications.map((note, i) => (
              <li
                key={note.text}
                style={{ animationDelay: `${i * 80 + 60}ms` }}
                className="group flex animate-rise-in items-start gap-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-600 dark:bg-violet-400 transition-transform duration-300 group-hover:scale-150" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{note.text}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{note.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
