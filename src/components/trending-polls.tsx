"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PollWithOptions } from "@/types";
import { formatTimeLeft, formatVotes } from "@/lib/utils";

interface TrendingPollsProps {
  polls: PollWithOptions[];
}

export function TrendingPolls({ polls }: TrendingPollsProps) {
  if (polls.length === 0) {
    return null;
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl font-medium text-[var(--text-primary)]">
          Trending Polls
        </h2>
        <Link
          href="/polls"
          className="flex items-center gap-1 text-[13px] font-medium text-[var(--accent-blue)]"
        >
          View All
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {polls.map((poll) => (
          <Link
            key={poll.id}
            href={`/polls/${poll.id}`}
            className="p-5 border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors cursor-pointer"
          >
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4 line-clamp-2">
              {poll.question}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                {formatVotes(poll.total_votes)}명 참여
              </span>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {formatTimeLeft(poll.expires_at)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
