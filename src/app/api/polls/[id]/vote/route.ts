import { NextRequest, NextResponse } from "next/server";
import { getDb, Poll } from "@/lib/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface PollWithOptionsRow extends Poll {
  option_id: string;
  option_text: string;
  option_votes: number;
}

const voteSchema = z.object({
  optionId: z.string().min(1, "Option ID is required"),
  visitorId: z.string().min(1, "Visitor ID is required"),
});

// POST /api/polls/[id]/vote - Submit a vote
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: pollId } = await params;
    const body = await request.json();

    // Validate input
    const result = voteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { optionId, visitorId } = result.data;
    const db = getDb();

    // Check if poll exists and is active
    const poll = db
      .prepare("SELECT id, status, expires_at FROM polls WHERE id = ?")
      .get(pollId) as { id: string; status: string; expires_at: string | null } | undefined;

    if (!poll) {
      return NextResponse.json(
        { success: false, error: "Poll not found" },
        { status: 404 }
      );
    }

    if (poll.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Poll is not active" },
        { status: 400 }
      );
    }

    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Poll has ended" },
        { status: 400 }
      );
    }

    // Check if option belongs to this poll
    const option = db
      .prepare("SELECT id FROM poll_options WHERE id = ? AND poll_id = ?")
      .get(optionId, pollId);

    if (!option) {
      return NextResponse.json(
        { success: false, error: "Invalid option for this poll" },
        { status: 400 }
      );
    }

    // Check if visitor already voted
    const existingVote = db
      .prepare("SELECT id FROM votes WHERE poll_id = ? AND visitor_id = ?")
      .get(pollId, visitorId);

    if (existingVote) {
      return NextResponse.json(
        { success: false, error: "You have already voted on this poll" },
        { status: 400 }
      );
    }

    // Submit vote and increment option votes
    const now = new Date().toISOString();

    const transaction = db.transaction(() => {
      db.prepare(
        "INSERT INTO votes (id, poll_id, option_id, visitor_id, created_at) VALUES (?, ?, ?, ?, ?)"
      ).run(uuidv4(), pollId, optionId, visitorId, now);

      db.prepare("UPDATE poll_options SET votes = votes + 1 WHERE id = ?").run(
        optionId
      );
    });

    transaction();

    // Get updated poll data
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

    const rows = db.prepare(query).all(pollId) as PollWithOptionsRow[];

    const firstRow = rows[0];
    const updatedPoll = {
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
        updatedPoll.options.push({
          id: row.option_id,
          text: row.option_text,
          votes: row.option_votes,
          percentage: 0,
        });
        updatedPoll.total_votes += row.option_votes;
      }
    }

    for (const opt of updatedPoll.options) {
      opt.percentage =
        updatedPoll.total_votes > 0
          ? Math.round((opt.votes / updatedPoll.total_votes) * 100)
          : 0;
    }

    return NextResponse.json({
      success: true,
      data: updatedPoll,
      message: "Vote submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting vote:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/polls/[id]/vote - Check if visitor has voted
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: pollId } = await params;
    const visitorId = request.nextUrl.searchParams.get("visitorId");

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    const db = getDb();

    const vote = db
      .prepare(
        "SELECT option_id, created_at FROM votes WHERE poll_id = ? AND visitor_id = ?"
      )
      .get(pollId, visitorId) as { option_id: string; created_at: string } | undefined;

    return NextResponse.json({
      success: true,
      hasVoted: !!vote,
      votedOptionId: vote?.option_id || null,
      votedAt: vote?.created_at || null,
    });
  } catch (error) {
    console.error("Error checking vote:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
