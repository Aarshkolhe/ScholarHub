import express from "express";
import { askGemini } from "../services/aiService.js";

const router = express.Router();

// 1. AI Q&A Chat Endpoint with Live Profile Matching
router.post("/api/ai/chat", async (req, res) => {
  const { prompt, studentName, course, profileSummary } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, message: "Prompt is required" });
  }

  const systemInstruction = `You are ScholarHub AI, an expert academic and scholarship matching advisor for students in India and globally.
Student Name: ${studentName || "Student"}
Student Profile Context: ${profileSummary || course || "Higher Education"}

Your Objectives:
- Analyze the student's degree course, academic marks, annual family income, category quota, and state domicile.
- Recommend specific top matching scholarships (e.g. National Merit STEM Grant, State Tech Fund, AI & Machine Learning Research Grant, First-Gen Excellence Award, Higher Education Merit Scholarship).
- Provide clear, actionable advice regarding document requirements, income eligibility limits, and application tips.
- Use clean markdown bullet points, bold highlights, and encouraging tone.`;

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
    reply: `Hi ${studentName || "Student"}! Based on your profile (${profileSummary || course}):\n\n1. **National Merit STEM Grant** (98% Match - ₹50,000)\n2. **AI & Machine Learning Research Grant** (96% Match - ₹90,000)\n3. **Higher Education Merit Scholarship** (91% Match - ₹60,000)\n\nClick "Go to Recommended" to view and apply directly!`,
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
