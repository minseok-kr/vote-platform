import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb, Poll } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Validation schema for creating a poll
const createPollSchema = z.object({
  question: z.string().min(5).max(200),
  description: z.string().max(500).optional(),
  category: z
    .enum([
      "tech",
      "sports",
      "entertainment",
      "politics",
      "lifestyle",
      "business",
      "other",
    ])
    .optional()
    .default("other"),
  options: z.array(z.string().min(1).max(100)).min(2).max(10),
  expires_at: z.string().datetime(),
});

interface PollWithOptionsRow extends Poll {
  option_id: string;
  option_text: string;
  option_votes: number;
}

// GET /api/polls - List polls
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") as "active" | "completed" | null;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const trending = searchParams.get("trending");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereConditions: string[] = [];
    const params: (string | number)[] = [];

    if (status) {
      whereConditions.push("p.status = ?");
      params.push(status);
    }

    if (category) {
      whereConditions.push("p.category = ?");
      params.push(category);
    }

    if (featured === "true") {
      whereConditions.push("p.is_featured = 1");
    } else if (trending === "true") {
      whereConditions.push("p.status = 'active'");
      whereConditions.push("p.is_featured = 0");
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Get polls with their options
    const query = `
      SELECT
        p.*,
        o.id as option_id,
        o.text as option_text,
        o.votes as option_votes
      FROM polls p
      LEFT JOIN poll_options o ON p.id = o.poll_id
      ${whereClause}
      ORDER BY ${trending === "true" ? "(SELECT SUM(votes) FROM poll_options WHERE poll_id = p.id) DESC" : "p.created_at DESC"}
    `;

    const rows = db.prepare(query).all(...params) as PollWithOptionsRow[];

    // Group by poll
    const pollsMap = new Map<
      string,
      {
        id: string;
        question: string;
        description: string | null;
        category: string;
        status: string;
        is_featured: boolean;
        expires_at: string | null;
        created_at: string;
        options: { id: string; text: string; votes: number; percentage: number }[];
        total_votes: number;
      }
    >();

    for (const row of rows) {
      if (!pollsMap.has(row.id)) {
        pollsMap.set(row.id, {
          id: row.id,
          question: row.question,
          description: row.description,
          category: row.category,
          status: row.status,
          is_featured: row.is_featured === 1,
          expires_at: row.expires_at,
          created_at: row.created_at,
          options: [],
          total_votes: 0,
        });
      }

      const poll = pollsMap.get(row.id)!;
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
    const polls = Array.from(pollsMap.values());
    for (const poll of polls) {
      for (const option of poll.options) {
        option.percentage =
          poll.total_votes > 0
            ? Math.round((option.votes / poll.total_votes) * 100)
            : 0;
      }
    }

    // Apply pagination
    let result = polls;
    if (featured === "true") {
      result = polls.slice(0, 1);
    } else if (trending === "true") {
      result = polls.slice(0, limit);
    } else {
      result = polls.slice(offset, offset + limit);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/polls - Create a poll
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    // Validate input
    const result = createPollSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { question, description, category, options, expires_at } = result.data;
    const pollId = uuidv4();
    const now = new Date().toISOString();

    // Insert poll
    const insertPoll = db.prepare(`
      INSERT INTO polls (id, question, description, category, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertOption = db.prepare(`
      INSERT INTO poll_options (id, poll_id, text, votes, created_at)
      VALUES (?, ?, ?, 0, ?)
    `);

    const transaction = db.transaction(() => {
      insertPoll.run(
        pollId,
        question,
        description || null,
        category,
        expires_at,
        now,
        now
      );

      for (const optionText of options) {
        insertOption.run(uuidv4(), pollId, optionText, now);
      }
    });

    transaction();

    return NextResponse.json(
      { success: true, data: { id: pollId } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
