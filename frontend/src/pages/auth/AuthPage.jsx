import { useState } from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/AuthHeader";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";

/**
 * Single authentication page.
 *
 * Starts in login mode.
 * Users can switch to registration using the Sign Up button.
 *
 * Profile and scholarship information will be collected later
 * from the user's dashboard/profile page.
 */
const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [prefillEmail, setPrefillEmail] = useState("");

  const handleRegister = () => {
    setMode("register");
  };

  const handleBackToLogin = () => {
    setMode("login");
  };

  const isRegister = mode === "register";

  return (
    <AuthLayout>
      <div
        className={`w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60 transition-all duration-500 ease-out sm:p-8 ${
          isRegister ? "max-w-xl" : "max-w-md"
        }`}
      >
        <AuthHeader
          title={
            isRegister
              ? "Create your account"
              : "Welcome back"
          }
          subtitle={
            isRegister
              ? "Create your ScholarHub account to get started."
              : "Sign in to continue to your dashboard"
          }
        />

        <div
          key={mode}
          className="animate-fade-in-up"
        >
          {isRegister ? (
            <RegisterForm
              defaultEmail={prefillEmail}
              onBackToLogin={handleBackToLogin}
            />
          ) : (
            <LoginForm
              onRegister={handleRegister}
            />
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthPage;