"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, X, Loader2, Users, Clock } from "lucide-react";
import type { PollWithOptions, PollCategory } from "@/types";
import { formatTimeLeft, formatVotes } from "@/lib/utils";

const CATEGORY_STYLES: Record<
  PollCategory,
  { bg: string; text: string; label: string }
> = {
  tech: { bg: "var(--category-tech)", text: "var(--category-tech-text)", label: "기술" },
  sports: { bg: "var(--category-sports)", text: "var(--category-sports-text)", label: "스포츠" },
  entertainment: { bg: "var(--category-entertainment)", text: "var(--category-entertainment-text)", label: "엔터" },
  politics: { bg: "var(--category-politics)", text: "var(--category-politics-text)", label: "정치" },
  lifestyle: { bg: "var(--category-lifestyle)", text: "var(--category-lifestyle-text)", label: "라이프" },
  business: { bg: "var(--category-tech)", text: "var(--category-tech-text)", label: "비즈니스" },
  other: { bg: "var(--bg-muted)", text: "var(--text-secondary)", label: "기타" },
};

export function SearchPolls() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PollWithOptions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchPolls = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/polls/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPolls(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchPolls]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-[28px] font-bold text-[var(--text-primary)]">
        투표 검색
      </h1>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요 (최소 2글자)"
          autoFocus
          className="w-full pl-12 pr-12 py-4 bg-[var(--bg-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] text-[var(--text-primary)] text-base placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="animate-spin text-[var(--accent-blue)]" />
        </div>
      )}

      {/* Results */}
      {!isLoading && hasSearched && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--text-tertiary)]">
            {results.length > 0
              ? `${results.length}개의 결과`
              : "검색 결과가 없습니다."}
          </p>

          <div className="space-y-3">
            {results.map((poll) => {
              const categoryStyle = CATEGORY_STYLES[poll.category as PollCategory] || CATEGORY_STYLES.other;

              return (
                <Link
                  key={poll.id}
                  href={`/polls/${poll.id}`}
                  className="block card-toss p-5 hover:shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-full)] ${
                        poll.status === "active"
                          ? "bg-[var(--accent-blue-light)] text-[var(--accent-blue)]"
                          : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
                      }`}
                    >
                      {poll.status === "active" ? "진행중" : "종료"}
                    </span>
                    <span
                      className="px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-full)]"
                      style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}
                    >
                      {categoryStyle.label}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">
                    {poll.question}
                  </h3>

                  <div className="flex items-center gap-4 text-[var(--text-tertiary)]">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span className="text-sm">
                        {formatVotes(poll.total_votes)}명
                      </span>
                    </div>
                    {poll.status === "active" && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span className="text-sm">
                          {formatTimeLeft(poll.expires_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!isLoading && !hasSearched && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-muted)] flex items-center justify-center">
            <Search size={28} className="text-[var(--text-muted)]" />
          </div>
          <p className="text-[var(--text-tertiary)]">
            검색어를 입력하여 투표를 찾아보세요.
          </p>
        </div>
      )}
    </div>
  );
}
