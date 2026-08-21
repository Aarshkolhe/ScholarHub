import { useState, useRef, useEffect, useMemo } from "react";
import { Bot, Sparkles, Send } from "lucide-react";
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

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hello ${firstName}! I am your ScholarHub AI Assistant. I have evaluated your profile (${studentProfile.category || "General"}, ${studentProfile.domicileState || "State"}, ₹${parseFloat(studentProfile.annualIncome || 0).toLocaleString("en-IN")} Income). How can I assist your scholarship search today?`,
    },
  ]);

  const chatEndRef = useRef(null);

  const evaluatedScholarships = useMemo(() => {
    return evaluateAllScholarships(studentProfile);
  }, [studentProfile]);

  const eligibleScholarships = evaluatedScholarships.filter((s) => s.isEligible);

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
          text: `Based on your profile in ${studentProfile.currentCourse || "Higher Education"} with ${studentProfile.category || "OBC"} category and income below ₹${parseFloat(studentProfile.annualIncome || 0).toLocaleString("en-IN")}:\n\n- You currently qualify for ${eligibleScholarships.length} scholarships (including ${eligibleScholarships[0]?.name || "National Merit STEM Grant"}).\n- All eligibility checks are calculated from your self-reported profile.\n- Official document verification will be handled directly by granting organizations during award disbursement.`,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="size-6 text-blue-600 dark:text-blue-400" />
          ScholarHub AI Guidance Studio
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Personalized scholarship counseling powered by Google Gemini AI & Intelligent Matching.
        </p>
      </div>

      {/* Full-Width AI Chat Assistant Console */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[600px] w-full">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1.5 opacity-80 text-[11px]">
                  {m.sender === "user" ? "You" : "ScholarHub AI"}
                </div>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}

          {isAiLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-none bg-slate-100 dark:bg-slate-800/90 p-4 text-xs text-slate-500 dark:text-slate-400 animate-pulse flex items-center gap-2">
                <Sparkles className="size-4 text-blue-500 animate-spin" />
                ScholarHub AI is analyzing your query...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Box Area */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask any scholarship question (e.g. Which grants fit my income or category?)..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={isAiLoading || !chatInput.trim()}
              className="rounded-xl bg-blue-600 dark:bg-blue-500 px-5 py-3 text-white font-semibold text-xs shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AiAssistantHub;
