import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { cn } from "../../lib/utils";
import { useTheme } from "../../context/ThemeContext";

/**
 * Build a collapsed polygon string where all vertices converge on one point.
 */
function polygonCollapsed(point, vertexCount) {
  const pairs = Array.from({ length: vertexCount }, () => point).join(", ");
  return `polygon(${pairs})`;
}

/**
 * Compute [collapsed, expanded] clip-path strings for View Transitions.
 * All coordinates are percentages so they work on fractional display scales.
 */
function getThemeTransitionClipPaths(
  variant,
  cx,
  cy,
  maxRadius,
  viewportWidth,
  viewportHeight
) {
  const toX = (x) => `${(x / viewportWidth) * 100}%`;
  const toY = (y) => `${(y / viewportHeight) * 100}%`;
  const point = (x, y) => `${toX(x)} ${toY(y)}`;
  const toRadius = (r) =>
    `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;

  switch (variant) {
    case "circle":
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
    case "square": {
      const halfW = Math.max(cx, viewportWidth - cx);
      const halfH = Math.max(cy, viewportHeight - cy);
      const halfSide = Math.max(halfW, halfH) * 1.05;
      const end = [
        point(cx - halfSide, cy - halfSide),
        point(cx + halfSide, cy - halfSide),
        point(cx + halfSide, cy + halfSide),
        point(cx - halfSide, cy + halfSide),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case "diamond": {
      const R = maxRadius * Math.SQRT2;
      const end = [
        point(cx, cy - R),
        point(cx + R, cy),
        point(cx, cy + R),
        point(cx - R, cy),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case "hexagon": {
      const R = maxRadius * Math.SQRT2;
      const verts = [];
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        verts.push(point(cx + R * Math.cos(a), cy + R * Math.sin(a)));
      }
      return [
        polygonCollapsed(point(cx, cy), 6),
        `polygon(${verts.join(", ")})`,
      ];
    }
    case "star": {
      const R = maxRadius * Math.SQRT2 * 1.03;
      const innerRatio = 0.42;
      const starPolygon = (radius) => {
        const verts = [];
        for (let i = 0; i < 5; i++) {
          const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          verts.push(
            point(cx + radius * Math.cos(outerA), cy + radius * Math.sin(outerA))
          );
          const innerA = outerA + Math.PI / 5;
          verts.push(
            point(
              cx + radius * innerRatio * Math.cos(innerA),
              cy + radius * innerRatio * Math.sin(innerA)
            )
          );
        }
        return `polygon(${verts.join(", ")})`;
      };
      const startR = Math.max(2, R * 0.025);
      return [starPolygon(startR), starPolygon(R)];
    }
    default:
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
  }
}

/**
 * Animated theme toggler that uses the View Transitions API
 * to reveal the new theme with a clip-path animation radiating
 * from the toggle button (circle reveal by default).
 *
 * Falls back to an instant toggle in browsers without View Transitions support.
 */
export function ThemeToggle({
  className = "",
  showLabel = false,
  duration = 500,
  variant = "circle",
  fromCenter = false,
}) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const buttonRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const activeAnimRef = useRef(null);

  const cancelAnim = useCallback(() => {
    activeAnimRef.current?.cancel();
    activeAnimRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnim();
      const root = document.documentElement;
      if (root.dataset.themeVt !== "active") return;
      delete root.dataset.themeVt;
      root.style.removeProperty("--theme-toggle-vt-duration");
      root.style.removeProperty("--theme-vt-clip-from");
    };
  }, [cancelAnim]);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (
      !button ||
      isTransitioningRef.current ||
      document.documentElement.dataset.themeVt === "active"
    )
      return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x, y;
    if (fromCenter) {
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    } else {
      const { top, left, width, height } = button.getBoundingClientRect();
      x = left + width / 2;
      y = top + height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const newTheme = isDark ? "light" : "dark";

    const applyTheme = () => {
      // Toggle the dark class synchronously so the View Transitions API
      // snapshots the new theme inside the startViewTransition callback.
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      setTheme(newTheme);
    };

    // Fallback: instant toggle if browser doesn't support View Transitions
    if (typeof document.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    const clipPath = getThemeTransitionClipPaths(
      variant,
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight
    );

    const root = document.documentElement;
    root.dataset.themeVt = "active";
    root.style.setProperty("--theme-toggle-vt-duration", `${duration}ms`);
    // Pin the collapsed clip-path via CSS so Firefox does not paint the new
    // theme unclipped between snapshot and the ready.then() JS animation.
    root.style.setProperty("--theme-vt-clip-from", clipPath[0]);

    const cleanup = () => {
      isTransitioningRef.current = false;
      delete root.dataset.themeVt;
      root.style.removeProperty("--theme-toggle-vt-duration");
      root.style.removeProperty("--theme-vt-clip-from");
      cancelAnim();
    };

    isTransitioningRef.current = true;

    const transition = document.startViewTransition(() => {
      flushSync(applyTheme);
    });

    if (typeof transition?.finished?.finally === "function") {
      transition.finished.finally(cleanup).catch(() => {});
    } else {
      cleanup();
    }

    const ready = transition?.ready;
    if (ready && typeof ready.then === "function") {
      ready
        .then(() => {
          const anim = document.documentElement.animate(
            { clipPath },
            {
              duration,
              easing: variant === "star" ? "linear" : "ease-in-out",
              fill: "forwards",
              pseudoElement: "::view-transition-new(root)",
            }
          );
          activeAnimRef.current = anim;
        })
        .catch(() => {});
    }
  }, [variant, fromCenter, duration, isDark, setTheme, cancelAnim]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-2xl border p-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
        isDark
          ? "border-slate-800/80 bg-slate-900/90 text-amber-300 hover:bg-slate-800 hover:border-slate-700 shadow-sm"
          : "border-slate-200/80 bg-white/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm",
        className
      )}
    >
      <div className="relative flex size-5 items-center justify-center">
        <Sun
          className={`absolute size-4 transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-amber-400"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`absolute size-4 transition-all duration-300 ${
            isDark
              ? "-rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-violet-500"
          }`}
        />
      </div>

      {showLabel && (
        <span className="pr-1 text-xs font-semibold select-none">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
