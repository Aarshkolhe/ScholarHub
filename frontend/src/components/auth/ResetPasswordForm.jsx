import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import PasswordInput from "./PasswordInput";
import PrimaryButton from "./PrimaryButton";
import { resetPassword } from "../../services/authService";
import { useAuthCharacter } from "./AuthCharacterContext";

const ResetPasswordForm = ({ email, otp, onPasswordResetComplete }) => {
  const { reactCorrect, reactWrong } = useAuthCharacter();
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMsg("");
    setIsSubmitting(true);

    const result = await resetPassword({
      email,
      otp,
      newPassword: values.newPassword,
    });

    setIsSubmitting(false);

    if (result.success) {
      if (reactCorrect) reactCorrect();
      setSuccessMsg("Your password has been successfully reset!");
      setTimeout(() => {
        onPasswordResetComplete();
      }, 1500);
      return;
    }

    if (reactWrong) reactWrong();
    setServerError(result.message || "Failed to reset password. Please try again.");
  };

  const onInvalid = () => {
    if (reactWrong) reactWrong();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="flex flex-col gap-4"
      aria-label="Reset password form"
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

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Choose a strong password containing at least 8 characters.
      </p>

      <PasswordInput
        label="New Password"
        name="newPassword"
        placeholder="••••••••"
        error={errors.newPassword?.message}
        registration={register("newPassword", {
          required: "New password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
          maxLength: {
            value: 128,
            message: "Password must not exceed 128 characters",
          },
        })}
      />

      <PasswordInput
        label="Confirm New Password"
        name="confirmPassword"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        registration={register("confirmPassword", {
          required: "Please confirm your new password",
          validate: (val) =>
            val === newPassword || "Passwords do not match",
        })}
      />

      <PrimaryButton
        type="submit"
        isLoading={isSubmitting}
        className="mt-1"
      >
        Update Password
      </PrimaryButton>
    </form>
  );
};

export default ResetPasswordForm;
