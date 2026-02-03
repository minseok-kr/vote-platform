"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";
import type { PollWithOptions } from "@/types";
import { formatTimeLeft, formatVotes } from "@/lib/utils";

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
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-[32px] font-medium text-[var(--text-primary)]">
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
          className="w-full pl-12 pr-12 py-4 bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-base placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--accent-blue)]" />
        </div>
      )}

      {/* Results */}
      {!isLoading && hasSearched && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            {results.length > 0
              ? `${results.length}개의 결과`
              : "검색 결과가 없습니다."}
          </p>

          {results.map((poll) => (
            <Link
              key={poll.id}
              href={`/polls/${poll.id}`}
              className="block p-5 bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold tracking-wider ${
                    poll.status === "active"
                      ? "bg-[var(--accent-blue)] text-white"
                      : "bg-[var(--text-muted)] text-white"
                  }`}
                >
                  {poll.status === "active" ? "진행중" : "종료"}
                </span>
                <span className="text-xs text-[var(--text-muted)] capitalize">
                  {poll.category}
                </span>
              </div>

              <h3 className="text-base font-medium text-[var(--text-primary)] mb-3">
                {poll.question}
              </h3>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">
                  {formatVotes(poll.total_votes)}명 참여
                </span>
                {poll.status === "active" && (
                  <span className="text-[var(--accent-blue)]">
                    {formatTimeLeft(poll.expires_at)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Initial State */}
      {!isLoading && !hasSearched && (
        <div className="py-12 text-center text-[var(--text-muted)]">
          검색어를 입력하여 투표를 찾아보세요.
        </div>
      )}
    </div>
  );
}
