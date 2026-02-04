import type { PollWithOptions, PollCategory } from "@/types";
import { getDb, Poll } from "./db";

interface PollWithOptionsRow extends Poll {
  option_id: string;
  option_text: string;
  option_votes: number;
}

function rowsToPoll(rows: PollWithOptionsRow[]): PollWithOptions | null {
  if (rows.length === 0) return null;

  const firstRow = rows[0];
  const poll: PollWithOptions = {
    id: firstRow.id,
    question: firstRow.question,
    description: firstRow.description,
    category: firstRow.category as PollCategory,
    status: firstRow.status as "active" | "completed",
    is_featured: firstRow.is_featured === 1,
    expires_at: firstRow.expires_at,
    created_at: firstRow.created_at,
    updated_at: firstRow.updated_at,
    options: [],
    total_votes: 0,
  };

  for (const row of rows) {
    if (row.option_id) {
      poll.options.push({
        id: row.option_id,
        text: row.option_text,
        votes: row.option_votes,
        percentage: 0,
      });
      poll.total_votes += row.option_votes;
    }
  }

  // Calculate percentages
  for (const option of poll.options) {
    option.percentage =
      poll.total_votes > 0
        ? Math.round((option.votes / poll.total_votes) * 100)
        : 0;
  }

  return poll;
}

// Get all polls with options
export async function getPolls(options?: {
  status?: "active" | "completed";
  category?: PollCategory;
  limit?: number;
  offset?: number;
}): Promise<PollWithOptions[]> {
  const db = getDb();

  const whereConditions: string[] = [];
  const params: (string | number)[] = [];

  if (options?.status) {
    whereConditions.push("p.status = ?");
    params.push(options.status);
  }

  if (options?.category) {
    whereConditions.push("p.category = ?");
    params.push(options.category);
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const query = `
    SELECT
      p.*,
      o.id as option_id,
      o.text as option_text,
      o.votes as option_votes
    FROM polls p
    LEFT JOIN poll_options o ON p.id = o.poll_id
    ${whereClause}
    ORDER BY p.created_at DESC
  `;

  const rows = db.prepare(query).all(...params) as PollWithOptionsRow[];

  // Group by poll
  const pollsMap = new Map<string, PollWithOptionsRow[]>();
  for (const row of rows) {
    if (!pollsMap.has(row.id)) {
      pollsMap.set(row.id, []);
    }
    pollsMap.get(row.id)!.push(row);
  }

  const polls: PollWithOptions[] = [];
  for (const pollRows of pollsMap.values()) {
    const poll = rowsToPoll(pollRows);
    if (poll) polls.push(poll);
  }

  // Apply pagination
  const limit = options?.limit || 10;
  const offset = options?.offset || 0;
  return polls.slice(offset, offset + limit);
}

// Get featured poll
export async function getFeaturedPoll(): Promise<PollWithOptions | null> {
  const db = getDb();

  const query = `
    SELECT
      p.*,
      o.id as option_id,
      o.text as option_text,
      o.votes as option_votes
    FROM polls p
    LEFT JOIN poll_options o ON p.id = o.poll_id
    WHERE p.is_featured = 1 AND p.status = 'active'
    ORDER BY p.created_at DESC
  `;

  const rows = db.prepare(query).all() as PollWithOptionsRow[];
  return rowsToPoll(rows);
}

// Get trending polls
export async function getTrendingPolls(limit = 4): Promise<PollWithOptions[]> {
  const db = getDb();

  const query = `
    SELECT
      p.*,
      o.id as option_id,
      o.text as option_text,
      o.votes as option_votes
    FROM polls p
    LEFT JOIN poll_options o ON p.id = o.poll_id
    WHERE p.status = 'active' AND p.is_featured = 0
    ORDER BY (SELECT SUM(votes) FROM poll_options WHERE poll_id = p.id) DESC
  `;

  const rows = db.prepare(query).all() as PollWithOptionsRow[];

  // Group by poll
  const pollsMap = new Map<string, PollWithOptionsRow[]>();
  for (const row of rows) {
    if (!pollsMap.has(row.id)) {
      pollsMap.set(row.id, []);
    }
    pollsMap.get(row.id)!.push(row);
  }

  const polls: PollWithOptions[] = [];
  for (const pollRows of pollsMap.values()) {
    const poll = rowsToPoll(pollRows);
    if (poll) polls.push(poll);
  }

  return polls.slice(0, limit);
}

// Get single poll by ID
export async function getPoll(id: string): Promise<PollWithOptions> {
  const db = getDb();

  const query = `
    SELECT
      p.*,
      o.id as option_id,
      o.text as option_text,
      o.votes as option_votes
    FROM polls p
    LEFT JOIN poll_options o ON p.id = o.poll_id
    WHERE p.id = ?
  `;

  const rows = db.prepare(query).all(id) as PollWithOptionsRow[];
  const poll = rowsToPoll(rows);

  if (!poll) {
    throw new Error("Poll not found");
  }

  return poll;
}
