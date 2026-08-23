import { useState, useEffect, useRef } from "react";
import {
  User,
  GraduationCap,
  BookOpen,
  Home,
  IndianRupee,
  ShieldCheck,
  Save,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Check,
  ChevronDown,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { calculateProfileStrength } from "../../lib/eligibilityEngine";

const BACKEND_URL = "http://localhost:5000";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female (Powers AICTE Pragati & Women in STEM)" },
  { value: "Other", label: "Other / Prefer not to say" },
];

const QUALIFICATION_OPTIONS = [
  { value: "Class 10 / Secondary (SSC)", label: "Class 10 / Secondary School (SSC)" },
  { value: "Class 12 / Senior Secondary (HSC / 10+2)", label: "Class 12 / Senior Secondary (HSC / 10+2 / Junior College)" },
  { value: "Undergraduate (UG)", label: "Undergraduate (UG / B.Tech, B.Sc, B.A, B.Com, MBBS)" },
  { value: "Postgraduate (PG)", label: "Postgraduate (PG / M.Tech, M.Sc, M.A, MBA)" },
  { value: "Diploma / Polytechnic", label: "Diploma / Polytechnic (3-Year Technical)" },
  { value: "Doctorate (PhD)", label: "Doctorate (PhD / Research Fellow)" },
  { value: "Primary / Middle School (Class 1 - 8)", label: "Primary / Middle School (Class 1 - 8)" },
];

const CLASS_12_STREAM_OPTIONS = [
  { value: "Senior Secondary 10+2 (Science PCM / PCB)", label: "Senior Secondary 10+2 (Science PCM / PCB)" },
  { value: "Senior Secondary 10+2 (Arts & Commerce)", label: "Senior Secondary 10+2 (Arts & Commerce)" },
];

const COLLEGE_STREAM_OPTIONS = [
  { value: "Engineering & Technology", label: "Engineering & Technology" },
  { value: "Science / STEM", label: "Science / STEM" },
  { value: "Arts & Humanities", label: "Arts & Humanities" },
  { value: "Commerce & Finance", label: "Commerce & Finance" },
  { value: "Medical & Healthcare", label: "Medical & Healthcare" },
  { value: "Diploma / Polytechnic", label: "Diploma / Polytechnic" },
  { value: "General School Education (Class 1 - 8)", label: "General School Education (Class 1 - 8)" },
];

const CLASS_YEAR_OPTIONS = [
  { value: "Class 11th", label: "Class 11th" },
  { value: "Class 12th", label: "Class 12th (HSC Board Year)" },
];

const LIVING_TYPE_OPTIONS = [
  { value: "Hostel", label: "Hostel (College / Govt / Private Hostel)" },
  { value: "PG / Rented Accommodation", label: "PG / Rented Accommodation" },
  { value: "Day Scholar at Home", label: "Day Scholar at Home (Resident with Family)" },
];

const CATEGORY_OPTIONS = [
  { value: "General", label: "General / Open" },
  { value: "OBC", label: "OBC (Other Backward Class)" },
  { value: "SC", label: "SC (Scheduled Caste)" },
  { value: "ST", label: "ST (Scheduled Tribe)" },
  { value: "EWS", label: "EWS (Economically Weaker Section)" },
  { value: "VJNT", label: "VJNT (Vimukta Jati & Nomadic Tribes)" },
  { value: "SBC", label: "SBC (Special Backward Class)" },
];

const DOMICILE_STATE_OPTIONS = [
  { value: "Maharashtra", label: "Maharashtra (Powers MahaDBT & MahaJYOTI)" },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Delhi", label: "Delhi (NCT)" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jammu & Kashmir", label: "Jammu & Kashmir / Ladakh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Other State", label: "Other State / All India Resident" },
];

const DISABILITY_OPTIONS = [
  { value: "No", label: "No" },
  { value: "Yes", label: "Yes (Person with Disability - PwD)" },
];

const SPECIAL_CRITERIA_OPTIONS = [
  { value: "None", label: "None / General" },
  { value: "First-Generation Learner", label: "First-Generation College Student" },
  { value: "Single Girl Child", label: "Single Girl Child" },
  { value: "Rural Background", label: "Rural Background Resident" },
  { value: "National Sports Level", label: "National / State Level Sports Athlete" },
];

function CustomSelect({ name, value, onChange, options, placeholder = "Select...", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 px-3.5 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 flex items-center justify-between transition-all cursor-pointer ${
          isOpen ? "ring-2 ring-blue-500/20 border-blue-500 shadow-sm" : ""
        } ${className}`}
      >
        <span className={`truncate text-left ${!value ? "text-slate-400 dark:text-slate-500 font-normal" : ""}`}>
          {displayLabel}
        </span>
        <ChevronDown className={`size-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-500" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-fade-in max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function UserProfileSection() {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("personal"); // personal, currentEd, pastEd, living, financial, eligibility
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [isSavingDb, setIsSavingDb] = useState(false);

  // 1. Personal Identity State (👤 Identity)
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

  // 2. Current Education State (🎓 Current Education)
  const [currentEducation, setCurrentEducation] = useState(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const storedCur = uid
      ? localStorage.getItem(`scholarhub_profile_current_education${uid}`)
      : localStorage.getItem("scholarhub_profile_current_education");
    const legacyEd = uid
      ? localStorage.getItem(`scholarhub_profile_education${uid}`)
      : localStorage.getItem("scholarhub_profile_education");
    const parsedLegacy = legacyEd ? JSON.parse(legacyEd) : {};

    return storedCur
      ? JSON.parse(storedCur)
      : {
          currentCourse: parsedLegacy.currentCourse || "",
          streamBranch: parsedLegacy.streamBranch || parsedLegacy.currentStream || "",
          collegeName: parsedLegacy.collegeName || "",
          yearSemester: parsedLegacy.yearSemester || "",
          marksPercentage: parsedLegacy.marksPercentage || "",
          qualification: parsedLegacy.qualification || parsedLegacy.degreeLevel || "Undergraduate (UG)",
        };
  });

  // 3. Past Education State (📚 Past Education)
  const [pastEducation, setPastEducation] = useState(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const storedPast = uid
      ? localStorage.getItem(`scholarhub_profile_past_education${uid}`)
      : localStorage.getItem("scholarhub_profile_past_education");
    const legacyEd = uid
      ? localStorage.getItem(`scholarhub_profile_education${uid}`)
      : localStorage.getItem("scholarhub_profile_education");
    const parsedLegacy = legacyEd ? JSON.parse(legacyEd) : {};
    const parsedPast = storedPast ? JSON.parse(storedPast) : {};

    return {
      tenthPercentage: parsedPast.tenthPercentage || parsedLegacy.tenthPercentage || "",
      twelfthPercentage: parsedPast.twelfthPercentage || parsedLegacy.twelfthPercentage || "",
      ugPercentage: parsedPast.ugPercentage || parsedLegacy.ugPercentage || "",
    };
  });

  // 4. Living Status State (🏠 Living Status)
  const [livingStatus, setLivingStatus] = useState(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const storedLiving = uid
      ? localStorage.getItem(`scholarhub_profile_living_status${uid}`)
      : localStorage.getItem("scholarhub_profile_living_status");
    const legacyEd = uid
      ? localStorage.getItem(`scholarhub_profile_education${uid}`)
      : localStorage.getItem("scholarhub_profile_education");
    const parsedLegacy = legacyEd ? JSON.parse(legacyEd) : {};

    return storedLiving
      ? JSON.parse(storedLiving)
      : {
          livingType: parsedLegacy.livingType || "Day Scholar at Home",
          monthlyLivingCost: parsedLegacy.monthlyLivingCost || "",
        };
  });

  // 5. Family & Financial State (💰 Financial)
  const [financial, setFinancial] = useState(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const stored = uid
      ? localStorage.getItem(`scholarhub_profile_financial${uid}`)
      : localStorage.getItem("scholarhub_profile_financial");
    return stored
      ? JSON.parse(stored)
      : {
          annualIncome: "",
        };
  });

  // 6. Category & Quota Eligibility State (🏛️ Category & Domicile)
  const [eligibility, setEligibility] = useState(() => {
    const uid = user?.id ? `_${user.id}` : "";
    const stored = uid
      ? localStorage.getItem(`scholarhub_profile_eligibility${uid}`)
      : localStorage.getItem("scholarhub_profile_eligibility");
    return stored
      ? JSON.parse(stored)
      : {
          category: "",
          domicileState: "",
          isDisability: "No",
          specialCriteria: "None",
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

    const cur = uid
      ? localStorage.getItem(`scholarhub_profile_current_education${uid}`)
      : localStorage.getItem("scholarhub_profile_current_education");
    if (cur) {
      setCurrentEducation(JSON.parse(cur));
    } else {
      setCurrentEducation({
        currentCourse: "",
        streamBranch: "",
        collegeName: "",
        yearSemester: "",
        marksPercentage: "",
        qualification: "Undergraduate (UG)",
      });
    }

    const past = uid
      ? localStorage.getItem(`scholarhub_profile_past_education${uid}`)
      : localStorage.getItem("scholarhub_profile_past_education");
    if (past) {
      setPastEducation(JSON.parse(past));
    } else {
      setPastEducation({
        tenthPercentage: "",
        twelfthPercentage: "",
      });
    }

    const liv = uid
      ? localStorage.getItem(`scholarhub_profile_living_status${uid}`)
      : localStorage.getItem("scholarhub_profile_living_status");
    if (liv) {
      setLivingStatus(JSON.parse(liv));
    } else {
      setLivingStatus({
        livingType: "Day Scholar at Home",
        monthlyLivingCost: "",
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
        domicileState: "",
        isDisability: "No",
        specialCriteria: "None",
      });
    }
  }, [user]);

  // Sync to localStorage
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
      localStorage.setItem(`scholarhub_profile_current_education${uid}`, JSON.stringify(currentEducation));
      localStorage.setItem(`scholarhub_profile_education${uid}`, JSON.stringify({ ...currentEducation, ...pastEducation, ...livingStatus }));
    } else {
      localStorage.setItem("scholarhub_profile_current_education", JSON.stringify(currentEducation));
      localStorage.setItem("scholarhub_profile_education", JSON.stringify({ ...currentEducation, ...pastEducation, ...livingStatus }));
    }
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }, [currentEducation, pastEducation, livingStatus, user]);

  useEffect(() => {
    const uid = user?.id ? `_${user.id}` : "";
    if (uid) {
      localStorage.setItem(`scholarhub_profile_past_education${uid}`, JSON.stringify(pastEducation));
    } else {
      localStorage.setItem("scholarhub_profile_past_education", JSON.stringify(pastEducation));
    }
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }, [pastEducation, user]);

  useEffect(() => {
    const uid = user?.id ? `_${user.id}` : "";
    if (uid) {
      localStorage.setItem(`scholarhub_profile_living_status${uid}`, JSON.stringify(livingStatus));
    } else {
      localStorage.setItem("scholarhub_profile_living_status", JSON.stringify(livingStatus));
    }
    window.dispatchEvent(new Event("scholarhub_profile_updated"));
  }, [livingStatus, user]);

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

  const handleCurrentEdChange = (e) => {
    const { name, value } = e.target;
    setCurrentEducation((prev) => ({ ...prev, [name]: value }));
  };

  const handlePastEdChange = (e) => {
    const { name, value } = e.target;
    setPastEducation((prev) => ({ ...prev, [name]: value }));
  };

  const handleLivingChange = (e) => {
    const { name, value } = e.target;
    setLivingStatus((prev) => ({ ...prev, [name]: value }));
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
    window.dispatchEvent(new Event("scholarhub_profile_updated"));

    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "demo-user-id",
          personal,
          currentEducation,
          pastEducation,
          livingStatus,
          financial,
          eligibility,
        }),
      });

      const data = await response.json();
      if (data.success) {
        triggerSaveFeedback("All profile details saved to PostgreSQL Database & local session!");
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
      localStorage.removeItem(`scholarhub_profile_current_education${uid}`);
      localStorage.removeItem(`scholarhub_profile_past_education${uid}`);
      localStorage.removeItem(`scholarhub_profile_living_status${uid}`);
      localStorage.removeItem(`scholarhub_profile_education${uid}`);
      localStorage.removeItem(`scholarhub_profile_financial${uid}`);
      localStorage.removeItem(`scholarhub_profile_eligibility${uid}`);
    }
    localStorage.removeItem("scholarhub_profile_personal");
    localStorage.removeItem("scholarhub_profile_current_education");
    localStorage.removeItem("scholarhub_profile_past_education");
    localStorage.removeItem("scholarhub_profile_living_status");
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
    setCurrentEducation({
      currentCourse: "",
      streamBranch: "",
      collegeName: "",
      yearSemester: "",
      marksPercentage: "",
      qualification: "Undergraduate (UG)",
    });
    setPastEducation({
      tenthPercentage: "",
      twelfthPercentage: "",
    });
    setLivingStatus({
      livingType: "Day Scholar at Home",
      monthlyLivingCost: "",
    });
    setFinancial({
      annualIncome: "",
    });
    setEligibility({
      category: "",
      domicileState: "",
      isDisability: "No",
      specialCriteria: "None",
    });

    window.dispatchEvent(new Event("scholarhub_profile_updated"));
    triggerSaveFeedback("Profile reset to clean state (0% strength).");
  };

  // Calculate details completion percentage using unified weighted domain calculator
  const completionPercent = calculateProfileStrength({
    ...personal,
    ...currentEducation,
    ...pastEducation,
    ...livingStatus,
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
            Streamlined Details Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill your high-impact academic, financial, accommodation, and quota details once. ScholarHub matches you with eligible grants automatically.
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
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Profile Strength</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{completionPercent}% Complete</p>
            </div>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                style={{ width: `${completionPercent}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPercent >= 80
                    ? "bg-emerald-500"
                    : completionPercent >= 30
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-amber-500"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 30% Activation Threshold Indicator Banner */}
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 p-4 text-xs text-blue-900 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900/60 shadow-sm">
        <Sparkles className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 animate-icon-twinkle" />
        <div className="leading-relaxed">
          <p className="font-semibold text-blue-950 dark:text-blue-100 flex items-center gap-1.5">
            High-Impact Matching Engine
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              completionPercent >= 30
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}>
              {completionPercent >= 30 ? "✓ 30% Activation Active" : "30% Activation Required"}
            </span>
          </p>
          <p className="mt-1 text-blue-800 dark:text-blue-300">
            {completionPercent >= 30
              ? "Your profile is active! Real-time eligibility evaluation and dynamic match percentage badges are live across the dashboard."
              : "Complete at least 30% of your profile fields (Current Course, Marks, Category, Domicile State, Income) to activate real-time scholarship match calculations."}
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
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 scrollbar-none">
        {[
          { id: "personal", label: "👤 Identity", icon: User },
          { id: "currentEd", label: "🎓 Current Education", icon: GraduationCap },
          { id: "pastEd", label: "📚 Past Education", icon: BookOpen },
          { id: "living", label: "🏠 Living Status", icon: Home },
          { id: "financial", label: "💰 Financial", icon: IndianRupee },
          { id: "eligibility", label: "🏛️ Category & Quotas", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* SECTION 1: PERSONAL & IDENTITY */}
        {activeSection === "personal" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="size-5 text-blue-600 dark:text-blue-400" />
              Identity & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Aarsh Kolhe"
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
                  placeholder="e.g. aarsh@scholarhub.edu"
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
                  placeholder="e.g. 9876543210"
                  value={personal.phone}
                  onChange={handlePersonalChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Gender</label>
                <CustomSelect
                  name="gender"
                  value={personal.gender}
                  onChange={handlePersonalChange}
                  options={GENDER_OPTIONS}
                  placeholder="Select Gender..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Date of Birth / Age</label>
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

        {/* SECTION 2: CURRENT EDUCATION */}
        {activeSection === "currentEd" && (() => {
          const qual = currentEducation.qualification || "";
          const isClass10 = qual.includes("Class 10") || qual.includes("Primary");
          const isClass12 = qual.includes("Class 12");
          const isSchool = isClass10 || isClass12;

          return (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <GraduationCap className="size-5 text-blue-600 dark:text-blue-400" />
                Current Education & Qualification Level
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Qualification Level Dropdown (Primary Control) */}
                <div className="sm:col-span-2 bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  <label className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    Qualification / Education Level
                  </label>
                  <CustomSelect
                    name="qualification"
                    value={currentEducation.qualification}
                    onChange={handleCurrentEdChange}
                    options={QUALIFICATION_OPTIONS}
                    placeholder="Select Qualification Level..."
                    className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700"
                  />
                </div>

                {/* 2. School / College Name */}
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {isSchool ? "School / Junior College Name" : "College / University Name"}
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    placeholder={
                      isSchool
                        ? "e.g. Kendriya Vidyalaya, Saraswati High School, St. Xavier's"
                        : "e.g. National Institute of Technology, Delhi University"
                    }
                    value={currentEducation.collegeName}
                    onChange={handleCurrentEdChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                {/* 3. Class / Course / Degree Name */}
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {isClass10
                      ? "Class / Board Name"
                      : isClass12
                      ? "Class & Stream Name"
                      : "Course / Degree Name"}
                  </label>
                  <input
                    type="text"
                    name="currentCourse"
                    placeholder={
                      isClass10
                        ? "e.g. Class 10 (SSC Board)"
                        : isClass12
                        ? "e.g. Class 12 Science (PCM), Class 11 Arts"
                        : "e.g. B.Tech Computer Science, B.Sc Physics, MBBS"
                    }
                    value={currentEducation.currentCourse}
                    onChange={handleCurrentEdChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                {/* 4. Stream / Academic Field (Hidden for Class 10 to reduce clutter) */}
                {!isClass10 && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Stream / Academic Field</label>
                    <CustomSelect
                      name="streamBranch"
                      value={currentEducation.streamBranch}
                      onChange={handleCurrentEdChange}
                      options={isClass12 ? CLASS_12_STREAM_OPTIONS : COLLEGE_STREAM_OPTIONS}
                      placeholder="Select Stream..."
                    />
                  </div>
                )}

                {/* 5. Year / Class / Semester (Only for Class 12 or College) */}
                {!isClass10 && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {isClass12 ? "Class Year" : "Year / Semester of Study"}
                    </label>
                    {isClass12 ? (
                      <CustomSelect
                        name="yearSemester"
                        value={currentEducation.yearSemester}
                        onChange={handleCurrentEdChange}
                        options={CLASS_YEAR_OPTIONS}
                        placeholder="Select Class Year..."
                      />
                    ) : (
                      <input
                        type="text"
                        name="yearSemester"
                        placeholder="e.g. 3rd Year (Sem 6), 1st Year"
                        value={currentEducation.yearSemester}
                        onChange={handleCurrentEdChange}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                )}

                {/* 6. Current / Previous Marks */}
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {isClass10
                      ? "Class 9th / Mid-Term Marks (%)"
                      : isClass12
                      ? "Class 11th / Mid-Term Marks (%)"
                      : "Current Semester / Annual Marks (%) or CGPA"}
                  </label>
                  <input
                    type="text"
                    name="marksPercentage"
                    placeholder={isSchool ? "e.g. 85%" : "e.g. 78% or 8.5 CGPA"}
                    value={currentEducation.marksPercentage}
                    onChange={handleCurrentEdChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* SECTION 3: PAST EDUCATION */}
        {activeSection === "pastEd" && (() => {
          const qual = currentEducation.qualification || "";
          const isClass10 = qual.includes("Class 10") || qual.includes("Primary");
          const isClass12 = qual.includes("Class 12");
          const isPG = qual.includes("Postgraduate") || qual.includes("Doctorate");

          if (isClass10) {
            return (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
                  Past Education Scores
                </h3>
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    ℹ️ Class 10 / Secondary Student Profile Active
                  </p>
                  <p>
                    Past 10th and 12th board exam scores are not applicable yet as you are currently in Class 10. Your Class 9th / Current Class 10 marks are evaluated directly for 10th Passed & pre-matric school merit grants.
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
                Past Education Scores {isPG ? "(UG Degree, 10th & 12th Scores)" : "(Powers 10th & 12th Merit Grants)"}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Matches merit-based cutoff grants like <strong>MahaDBT 10th Scheme</strong>, <strong>Postgraduate Research Fellowships</strong>, and <strong>Central Sector Grants</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* UG Graduation Marks (For PG / PhD Students) */}
                {isPG && (
                  <div className="sm:col-span-2 bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <label className="text-xs font-bold text-blue-900 dark:text-blue-300">
                      Undergraduate (UG / Graduation) Aggregate Marks (%) or CGPA
                    </label>
                    <input
                      type="text"
                      name="ugPercentage"
                      placeholder="e.g. 82% or 8.4 CGPA"
                      value={pastEducation.ugPercentage}
                      onChange={handlePastEdChange}
                      className="mt-1 w-full rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">10th Board Marks (%)</label>
                  <input
                    type="text"
                    name="tenthPercentage"
                    placeholder="e.g. 88.4% or 88.4"
                    value={pastEducation.tenthPercentage}
                    onChange={handlePastEdChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                {!isClass12 ? (
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">12th Board / Diploma Marks (%)</label>
                    <input
                      type="text"
                      name="twelfthPercentage"
                      placeholder="e.g. 85.2% or 85.2"
                      value={pastEducation.twelfthPercentage}
                      onChange={handlePastEdChange}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <span>ℹ️ 12th Board Score: Not applicable yet (Currently pursuing Class 11/12).</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* SECTION 4: LIVING STATUS & ACCOMMODATION */}
        {activeSection === "living" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Home className="size-5 text-blue-600 dark:text-blue-400" />
              Living Status & Accommodation (Powers Hostel Allowance Grants)
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Directly unlocks government hostel grants like <strong>Dr. Punjabrao Deshmukh Vasatigruh Nirvah Bhatta Yojna</strong> (₹30,000/yr).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Living / Accommodation Type</label>
                <CustomSelect
                  name="livingType"
                  value={livingStatus.livingType}
                  onChange={handleLivingChange}
                  options={LIVING_TYPE_OPTIONS}
                  placeholder="Select Living Accommodation..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Monthly Rent / Hostel Expense (₹)</label>
                <input
                  type="number"
                  name="monthlyLivingCost"
                  placeholder="e.g. 6000"
                  value={livingStatus.monthlyLivingCost}
                  onChange={handleLivingChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: FINANCIAL & INCOME */}
        {activeSection === "financial" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <IndianRupee className="size-5 text-blue-600 dark:text-blue-400" />
              Annual Family Income (Powers Income Ceilings)
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates eligibility against standard government thresholds (≤ ₹8 Lakhs for MahaDBT/AICTE, ≤ ₹5 Lakhs for Vidyasaarathi, ≤ ₹1.5 Lakhs for full freeships).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Annual Family Income (₹)</label>
                <input
                  type="number"
                  name="annualIncome"
                  placeholder="e.g. 200000"
                  value={financial.annualIncome}
                  onChange={handleFinChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: CATEGORY & DOMICILE */}
        {activeSection === "eligibility" && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="size-5 text-blue-600 dark:text-blue-400" />
              Social Category, Domicile & Quotas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Social Category</label>
                <CustomSelect
                  name="category"
                  value={eligibility.category}
                  onChange={handleEligibilityChange}
                  options={CATEGORY_OPTIONS}
                  placeholder="Select Social Category..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Domicile State</label>
                <CustomSelect
                  name="domicileState"
                  value={eligibility.domicileState}
                  onChange={handleEligibilityChange}
                  options={DOMICILE_STATE_OPTIONS}
                  placeholder="Select Domicile State..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Disability Status (PwD)</label>
                <CustomSelect
                  name="isDisability"
                  value={eligibility.isDisability}
                  onChange={handleEligibilityChange}
                  options={DISABILITY_OPTIONS}
                  placeholder="Select Disability Status..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Special Criteria / Quota</label>
                <CustomSelect
                  name="specialCriteria"
                  value={eligibility.specialCriteria}
                  onChange={handleEligibilityChange}
                  options={SPECIAL_CRITERIA_OPTIONS}
                  placeholder="Select Special Criteria..."
                />
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
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            <Save className="size-4" /> {isSavingDb ? "Saving to Database..." : "Save Details"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserProfileSection;
