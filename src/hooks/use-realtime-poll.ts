"use client";

import { useEffect, useState, useCallback } from "react";
import type { PollWithOptions } from "@/types";
import { getApiUrl } from "@/lib/utils";

export function useRealtimePoll(initialPoll: PollWithOptions) {
  const [poll, setPoll] = useState<PollWithOptions>(initialPoll);

  const fetchLatestPoll = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl(`/api/polls/${initialPoll.id}`));
      const data = await res.json();

      if (data.success && data.data) {
        setPoll(data.data as PollWithOptions);
      }
    } catch (error) {
      console.error("Failed to fetch poll:", error);
    }
  }, [initialPoll.id]);

  useEffect(() => {
    // Poll for updates every 5 seconds (simple polling instead of realtime)
    const interval = setInterval(fetchLatestPoll, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchLatestPoll]);

  // Update poll when initialPoll changes
  useEffect(() => {
    setPoll(initialPoll);
  }, [initialPoll]);

  return poll;
}
