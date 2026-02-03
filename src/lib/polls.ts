import { supabase } from "./supabase";
import type {
  Poll,
  PollWithOptions,
  PollCategory,
  CreatePollRequest,
  VoteRequest,
} from "@/types";

// Get all polls with options
export async function getPolls(options?: {
  status?: "active" | "completed";
  category?: PollCategory;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from("polls_with_options")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as PollWithOptions[];
}

// Get featured poll
export async function getFeaturedPoll() {
  const { data, error } = await supabase
    .from("polls_with_options")
    .select("*")
    .eq("is_featured", true)
    .eq("status", "active")
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data as PollWithOptions | null;
}

// Get trending polls (most votes in active polls)
export async function getTrendingPolls(limit = 4) {
  const { data, error } = await supabase
    .from("polls_with_options")
    .select("*")
    .eq("status", "active")
    .eq("is_featured", false)
    .order("total_votes", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as PollWithOptions[];
}

// Get single poll by ID
export async function getPoll(id: string) {
  const { data, error } = await supabase
    .from("polls_with_options")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PollWithOptions;
}

// Create a new poll
export async function createPoll(request: CreatePollRequest) {
  // Insert poll
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      question: request.question,
      description: request.description,
      category: request.category || "other",
      expires_at: request.expires_at,
    })
    .select()
    .single();

  if (pollError) throw pollError;

  // Insert options
  const optionsToInsert = request.options.map((text) => ({
    poll_id: poll.id,
    text,
  }));

  const { error: optionsError } = await supabase
    .from("poll_options")
    .insert(optionsToInsert);

  if (optionsError) throw optionsError;

  return poll as Poll;
}

// Vote on a poll
export async function vote(request: VoteRequest) {
  // Check if already voted
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("poll_id", request.poll_id)
    .eq("visitor_id", request.visitor_id)
    .single();

  if (existingVote) {
    throw new Error("Already voted on this poll");
  }

  // Insert vote
  const { error: voteError } = await supabase.from("votes").insert({
    poll_id: request.poll_id,
    option_id: request.option_id,
    visitor_id: request.visitor_id,
  });

  if (voteError) throw voteError;

  // Increment option votes
  const { error: incrementError } = await supabase.rpc("increment_option_votes", {
    option_uuid: request.option_id,
  });

  if (incrementError) throw incrementError;

  return { success: true };
}

// Check if visitor has voted
export async function hasVoted(pollId: string, visitorId: string) {
  const { data } = await supabase
    .from("votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("visitor_id", visitorId)
    .single();

  return !!data;
}

// Get visitor's vote for a poll
export async function getVisitorVote(pollId: string, visitorId: string) {
  const { data } = await supabase
    .from("votes")
    .select("option_id")
    .eq("poll_id", pollId)
    .eq("visitor_id", visitorId)
    .single();

  return data?.option_id || null;
}
