import { useState } from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/AuthHeader";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import VerifyOtpForm from "../../components/auth/VerifyOtpForm";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

/**
 * Single authentication page with multi-step flows:
 * - Login & Registration
 * - Password Reset (Forgot Password -> Verify OTP -> Reset Password)
 */
const AuthPage = () => {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot" | "verify" | "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleRegister = () => {
    setMode("register");
  };

  const handleBackToLogin = () => {
    setMode("login");
  };

  const handleForgotPassword = () => {
    setMode("forgot");
  };

  const handleOtpSent = (sentEmail) => {
    setEmail(sentEmail);
    setMode("verify");
  };

  const handleOtpVerified = ({ email: verifiedEmail, otp: verifiedOtp }) => {
    setEmail(verifiedEmail);
    setOtp(verifiedOtp);
    setMode("reset");
  };

  const handlePasswordResetComplete = () => {
    setMode("login");
  };

  const getHeaderInfo = () => {
    switch (mode) {
      case "register":
        return {
          title: "Create your account",
          subtitle: "Create your ScholarHub account to get started.",
        };
      case "forgot":
        return {
          title: "Reset your password",
          subtitle: "We'll send an OTP code to your registered email.",
        };
      case "verify":
        return {
          title: "Verify OTP code",
          subtitle: "Enter the 6-digit verification code sent to your email.",
        };
      case "reset":
        return {
          title: "Set new password",
          subtitle: "Choose a strong new password for your account.",
        };
      case "login":
      default:
        return {
          title: "Welcome back",
          subtitle: "Sign in to continue to your dashboard",
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const isRegister = mode === "register";

  return (
    <AuthLayout>
      <div
        className={`w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60 transition-all duration-500 ease-out sm:p-8 ${
          isRegister ? "max-w-xl" : "max-w-md"
        }`}
      >
        <AuthHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
        />

        <div key={mode} className="animate-fade-in-up">
          {mode === "login" && (
            <LoginForm
              onRegister={handleRegister}
              onForgotPassword={handleForgotPassword}
            />
          )}

          {mode === "register" && (
            <RegisterForm
              defaultEmail={email}
              onBackToLogin={handleBackToLogin}
            />
          )}

          {mode === "forgot" && (
            <ForgotPasswordForm
              defaultEmail={email}
              onOtpSent={handleOtpSent}
              onBackToLogin={handleBackToLogin}
            />
          )}

          {mode === "verify" && (
            <VerifyOtpForm
              email={email}
              onOtpVerified={handleOtpVerified}
              onBackToForgot={() => setMode("forgot")}
            />
          )}

          {mode === "reset" && (
            <ResetPasswordForm
              email={email}
              otp={otp}
              onPasswordResetComplete={handlePasswordResetComplete}
            />
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthPage;