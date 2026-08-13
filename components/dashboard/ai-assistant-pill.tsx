"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Send, X, Sparkles } from "lucide-react"

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
        className="group flex items-center gap-2 rounded-full bg-primary py-2.5 pl-3 pr-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-300 group-hover:rotate-12">
          <Bot className="size-4" />
        </span>
        <span className="whitespace-nowrap">AI Assistant</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 origin-top-right animate-rise-in overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary-foreground/15">
                <Bot className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">AI Assistant</p>
                <p className="text-[11px] text-primary-foreground/70">
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

          <div className="flex min-h-[340px] flex-col gap-3 overflow-y-auto px-4 py-4">
            <div className="flex items-start gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-3.5" />
              </span>
              <p className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground">
                Hi Riya! Ask me anything about eligibility, documents, or the
                application process.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue(s)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
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
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your question..."
              aria-label="Message AI Assistant"
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:scale-105"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
