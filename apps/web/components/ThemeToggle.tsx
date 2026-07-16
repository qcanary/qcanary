"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  /** Show label text alongside icon */
  showLabel?: boolean;
};

/**
 * ThemeToggle — switches between dark, light, and system theme.
 * Features:
 * - Smooth rotation animation on switch
 * - Respects system preference via next-themes
 * - Minimal footprint, no framer-motion needed
 */
export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <div className={cn("h-9 w-9 rounded-xl bg-surface border border-border", className)} />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    // Cycle: dark → light → dark (skip system for simplicity)
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition-all duration-200 hover:border-accent/30 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        showLabel ? "" : "h-9 w-9 justify-center p-0",
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun / Moon icons with rotation transition */}
      <span className="relative inline-block h-4 w-4">
        {/* Sun icon */}
        <svg
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-500",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        {/* Moon icon */}
        <svg
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-500",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </span>

      {showLabel && (
        <span className="text-xs">{isDark ? "Light" : "Dark"} mode</span>
      )}
    </button>
  );
}
