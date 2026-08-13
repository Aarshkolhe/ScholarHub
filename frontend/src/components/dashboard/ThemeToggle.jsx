import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle({ className = "", showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative inline-flex items-center gap-2 rounded-full border p-1.5 transition-all duration-300 outline-none focus:ring-2 focus:ring-blue-500/20 ${
        isDark
          ? "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700 hover:border-slate-600"
          : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
      } ${className}`}
    >
      <div className="relative flex size-6 items-center justify-center">
        <Sun
          className={`absolute size-4 transition-all duration-300 ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        />
        <Moon
          className={`absolute size-4 transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-blue-400"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>

      {showLabel && (
        <span className="pr-2 text-xs font-semibold select-none">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
