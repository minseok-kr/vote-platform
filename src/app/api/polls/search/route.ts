import { NextRequest, NextResponse } from "next/server";
import { getDb, Poll } from "@/lib/db";

interface PollWithOptionsRow extends Poll {
  option_id: string;
  option_text: string;
  option_votes: number;
}

// GET /api/polls/search?q=query
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const db = getDb();

    const sqlQuery = `
      SELECT
        p.*,
        o.id as option_id,
        o.text as option_text,
        o.votes as option_votes
      FROM polls p
      LEFT JOIN poll_options o ON p.id = o.poll_id
      WHERE p.question LIKE ?
      ORDER BY p.created_at DESC
    `;

    const rows = db.prepare(sqlQuery).all(`%${query}%`) as PollWithOptionsRow[];

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

    // Limit to 20 results
    const result = polls.slice(0, 20);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error searching polls:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
