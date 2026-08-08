import { FiTarget, FiZap, FiCheckCircle, FiBell } from "react-icons/fi";

const FEATURES = [
  { icon: FiTarget, label: "Personalized Scholarship Recommendations" },
  { icon: FiZap, label: "AI Assistant" },
  { icon: FiCheckCircle, label: "Eligibility Checker" },
  { icon: FiBell, label: "Deadline Notifications" },
];

/**
 * Full-page split layout used by AuthPage.
 * Left: education/scholarship illustration + feature highlights (desktop only).
 * Right: the auth card passed in as `children`.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left panel — hidden on mobile */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 p-12 text-white lg:flex">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              🎓
            </span>
            ScholarHub
          </div>
          <p className="mt-2 text-blue-100">One Platform, Endless Opportunities</p>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex flex-1 items-center justify-center py-10">
          <svg
            viewBox="0 0 400 300"
            className="w-full max-w-sm drop-shadow-2xl"
            role="img"
            aria-label="Illustration of a student receiving a scholarship"
          >
            <ellipse cx="200" cy="270" rx="150" ry="14" fill="rgba(0,0,0,0.12)" />
            <rect x="70" y="90" width="120" height="150" rx="10" fill="#ffffff" opacity="0.95" />
            <rect x="90" y="110" width="80" height="8" rx="4" fill="#93c5fd" />
            <rect x="90" y="130" width="60" height="8" rx="4" fill="#bfdbfe" />
            <rect x="90" y="150" width="70" height="8" rx="4" fill="#bfdbfe" />
            <circle cx="290" cy="150" r="70" fill="#ffffff" opacity="0.12" />
            <g transform="translate(210,120)">
              <circle cx="40" cy="20" r="20" fill="#fde68a" />
              <rect x="18" y="42" width="44" height="55" rx="12" fill="#ffffff" />
              <rect x="10" y="8" width="60" height="10" fill="#1d4ed8" />
              <polygon points="10,8 40,-6 70,8" fill="#1e40af" />
              <line x1="70" y1="8" x2="70" y2="34" stroke="#1e40af" strokeWidth="2" />
              <circle cx="70" cy="36" r="3" fill="#fbbf24" />
            </g>
            <g transform="translate(120,60)" opacity="0.9">
              <path d="M0 10 L30 0 L60 10 L30 20 Z" fill="#fbbf24" />
              <rect x="27" y="10" width="6" height="18" fill="#1d4ed8" />
            </g>
          </svg>
        </div>

        {/* Feature highlights */}
        <ul className="relative z-10 space-y-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur transition-transform duration-200 hover:translate-x-1 hover:bg-white/15"
            >
              <Icon size={18} className="shrink-0 text-white" />
              <span className="text-sm font-medium text-blue-50">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel — the auth card */}
      <div className="flex w-full flex-1 items-center justify-center p-4 sm:p-8 lg:w-1/2">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
