"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Active" },
  { href: "/completed", label: "Completed" },
  { href: "/bookmarks", label: "Saved" },
  { href: "/create", label: "Create" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-[72px] px-4 sm:px-6 md:px-10 lg:px-14 flex items-center justify-between border-b border-[var(--border-primary)]">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-6 md:gap-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[var(--accent-blue)] flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-[2px] text-[var(--text-primary)]">
            VOTE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[var(--accent-blue)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Theme Toggle + Search + Mobile Menu */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Link
          href="/search"
          className="w-10 h-10 flex items-center justify-center border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
        >
          <Search size={18} className="text-[var(--text-secondary)]" />
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center border border-[var(--border-primary)]"
        >
          {isMobileMenuOpen ? (
            <X size={18} className="text-[var(--text-secondary)]" />
          ) : (
            <Menu size={18} className="text-[var(--text-secondary)]" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-[var(--bg-page)] border-b border-[var(--border-primary)] z-50 md:hidden">
          <nav className="flex flex-col py-2">
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
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[var(--accent-blue)] bg-[var(--bg-card)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
