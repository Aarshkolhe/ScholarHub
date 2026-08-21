import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles, User, RefreshCw } from "lucide-react";
import useAuth from "../../hooks/useAuth";

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
        className="group flex items-center gap-2 rounded-full bg-blue-600 dark:bg-blue-500 py-2.5 pl-3 pr-4 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:rotate-12">
          <Bot className="size-4" />
        </span>
        <span className="whitespace-nowrap">AI Assistant</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 origin-top-right animate-rise-in overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 dark:bg-blue-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                <Bot className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">AI Assistant</p>
                <p className="text-[11px] text-blue-100">Smart Matching Active</p>
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

          {/* Messages Container */}
          <div className="flex min-h-[280px] max-h-[360px] flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400"
                  }`}
                >
                  {msg.sender === "user" ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
                </span>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "rounded-tr-sm bg-blue-600 text-white"
                      : "rounded-tl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {msg.text}
                </div>
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
            className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-900"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your question..."
              aria-label="Message AI Assistant"
              className="min-w-0 flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              aria-label="Send message"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white disabled:opacity-50 transition-transform duration-200 hover:scale-105"
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
