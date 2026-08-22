import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RotateCcw,
  GraduationCap,
  ChevronRight,
  User,
  Zap,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Star,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {
  getStoredStudentProfile,
  evaluateAllScholarships,
  calculateProfileStrength,
} from "../../lib/eligibilityEngine";
import { ScholarHubAiAvatar } from "./ScholarHubAiAvatar";

const BACKEND_URL = "http://localhost:5000";

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Best matches for me", color: "emerald" },
  { icon: BookOpen, label: "Documents I need", color: "blue" },
  { icon: Zap, label: "Application tips", color: "violet" },
  { icon: Star, label: "High-value grants", color: "amber" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-blue-400 inline-block"
          style={{ animation: `ai-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

/** Renders AI text with full markdown support styled for the dark chat UI */
function MarkdownMessage({ text }) {
  return (
    <ReactMarkdown
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-white mt-3 mb-1.5 first:mt-0 border-b border-slate-700/60 pb-1">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-blue-300 mt-3 mb-1.5 first:mt-0 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-blue-400 shrink-0" />
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-slate-200 mt-2.5 mb-1 first:mt-0">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2 mb-1 first:mt-0">
            {children}
          </h4>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="text-sm text-slate-200 leading-relaxed mb-2 last:mb-0">
            {children}
          </p>
        ),

        // Bold & italic
        strong: ({ children }) => (
          <strong className="font-bold text-white">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-300">{children}</em>
        ),

        // Unordered lists
        ul: ({ children }) => (
          <ul className="mt-1.5 mb-2 space-y-1.5 last:mb-0">{children}</ul>
        ),
        // Ordered lists
        ol: ({ children }) => (
          <ol className="mt-1.5 mb-2 space-y-1.5 list-none counter-reset-list last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children, ordered, index }) => (
          <li className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed">
            <span className="mt-1 shrink-0 size-1.5 rounded-full bg-blue-400/70" />
            <span>{children}</span>
          </li>
        ),

        // Horizontal rule (----)
        hr: () => (
          <hr className="my-3 border-slate-700/60" />
        ),

        // Inline code
        code: ({ inline, children }) =>
          inline ? (
            <code className="rounded px-1.5 py-0.5 text-xs font-mono bg-slate-700/80 text-blue-300 border border-slate-600/50">
              {children}
            </code>
          ) : (
            <pre className="mt-2 mb-2 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/80 p-3">
              <code className="text-xs font-mono text-slate-300">{children}</code>
            </pre>
          ),

        // Block quote
        blockquote: ({ children }) => (
          <blockquote className="mt-2 mb-2 border-l-2 border-blue-500/50 pl-3 text-sm text-slate-400 italic">
            {children}
          </blockquote>
        ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
          >
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function MessageBubble({ message, idx, copiedIdx, onCopy }) {
  const isUser = message.sender === "user";

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2.5 group">
        <div className="max-w-[78%] flex flex-col items-end gap-1">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-lg shadow-blue-500/20">
            {message.text}
          </div>
        </div>
        <div className="size-7 shrink-0 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center mb-0.5">
          <User className="size-3.5 text-slate-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 group">
      {/* AI Avatar glow */}
      <div className="shrink-0 mt-0.5">
        <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20">
          <Sparkles className="size-4 text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-400">ScholarHub AI</span>
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Rendered Markdown response */}
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm space-y-0.5">
          <MarkdownMessage text={message.text} />
        </div>

        {/* Scholarship recommendation mini-cards */}
        {message.recommendations && message.recommendations.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-blue-500" />
              Top Matches for You
            </p>
            {message.recommendations.map((item, rIdx) => (
              <div
                key={rIdx}
                className="group/card flex items-center justify-between gap-3 rounded-xl border border-slate-700/60 bg-slate-800/60 p-3 hover:border-blue-500/50 hover:bg-slate-800 transition-all backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 shrink-0 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <GraduationCap className="size-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-100 group-hover/card:text-blue-300 transition-colors">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold text-emerald-400">
                        {item.eligibilityPercent ?? item.matchScore}% match
                      </span>
                      <span className="text-slate-600 text-[10px]">·</span>
                      <span className="text-[11px] text-slate-400">
                        {typeof item.amount === "number"
                          ? `₹${item.amount.toLocaleString("en-IN")}`
                          : item.amount || "Financial Support"}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-600 group-hover/card:text-blue-400 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Copy button - appears on hover */}
        <button
          type="button"
          onClick={() => onCopy(message.text, idx)}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-all"
        >
          {copiedIdx === idx ? (
            <><Check className="size-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
          ) : (
            <><Copy className="size-3" /><span>Copy</span></>
          )}
        </button>
      </div>
    </div>
  );
}


export function AiAssistantHub() {
  const { user } = useAuth();
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    const handleProfileUpdate = () => setProfileVersion((v) => v + 1);
    window.addEventListener("scholarhub_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("scholarhub_profile_updated", handleProfileUpdate);
  }, []);

  const firstName = (user?.fullName || user?.name || "Student").split(" ")[0];
  const studentProfile = useMemo(() => getStoredStudentProfile(), [user, profileVersion]);
  const profileStrength = useMemo(() => calculateProfileStrength(studentProfile), [studentProfile]);

  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const inputRef = useRef(null);

  const evaluatedScholarships = useMemo(() => evaluateAllScholarships(studentProfile), [studentProfile]);
  const eligibleScholarships = useMemo(
    () => evaluatedScholarships.filter((s) => (s.eligibilityPercent ?? s.matchScore) >= 50),
    [evaluatedScholarships]
  );

  const hasProfile = !!(studentProfile.category || studentProfile.currentCourse || studentProfile.annualIncome);

  const initialGreeting = hasProfile
    ? `Hello ${firstName}! 👋 I can see your profile (${studentProfile.category || "General"} · ${studentProfile.domicileState || "Maharashtra"} · ${studentProfile.currentCourse || "Higher Education"}). I've matched ${eligibleScholarships.length} scholarships for you. Ask me anything about eligibility, documents, or application tips!`
    : `Hello ${firstName}! 👋 I'm your ScholarHub AI assistant. Fill in your profile details first and I can instantly tell you which grants you qualify for. What can I help you with?`;

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: initialGreeting,
      recommendations: hasProfile ? eligibleScholarships.slice(0, 3) : [],
    },
  ]);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customText) => {
    const text = customText || chatInput;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: text.trim() }]);
    if (!customText) setChatInput("");
    setIsAiLoading(true);
    inputRef.current?.focus();

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text.trim(),
          studentName: studentProfile.name,
          course: studentProfile.currentCourse,
        }),
      });
      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else throw new Error("No response");
    } catch {
      const lower = text.toLowerCase();
      const isMatchQuery =
        lower.includes("match") || lower.includes("eligible") || lower.includes("scholarship") ||
        lower.includes("grant") || lower.includes("recommend") || lower.includes("best");

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: isMatchQuery
            ? `Based on your profile (${studentProfile.currentCourse || "Higher Education"}, ${studentProfile.category || "General"} category, ₹${parseFloat(studentProfile.annualIncome || 0).toLocaleString("en-IN")} family income), here are your top scholarship matches:`
            : `Great question! Based on your profile in ${studentProfile.currentCourse || "higher education"}, ensure your documents are ready and review eligibility carefully before applying. Feel free to ask me about any specific scheme!`,
          recommendations: isMatchQuery ? eligibleScholarships.slice(0, 3) : null,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: "ai",
        text: initialGreeting,
        recommendations: hasProfile ? eligibleScholarships.slice(0, 3) : [],
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full animate-fade-in">

      {/* ── Header ── */}
      <div className="shrink-0 rounded-t-2xl border border-b-0 border-slate-800 bg-gradient-to-r from-[#0a1628] via-[#0f1e3d] to-[#0a1628] px-5 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/30 ring-4 ring-blue-500/10">
              <Sparkles className="size-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-[#0a1628] animate-pulse" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-white tracking-tight flex items-center gap-2">
              ScholarHub AI
              <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-2 py-0.5 tracking-normal">
                Beta
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Smart matching active · {eligibleScholarships.length} grants evaluated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Profile strength bar */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Profile</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 rounded-full bg-slate-800/80">
                <div
                  style={{ width: `${profileStrength}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                />
              </div>
              <span className="text-[11px] font-bold text-blue-400">{profileStrength}%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            title="New Conversation"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-blue-500/60 hover:bg-slate-800 hover:text-blue-400 transition-all"
          >
            <RotateCcw className="size-3" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 min-h-0 overflow-y-auto border-x border-slate-800 bg-gradient-to-b from-[#07101f] via-[#090f1e] to-[#0b1324] px-5 py-6 space-y-6 scrollbar-none">
        {messages.map((m, idx) => (
          <div key={idx} className="animate-rise-in">
            <MessageBubble message={m} idx={idx} copiedIdx={copiedIdx} onCopy={handleCopy} />
          </div>
        ))}

        {isAiLoading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="size-8 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20">
              <Sparkles className="size-4 text-white" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-2 backdrop-blur-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Quick Prompts ── */}
      <div className="shrink-0 border-x border-slate-800 bg-[#07101f]/95 px-4 pt-3 pb-2">
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(({ icon: Icon, label, color }) => {
            const cls = {
              emerald: "border-emerald-900/50 text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10",
              blue: "border-blue-900/50 text-blue-400 hover:border-blue-500/60 hover:bg-blue-500/10",
              violet: "border-violet-900/50 text-violet-400 hover:border-violet-500/60 hover:bg-violet-500/10",
              amber: "border-amber-900/50 text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/10",
            }[color];
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleSendMessage(label)}
                disabled={isAiLoading}
                className={`flex items-center gap-1.5 rounded-full border bg-slate-900/70 px-3 py-1.5 text-[11px] font-semibold transition-all disabled:opacity-40 ${cls}`}
              >
                <Icon className="size-3" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 rounded-b-2xl border border-t-0 border-slate-800 bg-[#07101f]/95 px-4 pb-4 pt-2">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="relative flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-800/70 p-1.5 shadow-xl backdrop-blur-sm transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10"
        >
          <div className="size-7 shrink-0 ml-1 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <MessageCircle className="size-3.5 text-white" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about eligibility, documents, deadlines..."
            className="flex-1 bg-transparent py-2 px-2 text-sm text-slate-100 outline-none placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={isAiLoading || !chatInput.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <span>Send</span>
            <Send className="size-3.5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-700 mt-2.5">
          AI responses are generated and may not be 100% accurate. Always verify scholarship details officially.
        </p>
      </div>

      <style>{`
        @keyframes ai-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default AiAssistantHub;