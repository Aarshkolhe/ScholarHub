import { useState, useRef, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  IndianRupee,
  ShieldCheck,
  Award,
  Bookmark,
  Send,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Camera,
  Trash2,
  Upload,
  Check,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getStoredStudentProfile, calculateProfileStrength } from "../../lib/eligibilityEngine";

export function StudentProfileOverview({ onNavigateTab }) {
  const { user, updateUser } = useAuth();
  const profile = useMemo(() => getStoredStudentProfile(), [user]);
  const fileInputRef = useRef(null);

  const [toastMsg, setToastMsg] = useState("");

  const displayName = user?.fullName || user?.name || profile.name || "Student";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase() || "ST";

  const savedIds = useMemo(() => {
    try {
      const uid = user?.id ? `_${user.id}` : "";
      const raw = uid
        ? localStorage.getItem(`scholarhub_saved_ids${uid}`)
        : localStorage.getItem("scholarhub_saved_ids");
      return JSON.parse(raw || "[]");
    } catch {
      return [];
    }
  }, [user]);

  const appliedIds = useMemo(() => {
    try {
      const uid = user?.id ? `_${user.id}` : "";
      const raw = uid
        ? localStorage.getItem(`scholarhub_applied_ids${uid}`)
        : localStorage.getItem("scholarhub_applied_ids");
      return JSON.parse(raw || "[]");
    } catch {
      return [];
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to 256x256 for smooth performance
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        updateUser({ avatar: compressedBase64 });
        setToastMsg("Profile picture updated successfully!");
        setTimeout(() => setToastMsg(""), 3500);
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = (e) => {
    e.stopPropagation();
    updateUser({ avatar: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setToastMsg("Profile picture removed.");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-rise-in">
          <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="size-6 text-blue-600 dark:text-blue-400" />
            Student Profile Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal student account, customize your profile picture, and verify your credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("Details")}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Edit Eligibility Details <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* Main Profile Hero Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar Upload Container */}
          <div className="relative group shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile picture"
              className="relative flex size-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-display text-2xl font-bold shadow-lg shadow-blue-500/20 ring-4 ring-blue-50 dark:ring-blue-950 overflow-hidden group-hover:ring-blue-400 transition-all cursor-pointer"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                initials
              )}

              {/* Hover Camera Overlay */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                <Camera className="size-5" />
                <span className="text-[9px] font-bold mt-1 uppercase">Change</span>
              </div>
            </button>

            {/* Corner Action Badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload photo"
              className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-transform hover:scale-110 border-2 border-white dark:border-slate-900"
            >
              <Camera className="size-3.5" />
            </button>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {displayName}
              </h2>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Student Account
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" /> Active
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="size-3.5" /> {profile.email || user?.email || "No email linked"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="size-3.5" /> {profile.collegeName || "Institution Not Set"} &bull; {profile.currentCourse || "Course Not Set"} {profile.yearSemester ? `(${profile.yearSemester})` : ""}
            </p>

            {/* Photo Action Buttons */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Upload className="size-3.5 text-blue-500" />
                <span>Upload Profile Photo</span>
              </button>

              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Applications</p>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">{appliedIds.length}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Bookmarked</p>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">{savedIds.length}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Score / CGPA</p>
            <p className="font-display text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{profile.marksPercentage || "N/A"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Details Strength</p>
            <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {calculateProfileStrength(profile)}%
            </p>
          </div>
        </div>
      </div>

      {/* Four Detailed Credential Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Current Academic Details */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="size-4 text-blue-600 dark:text-blue-400" />
              Current Academic Credentials
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
              {profile.marksPercentage ? "Profile Set" : "Pending"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Current Course</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.currentCourse || "Not Specified"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Stream / Branch</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.streamBranch || "Not Specified"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">College Name</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{profile.collegeName || "Not Specified"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Year / Sem</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.yearSemester || "Not Specified"}</p>
            </div>
          </div>
        </div>

        {/* 2. Past Academic Scores */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="size-4 text-amber-500" />
              Past Education Merit
            </h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
              {profile.tenthPercentage || profile.twelfthPercentage ? "Merit Active" : "Unspecified"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Class 10th Score</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.tenthPercentage || "Not Specified"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Class 12th / Diploma Score</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.twelfthPercentage || "Not Specified"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">10th-Merit Grant Match</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {profile.tenthPercentage ? "✓ MahaDBT / MahaJYOTI" : "Fill details"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">12th-Merit Grant Match</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {profile.twelfthPercentage ? "✓ NSP / Vidyasaarathi" : "Fill details"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Living Status & Accommodation */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="size-4 text-indigo-500" />
              Living & Accommodation Status
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full">
              {profile.livingType || "Day Scholar"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Accommodation Type</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.livingType || "Day Scholar at Home"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Monthly Living Cost</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {profile.monthlyLivingCost ? `₹${parseFloat(profile.monthlyLivingCost).toLocaleString("en-IN")}` : "None"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 font-medium">Hostel Grant Status</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {profile.livingType === "Hostel" || profile.livingType === "PG / Rented Accommodation"
                  ? "✓ Eligible for Dr. Punjabrao Deshmukh Hostel Allowance (₹30,000/yr)"
                  : "Day Scholar (Hostel allowance grants inactive)"}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Socio-Economic & Quotas */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              Socio-Economic & Quotas
            </h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
              {profile.category || profile.annualIncome ? "Profile Set" : "Unspecified"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Social Category</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.category || "Not Specified"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Annual Family Income</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {profile.annualIncome ? `₹${parseFloat(profile.annualIncome).toLocaleString("en-IN")}` : "Not Specified"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Domicile State</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.domicileState || "Not Specified"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Disability Status</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile.isDisability === "Yes" ? "Yes (PwD)" : "No (General)"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileOverview;
