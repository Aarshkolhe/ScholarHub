/**
 * ScholarHub Smart Eligibility Evaluation Engine
 * Evaluates student profile details against scholarship requirements.
 * Operates purely on self-reported profile data with zero file upload overhead.
 */

import { SCHOLARSHIPS_DATABASE } from "./scholarshipData.js";

export const SIMULATION_DEMO_PROFILE = {
  user: {
    id: "usr_sim_demo",
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
  savedIds: ["mahadbt-10th-1", "mahadbt-1", "mahadbt-2"],
  appliedIds: ["mahadbt-10th-1"],
};

/**
 * Load complete demo dataset into localStorage for Simulation Mode.
 */
export function loadSimulationProfile() {
  const uid = "_usr_sim_demo";

  // Global keys
  localStorage.setItem("scholarhub_user", JSON.stringify(SIMULATION_DEMO_PROFILE.user));
  localStorage.setItem("scholarhub_profile_personal", JSON.stringify(SIMULATION_DEMO_PROFILE.personal));
  localStorage.setItem("scholarhub_profile_current_education", JSON.stringify(SIMULATION_DEMO_PROFILE.currentEducation));
  localStorage.setItem("scholarhub_profile_past_education", JSON.stringify(SIMULATION_DEMO_PROFILE.pastEducation));
  localStorage.setItem("scholarhub_profile_living_status", JSON.stringify(SIMULATION_DEMO_PROFILE.livingStatus));
  localStorage.setItem("scholarhub_profile_financial", JSON.stringify(SIMULATION_DEMO_PROFILE.financial));
  localStorage.setItem("scholarhub_profile_eligibility", JSON.stringify(SIMULATION_DEMO_PROFILE.eligibility));
  localStorage.setItem("scholarhub_profile_education", JSON.stringify({
    ...SIMULATION_DEMO_PROFILE.currentEducation,
    ...SIMULATION_DEMO_PROFILE.pastEducation,
  }));
  localStorage.setItem("scholarhub_saved_landing_name", SIMULATION_DEMO_PROFILE.personal.fullName);
  localStorage.setItem("scholarhub_saved_ids", JSON.stringify(SIMULATION_DEMO_PROFILE.savedIds));
  localStorage.setItem("scholarhub_applied_ids", JSON.stringify(SIMULATION_DEMO_PROFILE.appliedIds));

  // Scoped keys
  localStorage.setItem(`scholarhub_profile_personal${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.personal));
  localStorage.setItem(`scholarhub_profile_current_education${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.currentEducation));
  localStorage.setItem(`scholarhub_profile_past_education${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.pastEducation));
  localStorage.setItem(`scholarhub_profile_living_status${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.livingStatus));
  localStorage.setItem(`scholarhub_profile_financial${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.financial));
  localStorage.setItem(`scholarhub_profile_eligibility${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.eligibility));
  localStorage.setItem(`scholarhub_profile_education${uid}`, JSON.stringify({
    ...SIMULATION_DEMO_PROFILE.currentEducation,
    ...SIMULATION_DEMO_PROFILE.pastEducation,
  }));
  localStorage.setItem(`scholarhub_saved_landing_name${uid}`, SIMULATION_DEMO_PROFILE.personal.fullName);
  localStorage.setItem(`scholarhub_saved_ids${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.savedIds));
  localStorage.setItem(`scholarhub_applied_ids${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.appliedIds));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }

  return SIMULATION_DEMO_PROFILE;
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
  if (p.tenthPercentage && String(p.tenthPercentage).trim()) score += 8;
  if (p.twelfthPercentage && String(p.twelfthPercentage).trim()) score += 7;

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

    if (!stream && !course) {
      missingFields.push("Course / Stream");
      reasons.push(`Course/Stream must relate to [${criteria.allowedStreams.slice(0, 3).join(", ")}] (not specified in profile).`);
      criteriaBreakdown.push({ label: "Degree & Stream", status: "failed", detail: `Requires ${criteria.allowedStreams.slice(0, 3).join(", ")}` });
    } else {
      const passed = criteria.allowedStreams.some((s) => {
        const sl = s.toLowerCase();
        return (
          stream.includes(sl) ||
          course.includes(sl) ||
          sl.includes(course) ||
          sl.includes(stream)
        );
      });

      if (!passed) {
        reasons.push(`Requires stream related to [${criteria.allowedStreams.slice(0, 3).join(", ")}] (your current: ${student.currentCourse || student.streamBranch || "Other"}).`);
        criteriaBreakdown.push({ label: "Degree & Stream", status: "failed", detail: `Requires ${criteria.allowedStreams.slice(0, 3).join(", ")}` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Degree & Stream", status: "passed", detail: `Matched: ${student.currentCourse || student.streamBranch}` });
      }
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
