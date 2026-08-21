import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Award,
  FileText,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const PRESET_PROMPTS = [
  "Analyze my profile for top matching scholarships",
  "What documents do I need to get verified?",
  "Draft a 200-word personal statement essay for me",
  "Check if my annual family income qualifies for grants",
];

const MATCHED_RECOMMENDATIONS = [
  {
    name: "National Merit STEM Grant",
    matchScore: 98,
    amount: "₹50,000",
    reason: "Perfect match for your B.Tech CS degree and family income below ₹6 Lakhs.",
  },
  {
    name: "AI & Machine Learning Research Grant",
    matchScore: 96,
    amount: "₹90,000",
    reason: "High match for Technology & Science background with high academic score.",
  },
  {
    name: "State Girls in Tech Fund",
    matchScore: 93,
    amount: "₹35,000",
    reason: "Strong fit for IT/CS accredited undergraduate program.",
  },
];

const BACKEND_URL = "http://localhost:5000";

export function AiAssistantHub() {
  const { user } = useAuth();
  const firstName = (user?.fullName || user?.name || "Student").split(" ")[0];

  const [activeSubTab, setActiveSubTab] = useState("chat"); // "chat", "essay", "recommendations"
  const [chatInput, setChatInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState("Free Google Gemini AI / Built-in Engine");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hello ${firstName}! I am your ScholarHub AI Assistant. I have analyzed your profile. How can I help you maximize your scholarship funding today?`,
    },
  ]);

  // AI Essay Generator State
  const [essayCourse, setEssayCourse] = useState("B.Tech Computer Science");
  const [essayTarget, setEssayTarget] = useState("National Merit STEM Grant");
  const [essayNeed, setEssayNeed] = useState("Funding for tuition fees and books");
  const [generatedEssay, setGeneratedEssay] = useState("");
  const [isGeneratingEssay, setIsGeneratingEssay] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSubTab]);

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
          studentName: user?.fullName || user?.name || "Student",
          course: essayCourse,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
        if (data.source) setAiSource(data.source);
      } else {
        throw new Error("No reply from backend");
      }
    } catch (error) {
      // Rule-based fallback if backend is offline
      let reply = "";
      const lower = text.toLowerCase();
      if (lower.includes("analyze") || lower.includes("match") || lower.includes("top")) {
        reply = `Based on your profile analysis, ${firstName}:\n\n1. National Merit STEM Grant (98% Match)\n2. AI Research Grant (96% Match)\n3. State Tech Fund (93% Match)\n\nRecommendation: Upload your Income Certificate to reach 100% verification!`;
      } else if (lower.includes("document") || lower.includes("verify")) {
        reply = "Required documents for instant verification: 1) Aadhaar Card, 2) Income Certificate, 3) Semester Marksheet, 4) College ID, and 5) Bank Passbook.";
      } else {
        reply = `Great question, ${firstName}! Our AI matching algorithm constantly evaluates your eligibility based on merit marks, course stream, and income thresholds.`;
      }
      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateEssay = async (e) => {
    e.preventDefault();
    setIsGeneratingEssay(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/essay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetScholarship: essayTarget,
          course: essayCourse,
          financialNeed: essayNeed,
          studentName: user?.fullName || user?.name || "Student",
        }),
      });

      const data = await response.json();
      if (data.success && data.essay) {
        setGeneratedEssay(data.essay);
        if (data.source) setAiSource(data.source);
      } else {
        throw new Error("Essay generation failed");
      }
    } catch (error) {
      // Local fallback draft
      setGeneratedEssay(
        `Statement of Purpose for ${essayTarget}\n\n` +
          `My name is ${user?.fullName || user?.name || "Student"}, currently pursuing ${essayCourse}. Academic excellence and technological innovation have always been my core passions. Receiving the ${essayTarget} will significantly relieve the financial burden of ${essayNeed}, allowing me to focus entirely on my studies and research projects.\n\n` +
          `Throughout my academic journey, I have maintained high academic performance and demonstrated dedication to learning. This grant will empower me to achieve my potential without financial constraint. Thank you for considering my application.`
      );
    } finally {
      setIsGeneratingEssay(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="size-6 text-blue-600 dark:text-blue-400" />
            ScholarHub AI Assistant & Matching Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Powered by {aiSource}</span> &bull; <span>100% Free AI Engine</span>
          </p>
        </div>

        {/* Navigation Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("chat")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeSubTab === "chat"
                ? "bg-blue-600 text-white dark:bg-blue-500 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            AI Chat Assistant
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("essay")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeSubTab === "essay"
                ? "bg-blue-600 text-white dark:bg-blue-500 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            AI Essay Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("recommendations")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeSubTab === "recommendations"
                ? "bg-blue-600 text-white dark:bg-blue-500 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            AI Match Insights
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: AI CHAT ASSISTANT */}
      {activeSubTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Console */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Assistant Chat Console</h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Google Gemini & Built-in Engine Active</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMessages([{ sender: "ai", text: `Hello ${firstName}! How can I help you today?` }])}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RefreshCw className="size-3" /> Clear
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {msg.sender === "user" ? "U" : <Bot className="size-3.5" />}
                  </span>
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <Sparkles className="size-3.5 animate-spin text-blue-500" /> AI is thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 py-2 border-t border-slate-100 dark:border-slate-800">
              {PRESET_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSendMessage(p)}
                  className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-[11px] text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI about eligibility, documents, or essay tips..."
                className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiLoading}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white disabled:opacity-50 hover:bg-blue-700"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>

          {/* AI Profile Audit Card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="size-4 text-amber-500" />
                AI Profile Audit
              </h3>

              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 p-3.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">AI Match Rating</p>
                <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">94 / 100</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Eligible for 4 High-Value Grants</p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Education Profile</span>
                  <span className="font-semibold text-emerald-600">Verified &check;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Income Eligibility</span>
                  <span className="font-semibold text-emerald-600">Verified &check;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Document Vault</span>
                  <span className="font-semibold text-amber-500">3 / 5 Uploaded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI ESSAY GENERATOR */}
      {activeSubTab === "essay" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleGenerateEssay} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Wand2 className="size-5 text-blue-600 dark:text-blue-400" />
              AI Application Essay Draft Studio
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Target Scholarship</label>
              <input
                type="text"
                required
                value={essayTarget}
                onChange={(e) => setEssayTarget(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Current Degree / Course</label>
              <input
                type="text"
                required
                value={essayCourse}
                onChange={(e) => setEssayCourse(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Primary Purpose / Financial Need</label>
              <textarea
                rows={3}
                required
                value={essayNeed}
                onChange={(e) => setEssayNeed(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isGeneratingEssay}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold py-3 text-xs shadow-md hover:bg-blue-700 transition-colors"
            >
              {isGeneratingEssay ? (
                <>Generating Essay Draft...</>
              ) : (
                <>
                  <Wand2 className="size-4" /> Generate Statement with AI
                </>
              )}
            </button>
          </form>

          {/* Generated Result */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Generated AI Statement</h3>
                {generatedEssay && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedEssay, 1)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {copiedIndex === 1 ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedIndex === 1 ? "Copied!" : "Copy Essay"}
                  </button>
                )}
              </div>

              {generatedEssay ? (
                <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 text-xs leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                  {generatedEssay}
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-slate-400">
                  Fill in your details on the left and click "Generate Statement with AI" to generate a tailored essay draft.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AI MATCH INSIGHTS */}
      {activeSubTab === "recommendations" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MATCHED_RECOMMENDATIONS.map((rec) => (
              <div
                key={rec.name}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                    {rec.matchScore}% AI Match
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{rec.amount}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rec.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AiAssistantHub;
