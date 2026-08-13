import { useEffect, useRef, useState } from "react";
import { Bell, CalendarClock, Sparkles, FileWarning } from "lucide-react";

const latestFeed = [
  {
    icon: CalendarClock,
    label: "Deadline",
    text: "STEM Grant closes in 3 days",
    tint: "text-rose-500 bg-rose-50",
  },
  {
    icon: Sparkles,
    label: "New",
    text: "State Girls in Tech Fund just released",
    tint: "text-amber-500 bg-amber-50",
  },
  {
    icon: FileWarning,
    label: "Action",
    text: "Profile update pending for better matches",
    tint: "text-blue-500 bg-blue-50",
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
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Latest
      </span>
      <div className="relative flex min-w-0 items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5">
        <span
          key={index}
          className={`flex size-6 shrink-0 animate-rise-in items-center justify-center rounded-full ${active.tint}`}
        >
          <Icon className="size-3.5" />
        </span>
        <p
          key={`text-${index}`}
          className="animate-rise-in truncate text-sm text-slate-700"
        >
          <span className="font-semibold">{active.label}:</span>{" "}
          <span className="text-slate-500">{active.text}</span>
        </p>
        <span className="ml-1 flex shrink-0 gap-1">
          {latestFeed.map((_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full transition-colors ${
                i === index ? "bg-blue-600" : "bg-slate-300"
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
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <Bell className="size-5" />
        <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      {open && (
        <div className="animate-rise-in absolute right-0 top-full z-20 mt-2 w-80 origin-top-right rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Your notifications
            </h2>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
              {personalNotifications.length} new
            </span>
          </div>

          <ul className="mt-3 space-y-2">
            {personalNotifications.map((note, i) => (
              <li
                key={note.text}
                style={{ animationDelay: `${i * 80 + 60}ms` }}
                className="group flex animate-rise-in items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 transition-colors hover:bg-slate-100"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-600 transition-transform duration-300 group-hover:scale-150" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">{note.text}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{note.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
