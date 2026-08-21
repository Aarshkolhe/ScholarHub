/**
 * ScholarHub Smart Eligibility Evaluation Engine
 * Evaluates student profile details against scholarship requirements.
 * Operates purely on self-reported profile data with zero file upload overhead.
 */

import { SCHOLARSHIPS_DATABASE } from "./scholarshipData";

/**
 * Retrieve the current merged student profile from localStorage.
 */
export function getStoredStudentProfile() {
  const userStr = localStorage.getItem("scholarhub_user");
  const educationStr = localStorage.getItem("scholarhub_profile_education");
  const financialStr = localStorage.getItem("scholarhub_profile_financial");
  const eligibilityStr = localStorage.getItem("scholarhub_profile_eligibility");
  const personalStr = localStorage.getItem("scholarhub_profile_personal");
  const savedName = localStorage.getItem("scholarhub_saved_landing_name");

  const user = userStr ? JSON.parse(userStr) : {};
  const education = educationStr ? JSON.parse(educationStr) : {
    currentCourse: "B.Tech",
    qualification: "Undergraduate",
    collegeName: "National Institute of Technology",
    yearSemester: "1st Year",
    marksPercentage: "78%",
    passingYear: "2026",
    streamBranch: "Computer Science & Engineering",
  };
  const financial = financialStr ? JSON.parse(financialStr) : {
    annualIncome: "200000",
    guardianOccupation: "Government Service",
    incomeCertNo: "INC/2026/88921",
    incomeIssuingAuth: "Tehsildar / District Revenue Office",
  };
  const eligibility = eligibilityStr ? JSON.parse(eligibilityStr) : {
    category: "OBC",
    isMinority: "No",
    isDisability: "No",
    domicileState: "Maharashtra",
    specialCriteria: "First-Generation Learner",
  };
  const personal = personalStr ? JSON.parse(personalStr) : {
    gender: "Male",
    dob: "2004-05-15",
    age: "21",
    phone: "9876543210",
  };

  return {
    name: user.fullName || user.name || savedName || "Student",
    email: user.email || "student@scholarhub.edu",
    ...personal,
    ...education,
    ...financial,
    ...eligibility,
  };
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

  // 1. Social Category Check
  if (criteria.allowedCategories && !criteria.allowedCategories.includes("All")) {
    totalChecks++;
    const studentCat = (student.category || "General").trim();
    const passed = criteria.allowedCategories.some(
      (c) => c.toLowerCase() === studentCat.toLowerCase()
    );
    if (!passed) {
      reasons.push(
        `Reserved for ${criteria.allowedCategories.join(", ")} category (your profile: ${studentCat || "Unspecified"}).`
      );
      criteriaBreakdown.push({ label: "Category Requirement", status: "failed", detail: `Requires ${criteria.allowedCategories.join(", ")}` });
    } else {
      passedChecks++;
      criteriaBreakdown.push({ label: "Category Requirement", status: "passed", detail: `Matched: ${studentCat}` });
    }
  }

  // 2. Annual Family Income Check
  if (criteria.maxIncome) {
    totalChecks++;
    const incomeNum =
      parseFloat(String(student.annualIncome || "").replace(/[^0-9.]/g, "")) || 0;
    const maxFormatted = `₹${criteria.maxIncome.toLocaleString("en-IN")}`;
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

  // 3. Minimum Percentage / CGPA Check
  if (criteria.minPercentage) {
    totalChecks++;
    let scoreNum =
      parseFloat(String(student.marksPercentage || "").replace(/[^0-9.]/g, "")) || 0;
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

  // 4. Domicile / State Check
  if (
    criteria.allowedStates &&
    !criteria.allowedStates.includes("All India") &&
    !criteria.allowedStates.includes("All")
  ) {
    totalChecks++;
    const studentState = (student.domicileState || "").trim().toLowerCase();
    const passed = criteria.allowedStates.some((s) => s.toLowerCase() === studentState);

    if (!passed) {
      reasons.push(
        `Restricted to students domiciled in ${criteria.allowedStates.join(", ")} (your state: ${student.domicileState || "Unspecified"}).`
      );
      criteriaBreakdown.push({ label: "Domicile State", status: "failed", detail: `Requires ${criteria.allowedStates.join(", ")}` });
    } else {
      passedChecks++;
      criteriaBreakdown.push({ label: "Domicile State", status: "passed", detail: `Matched state: ${student.domicileState}` });
    }
  }

  // 5. Gender Check
  if (criteria.gender && criteria.gender !== "All") {
    totalChecks++;
    const studentGender = (student.gender || "").trim().toLowerCase();
    const targetGender = criteria.gender.toLowerCase();

    if (studentGender && studentGender !== targetGender) {
      reasons.push(`Exclusively open for ${criteria.gender} candidates.`);
      criteriaBreakdown.push({ label: "Gender Requirement", status: "failed", detail: `Requires ${criteria.gender}` });
    } else if (!studentGender) {
      reasons.push(`Requires ${criteria.gender} gender in profile.`);
      criteriaBreakdown.push({ label: "Gender Requirement", status: "failed", detail: `Requires ${criteria.gender}` });
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
    const passed = criteria.allowedStreams.some((s) => {
      const sl = s.toLowerCase();
      return (
        stream.includes(sl) ||
        course.includes(sl) ||
        sl.includes(course) ||
        sl.includes(stream)
      );
    });

    if (!passed && (stream || course)) {
      reasons.push(
        `Course/Stream must relate to [${criteria.allowedStreams.slice(0, 4).join(", ")}] (your current: ${student.currentCourse || student.streamBranch || "Other"}).`
      );
      criteriaBreakdown.push({ label: "Degree & Stream", status: "failed", detail: `Requires ${criteria.allowedStreams.slice(0, 3).join(", ")}` });
    } else {
      passedChecks++;
      criteriaBreakdown.push({ label: "Degree & Stream", status: "passed", detail: `Matched: ${student.currentCourse} - ${student.streamBranch}` });
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

  const isEligible = reasons.length === 0;

  // Calculate dynamic match percentage: 88-99% if eligible, 35-70% if ineligible
  let matchScore = 75;
  if (isEligible) {
    matchScore = 90 + Math.min(Math.round((passedChecks / Math.max(totalChecks, 1)) * 9), 9);
  } else {
    const fraction = totalChecks > 0 ? passedChecks / totalChecks : 0;
    matchScore = Math.max(35, Math.round(fraction * 70));
  }

  return {
    isEligible,
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
