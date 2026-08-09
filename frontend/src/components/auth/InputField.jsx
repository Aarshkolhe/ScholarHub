import { forwardRef } from "react";

/**
 * Generic labeled input with built-in error display and focus animation.
 * Works for text, email, tel, number, date, and select (via `as="select"`).
 */
const InputField = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      placeholder,
      error,
      as = "input",
      options = [],
      registration = {},
      className = "",
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 " +
      "transition-all duration-200 ease-out outline-none " +
      "focus:ring-4 focus:ring-blue-100 focus:border-blue-500 " +
      (error
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 hover:border-slate-300");

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={name}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}

        {as === "select" ? (
          <select
            id={name}
            name={name}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
            className={`${baseClasses} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%2394a3b8"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>')] bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
            {...registration}
            {...rest}
          >
            <option value="" disabled>
              {placeholder || "Select an option"}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            ref={ref}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
            className={baseClasses}
            {...registration}
            {...rest}
          />
        )}

        {error && (
          <p
            id={`${name}-error`}
            role="alert"
            className="animate-fade-in text-xs font-medium text-red-500"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
