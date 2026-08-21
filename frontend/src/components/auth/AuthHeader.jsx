import { FiBookOpen } from "react-icons/fi";
import { Link } from "react-router-dom";

/**
 * Logo + heading block shown at the top of the auth card.
 * `title`/`subtitle` change between the Sign In and Register states.
 */
const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <Link to="/" className="mb-3 flex items-center gap-2 transition-transform hover:scale-105">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
          <FiBookOpen size={20} />
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Scholar<span className="text-blue-600 dark:text-blue-400">Hub</span>
        </span>
      </Link>

      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
        One Platform, Endless Opportunities
      </p>

      <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
};

export default AuthHeader;
