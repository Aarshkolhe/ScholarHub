import { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot,
  Sparkles,
  Send,
  User,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {
  getStoredStudentProfile,
  evaluateAllScholarships,
} from "../../lib/eligibilityEngine";

const BACKEND_URL = "http://localhost:5000";

export function AiAssistantHub() {
  const { user } = useAuth();
  const firstName = (user?.fullName || user?.name || "Student").split(" ")[0];
  const studentProfile = useMemo(() => getStoredStudentProfile(), [user]);

  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const initialGreeting = `Hello ${firstName}! I am your AI Scholarship Counselor. ${
    studentProfile.category || studentProfile.currentCourse || studentProfile.annualIncome
      ? `I have evaluated your profile (${studentProfile.category || "General"}, ${studentProfile.domicileState || "State"}, ₹${parseFloat(studentProfile.annualIncome || 0).toLocaleString("en-IN")} Income).`
      : "Complete your profile in the Eligibility Details tab or load the demo profile in Settings to receive personalized grant suggestions."
  } Ask me any questions about matching schemes, eligibility criteria, required documents, or application guidelines.`;

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: initialGreeting,
    },
  ]);

  const chatEndRef = useRef(null);

  const evaluatedScholarships = useMemo(() => {
    return evaluateAllScholarships(studentProfile);
  }, [studentProfile]);

  const eligibleScholarships = evaluatedScholarships.filter((s) => s.matchScore >= 50);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customText) => {
    const text = customText || chatInput;
    if (!text.trim()) return;

    const userMsg = { sender: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput("");
    setIsAiLoading(true);

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
      } else {
        throw new Error("No response");
      }
    } catch {
      // Local fallback response
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Based on your profile in ${studentProfile.currentCourse || "Higher Education"} with ${studentProfile.category || "OBC"} category and family income below ₹${parseFloat(studentProfile.annualIncome || 0).toLocaleString("en-IN")}:\n\n- You currently qualify for ${eligibleScholarships.length} scholarships with a 50%+ match score (including ${eligibleScholarships[0]?.name || "MahaDBT EBC Fee Reimbursement"}).\n- All eligibility checks are dynamically evaluated against official portal criteria.\n- You can explore scheme details and apply directly in the Search or Recommended sections.`,
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
    setMessages([{ sender: "ai", text: initialGreeting }]);
  };

  return (
    <div className="relative flex h-[calc(100vh-120px)] w-full flex-col rounded-2xl border border-slate-800 bg-[#0d1527]/80 p-4 shadow-xl overflow-hidden animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
            <Bot className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">AI Counselor</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          title="Reset Chat"
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-all shadow-xs"
        >
          <RotateCcw className="size-3" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 animate-rise-in ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar Badge - Sits directly inside flex layout without negative margins */}
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm ${
                m.sender === "user"
                  ? "bg-blue-600 text-white shadow-blue-600/20"
                  : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/20"
              }`}
            >
              {m.sender === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`group relative max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-blue-600/15"
                  : "bg-slate-800/90 text-slate-100 rounded-tl-sm border border-slate-700/80 backdrop-blur-md shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between gap-2 font-bold mb-1 opacity-75 text-[11px]">
                <span>{m.sender === "user" ? "You" : "ScholarHub AI"}</span>

                {m.sender === "ai" && (
                  <button
                    type="button"
                    onClick={() => handleCopy(m.text, idx)}
                    title="Copy response"
                    className="rounded p-1 hover:bg-slate-700 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedIdx === idx ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  </button>
                )}
              </div>

              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}

        {isAiLoading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
              <Bot className="size-4 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-slate-800/90 p-4 text-xs text-slate-400 border border-slate-700/80 flex items-center gap-2 shadow-xs">
              <Sparkles className="size-4 text-blue-500 animate-spin" />
              <span>AI is analyzing your query...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field Pinned Cleanly at Bottom */}
      <div className="mt-auto pt-4 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative w-full flex items-center rounded-2xl border border-slate-700/80 bg-slate-800/90 p-1.5 shadow-xs transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask any scholarship question (e.g. Which grants fit my income or category?)..."
            className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-slate-100 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isAiLoading || !chatInput.trim()}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs px-4 py-2.5 shadow-md shadow-blue-600/20 disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="size-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AiAssistantHub;
