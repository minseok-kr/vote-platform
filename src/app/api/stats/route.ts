import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/stats - Get platform statistics
export async function GET() {
  try {
    const supabase = createServerClient();

    // Get total polls count
    const { count: totalPolls } = await supabase
      .from("polls")
      .select("*", { count: "exact", head: true });

    // Get active polls count
    const { count: activePolls } = await supabase
      .from("polls")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get total votes
    const { count: totalVotes } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true });

    // Get polls by category
    const { data: categoryStats } = await supabase
      .from("polls")
      .select("category");

    const categoryCounts: Record<string, number> = {};
    categoryStats?.forEach((poll) => {
      categoryCounts[poll.category] = (categoryCounts[poll.category] || 0) + 1;
    });

    // Get recent activity (votes in last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count: recentVotes } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString());

    // Get top polls
    const { data: topPolls } = await supabase
      .from("polls_with_options")
      .select("id, question, total_votes")
      .order("total_votes", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalPolls: totalPolls || 0,
        activePolls: activePolls || 0,
        completedPolls: (totalPolls || 0) - (activePolls || 0),
        totalVotes: totalVotes || 0,
        recentVotes: recentVotes || 0,
        categoryCounts,
        topPolls: topPolls || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
