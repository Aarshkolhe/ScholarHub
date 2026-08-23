import { useEffect, useRef, useState } from "react";
import { Send, X, Sparkles, RefreshCw } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { ScholarHubAiAvatar } from "./ScholarHubAiAvatar";

const INITIAL_SUGGESTIONS = [
  "Am I eligible for the STEM Grant?",
  "What documents do I need to apply?",
  "Help me find high-value scholarships",
  "Tips for a strong application statement",
];

const AI_RESPONSES = [
  {
    keywords: ["eligible", "eligibility", "stem"],
    reply:
      "To qualify for the National Merit STEM Grant, you need: 1) Enrolled in a Science, Tech, or Engineering program, 2) Minimum 75% aggregate score in previous semester, and 3) Annual family income below ₹6,00,000.",
  },
  {
    keywords: ["document", "documents", "upload", "certificate"],
    reply:
      "Essential documents required for most scholarship applications: 1) Aadhaar Card / ID Proof, 2) Previous Semester Marksheet, 3) Family Income Certificate, 4) Bank Account Passbook (for direct credit), and 5) College Bonafide Certificate.",
  },
  {
    keywords: ["high-value", "top", "find", "recommend"],
    reply:
      "Top recommended high-value grants for you: 1) Global Engineering Fellowship (up to ₹75,000), 2) Higher Education Merit Scholarship (₹60,000), and 3) National Merit STEM Grant (₹50,000).",
  },
  {
    keywords: ["tip", "tips", "statement", "essay", "profile"],
    reply:
      "Pro Tips for your application: 1) Complete 100% of your ScholarHub profile, 2) Write a clear 200-word statement highlighting your academic achievements & financial need, and 3) Apply at least 5 days before the deadline!",
  },
];

export function AiAssistantPill() {
  const { user } = useAuth();
  const firstName = (user?.fullName || user?.name || "Student").split(" ")[0];

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hi ${firstName}! I'm your ScholarHub AI Assistant. Ask me anything about eligibility, deadlines, required documents, or application tips!`,
    },
  ]);

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = (textToSend) => {
    const text = textToSend || value;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setValue("");

    // Generate intelligent AI response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matchedReply = null;

      for (const item of AI_RESPONSES) {
        if (item.keywords.some((kw) => lower.includes(kw))) {
          matchedReply = item.reply;
          break;
        }
      }

      if (!matchedReply) {
        matchedReply = `That's a great question, ${firstName}! Based on your current profile, our AI matching engine evaluates scholarships across merit, income criteria, and degree level. Check the Recommended section for customized opportunities!`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: matchedReply }]);
    }, 600);
  };

  const handleClear = () => {
    setMessages([
      {
        sender: "ai",
        text: `Hi ${firstName}! I'm your ScholarHub AI Assistant. Ask me anything about eligibility, deadlines, required documents, or application tips!`,
      },
    ]);
  };

  return (
    <div ref={containerRef} className="relative shrink-0 z-30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open AI Assistant"
        className="group flex items-center gap-2 rounded-full bg-blue-600 dark:bg-blue-500 py-2 pl-2.5 pr-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25"
      >
        <ScholarHubAiAvatar size="xs" showContainer={true} />
        <span className="whitespace-nowrap">AI Assistant</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 origin-top-right animate-rise-in overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 dark:bg-blue-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <ScholarHubAiAvatar size="sm" showContainer={true} />
              <div className="leading-tight">
                <p className="text-sm font-semibold">ScholarHub AI</p>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Smart Matching Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                title="Clear conversation"
                className="rounded-full p-1 transition-colors hover:bg-white/20"
              >
                <RefreshCw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI Assistant"
                className="rounded-full p-1 transition-colors hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Container - Clean Conversational Layout */}
          <div className="flex min-h-[260px] max-h-[340px] flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div key={i} className="animate-fade-in">
                {msg.sender === "user" ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-slate-400 mb-0.5 pr-1">You</span>
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-blue-600 text-white px-3 py-1.5 text-xs leading-relaxed shadow-xs">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <ScholarHubAiAvatar size="xs" showContainer={true} />
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        ScholarHub AI
                      </span>
                    </div>
                    <div className="pl-6 text-xs leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {INITIAL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSend(s)}
                className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your question..."
              aria-label="Message AI Assistant"
              className="min-w-0 flex-1 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              aria-label="Send message"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white disabled:opacity-50 transition-transform duration-200 hover:scale-105"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AiAssistantPill;
