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

// Where each role lands after a successful sign in
const ROLE_ROUTES = {
  Student: "/student/dashboard",
  Admin: "/admin/dashboard",
};

/**
 * Sign-in form. On "User Not Found" it does NOT navigate — instead it calls
 * `onUserNotFound(email)` so the parent AuthPage can smoothly expand the
 * Registration form on the same page, pre-filling the email the user typed.
 */
const LoginForm = ({ onUserNotFound }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { reactCorrect, reactWrong } = useAuthCharacter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const onSubmit = async (values) => {
    setServerError("");
    setIsSubmitting(true);

    const result = await signIn(values);

    setIsSubmitting(false);

    if (result.success) {
      reactCorrect();
      const role = result.data?.user?.role;
      navigate(ROLE_ROUTES[role] || "/", { replace: true });
      return;
    }

    if (result.code === "USER_NOT_FOUND") {
      // Smoothly expand into registration instead of showing an error
      reactWrong();
      onUserNotFound(getValues("email"));
      return;
    }

    reactWrong();
    setServerError(result.message);
  };

  // Fires when the user hits Sign In but client-side validation (bad email
  // format, empty fields, etc.) blocks the submit — react before they even
  // reach the server.
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
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 animate-fade-in"
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
          pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
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

      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <PrimaryButton type="submit" isLoading={isSubmitting} className="mt-1">
        Sign In
      </PrimaryButton>

      <p className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-400">
        <FiMail size={13} />
        New here? Just enter your email and password — we'll set you up.
      </p>
    </form>
  );
};

export default LoginForm;
