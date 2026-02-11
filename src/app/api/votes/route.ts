import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { domainId, voterAddress, voteType } = await req.json();

    if (!domainId || !voterAddress || !voteType) {
      return NextResponse.json(
        { error: "domainId, voterAddress, and voteType are required" },
        { status: 400 }
      );
    }

    if (voteType !== "moon" && voteType !== "dead") {
      return NextResponse.json(
        { error: "voteType must be 'moon' or 'dead'" },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Check the voter isn't voting on their own domain
    const [domain] = await sql`
      SELECT owner_address FROM listed_domains WHERE id = ${domainId}
    `;

    if (!domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    if (domain.owner_address === voterAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "You can't vote on your own domain" },
        { status: 403 }
      );
    }

    // Upsert the vote (allows changing your vote)
    const rows = await sql`
      INSERT INTO votes (domain_id, voter_address, vote_type)
      VALUES (${domainId}, ${voterAddress.toLowerCase()}, ${voteType})
      ON CONFLICT (domain_id, voter_address)
      DO UPDATE SET vote_type = ${voteType}, voted_at = NOW()
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("[votes] Failed:", err);
    return NextResponse.json(
      { error: "Failed to cast vote" },
      { status: 500 }
    );
  }
}
