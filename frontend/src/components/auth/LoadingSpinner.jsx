const SIZE_MAP = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
};

/**
 * Simple accessible spinner. Pass `light` when placed on a dark/blue button.
 */
const LoadingSpinner = ({ size = "md", light = false }) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full ${SIZE_MAP[size]} ${
        light
          ? "border-white/40 border-t-white"
          : "border-blue-200 border-t-blue-600"
      }`}
    />
  );
};

export default LoadingSpinner;
