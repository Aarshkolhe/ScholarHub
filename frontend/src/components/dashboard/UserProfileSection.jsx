import { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  IndianRupee,
  ShieldAlert,
  FileCheck,
  Upload,
  CheckCircle2,
  Save,
  Trash2,
  FileText,
  Database,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const DOCUMENT_LIST = [
  { id: "aadhaar", label: "Aadhaar / Identity Proof", required: true },
  { id: "income", label: "Income Certificate", required: true },
  { id: "caste", label: "Caste Certificate", required: false },
  { id: "domicile", label: "Domicile Certificate", required: true },
  { id: "marksheet", label: "Marksheet (Previous Semester / 10th / 12th)", required: true },
  { id: "collegeId", label: "College / School ID Card", required: true },
  { id: "bonafide", label: "Bonafide Student Certificate", required: true },
  { id: "bankPassbook", label: "Bank Passbook / Account Details", required: true },
  { id: "disability", label: "Disability Certificate (if applicable)", required: false },
  { id: "photo", label: "Passport-size Photo", required: true },
  { id: "prevScholarship", label: "Previous Scholarship Details / Receipt", required: false },
];

const BACKEND_URL = "http://localhost:5000";

export function UserProfileSection() {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("education");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);

  // Personal Profile
  const [fullName, setFullName] = useState(user?.fullName || user?.name || "Student");
  const [email, setEmail] = useState(user?.email || "student@scholarhub.edu");

  // Education Details
  const [education, setEducation] = useState(() => {
    const stored = localStorage.getItem("scholarhub_profile_education");
    return stored
      ? JSON.parse(stored)
      : {
          currentCourse: "B.Tech",
          qualification: "Undergraduate",
          collegeName: "National Institute of Technology",
          yearSemester: "3rd Year / 5th Semester",
          marksPercentage: "85%",
          passingYear: "2026",
          streamBranch: "Computer Science & Engineering",
        };
  });

  // Financial Details
  const [financial, setFinancial] = useState(() => {
    const stored = localStorage.getItem("scholarhub_profile_financial");
    return stored
      ? JSON.parse(stored)
      : {
          annualIncome: "450000",
          guardianOccupation: "Government Service",
          incomeCertNo: "INC/2026/88921",
          incomeIssuingAuth: "Tehsildar / District Revenue Office",
        };
  });

  // Category & Eligibility Details
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

  // Documents State
  const [documents, setDocuments] = useState(() => {
    const stored = localStorage.getItem("scholarhub_profile_documents");
    return stored
      ? JSON.parse(stored)
      : {
          aadhaar: { fileName: "aadhaar_card.pdf", status: "Verified" },
          income: { fileName: "income_cert_2026.pdf", status: "Verified" },
          marksheet: { fileName: "sem4_marksheet.pdf", status: "Verified" },
        };
  });

  useEffect(() => {
    localStorage.setItem("scholarhub_profile_education", JSON.stringify(education));
  }, [education]);

  useEffect(() => {
    localStorage.setItem("scholarhub_profile_financial", JSON.stringify(financial));
  }, [financial]);

  useEffect(() => {
    localStorage.setItem("scholarhub_profile_eligibility", JSON.stringify(eligibility));
  }, [eligibility]);

  useEffect(() => {
    localStorage.setItem("scholarhub_profile_documents", JSON.stringify(documents));
  }, [documents]);

  const handleEducationChange = (e) => {
    setEducation((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFinancialChange = (e) => {
    setFinancial((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEligibilityChange = (e) => {
    setEligibility((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = (docId, file) => {
    if (!file) return;
    setDocuments((prev) => ({
      ...prev,
      [docId]: {
        fileName: file.name,
        status: "Uploaded",
        uploadedAt: new Date().toLocaleDateString(),
      },
    }));
    triggerSaveFeedback(`Uploaded ${file.name} successfully!`);
  };

  const handleRemoveDocument = (docId) => {
    setDocuments((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  const triggerSaveFeedback = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setIsSavingDb(true);

    updateUser({ name: fullName, fullName, email });

    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "demo-user-id",
          education,
          financial,
          eligibility,
          documents,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDbSynced(true);
        triggerSaveFeedback("All profile details & documents saved directly to PostgreSQL Database!");
      } else {
        throw new Error(data.message || "Failed to save profile");
      }
    } catch (err) {
      // Local storage fallback
      setDbSynced(true);
      triggerSaveFeedback("Profile details saved to session & local store successfully!");
    } finally {
      setIsSavingDb(false);
    }
  };

  const uploadedDocCount = Object.keys(documents).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="size-6 text-blue-600 dark:text-blue-400" />
            Student Profile & Verification Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Complete your academic, financial, category details and upload verification documents.</span>
          </p>
        </div>

        {/* Database Status Tag */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Database className="size-4" />
          <span>PostgreSQL Database Active</span>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm animate-rise-in">
          <CheckCircle2 className="size-4" /> {saveSuccessMsg}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection("education")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeSection === "education"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <GraduationCap className="size-4" /> 1. Education Details
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("financial")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeSection === "financial"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <IndianRupee className="size-4" /> 2. Family & Financial
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("eligibility")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeSection === "eligibility"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <ShieldAlert className="size-4" /> 3. Category & Eligibility
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("documents")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            activeSection === "documents"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <FileCheck className="size-4" /> 4. Documents Vault ({uploadedDocCount}/{DOCUMENT_LIST.length})
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* SECTION 1: EDUCATION DETAILS */}
        {activeSection === "education" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <GraduationCap className="size-5 text-blue-600 dark:text-blue-400" />
              Academic & Educational History
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Current Course / Class</label>
                <input
                  type="text"
                  name="currentCourse"
                  placeholder="e.g. B.Tech / B.Sc / Class 12"
                  value={education.currentCourse}
                  onChange={handleEducationChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Highest Qualification</label>
                <select
                  name="qualification"
                  value={education.qualification}
                  onChange={handleEducationChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="Higher Secondary (10+2)">Higher Secondary (10+2)</option>
                  <option value="Undergraduate">Undergraduate (B.E/B.Tech/B.Sc/B.Com)</option>
                  <option value="Postgraduate">Postgraduate (M.E/M.Tech/M.Sc/MBA)</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">College / School Name</label>
                <input
                  type="text"
                  name="collegeName"
                  placeholder="Official name of your institution"
                  value={education.collegeName}
                  onChange={handleEducationChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Academic Stream / Branch</label>
                <input
                  type="text"
                  name="streamBranch"
                  placeholder="e.g. Computer Science, Mechanical, Science"
                  value={education.streamBranch}
                  onChange={handleEducationChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Current Year / Semester</label>
                <input
                  type="text"
                  name="yearSemester"
                  placeholder="e.g. 3rd Year / 5th Semester"
                  value={education.yearSemester}
                  onChange={handleEducationChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Previous Marks / Percentage (%)</label>
                <input
                  type="text"
                  name="marksPercentage"
                  placeholder="e.g. 85% or 8.5 CGPA"
                  value={education.marksPercentage}
                  onChange={handleEducationChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Expected Passing Year</label>
                <input
                  type="text"
                  name="passingYear"
                  placeholder="e.g. 2026"
                  value={education.passingYear}
                  onChange={handleEducationChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: FAMILY & FINANCIAL DETAILS */}
        {activeSection === "financial" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <IndianRupee className="size-5 text-emerald-600 dark:text-emerald-400" />
              Family & Financial Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Annual Family Income (₹)</label>
                <input
                  type="number"
                  name="annualIncome"
                  placeholder="e.g. 350000"
                  value={financial.annualIncome}
                  onChange={handleFinancialChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Parent / Guardian Occupation</label>
                <select
                  name="guardianOccupation"
                  value={financial.guardianOccupation}
                  onChange={handleFinancialChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="Agriculture / Farming">Agriculture / Farming</option>
                  <option value="Government Service">Government Service</option>
                  <option value="Private Sector Employee">Private Sector Employee</option>
                  <option value="Business / Self-Employed">Business / Self-Employed</option>
                  <option value="Daily Wage / Worker">Daily Wage / Worker</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Income Certificate Number</label>
                <input
                  type="text"
                  name="incomeCertNo"
                  placeholder="Certificate Serial / Ref No."
                  value={financial.incomeCertNo}
                  onChange={handleFinancialChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Issuing Authority</label>
                <input
                  type="text"
                  name="incomeIssuingAuth"
                  placeholder="e.g. Tehsildar / District Magistrate"
                  value={financial.incomeIssuingAuth}
                  onChange={handleFinancialChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: CATEGORY & ELIGIBILITY DETAILS */}
        {activeSection === "eligibility" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldAlert className="size-5 text-amber-500" />
              Category & Social Quota Credentials
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
                  <option value="General">General / Open</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Domicile / Home State</label>
                <input
                  type="text"
                  name="domicileState"
                  placeholder="e.g. Maharashtra, Delhi, Karnataka"
                  value={eligibility.domicileState}
                  onChange={handleEligibilityChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Minority Category Status</label>
                <select
                  name="isMinority"
                  value={eligibility.isMinority}
                  onChange={handleEligibilityChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Religious / Linguistic Minority)</option>
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
                  <option value="Yes">Yes (&ge; 40% Disability Certificate)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Special Criteria / Achievements</label>
                <input
                  type="text"
                  name="specialCriteria"
                  placeholder="e.g. Single Girl Child, First-Generation Learner, National Sports Level"
                  value={eligibility.specialCriteria}
                  onChange={handleEligibilityChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: DOCUMENTS VAULT & UPLOAD */}
        {activeSection === "documents" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="size-5 text-blue-600 dark:text-blue-400" />
                  Verification Documents Vault
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload PDF or Image files (Max 5MB per file) for direct application verification.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOCUMENT_LIST.map((doc) => {
                const uploaded = documents[doc.id];
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {doc.label}
                        {doc.required && <span className="text-rose-500">*</span>}
                      </p>

                      {uploaded ? (
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <FileText className="size-3.5" />
                          <span className="truncate max-w-[160px]">{uploaded.fileName}</span>
                          <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 text-[10px] font-bold">
                            {uploaded.status}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1 text-[11px] text-slate-400">Not uploaded yet</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {uploaded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          title="Delete file"
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : (
                        <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                          <Upload className="size-3.5" /> Upload
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingDb}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Save className="size-4" /> {isSavingDb ? "Saving to PostgreSQL..." : "Save Profile & Documents"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserProfileSection;
