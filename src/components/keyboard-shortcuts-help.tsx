"use client";

import { useState, useEffect } from "react";
import { X, Keyboard } from "lucide-react";
import { getShortcutsList } from "@/hooks/use-keyboard-shortcuts";

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const shortcuts = getShortcutsList();

  useEffect(() => {
    const handleShowHelp = () => setIsOpen(true);

    window.addEventListener("show-shortcuts-help", handleShowHelp);
    return () => window.removeEventListener("show-shortcuts-help", handleShowHelp);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-2">
            <Keyboard size={20} className="text-[var(--accent-blue)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              키보드 단축키
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-[var(--text-secondary)]">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-mono bg-[var(--bg-active)] text-[var(--text-primary)] border border-[var(--border-primary)]">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-active)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            <kbd className="px-1 py-0.5 mx-1 bg-[var(--bg-card)] border border-[var(--border-primary)]">
              Esc
            </kbd>
            를 눌러 닫기
          </p>
        </div>
      </div>
    </div>
  );
}
