import {
  LatestNotificationsTicker,
  NotificationsBell,
} from "@/components/dashboard/latest-notifications"

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-card/80 px-6 py-3.5 backdrop-blur">
      <LatestNotificationsTicker />

      <div className="ml-auto flex shrink-0 items-center gap-4">
        <NotificationsBell />

        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            RS
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-foreground">Riya Sharma</p>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
        </div>
      </div>
    </header>
  )
}
