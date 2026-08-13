import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const suggestions = [
  "Am I eligible for the STEM Grant?",
  "What documents do I need?",
  "Help me improve my profile",
];

export function AiAssistantPill() {
  const { user } = useAuth();
  const firstName = (user?.fullName || user?.name || "Riya").split(" ")[0];
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open AI Assistant"
        className="group flex items-center gap-2 rounded-full bg-blue-600 py-2.5 pl-3 pr-4 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:rotate-12">
          <Bot className="size-4" />
        </span>
        <span className="whitespace-nowrap">AI Assistant</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 origin-top-right animate-rise-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                <Bot className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">AI Assistant</p>
                <p className="text-[11px] text-blue-100">Online now</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI Assistant"
              className="rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex min-h-[300px] flex-col gap-3 overflow-y-auto px-4 py-4">
            <div className="flex items-start gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Sparkles className="size-3.5" />
              </span>
              <p className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800">
                Hi {firstName}! Ask me anything about eligibility, documents, or the application process.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue(s)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-blue-500 hover:text-blue-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setValue("");
            }}
            className="flex items-center gap-2 border-t border-slate-100 p-3"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your question..."
              aria-label="Message AI Assistant"
              className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-transform duration-200 hover:scale-105"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AiAssistantPill;
