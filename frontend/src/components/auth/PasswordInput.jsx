import { forwardRef, useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

/**
 * Password field with a visibility toggle and left lock icon.
 */
const PasswordInput = forwardRef(
  ({ label, name, placeholder = "Enter your password", error, registration = {}, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        <div className="relative">
          <FiLock
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            size={16}
          />

          <input
            id={name}
            name={name}
            ref={ref}
            type={visible ? "text" : "password"}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
            className={`w-full rounded-xl border bg-white dark:bg-slate-800 py-2.5 pl-10 pr-11 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500
              transition-all duration-200 ease-out outline-none
              focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500
              ${error ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/40" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
            {...registration}
            {...rest}
          />

          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={0}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus-visible:text-blue-600"
          >
            {visible ? <FiEyeOff size={17} /> : <FiEye size={17} />}
          </button>
        </div>

        {error && (
          <p id={`${name}-error`} role="alert" className="animate-fade-in text-xs font-medium text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
