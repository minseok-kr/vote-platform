import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

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

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("polls_with_options")
      .select("*")
      .ilike("question", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(20);

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
