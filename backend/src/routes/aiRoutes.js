import express from "express";
import { askGemini } from "../services/aiService.js";

const router = express.Router();

// 1. AI Q&A Chat Endpoint
router.post("/api/ai/chat", async (req, res) => {
  const { prompt, studentName, course } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, message: "Prompt is required" });
  }

  const systemInstruction = `You are ScholarHub AI, an empathetic academic and scholarship guidance counselor for Indian & Global university students.
Student Name: ${studentName || "Student"}
Student Course: ${course || "Higher Education"}
Keep responses encouraging, clear, and actionable. Format with bullet points where appropriate.`;

  const result = await askGemini({ prompt, systemInstruction });

  if (result.success) {
    return res.status(200).json({
      success: true,
      source: result.source,
      reply: result.reply,
    });
  }

  // Fallback if Gemini key is missing or network is offline
  return res.status(200).json({
    success: true,
    source: "local-rule-engine",
    reply: `Hi ${studentName || "Student"}! Based on your profile in ${course || "Higher Education"}:\n\n- Key Document Checklist: Aadhaar, Income Certificate, Semester Marksheets, College ID.\n- Top Recommendation: Complete all 4 profile sections to maximize match scores!\n\n(Tip: Configure your free GEMINI_API_KEY in backend/.env for live Google AI responses)`,
  });
});

// 2. AI Application Essay Generator Endpoint
router.post("/api/ai/essay", async (req, res) => {
  const { targetScholarship, course, financialNeed, studentName } = req.body;

  const prompt = `Write a professional, compelling 200-word Statement of Purpose / Application Essay for a scholarship.
Student Name: ${studentName || "Student"}
Target Scholarship: ${targetScholarship || "Merit Grant"}
Degree Course: ${course || "Higher Education"}
Financial Need & Motivation: ${financialNeed || "Educational tuition fees & study materials"}`;

  const systemInstruction = "You are an expert scholarship essay consultant. Write clear, inspiring, professional essays tailored for university grants.";

  const result = await askGemini({ prompt, systemInstruction });

  if (result.success) {
    return res.status(200).json({
      success: true,
      source: result.source,
      essay: result.reply,
    });
  }

  // Local fallback essay
  const fallbackEssay = `Statement of Purpose for ${targetScholarship || "Scholarship Grant"}\n\n` +
    `My name is ${studentName || "Student"}, currently pursuing ${course || "Higher Education"}. Academic excellence and technological innovation have always been my core passions. Receiving the ${targetScholarship || "Grant"} will significantly relieve the financial burden of ${financialNeed || "tuition fees and books"}, allowing me to focus entirely on my studies and research projects.\n\n` +
    `Throughout my academic journey, I have maintained high academic performance and demonstrated dedication to learning. This grant will empower me to achieve my potential without financial constraint. Thank you for considering my application.`;

  return res.status(200).json({
    success: true,
    source: "local-rule-engine",
    essay: fallbackEssay,
  });
});

export default router;
