"use client"

import { useEffect, useRef, useState } from "react"
import { Send, X } from "lucide-react"
import { ScholarHubAiAvatar } from "./scholar-hub-ai-avatar"

const suggestions = [
  "Am I eligible for the STEM Grant?",
  "What documents do I need?",
  "Help me improve my profile",
]

export function AiAssistantPill() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open AI Assistant"
        className="group flex items-center gap-2 rounded-full bg-primary py-2 pl-2.5 pr-4 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
      >
        <ScholarHubAiAvatar size="xs" showContainer={true} />
        <span className="whitespace-nowrap">AI Assistant</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 origin-top-right animate-rise-in overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <ScholarHubAiAvatar size="sm" showContainer={true} />
              <div className="leading-tight">
                <p className="text-sm font-semibold">ScholarHub AI</p>
                <p className="text-[11px] text-primary-foreground/70 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online now
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI Assistant"
              className="rounded-full p-1 transition-colors hover:bg-primary-foreground/15"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex min-h-[280px] flex-col gap-3 overflow-y-auto px-4 py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <ScholarHubAiAvatar size="xs" showContainer={true} />
                <span className="text-[11px] font-semibold text-muted-foreground">
                  ScholarHub AI
                </span>
              </div>
              <p className="pl-6 text-xs text-foreground leading-relaxed">
                Hi! Ask me anything about eligibility, documents, or the
                application process.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue(s)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              setValue("")
            }}
            className="flex items-center gap-2 border-t border-border p-2.5"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your question..."
              aria-label="Message AI Assistant"
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:scale-105"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
