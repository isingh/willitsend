import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const voter = req.nextUrl.searchParams.get("voter")?.toLowerCase();
    const sql = getDb();

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
      WHERE d.domain_name = ${name}
      GROUP BY d.id
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    const row = rows[0];

    let myVote: string | null | undefined = undefined;
    if (voter) {
      const voteRows = await sql`
        SELECT vote_type FROM votes
        WHERE domain_id = ${row.id} AND voter_address = ${voter}
      `;
      myVote = voteRows.length > 0 ? (voteRows[0].vote_type as string) : null;
    }

    // Fetch individual votes ordered by most recent first
    const votesList = await sql`
      SELECT voter_address, vote_type, voted_at
      FROM votes
      WHERE domain_id = ${row.id}
      ORDER BY voted_at DESC
    `;

    return NextResponse.json({
      id: row.id,
      domainName: row.domain_name,
      tokenId: row.token_id,
      ownerAddress: row.owner_address,
      listedAt: row.listed_at,
      moonCount: row.moon_count,
      deadCount: row.dead_count,
      totalVotes: row.total_votes,
      myVote,
      votes: votesList.map((v) => ({
        voterAddress: v.voter_address,
        voteType: v.vote_type,
        votedAt: v.voted_at,
      })),
    });
  } catch (err) {
    console.error("[domains/name] Failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch domain" },
      { status: 500 }
    );
  }
}
