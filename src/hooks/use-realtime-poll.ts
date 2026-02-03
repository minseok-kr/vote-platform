"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { PollWithOptions } from "@/types";

export function useRealtimePoll(initialPoll: PollWithOptions) {
  const [poll, setPoll] = useState<PollWithOptions>(initialPoll);

  const fetchLatestPoll = useCallback(async () => {
    const { data, error } = await supabase
      .from("polls_with_options")
      .select("*")
      .eq("id", initialPoll.id)
      .single();

    if (!error && data) {
      setPoll(data as PollWithOptions);
    }
  }, [initialPoll.id]);

  useEffect(() => {
    // Subscribe to vote changes for this poll
    const channel = supabase
      .channel(`poll-${initialPoll.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${initialPoll.id}`,
        },
        () => {
          // Fetch latest poll data when a new vote is added
          fetchLatestPoll();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "poll_options",
          filter: `poll_id=eq.${initialPoll.id}`,
        },
        () => {
          // Fetch latest poll data when options are updated
          fetchLatestPoll();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialPoll.id, fetchLatestPoll]);

  return poll;
}
