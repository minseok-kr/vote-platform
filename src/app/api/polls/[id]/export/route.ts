import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface PollOption {
  text: string;
  votes: number;
  percentage: number;
}

interface PollData {
  id: string;
  question: string;
  category: string;
  status: string;
  total_votes: number;
  created_at: string;
  expires_at: string;
  options: PollOption[];
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

    const pollData = poll as PollData;

    // Build CSV content
    const rows: string[] = [];

    // Header
    rows.push("Poll Export");
    rows.push("");
    rows.push(`Question,"${escapeCSV(pollData.question)}"`);
    rows.push(`Category,${pollData.category}`);
    rows.push(`Status,${pollData.status}`);
    rows.push(`Total Votes,${pollData.total_votes}`);
    rows.push(`Created At,${pollData.created_at}`);
    rows.push(`Expires At,${pollData.expires_at}`);
    rows.push("");
    rows.push("Results");
    rows.push("Option,Votes,Percentage");

    // Options
    pollData.options.forEach((option: PollOption) => {
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
