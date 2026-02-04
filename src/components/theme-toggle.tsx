"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)]"
        aria-label="테마 변경"
      >
        <div className="w-[18px] h-[18px]" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)] hover:bg-[var(--bg-active)] transition-colors"
      aria-label={theme === "light" ? "다크 모드로 변경" : "라이트 모드로 변경"}
      title={theme === "light" ? "다크 모드" : "라이트 모드"}
    >
      {theme === "light" ? (
        <Moon size={18} className="text-[var(--text-secondary)]" />
      ) : (
        <Sun size={18} className="text-[var(--text-secondary)]" />
      )}
    </button>
  );
}
