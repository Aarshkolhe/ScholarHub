import { useState } from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/AuthHeader";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";

/**
 * Single authentication page.
 * Starts in "login" mode. If the backend reports "User Not Found",
 * it transitions in place to "register" mode — no route change.
 */
const AuthPage = () => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [prefillEmail, setPrefillEmail] = useState("");

  const handleUserNotFound = (email) => {
    setPrefillEmail(email);
    setMode("register");
  };

  const handleBackToLogin = () => {
    setMode("login");
  };

  const isRegister = mode === "register";

  return (
    <AuthLayout>
      <div
        className={`w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60 transition-all duration-500 ease-out sm:p-8
          ${isRegister ? "max-w-xl" : "max-w-md"}`}
      >
        <AuthHeader
          title={isRegister ? "Create your account" : "Welcome back"}
          subtitle={
            isRegister
              ? "We couldn't find an account — let's set one up for you."
              : "Sign in to continue to your dashboard"
          }
        />

        {/* Cross-fade between the two form states */}
        <div key={mode} className="animate-fade-in-up">
          {isRegister ? (
            <RegisterForm defaultEmail={prefillEmail} onBackToLogin={handleBackToLogin} />
          ) : (
            <LoginForm onUserNotFound={handleUserNotFound} />
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthPage;
