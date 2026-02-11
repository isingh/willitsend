import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const voter = req.nextUrl.searchParams.get("voter")?.toLowerCase();

    // Get all listed domains with their vote counts.
    // If a voter address is provided, also include whether they already voted.
    const rows = await sql`
      SELECT
        d.id,
        d.domain_name,
        d.token_id,
        d.owner_address,
        d.listed_at,
        COALESCE(SUM(CASE WHEN v.vote_type = 'moon' THEN 1 ELSE 0 END), 0)::int AS moon_count,
        COALESCE(SUM(CASE WHEN v.vote_type = 'dead' THEN 1 ELSE 0 END), 0)::int AS dead_count,
        COUNT(v.id)::int AS total_votes
      FROM listed_domains d
      LEFT JOIN votes v ON v.domain_id = d.id
      GROUP BY d.id
      ORDER BY d.listed_at DESC
    `;

    // If voter provided, get their votes in a separate query
    let voterVotes: Record<number, string> = {};
    if (voter) {
      const voteRows = await sql`
        SELECT domain_id, vote_type FROM votes WHERE voter_address = ${voter}
      `;
      for (const row of voteRows) {
        voterVotes[row.domain_id as number] = row.vote_type as string;
      }
    }

    const domains = rows.map((row) => ({
      id: row.id,
      domainName: row.domain_name,
      tokenId: row.token_id,
      ownerAddress: row.owner_address,
      listedAt: row.listed_at,
      moonCount: row.moon_count,
      deadCount: row.dead_count,
      totalVotes: row.total_votes,
      myVote: voter ? (voterVotes[row.id as number] ?? null) : undefined,
    }));

    return NextResponse.json(domains);
  } catch (err) {
    console.error("[domains/listed] Failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch listed domains" },
      { status: 500 }
    );
  }
}
