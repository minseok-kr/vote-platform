import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/stats - Get platform statistics
export async function GET() {
  try {
    const db = getDb();

    // Get total polls count
    const totalPolls = (
      db.prepare("SELECT COUNT(*) as count FROM polls").get() as { count: number }
    ).count;

    // Get active polls count
    const activePolls = (
      db
        .prepare("SELECT COUNT(*) as count FROM polls WHERE status = 'active'")
        .get() as { count: number }
    ).count;

    // Get total votes
    const totalVotes = (
      db.prepare("SELECT COUNT(*) as count FROM votes").get() as { count: number }
    ).count;

    // Get polls by category
    const categoryRows = db
      .prepare("SELECT category FROM polls")
      .all() as { category: string }[];

    const categoryCounts: Record<string, number> = {};
    for (const row of categoryRows) {
      categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
    }

    // Get recent activity (votes in last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentVotes = (
      db
        .prepare(
          "SELECT COUNT(*) as count FROM votes WHERE created_at >= ?"
        )
        .get(yesterday.toISOString()) as { count: number }
    ).count;

    // Get top polls
    const topPollsRows = db
      .prepare(
        `
        SELECT p.id, p.question, SUM(o.votes) as total_votes
        FROM polls p
        LEFT JOIN poll_options o ON p.id = o.poll_id
        GROUP BY p.id
        ORDER BY total_votes DESC
        LIMIT 5
      `
      )
      .all() as { id: string; question: string; total_votes: number }[];

    return NextResponse.json({
      success: true,
      data: {
        totalPolls,
        activePolls,
        completedPolls: totalPolls - activePolls,
        totalVotes,
        recentVotes,
        categoryCounts,
        topPolls: topPollsRows,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
