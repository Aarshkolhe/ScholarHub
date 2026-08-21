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
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = "http://localhost:5000";

export function UserProfileSection() {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("personal"); // personal, education, financial, eligibility
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [isSavingDb, setIsSavingDb] = useState(false);

  // 1. Personal Identity State
  const [personal, setPersonal] = useState(() => {
    const stored = localStorage.getItem("scholarhub_profile_personal");
    return stored
      ? JSON.parse(stored)
      : {
          fullName: user?.fullName || user?.name || "Student User",
          email: user?.email || "student@scholarhub.edu",
          phone: "9876543210",
          gender: "Male",
          dob: "2004-05-15",
          age: "21",
        };
  });

  // 2. Education Details State
  const [education, setEducation] = useState(() => {
    const stored = localStorage.getItem("scholarhub_profile_education");
    return stored
      ? JSON.parse(stored)
      : {
          currentCourse: "B.Tech Computer Science",
          qualification: "Undergraduate (UG)",
          collegeName: "National Institute of Technology",
          yearSemester: "3rd Year (Sem 6)",
          marksPercentage: "78%",
          passingYear: "2027",
          streamBranch: "Engineering & Technology",
        };
  });

  // 3. Family & Financial State
  const [financial, setFinancial] = useState(() => {
    const stored = localStorage.getItem("scholarhub_profile_financial");
    return stored
      ? JSON.parse(stored)
      : {
          annualIncome: "200000",
          guardianOccupation: "Agriculture / Farming",
          incomeCertNo: "MH-INC-2026-88492",
          incomeIssuingAuth: "Tahsildar Revenue Office",
        };
  });

  // 4. Category & Quota Eligibility State
  const [eligibility, setEligibility] = useState(() => {
    const stored = localStorage.getItem("scholarhub_profile_eligibility");
    return stored
      ? JSON.parse(stored)
      : {
          category: "OBC",
          isMinority: "No",
          isDisability: "No",
          domicileState: "Maharashtra",
          specialCriteria: "First-Generation Learner",
        };
  });

  useEffect(() => {
    localStorage.setItem("scholarhub_profile_personal", JSON.stringify(personal));
  }, [personal]);

  useEffect(() => {
    localStorage.setItem("scholarhub_profile_education", JSON.stringify(education));
  }, [education]);

  useEffect(() => {
    localStorage.setItem("scholarhub_profile_financial", JSON.stringify(financial));
  }, [financial]);

  useEffect(() => {
    localStorage.setItem("scholarhub_profile_eligibility", JSON.stringify(eligibility));
  }, [eligibility]);

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

  // Calculate details completion percentage
  const totalFields = 13;
  let filledFields = 0;
  if (personal.fullName) filledFields++;
  if (personal.email) filledFields++;
  if (personal.gender) filledFields++;
  if (education.currentCourse) filledFields++;
  if (education.collegeName) filledFields++;
  if (education.marksPercentage) filledFields++;
  if (education.streamBranch) filledFields++;
  if (education.yearSemester) filledFields++;
  if (financial.annualIncome) filledFields++;
  if (financial.guardianOccupation) filledFields++;
  if (eligibility.category) filledFields++;
  if (eligibility.domicileState) filledFields++;
  if (eligibility.specialCriteria) filledFields++;

  const completionPercent = Math.min(Math.round((filledFields / totalFields) * 100), 100);

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
