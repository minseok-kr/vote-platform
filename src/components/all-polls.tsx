"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, Check } from "lucide-react";
import type { PollWithOptions, PollCategory } from "@/types";
import { formatTimeLeft, formatVotes } from "@/lib/utils";

interface AllPollsProps {
  polls: PollWithOptions[];
}

type SortOption = "recent" | "popular" | "ending";

const CATEGORIES: { value: PollCategory | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "tech", label: "기술" },
  { value: "sports", label: "스포츠" },
  { value: "entertainment", label: "엔터테인먼트" },
  { value: "politics", label: "정치" },
  { value: "lifestyle", label: "라이프스타일" },
  { value: "business", label: "비즈니스" },
  { value: "other", label: "기타" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "ending", label: "마감임박" },
];

export function AllPolls({ polls }: AllPollsProps) {
  const [category, setCategory] = useState<PollCategory | "all">("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filteredAndSortedPolls = useMemo(() => {
    let result = [...polls];

    // Filter by category
    if (category !== "all") {
      result = result.filter((poll) => poll.category === category);
    }

    // Sort
    switch (sort) {
      case "popular":
        result.sort((a, b) => b.total_votes - a.total_votes);
        break;
      case "ending":
        result.sort(
          (a, b) =>
            new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
        );
        break;
      case "recent":
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return result;
  }, [polls, category, sort]);

  const selectedCategory = CATEGORIES.find((c) => c.value === category);
  const selectedSort = SORT_OPTIONS.find((s) => s.value === sort);

  if (polls.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl md:text-2xl font-medium text-[var(--text-primary)]">
            All Polls
          </h2>
        </div>
        <div className="p-8 text-center text-[var(--text-muted)] border border-[var(--border-primary)]">
          아직 진행 중인 투표가 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h2 className="font-display text-xl md:text-2xl font-medium text-[var(--text-primary)]">
          All Polls
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
            >
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {selectedCategory?.label}
              </span>
              <ChevronDown
                size={14}
                className={`text-[var(--text-muted)] transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isCategoryOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCategoryOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-lg z-50">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setCategory(cat.value);
                        setIsCategoryOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-active)] transition-colors"
                    >
                      {cat.label}
                      {category === cat.value && (
                        <Check size={14} className="text-[var(--accent-blue)]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsCategoryOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
            >
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {selectedSort?.label}
              </span>
              <ChevronDown
                size={14}
                className={`text-[var(--text-muted)] transition-transform ${isSortOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isSortOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSortOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-lg z-50">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value);
                        setIsSortOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-active)] transition-colors"
                    >
                      {opt.label}
                      {sort === opt.value && (
                        <Check size={14} className="text-[var(--accent-blue)]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[var(--border-primary)]">
        {/* Table Header - Hidden on mobile */}
        <div className="hidden md:flex items-center px-5 py-3.5 bg-[var(--bg-card)]">
          <span className="flex-1 text-[10px] font-semibold text-[var(--text-muted)] tracking-wider">
            QUESTION
          </span>
          <span className="w-[120px] text-right text-[10px] font-semibold text-[var(--text-muted)] tracking-wider">
            VOTES
          </span>
          <span className="w-[120px] text-right text-[10px] font-semibold text-[var(--text-muted)] tracking-wider">
            TIME LEFT
          </span>
        </div>

        {/* Results Count */}
        {filteredAndSortedPolls.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">
            해당 조건의 투표가 없습니다.
          </div>
        ) : (
          /* Table Rows */
          filteredAndSortedPolls.map((poll) => (
            <Link
              key={poll.id}
              href={`/polls/${poll.id}`}
              className="flex flex-col md:flex-row md:items-center px-4 md:px-5 py-4 border-t border-[var(--border-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
            >
              <span className="flex-1 text-sm font-medium text-[var(--text-primary)] mb-2 md:mb-0">
                {poll.question}
              </span>
              <div className="flex items-center justify-between md:justify-end gap-4">
                <span className="text-sm font-medium text-[var(--text-secondary)] md:w-[120px] md:text-right">
                  {formatVotes(poll.total_votes)}명
                </span>
                <span className="text-sm font-medium text-[var(--accent-blue)] md:w-[120px] md:text-right">
                  {formatTimeLeft(poll.expires_at)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
