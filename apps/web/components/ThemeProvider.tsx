"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
  /** Attribute to set the theme on. Defaults to "class" */
  attribute?: "class" | "data-theme";
  /** Default theme. Defaults to "dark" */
  defaultTheme?: string;
  /** Enable system preference detection. Defaults to true */
  enableSystem?: boolean;
  /** Disable transition flash on theme switch */
  disableTransitionOnChange?: boolean;
};

/**
 * ThemeProvider wraps the app with next-themes for dark/light mode support.
 * Uses class-based theming so Tailwind's `dark:` variant works seamlessly.
 * Prevents transition flicker by disabling CSS transitions during theme change.
 */
export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "dark",
  enableSystem = true,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  // The beforeInteractive theme script in layout.tsx already prevents flash.
  // No mounted guard needed — next-themes handles hydration safely.
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * useTheme — re-exported for convenience
 * Usage: const { theme, setTheme } = useTheme()
 * setTheme("dark") | setTheme("light") | setTheme("system")
 */
export { useTheme } from "next-themes";
