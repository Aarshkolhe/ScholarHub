/**
 * ScholarHub Smart Eligibility Evaluation Engine
 * Evaluates student profile details against scholarship requirements.
 * Operates purely on self-reported profile data with zero file upload overhead.
 */

import { SCHOLARSHIPS_DATABASE } from "./scholarshipData.js";

export const SIMULATION_DEMO_PROFILES = [
  {
    id: "high_merit_tech",
    label: "Aarsh Kolhe",
    tagline: "High Merit Engineering Student (OBC, 78% Marks, ₹2L Income)",
    description: "B.Tech Computer Science (Sem 6), OBC quota, ₹2.0L annual income, Maharashtra domicile. High eligibility for STEM & state merit grants.",
    badgeColor: "emerald",
    profile: {
      user: {
        id: "usr_sim_demo_aarsh",
        name: "Aarsh Kolhe",
        fullName: "Aarsh Kolhe",
        email: "aarsh@scholarhub.edu",
        role: "Student",
      },
      personal: {
        fullName: "Aarsh Kolhe",
        email: "aarsh@scholarhub.edu",
        phone: "9876543210",
        gender: "Male",
        dob: "2004-05-15",
        age: "21",
      },
      currentEducation: {
        currentCourse: "B.Tech Computer Science",
        streamBranch: "Engineering & Technology",
        collegeName: "National Institute of Technology",
        yearSemester: "3rd Year (Sem 6)",
        marksPercentage: "78%",
        qualification: "Undergraduate (UG)",
      },
      pastEducation: {
        tenthPercentage: "88.4%",
        twelfthPercentage: "85.2%",
      },
      livingStatus: {
        livingType: "Hostel",
        monthlyLivingCost: "6000",
      },
      financial: {
        annualIncome: "200000",
      },
      eligibility: {
        category: "OBC",
        domicileState: "Maharashtra",
        isDisability: "No",
        specialCriteria: "None",
      },
      savedIds: [],
      appliedIds: [],
    },
  },
  {
    id: "class_10_school_student",
    label: "Tanvi Deshmukh",
    tagline: "Class 10 School Student (SSC Board, 85% Marks, ₹1.2L Income)",
    description: "Class 10 Passed (SSC Board), EBC category, 85% 10th marks, ₹1.2L income, Maharashtra domicile. Tests 10th Passed & school merit grants (e.g. MahaDBT 10th Merit).",
    badgeColor: "cyan",
    profile: {
      user: {
        id: "usr_sim_demo_tanvi",
        name: "Tanvi Deshmukh",
        fullName: "Tanvi Deshmukh",
        email: "tanvi.d@scholarhub.edu",
        role: "Student",
      },
      personal: {
        fullName: "Tanvi Deshmukh",
        email: "tanvi.d@scholarhub.edu",
        phone: "9876123456",
        gender: "Female",
        dob: "2009-08-12",
        age: "16",
      },
      currentEducation: {
        currentCourse: "Class 10 (SSC Board)",
        streamBranch: "Secondary School (Class 9th & 10th)",
        collegeName: "Saraswati High School",
        yearSemester: "Class 10 (Board Year)",
        marksPercentage: "85%",
        qualification: "Class 10 / Secondary (SSC)",
      },
      pastEducation: {
        tenthPercentage: "85.0%",
        twelfthPercentage: "",
      },
      livingStatus: {
        livingType: "Day Scholar (Commuter)",
        monthlyLivingCost: "1500",
      },
      financial: {
        annualIncome: "120000",
      },
      eligibility: {
        category: "EBC",
        domicileState: "Maharashtra",
        isDisability: "No",
        specialCriteria: "Single Girl Child",
      },
      savedIds: [],
      appliedIds: [],
    },
  },
  {
    id: "disabled_girl_high_merit",
    label: "Ananya Roy",
    tagline: "Disabled Female Top Scholar (SC/ST, PwD, 90% Marks, ₹1.5L Income)",
    description: "B.Sc Biotechnology (1st Year), Female, PwD/Disability: Yes, SC/ST quota, ₹1.5L annual income, West Bengal domicile. Qualifies for disability grants & women in STEM awards.",
    badgeColor: "indigo",
    profile: {
      user: {
        id: "usr_sim_demo_ananya",
        name: "Ananya Roy",
        fullName: "Ananya Roy",
        email: "ananya.roy@scholarhub.edu",
        role: "Student",
      },
      personal: {
        fullName: "Ananya Roy",
        email: "ananya.roy@scholarhub.edu",
        phone: "9812345678",
        gender: "Female",
        dob: "2005-02-20",
        age: "20",
      },
      currentEducation: {
        currentCourse: "B.Sc Biotechnology",
        streamBranch: "Science & Healthcare",
        collegeName: "St. Xavier's College",
        yearSemester: "1st Year (Sem 2)",
        marksPercentage: "90%",
        qualification: "Undergraduate (UG)",
      },
      pastEducation: {
        tenthPercentage: "94.0%",
        twelfthPercentage: "92.5%",
      },
      livingStatus: {
        livingType: "Day Scholar (Commuter)",
        monthlyLivingCost: "2500",
      },
      financial: {
        annualIncome: "150000",
      },
      eligibility: {
        category: "SC/ST",
        domicileState: "West Bengal",
        isDisability: "Yes",
        specialCriteria: "Single Girl Child",
      },
      savedIds: [],
      appliedIds: [],
    },
  },
  {
    id: "moderate_general_arts",
    label: "Rahul Sharma",
    tagline: "Moderate Marks Arts Student (General Category, 50% Marks, ₹4.5L Income)",
    description: "B.A. Humanities (2nd Year), General category, 50% marks, ₹4.5L annual income, Delhi domicile. Tests moderate eligibility calculations & lower % match badge styling.",
    badgeColor: "amber",
    profile: {
      user: {
        id: "usr_sim_demo_rahul",
        name: "Rahul Sharma",
        fullName: "Rahul Sharma",
        email: "rahul.sharma@scholarhub.edu",
        role: "Student",
      },
      personal: {
        fullName: "Rahul Sharma",
        email: "rahul.sharma@scholarhub.edu",
        phone: "9898989898",
        gender: "Male",
        dob: "2004-09-10",
        age: "21",
      },
      currentEducation: {
        currentCourse: "B.A. Humanities & Social Sciences",
        streamBranch: "Arts & Humanities",
        collegeName: "Delhi University",
        yearSemester: "2nd Year (Sem 4)",
        marksPercentage: "50%",
        qualification: "Undergraduate (UG)",
      },
      pastEducation: {
        tenthPercentage: "58.0%",
        twelfthPercentage: "54.0%",
      },
      livingStatus: {
        livingType: "Rented Room / PG",
        monthlyLivingCost: "4500",
      },
      financial: {
        annualIncome: "450000",
      },
      eligibility: {
        category: "General",
        domicileState: "Delhi",
        isDisability: "No",
        specialCriteria: "None",
      },
      savedIds: [],
      appliedIds: [],
    },
  },
  {
    id: "incomplete_profile_gate",
    label: "Priya Patel",
    tagline: "Incomplete Profile (< 30% Strength - Threshold Gate Test)",
    description: "B.Com (1st Year). Only basic name & course filled, profile strength ~15%. Triggers the 30% Recommendation Threshold Gate card and incomplete profile alerts.",
    badgeColor: "rose",
    profile: {
      user: {
        id: "usr_sim_demo_priya",
        name: "Priya Patel",
        fullName: "Priya Patel",
        email: "priya.patel@scholarhub.edu",
        role: "Student",
      },
      personal: {
        fullName: "Priya Patel",
        email: "priya.patel@scholarhub.edu",
        phone: "",
        gender: "",
        dob: "",
        age: "",
      },
      currentEducation: {
        currentCourse: "B.Com Commerce",
        streamBranch: "",
        collegeName: "",
        yearSemester: "",
        marksPercentage: "",
        qualification: "Undergraduate (UG)",
      },
      pastEducation: {
        tenthPercentage: "",
        twelfthPercentage: "",
      },
      livingStatus: {
        livingType: "",
        monthlyLivingCost: "",
      },
      financial: {
        annualIncome: "",
      },
      eligibility: {
        category: "",
        domicileState: "",
        isDisability: "",
        specialCriteria: "",
      },
      savedIds: [],
      appliedIds: [],
    },
  },
  {
    id: "postgraduate_research",
    label: "Siddharth Verma",
    tagline: "Postgraduate AI Scholar (EWS, 82% Marks, ₹5L Income)",
    description: "M.Tech Artificial Intelligence (1st Year), EWS quota, 82% marks, ₹5.0L annual income, Karnataka domicile. Qualifies for PG research fellowships and higher education grants.",
    badgeColor: "violet",
    profile: {
      user: {
        id: "usr_sim_demo_siddharth",
        name: "Siddharth Verma",
        fullName: "Siddharth Verma",
        email: "siddharth.v@scholarhub.edu",
        role: "Student",
      },
      personal: {
        fullName: "Siddharth Verma",
        email: "siddharth.v@scholarhub.edu",
        phone: "9765432109",
        gender: "Male",
        dob: "2002-11-05",
        age: "23",
      },
      currentEducation: {
        currentCourse: "M.Tech Artificial Intelligence",
        streamBranch: "Engineering & Technology",
        collegeName: "Indian Institute of Science",
        yearSemester: "1st Year (Sem 2)",
        marksPercentage: "82%",
        qualification: "Postgraduate (PG)",
      },
      pastEducation: {
        tenthPercentage: "90.0%",
        twelfthPercentage: "88.0%",
        ugPercentage: "84.5%",
      },
      livingStatus: {
        livingType: "Hostel",
        monthlyLivingCost: "7000",
      },
      financial: {
        annualIncome: "500000",
      },
      eligibility: {
        category: "EWS",
        domicileState: "Karnataka",
        isDisability: "No",
        specialCriteria: "First Generation College Student",
      },
      savedIds: [],
      appliedIds: [],
    },
  },
];

export const SIMULATION_DEMO_PROFILE = SIMULATION_DEMO_PROFILES[0].profile;

/**
 * Load complete demo dataset into localStorage for Simulation Mode.
 * Accepts a profile index or ID string.
 */
export function loadSimulationProfile(profileIndexOrId = 0) {
  let selected = SIMULATION_DEMO_PROFILES[0];

  if (typeof profileIndexOrId === "number") {
    selected = SIMULATION_DEMO_PROFILES[profileIndexOrId] || SIMULATION_DEMO_PROFILES[0];
  } else if (typeof profileIndexOrId === "string") {
    selected =
      SIMULATION_DEMO_PROFILES.find((p) => p.id === profileIndexOrId) ||
      SIMULATION_DEMO_PROFILES[0];
  }

  const demo = selected.profile;
  const uid = `_${demo.user.id}`;

  // Global keys — savedIds and appliedIds are explicitly empty []
  localStorage.setItem("scholarhub_user", JSON.stringify(demo.user));
  localStorage.setItem("scholarhub_profile_personal", JSON.stringify(demo.personal));
  localStorage.setItem("scholarhub_profile_current_education", JSON.stringify(demo.currentEducation));
  localStorage.setItem("scholarhub_profile_past_education", JSON.stringify(demo.pastEducation));
  localStorage.setItem("scholarhub_profile_living_status", JSON.stringify(demo.livingStatus));
  localStorage.setItem("scholarhub_profile_financial", JSON.stringify(demo.financial));
  localStorage.setItem("scholarhub_profile_eligibility", JSON.stringify(demo.eligibility));
  localStorage.setItem("scholarhub_profile_education", JSON.stringify({
    ...demo.currentEducation,
    ...demo.pastEducation,
  }));
  localStorage.setItem("scholarhub_saved_landing_name", demo.personal.fullName);
  localStorage.setItem("scholarhub_saved_ids", JSON.stringify([]));
  localStorage.setItem("scholarhub_applied_ids", JSON.stringify([]));

  // Scoped keys
  localStorage.setItem(`scholarhub_profile_personal${uid}`, JSON.stringify(demo.personal));
  localStorage.setItem(`scholarhub_profile_current_education${uid}`, JSON.stringify(demo.currentEducation));
  localStorage.setItem(`scholarhub_profile_past_education${uid}`, JSON.stringify(demo.pastEducation));
  localStorage.setItem(`scholarhub_profile_living_status${uid}`, JSON.stringify(demo.livingStatus));
  localStorage.setItem(`scholarhub_profile_financial${uid}`, JSON.stringify(demo.financial));
  localStorage.setItem(`scholarhub_profile_eligibility${uid}`, JSON.stringify(demo.eligibility));
  localStorage.setItem(`scholarhub_profile_education${uid}`, JSON.stringify({
    ...demo.currentEducation,
    ...demo.pastEducation,
  }));
  localStorage.setItem(`scholarhub_saved_landing_name${uid}`, demo.personal.fullName);
  localStorage.setItem(`scholarhub_saved_ids${uid}`, JSON.stringify([]));
  localStorage.setItem(`scholarhub_applied_ids${uid}`, JSON.stringify([]));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }

  return demo;
}

/**
 * Clear all profile data from localStorage to return to clean state.
 */
export function clearProfileData() {
  let user = {};
  try {
    const userStr = localStorage.getItem("scholarhub_user");
    user = userStr ? JSON.parse(userStr) : {};
  } catch {}
  const uid = user.id ? `_${user.id}` : "";

  localStorage.removeItem("scholarhub_profile_personal");
  localStorage.removeItem("scholarhub_profile_current_education");
  localStorage.removeItem("scholarhub_profile_past_education");
  localStorage.removeItem("scholarhub_profile_living_status");
  localStorage.removeItem("scholarhub_profile_education");
  localStorage.removeItem("scholarhub_profile_financial");
  localStorage.removeItem("scholarhub_profile_eligibility");
  localStorage.removeItem("scholarhub_saved_landing_name");
  localStorage.removeItem("scholarhub_saved_ids");
  localStorage.removeItem("scholarhub_applied_ids");
  localStorage.removeItem("scholarhub_avatar");

  if (uid) {
    localStorage.removeItem(`scholarhub_profile_personal${uid}`);
    localStorage.removeItem(`scholarhub_profile_current_education${uid}`);
    localStorage.removeItem(`scholarhub_profile_past_education${uid}`);
    localStorage.removeItem(`scholarhub_profile_living_status${uid}`);
    localStorage.removeItem(`scholarhub_profile_education${uid}`);
    localStorage.removeItem(`scholarhub_profile_financial${uid}`);
    localStorage.removeItem(`scholarhub_profile_eligibility${uid}`);
    localStorage.removeItem(`scholarhub_saved_landing_name${uid}`);
    localStorage.removeItem(`scholarhub_saved_ids${uid}`);
    localStorage.removeItem(`scholarhub_applied_ids${uid}`);
    localStorage.removeItem(`scholarhub_avatar${uid}`);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }
}

/**
 * Retrieve the current merged student profile from localStorage.
 */
export function getStoredStudentProfile() {
  let user = {};
  try {
    const userStr = localStorage.getItem("scholarhub_user");
    user = userStr ? JSON.parse(userStr) : {};
  } catch {}

  const uid = user.id ? `_${user.id}` : "";

  const personalStr = uid
    ? localStorage.getItem(`scholarhub_profile_personal${uid}`)
    : localStorage.getItem("scholarhub_profile_personal");
  const curEdStr = uid
    ? localStorage.getItem(`scholarhub_profile_current_education${uid}`)
    : localStorage.getItem("scholarhub_profile_current_education");
  const pastEdStr = uid
    ? localStorage.getItem(`scholarhub_profile_past_education${uid}`)
    : localStorage.getItem("scholarhub_profile_past_education");
  const livingStr = uid
    ? localStorage.getItem(`scholarhub_profile_living_status${uid}`)
    : localStorage.getItem("scholarhub_profile_living_status");
  const legacyEdStr = uid
    ? localStorage.getItem(`scholarhub_profile_education${uid}`)
    : localStorage.getItem("scholarhub_profile_education");
  const financialStr = uid
    ? localStorage.getItem(`scholarhub_profile_financial${uid}`)
    : localStorage.getItem("scholarhub_profile_financial");
  const eligibilityStr = uid
    ? localStorage.getItem(`scholarhub_profile_eligibility${uid}`)
    : localStorage.getItem("scholarhub_profile_eligibility");

  const legacyEd = legacyEdStr ? JSON.parse(legacyEdStr) : {};

  const currentEducation = curEdStr
    ? JSON.parse(curEdStr)
    : {
        currentCourse: legacyEd.currentCourse || "",
        streamBranch: legacyEd.streamBranch || legacyEd.currentStream || "",
        collegeName: legacyEd.collegeName || "",
        yearSemester: legacyEd.yearSemester || "",
        marksPercentage: legacyEd.marksPercentage || "",
        qualification: legacyEd.qualification || legacyEd.degreeLevel || "",
      };

  const pastEducation = pastEdStr
    ? JSON.parse(pastEdStr)
    : {
        tenthPercentage: legacyEd.tenthPercentage || "",
        twelfthPercentage: legacyEd.twelfthPercentage || "",
      };

  const livingStatus = livingStr
    ? JSON.parse(livingStr)
    : {
        livingType: legacyEd.livingType || "Day Scholar at Home",
        monthlyLivingCost: legacyEd.monthlyLivingCost || "",
      };

  const financial = financialStr
    ? JSON.parse(financialStr)
    : {
        annualIncome: "",
      };

  const eligibility = eligibilityStr
    ? JSON.parse(eligibilityStr)
    : {
        category: "",
        domicileState: "",
        isDisability: "No",
        specialCriteria: "None",
      };

  const personal = personalStr
    ? JSON.parse(personalStr)
    : {
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: "",
        gender: "",
        dob: "",
        age: "",
      };

  return {
    ...personal,
    ...currentEducation,
    ...pastEducation,
    ...livingStatus,
    ...financial,
    ...eligibility,
    personal,
    currentEducation,
    pastEducation,
    livingStatus,
    financial,
    eligibility,
    name: user.fullName || user.name || personal.fullName || "",
    email: user.email || personal.email || "",
  };
}

/**
 * Helper to normalize flat or nested student profile objects.
 */
export function normalizeProfile(raw) {
  if (!raw) return {};
  const personal = raw.personal || {};
  const curEd = raw.currentEducation || {};
  const pastEd = raw.pastEducation || {};
  const living = raw.livingStatus || {};
  const financial = raw.financial || {};
  const eligibility = raw.eligibility || {};

  return {
    ...raw,
    phone: raw.phone || personal.phone || "",
    gender: raw.gender || personal.gender || "",
    dob: raw.dob || personal.dob || "",
    age: raw.age || personal.age || "",
    fullName: raw.fullName || raw.name || personal.fullName || "",
    email: raw.email || personal.email || "",
    currentCourse: raw.currentCourse || curEd.currentCourse || "",
    streamBranch: raw.streamBranch || curEd.streamBranch || "",
    collegeName: raw.collegeName || curEd.collegeName || "",
    yearSemester: raw.yearSemester || curEd.yearSemester || "",
    marksPercentage: raw.marksPercentage || curEd.marksPercentage || "",
    qualification: raw.qualification || curEd.qualification || "",
    tenthPercentage: raw.tenthPercentage || pastEd.tenthPercentage || "",
    twelfthPercentage: raw.twelfthPercentage || pastEd.twelfthPercentage || "",
    ugPercentage: raw.ugPercentage || pastEd.ugPercentage || "",
    livingType: raw.livingType || living.livingType || "",
    monthlyLivingCost: raw.monthlyLivingCost || living.monthlyLivingCost || "",
    annualIncome: raw.annualIncome !== undefined && raw.annualIncome !== null ? raw.annualIncome : (financial.annualIncome !== undefined ? financial.annualIncome : ""),
    category: raw.category || eligibility.category || "",
    domicileState: raw.domicileState || eligibility.domicileState || "",
    isDisability: raw.isDisability || eligibility.isDisability || "No",
    specialCriteria: raw.specialCriteria || eligibility.specialCriteria || "None",
  };
}

/**
 * Calculate the exact functional profile strength (0 - 100%)
 * based on high-impact scholarship matching fields.
 *
 * Domain Breakdown (Total 100%):
 * 1. 👤 Identity & Contact (15%): Phone (5%), Gender (5%), DOB (5%)
 * 2. 🎓 Current Education (25%): Current Course (6%), Stream (5%), College Name (5%), Year/Sem (4%), Marks/CGPA (5%)
 * 3. 📚 Past Education (15%): 10th Marks % (8%), 12th/Diploma % (7%)
 * 4. 🏠 Living Status (10%): Living Type (10%)
 * 5. 💰 Financial (15%): Annual Family Income (15%)
 * 6. 🏛️ Category & Domicile (20%): Social Category (10%), Domicile State (10%)
 */
export function calculateProfileStrength(profile = null) {
  const p = normalizeProfile(profile || getStoredStudentProfile());
  let score = 0;

  // 1. Identity & Contact (15 pts)
  if (p.phone && String(p.phone).trim().length >= 8) score += 5;
  if (p.gender && String(p.gender).trim()) score += 5;
  if (p.dob && String(p.dob).trim()) score += 5;

  // 2. Current Education (25 pts)
  if (p.currentCourse && String(p.currentCourse).trim()) score += 6;
  if (p.streamBranch && String(p.streamBranch).trim()) score += 5;
  if (p.collegeName && String(p.collegeName).trim()) score += 5;
  if (p.yearSemester && String(p.yearSemester).trim()) score += 4;
  if (p.marksPercentage && String(p.marksPercentage).trim()) score += 5;

  // 3. Past Education (15 pts)
  if (p.tenthPercentage && String(p.tenthPercentage).trim()) score += 5;
  if (p.twelfthPercentage && String(p.twelfthPercentage).trim()) score += 5;
  if (p.ugPercentage && String(p.ugPercentage).trim()) score += 5;

  // 4. Living Status (10 pts)
  if (p.livingType && String(p.livingType).trim()) score += 10;

  // 5. Financial (15 pts)
  if (p.annualIncome !== undefined && p.annualIncome !== null && String(p.annualIncome).trim().length > 0) {
    score += 15;
  }

  // 6. Category & Domicile (20 pts)
  if (p.category && String(p.category).trim()) score += 10;
  if (p.domicileState && String(p.domicileState).trim()) score += 10;

  return Math.min(100, Math.round(score));
}

/**
 * Compare a scholarship against a student's profile attributes.
 * Activates real-time match evaluation once profile passes the 30% activation threshold.
 * Returns { isEligible, isPendingDetails, matchScore, reasons, criteriaBreakdown, passedChecks, totalChecks }
 */
export function evaluateEligibility(scholarship, profile = null) {
  const student = normalizeProfile(profile || getStoredStudentProfile());
  const criteria = scholarship.criteria || {};
  const profileStrength = calculateProfileStrength(student);

  const reasons = [];
  const criteriaBreakdown = [];
  let passedChecks = 0;
  let totalChecks = 0;
  const missingFields = [];

  // 1. Social Category Check
  if (criteria.allowedCategories && !criteria.allowedCategories.includes("All")) {
    totalChecks++;
    const studentCat = (student.category || "").trim();
    if (!studentCat) {
      missingFields.push("Category");
      reasons.push(`Reserved for ${criteria.allowedCategories.join(", ")} category (not specified in profile).`);
      criteriaBreakdown.push({ label: "Category Quota", status: "failed", detail: `Requires ${criteria.allowedCategories.join(", ")}` });
    } else {
      const passed = criteria.allowedCategories.some(
        (c) => c.toLowerCase() === studentCat.toLowerCase()
      );
      if (!passed) {
        reasons.push(`Reserved for ${criteria.allowedCategories.join(", ")} (your category: ${studentCat}).`);
        criteriaBreakdown.push({ label: "Category Quota", status: "failed", detail: `Requires ${criteria.allowedCategories.join(", ")} (Yours: ${studentCat})` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Category Quota", status: "passed", detail: `Matched: ${studentCat}` });
      }
    }
  }

  // 2. Annual Family Income Check
  if (criteria.maxIncome) {
    totalChecks++;
    const rawIncome = student.annualIncome !== undefined && student.annualIncome !== null ? String(student.annualIncome).trim() : "";
    const maxFormatted = `₹${criteria.maxIncome.toLocaleString("en-IN")}`;

    if (!rawIncome) {
      missingFields.push("Family Income");
      reasons.push(`Requires annual family income <= ${maxFormatted} (not specified in profile).`);
      criteriaBreakdown.push({ label: "Income Limit", status: "failed", detail: `Max ${maxFormatted} (Unspecified)` });
    } else {
      const incomeNum = parseFloat(rawIncome.replace(/[^0-9.]/g, "")) || 0;
      const userFormatted = `₹${incomeNum.toLocaleString("en-IN")}`;

      if (incomeNum > criteria.maxIncome) {
        reasons.push(`Income exceeds ${maxFormatted} ceiling (your reported income: ${userFormatted}).`);
        criteriaBreakdown.push({ label: "Income Limit", status: "failed", detail: `Max ${maxFormatted} (Yours: ${userFormatted})` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Income Limit", status: "passed", detail: `Within limit: ${userFormatted} <= ${maxFormatted}` });
      }
    }
  }

  // 3. Living Status / Hostel Check (e.g. Dr. Punjabrao Deshmukh Hostel Allowance)
  if (criteria.requiresHostel || (criteria.allowedLivingTypes && criteria.allowedLivingTypes.length > 0)) {
    totalChecks++;
    const userLiving = (student.livingType || "").trim();
    const allowedTypes = criteria.allowedLivingTypes || ["Hostel", "PG / Rented Accommodation"];

    if (!userLiving) {
      missingFields.push("Living Status");
      reasons.push(`Requires living status verification: ${allowedTypes.join(" or ")} (not specified in profile).`);
      criteriaBreakdown.push({ label: "Living / Hostel Status", status: "failed", detail: `Requires ${allowedTypes.join(" / ")}` });
    } else {
      const isHostelOrPg = allowedTypes.some((t) => t.toLowerCase() === userLiving.toLowerCase());
      if (!isHostelOrPg) {
        reasons.push(`Directly restricted to hostel / PG residents (your profile: ${userLiving}).`);
        criteriaBreakdown.push({ label: "Living / Hostel Status", status: "failed", detail: `Requires Hostel / PG (Yours: ${userLiving})` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Living / Hostel Status", status: "passed", detail: `Matched: ${userLiving}` });
      }
    }
  }

  // 4. Class 10th Marks Check (e.g. MahaDBT 10th Passed Merit Schemes)
  if (criteria.minTenthPercentage) {
    totalChecks++;
    const rawTenth = student.tenthPercentage !== undefined && student.tenthPercentage !== null ? String(student.tenthPercentage).trim() : "";

    if (!rawTenth) {
      missingFields.push("10th Marks %");
      reasons.push(`Requires minimum ${criteria.minTenthPercentage}% in 10th Board Exam (not specified in profile).`);
      criteriaBreakdown.push({ label: "Class 10th Cutoff", status: "failed", detail: `Requires >= ${criteria.minTenthPercentage}% (Unspecified)` });
    } else {
      const tenthScore = parseFloat(rawTenth.replace(/[^0-9.]/g, "")) || 0;
      if (tenthScore < criteria.minTenthPercentage) {
        reasons.push(`Requires minimum ${criteria.minTenthPercentage}% in 10th (your score: ${tenthScore}%).`);
        criteriaBreakdown.push({ label: "Class 10th Cutoff", status: "failed", detail: `Requires >= ${criteria.minTenthPercentage}% (Yours: ${tenthScore}%)` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Class 10th Cutoff", status: "passed", detail: `Passed: ${tenthScore}% >= ${criteria.minTenthPercentage}%` });
      }
    }
  }

  // 5. Class 12th / Diploma Marks Check
  if (criteria.minTwelfthPercentage) {
    totalChecks++;
    const rawTwelfth = student.twelfthPercentage !== undefined && student.twelfthPercentage !== null ? String(student.twelfthPercentage).trim() : "";

    if (!rawTwelfth) {
      missingFields.push("12th Marks %");
      reasons.push(`Requires minimum ${criteria.minTwelfthPercentage}% in 12th / Diploma (not specified in profile).`);
      criteriaBreakdown.push({ label: "Class 12th Cutoff", status: "failed", detail: `Requires >= ${criteria.minTwelfthPercentage}% (Unspecified)` });
    } else {
      const twelfthScore = parseFloat(rawTwelfth.replace(/[^0-9.]/g, "")) || 0;
      if (twelfthScore < criteria.minTwelfthPercentage) {
        reasons.push(`Requires minimum ${criteria.minTwelfthPercentage}% in 12th (your score: ${twelfthScore}%).`);
        criteriaBreakdown.push({ label: "Class 12th Cutoff", status: "failed", detail: `Requires >= ${criteria.minTwelfthPercentage}% (Yours: ${twelfthScore}%)` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Class 12th Cutoff", status: "passed", detail: `Passed: ${twelfthScore}% >= ${criteria.minTwelfthPercentage}%` });
      }
    }
  }

  // 6. Current Academic Cutoff (Marks % or CGPA)
  if (criteria.minPercentage && !criteria.minTenthPercentage && !criteria.minTwelfthPercentage) {
    totalChecks++;
    const rawMarks = student.marksPercentage !== undefined && student.marksPercentage !== null ? String(student.marksPercentage).trim() : "";

    if (!rawMarks) {
      missingFields.push("Academic Marks / CGPA");
      reasons.push(`Requires minimum ${criteria.minPercentage}% marks (not specified in profile).`);
      criteriaBreakdown.push({ label: "Academic Cutoff", status: "failed", detail: `Requires >= ${criteria.minPercentage}%` });
    } else {
      let scoreNum = parseFloat(rawMarks.replace(/[^0-9.]/g, "")) || 0;
      if (scoreNum > 0 && scoreNum <= 10) {
        scoreNum = scoreNum * 9.5; // CGPA conversion
      }

      if (scoreNum < criteria.minPercentage) {
        reasons.push(`Requires minimum ${criteria.minPercentage}% marks (your score: ${Math.round(scoreNum)}%).`);
        criteriaBreakdown.push({ label: "Academic Cutoff", status: "failed", detail: `Requires >= ${criteria.minPercentage}% (Yours: ${Math.round(scoreNum)}%)` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Academic Cutoff", status: "passed", detail: `Passed: ${Math.round(scoreNum)}% >= ${criteria.minPercentage}%` });
      }
    }
  }

  // 7. Domicile / State Check
  if (
    criteria.allowedStates &&
    !criteria.allowedStates.includes("All India") &&
    !criteria.allowedStates.includes("All")
  ) {
    totalChecks++;
    const studentState = (student.domicileState || "").trim();

    if (!studentState) {
      missingFields.push("Domicile State");
      reasons.push(`Restricted to students domiciled in ${criteria.allowedStates.join(", ")} (not specified in profile).`);
      criteriaBreakdown.push({ label: "Domicile State", status: "failed", detail: `Requires ${criteria.allowedStates.join(", ")}` });
    } else {
      const passed = criteria.allowedStates.some((s) => s.toLowerCase() === studentState.toLowerCase());
      if (!passed) {
        reasons.push(`Restricted to ${criteria.allowedStates.join(", ")} (your state: ${studentState}).`);
        criteriaBreakdown.push({ label: "Domicile State", status: "failed", detail: `Requires ${criteria.allowedStates.join(", ")} (Yours: ${studentState})` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Domicile State", status: "passed", detail: `Matched: ${studentState}` });
      }
    }
  }

  // 8. Gender Check
  if (criteria.gender && criteria.gender !== "All") {
    totalChecks++;
    const studentGender = (student.gender || "").trim().toLowerCase();
    const targetGender = criteria.gender.toLowerCase();

    if (!studentGender) {
      missingFields.push("Gender");
      reasons.push(`Exclusively open for ${criteria.gender} candidates (not specified in profile).`);
      criteriaBreakdown.push({ label: "Gender Requirement", status: "failed", detail: `Requires ${criteria.gender}` });
    } else if (studentGender !== targetGender) {
      reasons.push(`Exclusively open for ${criteria.gender} candidates (your profile: ${student.gender}).`);
      criteriaBreakdown.push({ label: "Gender Requirement", status: "failed", detail: `Requires ${criteria.gender} (Yours: ${student.gender})` });
    } else {
      passedChecks++;
      criteriaBreakdown.push({ label: "Gender Requirement", status: "passed", detail: `Matched: ${student.gender}` });
    }
  }

  // 9. Course & Stream Alignment Check
  if (criteria.allowedStreams && !criteria.allowedStreams.includes("All")) {
    totalChecks++;
    const stream = (student.streamBranch || "").toLowerCase();
    const course = (student.currentCourse || "").toLowerCase();
    const qual = (student.qualification || "").toLowerCase();

    if (!stream && !course && !qual) {
      missingFields.push("Course / Stream");
      reasons.push(`Course/Stream must relate to [${criteria.allowedStreams.slice(0, 3).join(", ")}] (not specified in profile).`);
      criteriaBreakdown.push({ label: "Degree & Stream", status: "failed", detail: `Requires ${criteria.allowedStreams.slice(0, 3).join(", ")}` });
    } else {
      const passed = criteria.allowedStreams.some((s) => {
        const sl = s.toLowerCase();
        return (
          stream.includes(sl) ||
          course.includes(sl) ||
          qual.includes(sl) ||
          sl.includes(course) ||
          sl.includes(stream) ||
          (sl.includes("school") && (qual.includes("10") || qual.includes("12") || qual.includes("secondary") || course.includes("class")))
        );
      });

      if (!passed) {
        reasons.push(`Requires stream related to [${criteria.allowedStreams.slice(0, 3).join(", ")}] (your current: ${student.currentCourse || student.streamBranch || student.qualification || "Other"}).`);
        criteriaBreakdown.push({ label: "Degree & Stream", status: "failed", detail: `Requires ${criteria.allowedStreams.slice(0, 3).join(", ")}` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Degree & Stream", status: "passed", detail: `Matched: ${student.currentCourse || student.streamBranch || student.qualification}` });
      }
    }
  }

  // 9b. Allowed Degree / Level Check
  if (criteria.allowedDegrees && !criteria.allowedDegrees.includes("All")) {
    totalChecks++;
    const qual = (student.qualification || "").toLowerCase();
    const course = (student.currentCourse || "").toLowerCase();

    const passed = criteria.allowedDegrees.some((d) => {
      const dl = d.toLowerCase();
      if (dl === "school" || dl.includes("secondary") || dl.includes("10+2")) {
        return (
          qual.includes("10") ||
          qual.includes("12") ||
          qual.includes("secondary") ||
          qual.includes("school") ||
          course.includes("class 10") ||
          course.includes("class 12") ||
          course.includes("class 11") ||
          course.includes("ssc") ||
          course.includes("hsc")
        );
      }
      if (dl === "undergraduate" || dl === "ug") {
        return qual.includes("undergraduate") || qual.includes("ug") || course.includes("b.tech") || course.includes("b.sc") || course.includes("b.a") || course.includes("b.com") || course.includes("mbbs");
      }
      if (dl === "postgraduate" || dl === "pg") {
        return qual.includes("postgraduate") || qual.includes("pg") || course.includes("m.tech") || course.includes("m.sc") || course.includes("m.a") || course.includes("mba");
      }
      if (dl === "diploma") {
        return qual.includes("diploma") || course.includes("diploma") || course.includes("polytechnic");
      }
      return qual.includes(dl) || course.includes(dl);
    });

    if (!passed) {
      reasons.push(`Degree level restricted to [${criteria.allowedDegrees.join(", ")}] (your profile: ${student.qualification || student.currentCourse || "Unspecified"}).`);
      criteriaBreakdown.push({ label: "Degree Level", status: "failed", detail: `Requires ${criteria.allowedDegrees.join(", ")}` });
    } else {
      passedChecks++;
      criteriaBreakdown.push({ label: "Degree Level", status: "passed", detail: `Matched: ${student.qualification || student.currentCourse}` });
    }
  }

  // 10. Disability Status (PwD)
  if (criteria.disabilityRequired) {
    totalChecks++;
    const isPwD = (student.isDisability || "").toLowerCase() === "yes";
    if (!isPwD) {
      reasons.push("Requires verified Person with Disability (PwD) status.");
      criteriaBreakdown.push({ label: "PwD Status", status: "failed", detail: "Requires Disability (PwD) profile status" });
    } else {
      passedChecks++;
      criteriaBreakdown.push({ label: "PwD Status", status: "passed", detail: "PwD status verified" });
    }
  }

  // Calculate explicit eligibility and match percentage (0% to 100%)
  const isPendingDetails = profileStrength < 20 && missingFields.length > 0;
  const isEligible = reasons.length === 0 && missingFields.length === 0;

  // Numeric percentage calculation:
  // If totalChecks is 0, scheme is universal/open to all -> 100%
  // Otherwise, exact ratio of passed checks vs total applicable criteria checks
  let eligibilityPercent = 100;
  if (totalChecks > 0) {
    if (isEligible) {
      eligibilityPercent = 100;
    } else {
      eligibilityPercent = Math.max(0, Math.round((passedChecks / totalChecks) * 100));
    }
  }

  const matchScore = eligibilityPercent;

  return {
    isEligible,
    isPendingDetails,
    missingFields,
    matchScore,
    eligibilityPercent,
    reasons,
    criteriaBreakdown,
    passedChecks,
    totalChecks,
  };
}

/**
 * Evaluates all scholarships in the database with the student's profile.
 */
export function evaluateAllScholarships(profile = null) {
  const student = profile || getStoredStudentProfile();
  return SCHOLARSHIPS_DATABASE.map((scholarship) => {
    const evalResult = evaluateEligibility(scholarship, student);
    return {
      ...scholarship,
      ...evalResult,
    };
  });
}
