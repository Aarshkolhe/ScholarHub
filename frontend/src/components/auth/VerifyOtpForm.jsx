import { useState, useRef, useEffect } from "react";
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import PrimaryButton from "./PrimaryButton";
import { verifyOtp, forgotPassword } from "../../services/authService";
import { useAuthCharacter } from "./AuthCharacterContext";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

const VerifyOtpForm = ({ email, onOtpVerified, onBackToForgot }) => {
  const { reactCorrect, reactWrong } = useAuthCharacter();
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpDigits];

    if (value.length <= 1) {
      newOtp[index] = value;
      setOtpDigits(newOtp);

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split("");
    const newOtp = Array(OTP_LENGTH).fill("");
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtpDigits(newOtp);

    const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    const fullOtp = otpDigits.join("");

    if (fullOtp.length < OTP_LENGTH) {
      setServerError("Please enter all 6 digits of the OTP code.");
      if (reactWrong) reactWrong();
      return;
    }

    setIsSubmitting(true);

    const result = await verifyOtp({ email, otp: fullOtp });

    setIsSubmitting(false);

    if (result.success) {
      if (reactCorrect) reactCorrect();
      setSuccessMsg("OTP verified successfully!");
      setTimeout(() => {
        onOtpVerified({
          email,
          otp: fullOtp,
          resetToken: result.data?.resetToken,
        });
      }, 500);
      return;
    }

    if (reactWrong) reactWrong();
    setServerError(result.message || "Invalid OTP code. Please check and try again.");
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setServerError("");
    setSuccessMsg("");
    setIsResending(true);

    const result = await forgotPassword({ email });

    setIsResending(false);

    if (result.success) {
      setSuccessMsg("A new OTP code has been sent to your email.");
      setResendTimer(RESEND_COOLDOWN);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } else {
      setServerError(result.message || "Failed to resend OTP. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
      aria-label="Verify OTP form"
    >
      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 animate-fade-in"
        >
          <FiAlertCircle className="shrink-0" size={16} />
          <span>{serverError}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 animate-fade-in"
        >
          <FiCheckCircle className="shrink-0" size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter the 6-digit code sent to
        </p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
          {email}
        </p>
      </div>

      {/* 6-Digit OTP Box Grid */}
      <div className="flex justify-center gap-2 py-2" onPaste={handlePaste}>
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-11 h-12 rounded-xl border text-center text-xl font-bold transition-all outline-none focus:ring-4 ${
              digit
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/40"
            }`}
          />
        ))}
      </div>

      <PrimaryButton
        type="submit"
        isLoading={isSubmitting}
        disabled={otpDigits.join("").length < OTP_LENGTH}
        className="mt-1"
      >
        Verify Code
      </PrimaryButton>

      <div className="flex flex-col items-center gap-2 pt-2 text-xs">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendTimer > 0 || isResending}
          className="inline-flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors"
        >
          <FiRefreshCw size={13} className={isResending ? "animate-spin" : ""} />
          {resendTimer > 0
            ? `Resend code in ${resendTimer}s`
            : "Resend Code"}
        </button>

        <button
          type="button"
          onClick={onBackToForgot}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mt-1"
        >
          <FiArrowLeft size={14} />
          Change email address
        </button>
      </div>
    </form>
  );
};

export default VerifyOtpForm;
