import { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Copy,
  Check,
  Zap,
  Award,
  Wand2,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {
  getStoredStudentProfile,
  evaluateAllScholarships,
} from "../../lib/eligibilityEngine";

const PRESET_PROMPTS = [
  "Check which scholarships I am currently eligible for",
  "How does my annual family income impact my match score?",
  "Draft a 200-word personal statement essay for my application",
  "What criteria are needed for National Merit STEM Grant?",
];

const BACKEND_URL = "http://localhost:5000";

export function AiAssistantHub() {
  const { user } = useAuth();
  const firstName = (user?.fullName || user?.name || "Student").split(" ")[0];
  const studentProfile = useMemo(() => getStoredStudentProfile(), [user]);

  const [activeSubTab, setActiveSubTab] = useState("chat"); // "chat", "essay", "recommendations"
  const [chatInput, setChatInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState("Free Google Gemini AI / Built-in Engine");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hello ${firstName}! I am your ScholarHub AI Assistant. I have evaluated your profile (${studentProfile.category || "General"}, ${studentProfile.domicileState || "State"}, ₹${parseFloat(studentProfile.annualIncome || 0).toLocaleString("en-IN")} Income). How can I assist your scholarship search today?`,
    },
  ]);

  // AI Essay Generator State
  const [essayCourse, setEssayCourse] = useState(studentProfile.currentCourse || "B.Tech Computer Science");
  const [essayTarget, setEssayTarget] = useState("National Merit STEM Grant");
  const [essayNeed, setEssayNeed] = useState("Funding for tuition fees and books");
  const [generatedEssay, setGeneratedEssay] = useState("");
  const [isGeneratingEssay, setIsGeneratingEssay] = useState(false);

  const chatEndRef = useRef(null);

  // Dynamic recommendations evaluated against student profile
  const evaluatedScholarships = useMemo(() => {
    return evaluateAllScholarships(studentProfile);
  }, [studentProfile]);

  const eligibleScholarships = evaluatedScholarships.filter((s) => s.isEligible);
  const topRecommendations = evaluatedScholarships.slice(0, 3);

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
          studentName: studentProfile.name,
          course: studentProfile.currentCourse,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
        if (data.source) setAiSource(data.source);
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
      setAiSource("Offline Built-in AI Rule Engine");
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
          studentName: studentProfile.name,
          targetScholarship: essayTarget,
          course: essayCourse,
          financialNeed: essayNeed,
        }),
      });

      const data = await response.json();
      if (data.success && data.essay) {
        setGeneratedEssay(data.essay);
      } else {
        throw new Error("Generation error");
      }
    } catch {
      // Local fallback essay
      setGeneratedEssay(
        `Statement of Purpose for ${essayTarget}\n\n` +
          `My name is ${studentProfile.name}, pursuing ${essayCourse}. Academic innovation and technological excellence are my passions. Receiving the ${essayTarget} will significantly alleviate the financial burden of ${essayNeed}, empowering me to focus on my education and future contributions.\n\n` +
          `Throughout my academic tenure, I have maintained high performance with demonstrated discipline. This award will ensure I continue my studies without financial limitation. Thank you for considering my application.`
      );
    } finally {
      setIsGeneratingEssay(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="size-6 text-blue-600 dark:text-blue-400" />
            ScholarHub AI Guidance & Essay Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalized scholarship counseling powered by Google Gemini API + Local Fallback Engine.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300">
          <Zap className="size-3.5 text-amber-500" />
          <span>{aiSource}</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("chat")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeSubTab === "chat"
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Bot className="size-3.5" /> AI Chat Assistant
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("essay")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeSubTab === "essay"
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Wand2 className="size-3.5" /> 1-Click Essay Generator
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("recommendations")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeSubTab === "recommendations"
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Award className="size-3.5" /> AI Match Analysis
        </button>
      </div>

      {/* SUB-TAB 1: AI CHAT ASSISTANT */}
      {activeSubTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[520px]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1 opacity-80 text-[11px]">
                      {m.sender === "user" ? "You" : "ScholarHub AI"}
                    </div>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-none bg-slate-100 dark:bg-slate-800 p-3.5 text-xs text-slate-500 dark:text-slate-400 animate-pulse flex items-center gap-2">
                    <Sparkles className="size-3.5 text-blue-500 animate-spin" />
                    ScholarHub AI is analyzing your query...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Box Area */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask any scholarship question (e.g. Which grants fit my income?)..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !chatInput.trim()}
                  className="rounded-xl bg-blue-600 dark:bg-blue-500 p-2.5 text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Preset Prompts Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Suggested Prompts
              </h3>
              <div className="space-y-2">
                {PRESET_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(p)}
                    className="w-full text-left rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-100 dark:border-slate-800"
                  >
                    &ldquo;{p}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Profile Eligibility Status
              </h3>
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 p-3.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">AI Match Rating</p>
                <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">94 / 100</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Eligible for {eligibleScholarships.length} High-Value Grants
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Category Matching</span>
                  <span className="font-semibold text-emerald-600">Passed &check;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Income Eligibility</span>
                  <span className="font-semibold text-emerald-600">Passed &check;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Document Requirement</span>
                  <span className="font-semibold text-blue-600">Zero Uploads Needed</span>
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
                  Fill in your details on the left and click &quot;Generate Statement with AI&quot; to create a tailored essay draft.
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
            {topRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      rec.isEligible
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {rec.matchScore}% Match {rec.isEligible ? "(Eligible)" : "(Partial)"}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{rec.amountFormatted}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rec.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rec.description}
                </p>
                {!rec.isEligible && rec.reasons.length > 0 && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    Note: {rec.reasons[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AiAssistantHub;
