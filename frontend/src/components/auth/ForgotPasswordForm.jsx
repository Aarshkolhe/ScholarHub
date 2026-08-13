import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiAlertCircle, FiArrowLeft, FiMail } from "react-icons/fi";
import InputField from "./InputField";
import PrimaryButton from "./PrimaryButton";
import { forgotPassword } from "../../services/authService";
import { useAuthCharacter } from "./AuthCharacterContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordForm = ({ defaultEmail = "", onOtpSent, onBackToLogin }) => {
  const { reactCorrect, reactWrong } = useAuthCharacter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      email: defaultEmail,
    },
  });

  const onSubmit = async (values) => {
    setServerError("");
    setIsSubmitting(true);

    const result = await forgotPassword({ email: values.email });

    setIsSubmitting(false);

    if (result.success) {
      if (reactCorrect) reactCorrect();
      onOtpSent(values.email);
      return;
    }

    if (reactWrong) reactWrong();
    setServerError(result.message || "Failed to send reset code. Please try again.");
  };

  const onInvalid = () => {
    if (reactWrong) reactWrong();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="flex flex-col gap-4"
      aria-label="Forgot password form"
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

      <p className="text-xs leading-relaxed text-slate-500">
        Enter your registered email address below and we'll send you a 6-digit OTP to reset your password.
      </p>

      <InputField
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        registration={register("email", {
          required: "Email is required",
          pattern: {
            value: EMAIL_PATTERN,
            message: "Enter a valid email address",
          },
        })}
      />

      <PrimaryButton
        type="submit"
        isLoading={isSubmitting}
        className="mt-1"
      >
        Send Reset Code
      </PrimaryButton>

      <div className="flex items-center justify-center pt-2">
        <button
          type="button"
          onClick={onBackToLogin}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <FiArrowLeft size={14} />
          Back to Sign In
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
