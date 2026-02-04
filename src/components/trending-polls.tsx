"use client";

import Link from "next/link";
import { ChevronRight, Users, TrendingUp } from "lucide-react";
import type { PollWithOptions, PollCategory } from "@/types";
import { formatTimeLeft, formatVotes } from "@/lib/utils";

interface TrendingPollsProps {
  polls: PollWithOptions[];
}

const CATEGORY_STYLES: Record<
  PollCategory,
  { bg: string; text: string; label: string }
> = {
  tech: {
    bg: "var(--category-tech)",
    text: "var(--category-tech-text)",
    label: "기술",
  },
  sports: {
    bg: "var(--category-sports)",
    text: "var(--category-sports-text)",
    label: "스포츠",
  },
  entertainment: {
    bg: "var(--category-entertainment)",
    text: "var(--category-entertainment-text)",
    label: "엔터",
  },
  politics: {
    bg: "var(--category-politics)",
    text: "var(--category-politics-text)",
    label: "정치",
  },
  lifestyle: {
    bg: "var(--category-lifestyle)",
    text: "var(--category-lifestyle-text)",
    label: "라이프",
  },
  business: {
    bg: "var(--category-tech)",
    text: "var(--category-tech-text)",
    label: "비즈니스",
  },
  other: {
    bg: "var(--bg-muted)",
    text: "var(--text-secondary)",
    label: "기타",
  },
};

export function TrendingPolls({ polls }: TrendingPollsProps) {
  if (polls.length === 0) {
    return null;
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-[var(--accent-blue)]" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            인기 투표
          </h2>
        </div>
        <Link
          href="/polls"
          className="flex items-center gap-0.5 text-sm font-medium text-[var(--accent-blue)] hover:underline"
        >
          전체보기
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {polls.map((poll) => {
          const categoryStyle = CATEGORY_STYLES[poll.category] || CATEGORY_STYLES.other;

          return (
            <Link
              key={poll.id}
              href={`/polls/${poll.id}`}
              className="card-toss p-5 hover:shadow-[var(--shadow-md)] transition-all hover:-translate-y-1 cursor-pointer group"
            >
              {/* Category Badge */}
              <span
                className="inline-block px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-full)] mb-3"
                style={{
                  backgroundColor: categoryStyle.bg,
                  color: categoryStyle.text,
                }}
              >
                {categoryStyle.label}
              </span>

              {/* Question */}
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 line-clamp-2 group-hover:text-[var(--accent-blue)] transition-colors">
                {poll.question}
              </h3>

              {/* Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                  <Users size={14} />
                  <span className="text-xs font-medium">
                    {formatVotes(poll.total_votes)}명
                  </span>
                </div>
                <span className="text-xs font-medium text-[var(--text-tertiary)]">
                  {formatTimeLeft(poll.expires_at)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
