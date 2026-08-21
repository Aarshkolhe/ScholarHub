import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiMail } from "react-icons/fi";
import InputField from "./InputField";
import PasswordInput from "./PasswordInput";
import PrimaryButton from "./PrimaryButton";
import useAuth from "../../hooks/useAuth";
import { useAuthCharacter } from "./AuthCharacterContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginForm = ({ defaultEmail = "", onRegister, onForgotPassword }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { reactCorrect, reactWrong } = useAuthCharacter();

  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: { email: defaultEmail },
  });

  const onSubmit = async (values) => {
    setServerError("");
    setIsSubmitting(true);

    const result = await signIn(values);

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
      className="flex flex-col gap-4"
      aria-label="Sign in form"
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 transition-colors hover:text-blue-700 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <PrimaryButton
        type="submit"
        isLoading={isSubmitting}
        className="mt-1"
      >
        Sign In
      </PrimaryButton>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs text-slate-400 dark:text-slate-500">
          OR
        </span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <p className="flex items-center justify-center gap-1 text-xs text-slate-400 dark:text-slate-500">
        <FiMail size={13} />
        Don't have an account?
      </p>

      <PrimaryButton
        type="button"
        variant="ghost"
        onClick={onRegister}
        disabled={isSubmitting}
      >
        Sign Up
      </PrimaryButton>
    </form>
  );
};

export default LoginForm;