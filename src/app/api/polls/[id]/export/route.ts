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

// GET /api/polls/[id]/export - Export poll results as CSV
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: pollId } = await params;
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

    const rows = db.prepare(query).all(pollId) as PollWithOptionsRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Poll not found" },
        { status: 404 }
      );
    }

    const firstRow = rows[0];
    let totalVotes = 0;
    const options: { text: string; votes: number; percentage: number }[] = [];

    for (const row of rows) {
      if (row.option_id) {
        options.push({
          text: row.option_text,
          votes: row.option_votes,
          percentage: 0,
        });
        totalVotes += row.option_votes;
      }
    }

    for (const option of options) {
      option.percentage =
        totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
    }

    // Build CSV content
    const csvRows: string[] = [];

    // Header
    csvRows.push("Poll Export");
    csvRows.push("");
    csvRows.push(`Question,"${escapeCSV(firstRow.question)}"`);
    csvRows.push(`Category,${firstRow.category}`);
    csvRows.push(`Status,${firstRow.status}`);
    csvRows.push(`Total Votes,${totalVotes}`);
    csvRows.push(`Created At,${firstRow.created_at}`);
    csvRows.push(`Expires At,${firstRow.expires_at || "N/A"}`);
    csvRows.push("");
    csvRows.push("Results");
    csvRows.push("Option,Votes,Percentage");

    // Options
    for (const option of options) {
      csvRows.push(
        `"${escapeCSV(option.text)}",${option.votes},${option.percentage}%`
      );
    }

    const csv = csvRows.join("\n");

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="poll-${pollId}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting poll:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export poll" },
      { status: 500 }
    );
  }
}

function escapeCSV(value: string): string {
  return value.replace(/"/g, '""');
}
