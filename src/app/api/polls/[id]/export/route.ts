import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/polls/[id]/export - Export poll results as CSV
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: pollId } = await params;
    const supabase = createServerClient();

    // Get poll with options
    const { data: poll, error: pollError } = await supabase
      .from("polls_with_options")
      .select("*")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json(
        { success: false, error: "Poll not found" },
        { status: 404 }
      );
    }

    // Build CSV content
    const rows: string[] = [];

    // Header
    rows.push("Poll Export");
    rows.push("");
    rows.push(`Question,"${escapeCSV(poll.question)}"`);
    rows.push(`Category,${poll.category}`);
    rows.push(`Status,${poll.status}`);
    rows.push(`Total Votes,${poll.total_votes}`);
    rows.push(`Created At,${poll.created_at}`);
    rows.push(`Expires At,${poll.expires_at}`);
    rows.push("");
    rows.push("Results");
    rows.push("Option,Votes,Percentage");

    // Options
    poll.options.forEach((option: { text: string; votes: number; percentage: number }) => {
      rows.push(`"${escapeCSV(option.text)}",${option.votes},${option.percentage}%`);
    });

    const csv = rows.join("\n");

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="poll-${pollId}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to export poll" },
      { status: 500 }
    );
  }
}

function escapeCSV(value: string): string {
  return value.replace(/"/g, '""');
}
