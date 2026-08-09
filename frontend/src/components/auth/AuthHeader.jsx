import { FiBookOpen } from "react-icons/fi";

/**
 * Logo + heading block shown at the top of the auth card.
 * `title`/`subtitle` change between the Sign In and Register states.
 */
const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
          <FiBookOpen size={20} />
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          Scholar<span className="text-blue-600">Hub</span>
        </span>
      </div>

      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-blue-500">
        One Platform, Endless Opportunities
      </p>

      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
};

export default AuthHeader;
