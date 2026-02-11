import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();

    const rows = await sql`
      SELECT
        d.id,
        d.domain_name,
        d.token_id,
        d.owner_address,
        COALESCE(SUM(CASE WHEN v.vote_type = 'moon' THEN 1 ELSE 0 END), 0)::int AS moon_count,
        COALESCE(SUM(CASE WHEN v.vote_type = 'dead' THEN 1 ELSE 0 END), 0)::int AS dead_count,
        COUNT(v.id)::int AS total_votes,
        COALESCE(SUM(CASE WHEN v.vote_type = 'moon' THEN 1 ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN v.vote_type = 'dead' THEN 1 ELSE 0 END), 0) AS score
      FROM listed_domains d
      LEFT JOIN votes v ON v.domain_id = d.id
      GROUP BY d.id
      HAVING COUNT(v.id) > 0
      ORDER BY score DESC, moon_count DESC
    `;

    const leaderboard = rows.map((row, i) => ({
      rank: i + 1,
      id: row.id,
      domainName: row.domain_name,
      tokenId: row.token_id,
      ownerAddress: row.owner_address,
      moonCount: row.moon_count,
      deadCount: row.dead_count,
      totalVotes: row.total_votes,
      score: row.score,
    }));

    return NextResponse.json(leaderboard);
  } catch (err) {
    console.error("[leaderboard] Failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
