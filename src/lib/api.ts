import type { PollWithOptions, PollCategory } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// For server-side calls, use internal URL
function getApiUrl(path: string): string {
  // In server components, use internal API
  if (typeof window === "undefined") {
    return `http://localhost:3000/poll/api${path}`;
  }
  // In client components, use relative path
  return `/poll/api${path}`;
}

// Get all polls with options
export async function getPolls(options?: {
  status?: "active" | "completed";
  category?: PollCategory;
  limit?: number;
  offset?: number;
}): Promise<PollWithOptions[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.category) params.set("category", options.category);
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.offset) params.set("offset", options.offset.toString());

  const url = `${getApiUrl("/polls")}?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();

  if (!data.success) throw new Error(data.error);
  return data.data;
}

// Get featured poll
export async function getFeaturedPoll(): Promise<PollWithOptions | null> {
  const url = `${getApiUrl("/polls")}?featured=true`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();

  if (!data.success) throw new Error(data.error);
  return data.data[0] || null;
}

// Get trending polls
export async function getTrendingPolls(
  limit = 4
): Promise<PollWithOptions[]> {
  const url = `${getApiUrl("/polls")}?trending=true&limit=${limit}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();

  if (!data.success) throw new Error(data.error);
  return data.data;
}

// Get single poll by ID
export async function getPoll(id: string): Promise<PollWithOptions> {
  const url = `${getApiUrl(`/polls/${id}`)}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();

  if (!data.success) throw new Error(data.error);
  return data.data;
}
