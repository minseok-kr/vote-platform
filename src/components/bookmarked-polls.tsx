"use client";

import { useBookmarks } from "@/hooks/use-bookmarks";
import { Bookmark, X, ExternalLink } from "lucide-react";
import Link from "next/link";

export function BookmarkedPolls() {
  const { bookmarks, removeBookmark } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
        <h2 className="text-xl font-medium text-[var(--text-primary)] mb-2">
          저장된 투표가 없습니다
        </h2>
        <p className="text-[var(--text-secondary)]">
          관심 있는 투표를 북마크하면 여기에 표시됩니다
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-2 bg-[var(--accent-blue)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          투표 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">
          저장된 투표 ({bookmarks.length})
        </h2>
      </div>

      <div className="divide-y divide-[var(--border-primary)]">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="flex items-center justify-between py-4 group"
          >
            <div className="flex-1 min-w-0">
              <Link
                href={`/polls/${bookmark.id}`}
                className="flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
              >
                <span className="truncate">{bookmark.question}</span>
                <ExternalLink size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {formatDate(bookmark.bookmarkedAt)}에 저장됨
              </p>
            </div>

            <button
              onClick={() => removeBookmark(bookmark.id)}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="북마크 제거"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
