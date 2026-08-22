import express from "express";
import { askGemini } from "../services/aiService.js";

const router = express.Router();

// 1. AI Q&A Chat Endpoint — Rich Profile-Aware Context
router.post("/api/ai/chat", async (req, res) => {
  const {
    prompt,
    studentName,
    course,
    profileSummary,
    // Rich profile fields
    category,
    domicileState,
    annualIncome,
    marksPercentage,
    tenthPercentage,
    twelfthPercentage,
    gender,
    qualification,
    streamBranch,
    yearSemester,
    isDisability,
    specialCriteria,
    eligibleScholarships,
    profileStrengthPct,
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, message: "Prompt is required" });
  }

  // Build a rich, structured profile context string
  const profileLines = [
    studentName ? `- Name: ${studentName}` : null,
    course ? `- Current Course: ${course}${streamBranch ? ` (${streamBranch})` : ""}${yearSemester ? `, Year/Sem: ${yearSemester}` : ""}` : null,
    qualification ? `- Qualification Level: ${qualification}` : null,
    marksPercentage ? `- Current Marks/CGPA: ${marksPercentage}%` : null,
    tenthPercentage ? `- 10th Marks: ${tenthPercentage}%` : null,
    twelfthPercentage ? `- 12th/Diploma Marks: ${twelfthPercentage}%` : null,
    category ? `- Social Category: ${category}` : null,
    domicileState ? `- Domicile State: ${domicileState}` : null,
    annualIncome !== undefined && annualIncome !== null && annualIncome !== ""
      ? `- Annual Family Income: ₹${Number(annualIncome).toLocaleString("en-IN")}`
      : null,
    gender ? `- Gender: ${gender}` : null,
    isDisability && isDisability !== "No" ? `- Disability Status: ${isDisability}` : null,
    specialCriteria && specialCriteria !== "None" ? `- Special Criteria: ${specialCriteria}` : null,
    profileStrengthPct !== undefined ? `- Profile Completion: ${profileStrengthPct}%` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const scholarshipContext =
    eligibleScholarships && eligibleScholarships.length > 0
      ? `\n\nTop Eligible Scholarships from ScholarHub database:\n` +
        eligibleScholarships
          .slice(0, 5)
          .map(
            (s, i) =>
              `${i + 1}. ${s.name} (${s.eligibilityPercent ?? s.matchScore}% match) — ${
                typeof s.amount === "number" ? `₹${s.amount.toLocaleString("en-IN")}` : s.amount || "Financial Support"
              } — Provider: ${s.provider} — Portal: ${s.portalUrl || "N/A"}`
          )
          .join("\n")
      : "";

  const systemInstruction = `You are ScholarHub AI — an expert scholarship advisor and eligibility counselor for Indian students.

## Student Profile:
${profileLines || "Profile not yet filled. Encourage the student to complete their profile."}
${scholarshipContext}

## Your Responsibilities:
1. Give precise, personalized advice based on the student's actual profile fields above.
2. When recommending scholarships, refer to the real schemes from the database context if provided.
3. For eligibility questions, compare the student's income, marks, category, and domicile against typical scholarship criteria.
4. For document questions, list the actual documents needed for Indian scholarship portals (MahaDBT, NSP, Vidyasaarathi, etc.).
5. Keep responses concise, structured, and scannable — use markdown headers, bold text, and bullet points.
6. Be encouraging but honest about eligibility gaps and how to improve them.
7. Never make up scholarship names not listed in the database context — only recommend real ones.
8. If profile is incomplete (< 30%), strongly encourage filling in the Details tab first.`;

  const result = await askGemini({ prompt, systemInstruction });

  if (result.success) {
    return res.status(200).json({
      success: true,
      source: result.source,
      reply: result.reply,
    });
  }

  // Smart local fallback using the submitted profile data
  const lower = prompt.toLowerCase();
  const isMatch = lower.includes("match") || lower.includes("eligible") || lower.includes("scholarship") || lower.includes("grant") || lower.includes("recommend") || lower.includes("best");
  const isDoc = lower.includes("document") || lower.includes("certificate") || lower.includes("proof") || lower.includes("upload");
  const isTip = lower.includes("tip") || lower.includes("essay") || lower.includes("statement") || lower.includes("apply");

  let fallbackReply = "";

  if (isDoc) {
    fallbackReply = `## Documents Required for Indian Scholarships\n\n**Academic Documents:**\n- 10th & 12th Marksheet / Semester Marksheet\n- College Bonafide / Enrollment Certificate\n\n**Identity & Domicile:**\n- Aadhaar Card\n- State Domicile Certificate (issued by Tehsildar/SDM)\n- Caste/Category Certificate (if applicable: OBC/SC/ST/EWS)\n\n**Financial Documents:**\n- Annual Family Income Certificate (issued by competent authority)\n\n**Bank Details:**\n- Bank Passbook front page (Account Number, IFSC, Branch — must be Aadhaar-seeded for DBT)\n\n**Passport-size Photograph** and **College Fee Receipt** may also be required depending on the scheme.`;
  } else if (isTip) {
    fallbackReply = `## Application Tips for Scholarship Success\n\n- **Apply Early:** Most central/state schemes open August–December. Don't wait for last-minute portal crashes.\n- **Complete Your ScholarHub Profile:** A higher profile completion score directly improves your AI match accuracy.\n- **Aadhaar–Bank Seeding:** Link your bank account to Aadhaar for seamless DBT credit.\n- **One Scholarship Rule:** Most government schemes allow only one government scholarship per academic year — choose wisely.\n- **Strong SOP:** For competitive grants (STEM, Research), write a crisp 200-word Statement of Purpose highlighting your academic goals and financial need.`;
  } else if (isMatch && eligibleScholarships && eligibleScholarships.length > 0) {
    const topMatches = eligibleScholarships
      .slice(0, 3)
      .map(
        (s, i) =>
          `**${i + 1}. ${s.name}** — ${s.eligibilityPercent ?? s.matchScore}% match — ${
            typeof s.amount === "number" ? `₹${s.amount.toLocaleString("en-IN")}` : s.amount || "Financial Support"
          }`
      )
      .join("\n");
    fallbackReply = `## Your Top Scholarship Matches\n\nBased on your profile (${category || "General"} · ${domicileState || "Maharashtra"} · ${course || "Higher Education"}):\n\n${topMatches}\n\nVisit the **Recommended** tab to see all your matches with full eligibility details.`;
  } else {
    fallbackReply = `I'm here to help${studentName ? `, ${studentName}` : ""}! You can ask me about:\n\n- **Scholarship eligibility** — which schemes match your profile\n- **Required documents** — what to prepare for MahaDBT, NSP, Vidyasaarathi\n- **Application tips** — how to write a strong SOP and avoid common mistakes\n- **Income limits** — what income ceiling applies to different grant types\n\nFor personalized recommendations, make sure your profile is at least 30% complete in the **Details** tab.`;
  }

  return res.status(200).json({
    success: true,
    source: "local-rule-engine",
    reply: fallbackReply,
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

  const systemInstruction =
    "You are an expert scholarship essay consultant. Write clear, inspiring, professional essays tailored for university grants. Use first-person voice, professional tone, and keep it under 220 words.";

  const result = await askGemini({ prompt, systemInstruction });

  if (result.success) {
    return res.status(200).json({ success: true, source: result.source, essay: result.reply });
  }

  const fallbackEssay =
    `Statement of Purpose for ${targetScholarship || "Scholarship Grant"}\n\n` +
    `My name is ${studentName || "Student"}, currently pursuing ${course || "Higher Education"}. Academic excellence and a passion for continuous growth have been my guiding principles. Receiving the ${targetScholarship || "Grant"} will significantly ease the financial burden of ${financialNeed || "tuition and study materials"}, allowing me to focus entirely on my academics and career goals.\n\n` +
    `I have consistently demonstrated dedication to learning and a commitment to making the most of every opportunity available to me. This grant will empower me to reach my full potential without financial constraint. I am deeply grateful for the opportunity to apply and am committed to honouring this scholarship through academic achievement and community contribution.`;

  return res.status(200).json({ success: true, source: "local-rule-engine", essay: fallbackEssay });
});

export default router;
