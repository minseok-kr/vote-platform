"use client";

import { Bookmark } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";

interface BookmarkButtonProps {
  pollId: string;
  question: string;
}

export function BookmarkButton({ pollId, question }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(pollId);

  return (
    <button
      onClick={() => toggleBookmark(pollId, question)}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border transition-colors ${
        bookmarked
          ? "text-[var(--accent-gold)] border-[var(--accent-gold)] bg-[var(--accent-gold)]/5"
          : "text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--border-secondary)]"
      }`}
      title={bookmarked ? "북마크 제거" : "북마크 추가"}
    >
      <Bookmark
        size={16}
        fill={bookmarked ? "currentColor" : "none"}
      />
      {bookmarked ? "저장됨" : "저장"}
    </button>
  );
}
