"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "vote_bookmarks";

interface BookmarkedPoll {
  id: string;
  question: string;
  bookmarkedAt: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedPoll[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      // Ignore errors
    }
  }, []);

  // Check if a poll is bookmarked
  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  // Toggle bookmark
  const toggleBookmark = useCallback((id: string, question: string) => {
    if (typeof window === "undefined") return;

    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === id);
      let updated: BookmarkedPoll[];

      if (exists) {
        updated = prev.filter((b) => b.id !== id);
      } else {
        updated = [
          { id, question, bookmarkedAt: new Date().toISOString() },
          ...prev,
        ];
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        // Ignore errors
      }

      return updated;
    });
  }, []);

  // Remove bookmark
  const removeBookmark = useCallback((id: string) => {
    if (typeof window === "undefined") return;

    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.id !== id);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        // Ignore errors
      }

      return updated;
    });
  }, []);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
  };
}
