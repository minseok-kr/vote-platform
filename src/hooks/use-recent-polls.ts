"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "vote_recent_polls";
const MAX_RECENT = 10;

interface RecentPoll {
  id: string;
  question: string;
  viewedAt: string;
}

export function useRecentPolls() {
  const [recentPolls, setRecentPolls] = useState<RecentPoll[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentPolls(JSON.parse(stored));
      }
    } catch (error) {
      // Ignore errors
    }
  }, []);

  // Add a poll to recent list
  const addRecentPoll = useCallback((id: string, question: string) => {
    if (typeof window === "undefined") return;

    setRecentPolls((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== id);

      // Add to beginning
      const updated = [
        { id, question, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_RECENT);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        // Ignore errors
      }

      return updated;
    });
  }, []);

  // Remove a poll from recent list
  const removeRecentPoll = useCallback((id: string) => {
    if (typeof window === "undefined") return;

    setRecentPolls((prev) => {
      const updated = prev.filter((p) => p.id !== id);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        // Ignore errors
      }

      return updated;
    });
  }, []);

  // Clear all recent polls
  const clearRecentPolls = useCallback(() => {
    if (typeof window === "undefined") return;

    setRecentPolls([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Ignore errors
    }
  }, []);

  return {
    recentPolls,
    addRecentPoll,
    removeRecentPoll,
    clearRecentPolls,
  };
}
