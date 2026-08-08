import LoadingSpinner from "./LoadingSpinner";

/**
 * Primary call-to-action button used across the auth flow.
 * `variant="solid"` (default) is the blue filled button.
 * `variant="ghost"` is used for secondary actions like "Back to Login".
 */
const PrimaryButton = ({
  children,
  type = "button",
  onClick,
  isLoading = false,
  disabled = false,
  variant = "solid",
  className = "",
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const base =
    "relative flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold " +
    "transition-all duration-200 ease-out focus:outline-none focus-visible:ring-4 active:scale-[0.98]";

  const variants = {
    solid:
      "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 focus-visible:ring-blue-200 disabled:opacity-60 disabled:hover:bg-blue-600 disabled:active:scale-100",
    ghost:
      "bg-transparent text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-100 disabled:opacity-60",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {isLoading && <LoadingSpinner size="sm" light={variant === "solid"} />}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;
