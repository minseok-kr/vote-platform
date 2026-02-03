"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import type { PollWithOptions } from "@/types";
import { formatVotes } from "@/lib/utils";

interface CompletedPollsProps {
  polls: PollWithOptions[];
}

export function CompletedPolls({ polls }: CompletedPollsProps) {
  if (polls.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-[32px] font-medium text-[var(--text-primary)]">
          Completed Polls
        </h1>
        <div className="p-12 text-center border border-[var(--border-primary)]">
          <p className="text-[var(--text-muted)]">아직 종료된 투표가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[32px] font-medium text-[var(--text-primary)]">
          Completed Polls
        </h1>
        <span className="text-sm text-[var(--text-muted)]">
          총 {polls.length}개
        </span>
      </div>

      <div className="grid gap-4">
        {polls.map((poll) => {
          const winner = poll.options.reduce((prev, curr) =>
            curr.votes > prev.votes ? curr : prev
          );

          return (
            <Link
              key={poll.id}
              href={`/polls/${poll.id}`}
              className="p-6 bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">
                    {poll.question}
                  </h3>

                  {/* Winner */}
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={14} className="text-[var(--accent-gold)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {winner.text}
                    </span>
                    <span className="text-sm font-semibold text-[var(--accent-blue)]">
                      {winner.percentage}%
                    </span>
                  </div>

                  {/* Options mini bar */}
                  <div className="flex h-2 overflow-hidden bg-[var(--bg-active)]">
                    {poll.options.map((option, index) => (
                      <div
                        key={option.id}
                        className="h-full"
                        style={{
                          width: `${option.percentage}%`,
                          backgroundColor: `hsl(${220 - index * 20}, 80%, ${50 + index * 10}%)`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {formatVotes(poll.total_votes)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    총 투표
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
