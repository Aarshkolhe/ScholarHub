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

/**
 * Registration form with Full Name, Email, and Password.
 */
const RegisterForm = ({ defaultEmail = "", defaultName = "", onBackToLogin }) => {
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
    defaultValues: { email: defaultEmail, name: defaultName },
  });

  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    setIsSubmitting(true);

    const { confirmPassword, ...payload } = values;

    const result = await signUp(payload);

    setIsSubmitting(false);

    if (result.success) {
      reactCorrect();
      // Redirect to Step 2: Landing Page
      navigate("/landing", { replace: true });
      return;
    }

    reactWrong();
    setServerError(result.message);
  };

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
          className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 animate-fade-in"
        >
          <FiAlertCircle className="shrink-0" size={16} />
          <span>{serverError}</span>
        </div>
      )}

      <InputField
        label="Full Name"
        name="name"
        type="text"
        placeholder="Enter your name"
        error={errors.name?.message}
        registration={register("name", {
          required: "Name is required",
          minLength: {
            value: 2,
            message: "Name must be at least 2 characters",
          },
        })}
      />

      <InputField
        label="Email"
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

      <PasswordInput
        label="Password"
        name="password"
        error={errors.password?.message}
        registration={register("password", {
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
        })}
      />

      <PasswordInput
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Re-enter your password"
        error={errors.confirmPassword?.message}
        registration={register("confirmPassword", {
          required: "Please confirm your password",
          validate: (value) =>
            value === password || "Passwords do not match",
        })}
      />

      <div className="sticky bottom-0 -mx-1 mt-2 flex flex-col gap-2 bg-white dark:bg-slate-900 pb-1 pt-3 sm:flex-row-reverse">
        <PrimaryButton type="submit" isLoading={isSubmitting}>
          Register
        </PrimaryButton>

        <PrimaryButton
          type="button"
          variant="ghost"
          onClick={onBackToLogin}
          disabled={isSubmitting}
        >
          <FiArrowLeft size={15} />
          Back to Login
        </PrimaryButton>
      </div>
    </form>
  );
};

export default RegisterForm;