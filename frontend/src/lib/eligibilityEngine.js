/**
 * ScholarHub Smart Eligibility Evaluation Engine
 * Evaluates student profile details against scholarship requirements.
 * Operates purely on self-reported profile data with zero file upload overhead.
 */

import { SCHOLARSHIPS_DATABASE } from "./scholarshipData";

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
  education: {
    currentCourse: "B.Tech Computer Science",
    qualification: "Undergraduate (UG)",
    collegeName: "National Institute of Technology",
    yearSemester: "3rd Year (Sem 6)",
    marksPercentage: "78%",
    passingYear: "2027",
    streamBranch: "Engineering & Technology",
    tenthPercentage: "88.4%",
    twelfthPercentage: "85.2%",
    degreeLevel: "Undergraduate",
    currentStream: "Engineering",
  },
  financial: {
    annualIncome: "200000",
    guardianOccupation: "Agriculture / Farming",
    incomeCertNo: "MH-INC-2026-88492",
    incomeIssuingAuth: "Tahsildar Revenue Office",
  },
  eligibility: {
    category: "OBC",
    isMinority: "No",
    isDisability: "No",
    domicileState: "Maharashtra",
    specialCriteria: "First-Generation Learner",
  },
  savedIds: ["mahadbt-10th-1", "mahadbt-1"],
  appliedIds: ["mahadbt-10th-1"],
};

/**
 * Load complete demo dataset into localStorage for Simulation Mode.
 */
export function loadSimulationProfile() {
  const uid = "_usr_sim_demo";
  localStorage.setItem("scholarhub_user", JSON.stringify(SIMULATION_DEMO_PROFILE.user));
  localStorage.setItem("scholarhub_profile_personal", JSON.stringify(SIMULATION_DEMO_PROFILE.personal));
  localStorage.setItem("scholarhub_profile_education", JSON.stringify(SIMULATION_DEMO_PROFILE.education));
  localStorage.setItem("scholarhub_profile_financial", JSON.stringify(SIMULATION_DEMO_PROFILE.financial));
  localStorage.setItem("scholarhub_profile_eligibility", JSON.stringify(SIMULATION_DEMO_PROFILE.eligibility));
  localStorage.setItem("scholarhub_saved_landing_name", SIMULATION_DEMO_PROFILE.personal.fullName);
  localStorage.setItem("scholarhub_saved_ids", JSON.stringify(SIMULATION_DEMO_PROFILE.savedIds));
  localStorage.setItem("scholarhub_applied_ids", JSON.stringify(SIMULATION_DEMO_PROFILE.appliedIds));

  localStorage.setItem(`scholarhub_profile_personal${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.personal));
  localStorage.setItem(`scholarhub_profile_education${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.education));
  localStorage.setItem(`scholarhub_profile_financial${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.financial));
  localStorage.setItem(`scholarhub_profile_eligibility${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.eligibility));
  localStorage.setItem(`scholarhub_saved_landing_name${uid}`, SIMULATION_DEMO_PROFILE.personal.fullName);
  localStorage.setItem(`scholarhub_saved_ids${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.savedIds));
  localStorage.setItem(`scholarhub_applied_ids${uid}`, JSON.stringify(SIMULATION_DEMO_PROFILE.appliedIds));
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
  localStorage.removeItem("scholarhub_profile_education");
  localStorage.removeItem("scholarhub_profile_financial");
  localStorage.removeItem("scholarhub_profile_eligibility");
  localStorage.removeItem("scholarhub_saved_landing_name");
  localStorage.removeItem("scholarhub_saved_ids");
  localStorage.removeItem("scholarhub_applied_ids");
  localStorage.removeItem("scholarhub_avatar");

  if (uid) {
    localStorage.removeItem(`scholarhub_profile_personal${uid}`);
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
 * In standard mode, defaults are completely clean/empty until entered by user or loaded in simulation.
 */
export function getStoredStudentProfile() {
  let user = {};
  try {
    const userStr = localStorage.getItem("scholarhub_user");
    user = userStr ? JSON.parse(userStr) : {};
  } catch {}

  const uid = user.id ? `_${user.id}` : "";

  // If user is authenticated, read ONLY their scoped storage. Never leak global/unscoped storage.
  const educationStr = uid
    ? localStorage.getItem(`scholarhub_profile_education${uid}`)
    : localStorage.getItem("scholarhub_profile_education");
  const financialStr = uid
    ? localStorage.getItem(`scholarhub_profile_financial${uid}`)
    : localStorage.getItem("scholarhub_profile_financial");
  const eligibilityStr = uid
    ? localStorage.getItem(`scholarhub_profile_eligibility${uid}`)
    : localStorage.getItem("scholarhub_profile_eligibility");
  const personalStr = uid
    ? localStorage.getItem(`scholarhub_profile_personal${uid}`)
    : localStorage.getItem("scholarhub_profile_personal");

  const education = educationStr ? JSON.parse(educationStr) : {
    currentCourse: "",
    qualification: "",
    collegeName: "",
    yearSemester: "",
    marksPercentage: "",
    passingYear: "",
    streamBranch: "",
    tenthPercentage: "",
    twelfthPercentage: "",
    degreeLevel: "",
    currentStream: "",
  };
  const financial = financialStr ? JSON.parse(financialStr) : {
    annualIncome: "",
    guardianOccupation: "",
    incomeCertNo: "",
    incomeIssuingAuth: "",
  };
  const eligibility = eligibilityStr ? JSON.parse(eligibilityStr) : {
    category: "",
    isMinority: "No",
    isDisability: "No",
    domicileState: "",
    specialCriteria: "",
  };
  const personal = personalStr ? JSON.parse(personalStr) : {
    gender: "",
    dob: "",
    age: "",
    phone: "",
  };

  return {
    ...personal,
    ...education,
    ...financial,
    ...eligibility,
    // Authentic user auth identity is definitive
    name: user.fullName || user.name || personal.fullName || "",
    email: user.email || personal.email || "",
  };
}

/**
 * Calculate the exact functional strength / completion percentage (0 - 100%)
 * based on weighted scholarship-matching eligibility domains.
 *
 * Domain Breakdown (Total 100%):
 * 1. Personal Verification (10%): Phone, Gender, Date of Birth
 * 2. Academic Performance & Institution (35%): Course, Qualification, College, Year/Sem, Marks % / CGPA
 * 3. Family Financial & Income (25%): Annual Family Income, Occupation, Certificate No / Authority
 * 4. Reservation, Domicile & Quotas (30%): Social Category, Domicile State, Quota / Disability status
 *
 * Base Account metadata (Name/Email) is basic identity and does not falsely inflate eligibility strength.
 */
export function calculateProfileStrength(profile = null) {
  const p = profile || getStoredStudentProfile();
  let score = 0;

  // 1. Personal Verification (10 pts total)
  if (p.phone && String(p.phone).trim().length >= 8) score += 3.5;
  if (p.gender && String(p.gender).trim()) score += 3.5;
  if (p.dob && String(p.dob).trim()) score += 3;

  // 2. Academic Performance & Institution (35 pts total)
  if (p.currentCourse && String(p.currentCourse).trim()) score += 7;
  if (p.qualification && String(p.qualification).trim()) score += 6;
  if (p.collegeName && String(p.collegeName).trim()) score += 7;
  if (p.yearSemester && String(p.yearSemester).trim()) score += 5;
  if (p.marksPercentage && String(p.marksPercentage).trim()) score += 10;

  // 3. Family Financial & Income (25 pts total)
  if (p.annualIncome && String(p.annualIncome).trim().length > 0) score += 15;
  if (p.guardianOccupation && String(p.guardianOccupation).trim()) score += 5;
  if (
    (p.incomeCertNo && String(p.incomeCertNo).trim()) ||
    (p.incomeIssuingAuth && String(p.incomeIssuingAuth).trim())
  ) {
    score += 5;
  }

  // 4. Reservation, Domicile & Quotas (30 pts total)
  if (p.category && String(p.category).trim()) score += 12;
  if (p.domicileState && String(p.domicileState).trim()) score += 12;
  if (
    (p.isDisability && String(p.isDisability).trim() && String(p.isDisability) !== "No") ||
    (p.specialCriteria && String(p.specialCriteria).trim() && String(p.specialCriteria) !== "None")
  ) {
    score += 6;
  } else if (p.isDisability || p.specialCriteria) {
    score += 6;
  }

  return Math.min(100, Math.round(score));
}

/**
 * Compare a scholarship against a student's profile attributes.
 * Returns { isEligible, matchScore, reasons, criteriaBreakdown }
 */
export function evaluateEligibility(scholarship, profile = null) {
  const student = profile || getStoredStudentProfile();
  const criteria = scholarship.criteria || {};

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
      reasons.push(
        `Reserved for ${criteria.allowedCategories.join(", ")} category (not specified in your profile yet).`
      );
      criteriaBreakdown.push({ label: "Category Requirement", status: "failed", detail: `Requires ${criteria.allowedCategories.join(", ")} (Profile: Not specified)` });
    } else {
      const passed = criteria.allowedCategories.some(
        (c) => c.toLowerCase() === studentCat.toLowerCase()
      );
      if (!passed) {
        reasons.push(
          `Reserved for ${criteria.allowedCategories.join(", ")} category (your profile: ${studentCat}).`
        );
        criteriaBreakdown.push({ label: "Category Requirement", status: "failed", detail: `Requires ${criteria.allowedCategories.join(", ")} (Yours: ${studentCat})` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Category Requirement", status: "passed", detail: `Matched: ${studentCat}` });
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
      reasons.push(
        `Requires annual family income verification <= ${maxFormatted} (not specified in your profile yet).`
      );
      criteriaBreakdown.push({ label: "Income Limit", status: "failed", detail: `Max ${maxFormatted} (Profile: Not specified)` });
    } else {
      const incomeNum = parseFloat(rawIncome.replace(/[^0-9.]/g, "")) || 0;
      const userFormatted = `₹${incomeNum.toLocaleString("en-IN")}`;

      if (incomeNum > criteria.maxIncome) {
        reasons.push(
          `Family income exceeds ${maxFormatted} limit (your reported income: ${userFormatted}).`
        );
        criteriaBreakdown.push({ label: "Income Limit", status: "failed", detail: `Max ${maxFormatted} (Yours: ${userFormatted})` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Income Limit", status: "passed", detail: `Within limit: ${userFormatted} <= ${maxFormatted}` });
      }
    }
  }

  // 3. Minimum Percentage / CGPA Check
  if (criteria.minPercentage) {
    totalChecks++;
    const rawMarks = student.marksPercentage !== undefined && student.marksPercentage !== null ? String(student.marksPercentage).trim() : "";

    if (!rawMarks) {
      missingFields.push("Academic Marks");
      reasons.push(
        `Requires minimum ${criteria.minPercentage}% marks (not specified in your profile yet).`
      );
      criteriaBreakdown.push({ label: "Academic Cutoff", status: "failed", detail: `Requires >= ${criteria.minPercentage}% (Profile: Not specified)` });
    } else {
      let scoreNum = parseFloat(rawMarks.replace(/[^0-9.]/g, "")) || 0;
      if (scoreNum > 0 && scoreNum <= 10) {
        scoreNum = scoreNum * 9.5; // CGPA to %
      }

      if (scoreNum < criteria.minPercentage) {
        reasons.push(
          `Requires minimum ${criteria.minPercentage}% marks (your reported score: ${Math.round(scoreNum)}%).`
        );
        criteriaBreakdown.push({ label: "Academic Cutoff", status: "failed", detail: `Requires >= ${criteria.minPercentage}% (Yours: ${Math.round(scoreNum)}%)` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Academic Cutoff", status: "passed", detail: `Passed: ${Math.round(scoreNum)}% >= ${criteria.minPercentage}%` });
      }
    }
  }

  // 4. Domicile / State Check
  if (
    criteria.allowedStates &&
    !criteria.allowedStates.includes("All India") &&
    !criteria.allowedStates.includes("All")
  ) {
    totalChecks++;
    const studentState = (student.domicileState || "").trim();

    if (!studentState) {
      missingFields.push("Domicile State");
      reasons.push(
        `Restricted to students domiciled in ${criteria.allowedStates.join(", ")} (not specified in your profile yet).`
      );
      criteriaBreakdown.push({ label: "Domicile State", status: "failed", detail: `Requires ${criteria.allowedStates.join(", ")} (Profile: Not specified)` });
    } else {
      const passed = criteria.allowedStates.some((s) => s.toLowerCase() === studentState.toLowerCase());
      if (!passed) {
        reasons.push(
          `Restricted to students domiciled in ${criteria.allowedStates.join(", ")} (your state: ${studentState}).`
        );
        criteriaBreakdown.push({ label: "Domicile State", status: "failed", detail: `Requires ${criteria.allowedStates.join(", ")} (Yours: ${studentState})` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Domicile State", status: "passed", detail: `Matched state: ${studentState}` });
      }
    }
  }

  // 5. Gender Check
  if (criteria.gender && criteria.gender !== "All") {
    totalChecks++;
    const studentGender = (student.gender || "").trim().toLowerCase();
    const targetGender = criteria.gender.toLowerCase();

    if (!studentGender) {
      missingFields.push("Gender");
      reasons.push(`Requires ${criteria.gender} gender (not specified in your profile yet).`);
      criteriaBreakdown.push({ label: "Gender Requirement", status: "failed", detail: `Requires ${criteria.gender} (Profile: Not specified)` });
    } else if (studentGender !== targetGender) {
      reasons.push(`Exclusively open for ${criteria.gender} candidates (your profile: ${student.gender}).`);
      criteriaBreakdown.push({ label: "Gender Requirement", status: "failed", detail: `Requires ${criteria.gender} (Yours: ${student.gender})` });
    } else {
      passedChecks++;
      criteriaBreakdown.push({ label: "Gender Requirement", status: "passed", detail: `Matched: ${student.gender}` });
    }
  }

  // 6. Course / Stream Alignment Check
  if (criteria.allowedStreams && !criteria.allowedStreams.includes("All")) {
    totalChecks++;
    const stream = (student.streamBranch || "").toLowerCase();
    const course = (student.currentCourse || "").toLowerCase();

    if (!stream && !course) {
      missingFields.push("Course / Stream");
      reasons.push(
        `Course/Stream must relate to [${criteria.allowedStreams.slice(0, 4).join(", ")}] (not specified in your profile yet).`
      );
      criteriaBreakdown.push({ label: "Degree & Stream", status: "failed", detail: `Requires ${criteria.allowedStreams.slice(0, 3).join(", ")} (Profile: Not specified)` });
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
        reasons.push(
          `Course/Stream must relate to [${criteria.allowedStreams.slice(0, 4).join(", ")}] (your current: ${student.currentCourse || student.streamBranch || "Other"}).`
        );
        criteriaBreakdown.push({ label: "Degree & Stream", status: "failed", detail: `Requires ${criteria.allowedStreams.slice(0, 3).join(", ")}` });
      } else {
        passedChecks++;
        criteriaBreakdown.push({ label: "Degree & Stream", status: "passed", detail: `Matched: ${student.currentCourse || student.streamBranch}` });
      }
    }
  }

  // 7. Disability (PwD) Criteria
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

  // 8. Special Criteria (e.g. First-Gen)
  if (criteria.specialCriteriaRequired) {
    totalChecks++;
    const special = (student.specialCriteria || "").toLowerCase();
    const required = criteria.specialCriteriaRequired.toLowerCase();
    if (!special.includes(required)) {
      reasons.push(
        `Requires special qualification: "${criteria.specialCriteriaRequired}".`
      );
      criteriaBreakdown.push({ label: "Special Criteria", status: "failed", detail: `Requires ${criteria.specialCriteriaRequired}` });
    } else {
      passedChecks++;
      criteriaBreakdown.push({ label: "Special Criteria", status: "passed", detail: `Matched: ${criteria.specialCriteriaRequired}` });
    }
  }

  const isPendingDetails = missingFields.length > 0;
  const isEligible = !isPendingDetails && reasons.length === 0;

  // Calculate dynamic match percentage:
  // If required details are missing -> null (Details Pending, no arbitrary 35%!)
  // If eligible -> 90-99%
  // If evaluated with details provided and ineligible -> 30-65%
  let matchScore = null;
  if (!isPendingDetails) {
    if (isEligible) {
      matchScore = 90 + Math.min(Math.round((passedChecks / Math.max(totalChecks, 1)) * 9), 9);
    } else {
      const fraction = totalChecks > 0 ? passedChecks / totalChecks : 0;
      matchScore = Math.max(30, Math.round(fraction * 70));
    }
  }

  return {
    isEligible,
    isPendingDetails,
    missingFields,
    matchScore,
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
