"use client";

import Link from "next/link";
import { Clock, X, Trash2 } from "lucide-react";
import { useRecentPolls } from "@/hooks/use-recent-polls";

export function RecentPolls() {
  const { recentPolls, removeRecentPoll, clearRecentPolls } = useRecentPolls();

  if (recentPolls.length === 0) {
    return null;
  }

  return (
    <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-primary)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[var(--text-muted)]" />
          <h3 className="text-sm font-medium text-[var(--text-primary)]">
            최근 본 투표
          </h3>
        </div>
        <button
          onClick={clearRecentPolls}
          className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} />
          모두 삭제
        </button>
      </div>

      <div className="space-y-2">
        {recentPolls.slice(0, 5).map((poll) => (
          <div
            key={poll.id}
            className="flex items-center justify-between gap-2 group"
          >
            <Link
              href={`/polls/${poll.id}`}
              className="flex-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] line-clamp-1 transition-colors"
            >
              {poll.question}
            </Link>
            <button
              onClick={() => removeRecentPoll(poll.id)}
              className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
