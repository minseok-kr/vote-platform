"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./use-theme";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const shortcuts: ShortcutConfig[] = [
    {
      key: "h",
      action: () => router.push("/"),
      description: "홈으로 이동",
    },
    {
      key: "c",
      action: () => router.push("/create"),
      description: "투표 생성",
    },
    {
      key: "s",
      action: () => router.push("/search"),
      description: "검색",
    },
    {
      key: "b",
      action: () => router.push("/bookmarks"),
      description: "저장된 투표",
    },
    {
      key: "d",
      action: () => toggleTheme(),
      description: "다크/라이트 모드 전환",
    },
    {
      key: "/",
      action: () => router.push("/search"),
      description: "검색 (빠른 접근)",
    },
    {
      key: "?",
      shift: true,
      action: () => {
        // Show keyboard shortcuts help
        const event = new CustomEvent("show-shortcuts-help");
        window.dispatchEvent(event);
      },
      description: "단축키 도움말",
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if typing in an input, textarea, or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        const keyMatch = event.key.toLowerCase() === s.key.toLowerCase();
        const ctrlMatch = s.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = s.shift ? event.shiftKey : !event.shiftKey;

        // Special case for "?" which requires shift
        if (s.key === "?") {
          return event.key === "?" && event.shiftKey;
        }

        return keyMatch && ctrlMatch && shiftMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}

export function getShortcutsList() {
  return [
    { key: "H", description: "홈으로 이동" },
    { key: "C", description: "투표 생성" },
    { key: "S", description: "검색" },
    { key: "B", description: "저장된 투표" },
    { key: "D", description: "다크/라이트 모드 전환" },
    { key: "/", description: "검색 (빠른 접근)" },
    { key: "?", description: "단축키 도움말" },
  ];
}
