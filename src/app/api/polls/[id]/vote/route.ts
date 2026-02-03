import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const voteSchema = z.object({
  optionId: z.string().uuid("Invalid option ID"),
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
    const supabase = createServerClient();

    // Check if poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("id, status, ends_at")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
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

    if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Poll has ended" },
        { status: 400 }
      );
    }

    // Check if option belongs to this poll
    const { data: option, error: optionError } = await supabase
      .from("poll_options")
      .select("id")
      .eq("id", optionId)
      .eq("poll_id", pollId)
      .single();

    if (optionError || !option) {
      return NextResponse.json(
        { success: false, error: "Invalid option for this poll" },
        { status: 400 }
      );
    }

    // Check if visitor already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("visitor_id", visitorId)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { success: false, error: "You have already voted on this poll" },
        { status: 400 }
      );
    }

    // Submit vote
    const { error: voteError } = await supabase.from("votes").insert({
      poll_id: pollId,
      option_id: optionId,
      visitor_id: visitorId,
    });

    if (voteError) {
      return NextResponse.json(
        { success: false, error: "Failed to submit vote" },
        { status: 500 }
      );
    }

    // Get updated poll data
    const { data: updatedPoll } = await supabase
      .from("polls_with_options")
      .select("*")
      .eq("id", pollId)
      .single();

    return NextResponse.json({
      success: true,
      data: updatedPoll,
      message: "Vote submitted successfully",
    });
  } catch (error) {
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

    const supabase = createServerClient();

    const { data: vote } = await supabase
      .from("votes")
      .select("option_id, created_at")
      .eq("poll_id", pollId)
      .eq("visitor_id", visitorId)
      .single();

    return NextResponse.json({
      success: true,
      hasVoted: !!vote,
      votedOptionId: vote?.option_id || null,
      votedAt: vote?.created_at || null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
