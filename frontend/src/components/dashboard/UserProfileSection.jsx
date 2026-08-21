import { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  IndianRupee,
  ShieldCheck,
  Save,
  CheckCircle2,
  Database,
  Info,
  RotateCcw,
  Trash2,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { calculateProfileStrength } from "../../lib/eligibilityEngine";

const BACKEND_URL = "http://localhost:5000";

export function UserProfileSection() {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("personal"); // personal, education, financial, eligibility
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [isSavingDb, setIsSavingDb] = useState(false);

  // 1. Personal Identity State
  const [personal, setPersonal] = useState(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const stored = uid
      ? localStorage.getItem(`scholarhub_profile_personal${uid}`)
      : localStorage.getItem("scholarhub_profile_personal");
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      fullName: user?.fullName || user?.name || parsed.fullName || "",
      email: user?.email || parsed.email || "",
      phone: parsed.phone || "",
      gender: parsed.gender || "",
      dob: parsed.dob || "",
      age: parsed.age || "",
    };
  });

  // 2. Education Details State
  const [education, setEducation] = useState(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const stored = uid
      ? localStorage.getItem(`scholarhub_profile_education${uid}`)
      : localStorage.getItem("scholarhub_profile_education");
    return stored
      ? JSON.parse(stored)
      : {
          currentCourse: "",
          qualification: "",
          collegeName: "",
          yearSemester: "",
          marksPercentage: "",
          passingYear: "",
          streamBranch: "",
        };
  });

  // 3. Family & Financial State
  const [financial, setFinancial] = useState(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const stored = uid
      ? localStorage.getItem(`scholarhub_profile_financial${uid}`)
      : localStorage.getItem("scholarhub_profile_financial");
    return stored
      ? JSON.parse(stored)
      : {
          annualIncome: "",
          guardianOccupation: "",
          incomeCertNo: "",
          incomeIssuingAuth: "",
        };
  });

  // 4. Category & Quota Eligibility State
  const [eligibility, setEligibility] = useState(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const stored = uid
      ? localStorage.getItem(`scholarhub_profile_eligibility${uid}`)
      : localStorage.getItem("scholarhub_profile_eligibility");
    return stored
      ? JSON.parse(stored)
      : {
          category: "",
          isMinority: "No",
          isDisability: "No",
          domicileState: "",
          specialCriteria: "",
        };
  });

  // Sync state when user changes
  useEffect(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const p = uid
      ? localStorage.getItem(`scholarhub_profile_personal${uid}`)
      : localStorage.getItem("scholarhub_profile_personal");
    if (p) {
      const parsed = JSON.parse(p);
      setPersonal({
        ...parsed,
        fullName: user?.fullName || user?.name || parsed.fullName || "",
        email: user?.email || parsed.email || "",
      });
    } else {
      setPersonal({
        fullName: user?.fullName || user?.name || "",
        email: user?.email || "",
        phone: "",
        gender: "",
        dob: "",
        age: "",
      });
    }

    const ed = uid
      ? localStorage.getItem(`scholarhub_profile_education${uid}`)
      : localStorage.getItem("scholarhub_profile_education");
    if (ed) {
      setEducation(JSON.parse(ed));
    } else {
      setEducation({
        currentCourse: "",
        qualification: "",
        collegeName: "",
        yearSemester: "",
        marksPercentage: "",
        passingYear: "",
        streamBranch: "",
      });
    }

    const fin = uid
      ? localStorage.getItem(`scholarhub_profile_financial${uid}`)
      : localStorage.getItem("scholarhub_profile_financial");
    if (fin) {
      setFinancial(JSON.parse(fin));
    } else {
      setFinancial({
        annualIncome: "",
        guardianOccupation: "",
        incomeCertNo: "",
        incomeIssuingAuth: "",
      });
    }

    const el = uid
      ? localStorage.getItem(`scholarhub_profile_eligibility${uid}`)
      : localStorage.getItem("scholarhub_profile_eligibility");
    if (el) {
      setEligibility(JSON.parse(el));
    } else {
      setEligibility({
        category: "",
        isMinority: "No",
        isDisability: "No",
        domicileState: "",
        specialCriteria: "",
      });
    }
  }, [user]);

  useEffect(() => {
    const uid = user?.id ? `_${user.id}` : "";
    if (uid) {
      localStorage.setItem(`scholarhub_profile_personal${uid}`, JSON.stringify(personal));
    } else {
      localStorage.setItem("scholarhub_profile_personal", JSON.stringify(personal));
    }
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }, [personal, user]);

  useEffect(() => {
    const uid = user?.id ? `_${user.id}` : "";
    if (uid) {
      localStorage.setItem(`scholarhub_profile_education${uid}`, JSON.stringify(education));
    } else {
      localStorage.setItem("scholarhub_profile_education", JSON.stringify(education));
    }
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }, [education, user]);

  useEffect(() => {
    const uid = user?.id ? `_${user.id}` : "";
    if (uid) {
      localStorage.setItem(`scholarhub_profile_financial${uid}`, JSON.stringify(financial));
    } else {
      localStorage.setItem("scholarhub_profile_financial", JSON.stringify(financial));
    }
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }, [financial, user]);

  useEffect(() => {
    const uid = user?.id ? `_${user.id}` : "";
    if (uid) {
      localStorage.setItem(`scholarhub_profile_eligibility${uid}`, JSON.stringify(eligibility));
    } else {
      localStorage.setItem("scholarhub_profile_eligibility", JSON.stringify(eligibility));
    }
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }, [eligibility, user]);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonal((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdChange = (e) => {
    const { name, value } = e.target;
    setEducation((prev) => ({ ...prev, [name]: value }));
  };

  const handleFinChange = (e) => {
    const { name, value } = e.target;
    setFinancial((prev) => ({ ...prev, [name]: value }));
  };

  const handleEligibilityChange = (e) => {
    const { name, value } = e.target;
    setEligibility((prev) => ({ ...prev, [name]: value }));
  };

  const triggerSaveFeedback = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setIsSavingDb(true);

    updateUser({
      name: personal.fullName,
      fullName: personal.fullName,
      email: personal.email,
    });

    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "demo-user-id",
          personal,
          education,
          financial,
          eligibility,
        }),
      });

      const data = await response.json();
      if (data.success) {
        triggerSaveFeedback("All details saved to PostgreSQL Database & local session!");
      } else {
        throw new Error(data.message || "Save error");
      }
    } catch {
      triggerSaveFeedback("All profile details saved to local session successfully!");
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleResetProfile = () => {
    const uid = user?.id ? `_${user.id}` : "";
    if (uid) {
      localStorage.removeItem(`scholarhub_profile_personal${uid}`);
      localStorage.removeItem(`scholarhub_profile_education${uid}`);
      localStorage.removeItem(`scholarhub_profile_financial${uid}`);
      localStorage.removeItem(`scholarhub_profile_eligibility${uid}`);
    }
    localStorage.removeItem("scholarhub_profile_personal");
    localStorage.removeItem("scholarhub_profile_education");
    localStorage.removeItem("scholarhub_profile_financial");
    localStorage.removeItem("scholarhub_profile_eligibility");

    setPersonal({
      fullName: user?.fullName || user?.name || "",
      email: user?.email || "",
      phone: "",
      gender: "",
      dob: "",
      age: "",
    });
    setEducation({
      currentCourse: "",
      qualification: "",
      collegeName: "",
      yearSemester: "",
      marksPercentage: "",
      passingYear: "",
      streamBranch: "",
    });
    setFinancial({
      annualIncome: "",
      guardianOccupation: "",
      incomeCertNo: "",
      incomeIssuingAuth: "",
    });
    setEligibility({
      category: "",
      isMinority: "No",
      isDisability: "No",
      domicileState: "",
      specialCriteria: "",
    });
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
    triggerSaveFeedback("Profile reset to clean state (0% strength).");
  };

  // Calculate details completion percentage using unified weighted domain calculator
  const completionPercent = calculateProfileStrength({
    ...personal,
    ...education,
    ...financial,
    ...eligibility,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="size-6 text-blue-600 dark:text-blue-400" />
            Student Details & Eligibility Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill your academic, financial, category, and domicile details once. ScholarHub matches you with eligible grants automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Clear / Reset Profile Button */}
          <button
            type="button"
            onClick={handleResetProfile}
            title="Reset profile fields to clean state"
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset to 0%</span>
          </button>

          {/* Details Completion Badge */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Details Completion</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{completionPercent}% Complete</p>
            </div>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                style={{ width: `${completionPercent}%` }}
                className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* No Document Upload Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 p-4 text-xs text-blue-900 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900/60 shadow-sm">
        <ShieldCheck className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-blue-950 dark:text-blue-100 flex items-center gap-1.5">
            Zero Document Upload Requirement
            <span className="rounded-full bg-blue-200 dark:bg-blue-900 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-200">
              Simplified Flow
            </span>
          </p>
          <p className="mt-1 text-blue-800 dark:text-blue-300">
            Eligibility is evaluated purely on self-reported profile data. Official physical or scanned documents (e.g. income certificates, caste certificates, semester marksheets) will only be requested directly by scholarship providers during the external grant verification and disbursement process.
          </p>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-rise-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Sub-Section Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection("personal")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeSection === "personal"
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <User className="size-3.5" /> Personal Identity
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("education")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeSection === "education"
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <GraduationCap className="size-3.5" /> Academic Details
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("financial")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeSection === "financial"
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <IndianRupee className="size-3.5" /> Financial & Income
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("eligibility")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeSection === "eligibility"
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <ShieldCheck className="size-3.5" /> Category & Quotas
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* SECTION 1: PERSONAL IDENTITY */}
        {activeSection === "personal" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="size-5 text-blue-600 dark:text-blue-400" />
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={personal.fullName}
                  onChange={handlePersonalChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={personal.email}
                  onChange={handlePersonalChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Mobile Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={personal.phone}
                  onChange={handlePersonalChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Gender</label>
                <select
                  name="gender"
                  value={personal.gender}
                  onChange={handlePersonalChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="">Select Gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={personal.dob}
                  onChange={handlePersonalChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: ACADEMIC DETAILS */}
        {activeSection === "education" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <GraduationCap className="size-5 text-blue-600 dark:text-blue-400" />
              Academic Performance & Institution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Current Course / Degree</label>
                <input
                  type="text"
                  name="currentCourse"
                  placeholder="e.g. B.Tech Computer Science, Class 12, MBBS"
                  value={education.currentCourse}
                  onChange={handleEdChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Qualification Level</label>
                <select
                  name="qualification"
                  value={education.qualification}
                  onChange={handleEdChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="">Select Qualification...</option>
                  <option value="Higher Secondary (10+2)">Higher Secondary (10+2)</option>
                  <option value="Undergraduate (UG)">Undergraduate (UG)</option>
                  <option value="Postgraduate (PG)">Postgraduate (PG)</option>
                  <option value="Doctorate (PhD)">Doctorate (PhD)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">College / University Name</label>
                <input
                  type="text"
                  name="collegeName"
                  placeholder="e.g. National Institute of Technology"
                  value={education.collegeName}
                  onChange={handleEdChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Year / Semester of Study</label>
                <input
                  type="text"
                  name="yearSemester"
                  placeholder="e.g. 1st Year, Sem 4"
                  value={education.yearSemester}
                  onChange={handleEdChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Previous Semester / Class Marks (%) or CGPA</label>
                <input
                  type="text"
                  name="marksPercentage"
                  placeholder="e.g. 78% or 8.5 CGPA"
                  value={education.marksPercentage}
                  onChange={handleEdChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Stream / Branch</label>
                <select
                  name="streamBranch"
                  value={education.streamBranch}
                  onChange={handleEdChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="">Select Stream...</option>
                  <option value="Engineering & Technology">Engineering & Technology</option>
                  <option value="Science / STEM">Science / STEM</option>
                  <option value="Arts & Commerce">Arts & Commerce</option>
                  <option value="Medical & Healthcare">Medical & Healthcare</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: FINANCIAL & INCOME */}
        {activeSection === "financial" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <IndianRupee className="size-5 text-blue-600 dark:text-blue-400" />
              Family Income & Financial Eligibility
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Annual Family Income (₹)</label>
                <input
                  type="number"
                  name="annualIncome"
                  placeholder="e.g. 200000"
                  value={financial.annualIncome}
                  onChange={handleFinChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Parent / Guardian Occupation</label>
                <input
                  type="text"
                  name="guardianOccupation"
                  placeholder="e.g. Agriculture, Business, Service"
                  value={financial.guardianOccupation}
                  onChange={handleFinChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Income Certificate Serial Number</label>
                <input
                  type="text"
                  name="incomeCertNo"
                  placeholder="e.g. MH-INC-2026-88492"
                  value={financial.incomeCertNo}
                  onChange={handleFinChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Issuing Authority</label>
                <input
                  type="text"
                  name="incomeIssuingAuth"
                  placeholder="e.g. Tahsildar / Revenue Office"
                  value={financial.incomeIssuingAuth}
                  onChange={handleFinChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: CATEGORY & QUOTAS */}
        {activeSection === "eligibility" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="size-5 text-blue-600 dark:text-blue-400" />
              Social Category, Domicile & Reservation Quotas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Social Category</label>
                <select
                  name="category"
                  value={eligibility.category}
                  onChange={handleEligibilityChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="">Select Category...</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC (Other Backward Class)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Domicile State</label>
                <select
                  name="domicileState"
                  value={eligibility.domicileState}
                  onChange={handleEligibilityChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="">Select Domicile State...</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Other State">Other State / All India</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Disability Status (PwD)</label>
                <select
                  name="isDisability"
                  value={eligibility.isDisability}
                  onChange={handleEligibilityChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Person with Disability)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Special Eligibility Criteria / Quota</label>
                <select
                  name="specialCriteria"
                  value={eligibility.specialCriteria}
                  onChange={handleEligibilityChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="">Select Special Quota...</option>
                  <option value="First-Generation Learner">First-Generation Learner</option>
                  <option value="Single Girl Child">Single Girl Child</option>
                  <option value="Rural Background">Rural / Remote District Resident</option>
                  <option value="National Sports Level">National / State Level Sports Athlete</option>
                  <option value="None">None / General</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Save Button Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Changes directly update your real-time scholarship matches across the dashboard.
          </p>
          <button
            type="submit"
            disabled={isSavingDb}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Save className="size-4" /> {isSavingDb ? "Saving to Database..." : "Save Details"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserProfileSection;
