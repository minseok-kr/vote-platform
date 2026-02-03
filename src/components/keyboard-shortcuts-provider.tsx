"use client";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";

export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <>
      {children}
      <KeyboardShortcutsHelp />
    </>
  );
}
