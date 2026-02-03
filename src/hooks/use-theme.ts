"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "vote_theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
      return;
    }

    // Fall back to system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const systemTheme = prefersDark ? "dark" : "light";
    setThemeState(systemTheme);
    document.documentElement.setAttribute("data-theme", systemTheme);
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't set a preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const newTheme = e.matches ? "dark" : "light";
        setThemeState(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    if (typeof window === "undefined") return;

    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    mounted,
    isDark: theme === "dark",
  };
}
