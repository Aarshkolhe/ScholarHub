import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiTarget, FiZap, FiCheckCircle, FiBell } from "react-icons/fi";
import AuthCharacter from "./AuthCharacter";
import { AuthCharacterContext } from "./AuthCharacterContext";
import ThemeToggle from "../dashboard/ThemeToggle";

const FEATURES = [
  { icon: FiTarget, label: "Personalized Scholarship Recommendations" },
  { icon: FiZap, label: "AI Assistant" },
  { icon: FiCheckCircle, label: "Eligibility Checker" },
  { icon: FiBell, label: "Deadline Notifications" },
];

/**
 * Full-page split layout used by AuthPage.
 * Left: mascot + feature highlights (desktop only).
 * Right: the auth card passed in as `children`.
 */
const AuthLayout = ({ children }) => {
  const characterRef = useRef(null);

  const characterApi = {
    reactCorrect: () => characterRef.current?.reactCorrect(),
    reactWrong: () => characterRef.current?.reactWrong(),
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top right theme toggle for mobile/desktop auth view */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left panel — hidden on mobile */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 dark:from-blue-900 dark:via-blue-900 dark:to-slate-900 p-12 text-white lg:flex">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold transition-transform hover:scale-105">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              🎓
            </span>
            ScholarHub
          </Link>
          <p className="mt-2 text-slate-200">One Platform, Endless Opportunities</p>
        </div>

        {/* Mascot */}
        <div className="relative z-10 flex flex-1 items-center justify-center py-10">
          <AuthCharacter ref={characterRef} />
        </div>

        {/* Feature highlights */}
        <ul className="relative z-10 space-y-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur transition-transform duration-200 hover:translate-x-1 hover:bg-white/15"
            >
              <Icon size={18} className="shrink-0 text-white" />
              <span className="text-sm font-medium text-slate-100">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel — the auth card */}
      <div className="flex w-full flex-1 items-center justify-center p-4 sm:p-8 lg:w-1/2">
        <AuthCharacterContext.Provider value={characterApi}>{children}</AuthCharacterContext.Provider>
      </div>
    </div>
  );
};

export default AuthLayout;
