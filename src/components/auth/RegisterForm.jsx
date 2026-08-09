import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import InputField from "./InputField";
import PasswordInput from "./PasswordInput";
import PrimaryButton from "./PrimaryButton";
import useAuth from "../../hooks/useAuth";
import { useAuthCharacter } from "./AuthCharacterContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/; // 10-digit mobile number

const GENDER_OPTIONS = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const YEAR_OPTIONS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5+", label: "5th Year or above" },
];

const CATEGORY_OPTIONS = [
  { value: "General", label: "General" },
  { value: "OBC", label: "OBC" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "EWS", label: "EWS" },
  { value: "Minority", label: "Minority" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
].map((s) => ({ value: s, label: s }));

const ROLE_ROUTES = {
  Student: "/student/dashboard",
  Admin: "/admin/dashboard",
};

const SectionTitle = ({ children }) => (
  <p className="mb-3 mt-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
    {children}
  </p>
);

/**
 * Full registration form shown after login reports "User Not Found".
 * `defaultEmail` pre-fills the email the user already typed on the login step.
 */
const RegisterForm = ({ defaultEmail = "", onBackToLogin }) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { reactCorrect, reactWrong } = useAuthCharacter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: { email: defaultEmail },
  });

  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    setIsSubmitting(true);

    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...payload } = values;
    const result = await signUp(payload);

    setIsSubmitting(false);

    if (result.success) {
      reactCorrect();
      const role = result.data?.user?.role || "Student";
      navigate(ROLE_ROUTES[role] || "/", { replace: true });
      return;
    }

    reactWrong();
    setServerError(result.message);
  };

  // Fires when Register is clicked but client-side validation blocks the
  // submit (missing required field, passwords don't match, etc.).
  const onInvalid = () => {
    reactWrong();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1"
      aria-label="Registration form"
    >
      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 animate-fade-in"
        >
          <FiAlertCircle className="shrink-0" size={16} />
          <span>{serverError}</span>
        </div>
      )}

      {/* Personal Details */}
      <SectionTitle>Personal Details</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Full Name"
          name="fullName"
          placeholder="Jane Doe"
          error={errors.fullName?.message}
          className="sm:col-span-2"
          registration={register("fullName", { required: "Full name is required" })}
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          registration={register("email", {
            required: "Email is required",
            pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
          })}
        />

        <InputField
          label="Mobile Number"
          name="mobileNumber"
          type="tel"
          placeholder="9876543210"
          error={errors.mobileNumber?.message}
          registration={register("mobileNumber", {
            required: "Mobile number is required",
            pattern: { value: PHONE_PATTERN, message: "Enter a valid 10-digit mobile number" },
          })}
        />

        <PasswordInput
          label="Password"
          name="password"
          error={errors.password?.message}
          registration={register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />

        <InputField
          as="select"
          label="Gender"
          name="gender"
          placeholder="Select gender"
          options={GENDER_OPTIONS}
          error={errors.gender?.message}
          registration={register("gender", { required: "Gender is required" })}
        />

        <InputField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          error={errors.dateOfBirth?.message}
          registration={register("dateOfBirth", { required: "Date of birth is required" })}
        />
      </div>

      {/* Academic Details */}
      <SectionTitle>Academic Details</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="College Name"
          name="collegeName"
          placeholder="ABC Institute of Technology"
          error={errors.collegeName?.message}
          className="sm:col-span-2"
          registration={register("collegeName", { required: "College name is required" })}
        />

        <InputField
          label="Course"
          name="course"
          placeholder="B.Tech, B.Sc, MBA..."
          error={errors.course?.message}
          registration={register("course", { required: "Course is required" })}
        />

        <InputField
          label="Branch"
          name="branch"
          placeholder="Computer Science"
          error={errors.branch?.message}
          registration={register("branch", { required: "Branch is required" })}
        />

        <InputField
          as="select"
          label="Current Year"
          name="currentYear"
          placeholder="Select year"
          options={YEAR_OPTIONS}
          error={errors.currentYear?.message}
          registration={register("currentYear", { required: "Current year is required" })}
        />

        <InputField
          label="CGPA / Percentage"
          name="cgpaOrPercentage"
          placeholder="e.g. 8.5 or 85%"
          error={errors.cgpaOrPercentage?.message}
          registration={register("cgpaOrPercentage", {
            required: "CGPA or percentage is required",
          })}
        />
      </div>

      {/* Scholarship Details */}
      <SectionTitle>Scholarship Details</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          as="select"
          label="Category"
          name="category"
          placeholder="Select category"
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          registration={register("category", { required: "Category is required" })}
        />

        <InputField
          as="select"
          label="State"
          name="state"
          placeholder="Select state"
          options={INDIAN_STATES}
          error={errors.state?.message}
          registration={register("state", { required: "State is required" })}
        />

        <InputField
          label="Annual Family Income"
          name="annualFamilyIncome"
          type="number"
          placeholder="e.g. 250000"
          className="sm:col-span-2"
          error={errors.annualFamilyIncome?.message}
          registration={register("annualFamilyIncome", {
            required: "Annual family income is required",
            min: { value: 0, message: "Income cannot be negative" },
          })}
        />
      </div>

      <div className="sticky bottom-0 -mx-1 mt-2 flex flex-col gap-2 bg-white pb-1 pt-3 sm:flex-row-reverse">
        <PrimaryButton type="submit" isLoading={isSubmitting}>
          Register
        </PrimaryButton>
        <PrimaryButton type="button" variant="ghost" onClick={onBackToLogin} disabled={isSubmitting}>
          <FiArrowLeft size={15} />
          Back to Login
        </PrimaryButton>
      </div>
    </form>
  );
};

export default RegisterForm;
