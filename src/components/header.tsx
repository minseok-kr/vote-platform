"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Plus } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "진행중" },
  { href: "/completed", label: "완료됨" },
  { href: "/bookmarks", label: "저장됨" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-card)] shadow-[var(--shadow-sm)]">
      <div className="h-[64px] px-4 sm:px-6 md:px-10 lg:px-14 flex items-center justify-between">
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-6 md:gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--accent-blue)] rounded-[var(--radius-sm)] flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              Vote
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-all ${
                    isActive
                      ? "text-[var(--accent-blue)] bg-[var(--accent-blue-light)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Create Button + Theme Toggle + Search + Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Create Button - Desktop */}
          <Link
            href="/create"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-blue)] text-white text-sm font-semibold rounded-[var(--radius-md)] shadow-[var(--shadow-button)] hover:shadow-[0_6px_20px_rgba(49,130,246,0.32)] transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} />
            <span>투표 만들기</span>
          </Link>

          <ThemeToggle />

          <Link
            href="/search"
            className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)] hover:bg-[var(--bg-active)] transition-colors"
          >
            <Search size={18} className="text-[var(--text-secondary)]" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-muted)]"
          >
            {isMobileMenuOpen ? (
              <X size={18} className="text-[var(--text-secondary)]" />
            ) : (
              <Menu size={18} className="text-[var(--text-secondary)]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute top-[64px] left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-primary)] shadow-[var(--shadow-lg)] z-50 md:hidden">
          <nav className="flex flex-col p-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-[var(--radius-sm)] transition-colors ${
                    isActive
                      ? "text-[var(--accent-blue)] bg-[var(--accent-blue-light)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Mobile Create Button */}
            <Link
              href="/create"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mx-2 mt-2 flex items-center justify-center gap-1.5 px-4 py-3 bg-[var(--accent-blue)] text-white text-sm font-semibold rounded-[var(--radius-md)]"
            >
              <Plus size={16} />
              <span>투표 만들기</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
