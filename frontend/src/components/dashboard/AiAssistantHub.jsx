import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RotateCcw,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {
  getStoredStudentProfile,
  evaluateAllScholarships,
} from "../../lib/eligibilityEngine";
import { ScholarHubAiAvatar } from "./ScholarHubAiAvatar";

const BACKEND_URL = "http://localhost:5000";

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

  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const evaluatedScholarships = useMemo(() => {
    return evaluateAllScholarships(studentProfile);
  }, [studentProfile]);

  const eligibleScholarships = useMemo(() => {
    return evaluatedScholarships.filter((s) => s.matchScore >= 50);
  }, [evaluatedScholarships]);

  const initialGreeting = `Hello ${firstName}! I'm your ScholarHub AI. ${
    studentProfile.category || studentProfile.currentCourse || studentProfile.annualIncome
      ? `I have evaluated your profile (${studentProfile.category || "General"}, ${
          studentProfile.domicileState || "State"
        }, ₹${parseFloat(studentProfile.annualIncome || 0).toLocaleString("en-IN")} Income).`
      : "Complete your profile in the Streamlined Details tab to receive personalized grant suggestions."
  } Ask me any questions about matching schemes, eligibility criteria, required documents, or application guidelines.`;

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: initialGreeting,
      recommendations: eligibleScholarships.slice(0, 3),
    },
  ]);

  const chatEndRef = useRef(null);

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
      // Local fallback response with structured recommendations if query asks for matches
      const lower = text.toLowerCase();
      const isMatchQuery =
        lower.includes("match") ||
        lower.includes("eligible") ||
        lower.includes("scholarship") ||
        lower.includes("grant") ||
        lower.includes("recommend");

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Based on your profile in ${studentProfile.currentCourse || "Higher Education"} (${
            studentProfile.category || "OBC"
          } category, family income below ₹${parseFloat(
            studentProfile.annualIncome || 0
          ).toLocaleString("en-IN")}):`,
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
        recommendations: eligibleScholarships.slice(0, 3),
      },
    ]);
  };

  return (
    <div className="relative flex h-[calc(100vh-120px)] w-full flex-col rounded-2xl border border-slate-800/80 bg-[#0b1324]/90 p-4 shadow-xl overflow-hidden animate-fade-in">
      {/* Top Action Bar - Header completely removed; ONLY Reset Chat positioned top-right */}
      <div className="flex items-center justify-end pt-1 pb-3 shrink-0">
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

      {/* Messages Scroll Area - Direct conversation start */}
      <div className="flex-1 overflow-y-auto py-2 px-2 sm:px-4 space-y-4 min-h-0">
        {messages.map((m, idx) => (
          <div key={idx} className="animate-rise-in">
            {m.sender === "user" ? (
              /* User Message - Compact, Right-Aligned Bubble */
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-semibold text-slate-400 mb-1 pr-1">You</span>
                <div className="max-w-[80%] sm:max-w-[70%] rounded-2xl rounded-tr-xs bg-blue-600 text-white px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-sm">
                  {m.text}
                </div>
              </div>
            ) : (
              /* AI Response - Direct on Chat Background, no header or card container */
              <div className="space-y-1.5 max-w-[92%] sm:max-w-[88%]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ScholarHubAiAvatar size="xs" showContainer={true} />
                    <span className="text-xs font-semibold text-slate-300">ScholarHub AI</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(m.text, idx)}
                    title="Copy response"
                    className="rounded p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {copiedIdx === idx ? (
                      <Check className="size-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>

                <div className="pl-7 text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-normal">
                  {m.text}

                  {/* Compact Scholarship Recommendation List Rows */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-800/80 pt-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <GraduationCap className="size-3.5 text-blue-400" />
                        <span>Top Scholarship Matches</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {m.recommendations.map((item, rIdx) => (
                          <div
                            key={rIdx}
                            className="group flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 sm:p-3 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <GraduationCap className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  <span className="font-semibold text-emerald-400">
                                    {item.matchScore}% Match
                                  </span>
                                  <span>·</span>
                                  <span>
                                    {typeof item.amount === "number"
                                      ? `₹${item.amount.toLocaleString("en-IN")}`
                                      : item.amount || "Financial Support"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 group-hover:text-blue-300 transition-colors shrink-0 pr-1">
                              <span>View</span>
                              <ChevronRight className="size-3.5" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isAiLoading && (
          <div className="flex items-center gap-2.5 pl-1 animate-fade-in">
            <ScholarHubAiAvatar size="xs" showContainer={true} />
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Sparkles className="size-3.5 text-blue-400 animate-spin" />
              <span>ScholarHub AI is evaluating your request...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field Pinned Cleanly at Bottom */}
      <div className="mt-auto pt-3 shrink-0 border-t border-slate-800/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative w-full flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 p-1 shadow-xs transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask any scholarship question (e.g. Which grants fit my income or category?)..."
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isAiLoading || !chatInput.trim()}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 shadow-sm disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 shrink-0"
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
