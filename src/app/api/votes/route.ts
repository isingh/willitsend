import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getVotingPower } from "@/lib/voting-power";

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

    // Calculate voting power based on token holdings
    const { weight } = await getVotingPower(voterAddress);

    // Upsert the vote (allows changing your vote), recalculating weight each time
    const rows = await sql`
      INSERT INTO votes (domain_id, voter_address, vote_type, vote_weight)
      VALUES (${domainId}, ${voterAddress.toLowerCase()}, ${voteType}, ${weight})
      ON CONFLICT (domain_id, voter_address)
      DO UPDATE SET vote_type = ${voteType}, vote_weight = ${weight}, voted_at = NOW()
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
