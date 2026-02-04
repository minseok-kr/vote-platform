import { NextRequest, NextResponse } from "next/server";
import { getDb, Poll } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface PollWithOptionsRow extends Poll {
  option_id: string;
  option_text: string;
  option_votes: number;
}

// GET /api/polls/[id] - Get single poll
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Poll not found" },
        { status: 404 }
      );
    }

    const firstRow = rows[0];
    const poll = {
      id: firstRow.id,
      question: firstRow.question,
      description: firstRow.description,
      category: firstRow.category,
      status: firstRow.status,
      is_featured: firstRow.is_featured === 1,
      expires_at: firstRow.expires_at,
      created_at: firstRow.created_at,
      options: [] as { id: string; text: string; votes: number; percentage: number }[],
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

    return NextResponse.json({ success: true, data: poll });
  } catch (error) {
    console.error("Error fetching poll:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
