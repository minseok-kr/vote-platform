import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";

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

// GET /api/polls - List polls
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") as "active" | "completed" | null;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const trending = searchParams.get("trending");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("polls_with_options")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true).limit(1);
    } else if (trending === "true") {
      query = query
        .eq("status", "active")
        .eq("is_featured", false)
        .order("total_votes", { ascending: false })
        .limit(limit);
    } else {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/polls - Create a poll
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
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

    // Insert poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        question,
        description,
        category,
        expires_at,
      } as never)
      .select()
      .single();

    if (pollError || !poll) {
      return NextResponse.json(
        { success: false, error: pollError?.message || "Failed to create poll" },
        { status: 500 }
      );
    }

    const pollData = poll as { id: string };

    // Insert options
    const optionsToInsert = options.map((text) => ({
      poll_id: pollData.id,
      text,
    }));

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(optionsToInsert as never);

    if (optionsError) {
      // Rollback: delete the poll
      await supabase.from("polls").delete().eq("id", pollData.id);

      return NextResponse.json(
        { success: false, error: optionsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: pollData }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
