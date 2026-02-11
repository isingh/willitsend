import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { domainName, tokenId, ownerAddress } = await req.json();

    if (!domainName || !ownerAddress) {
      return NextResponse.json(
        { error: "domainName and ownerAddress are required" },
        { status: 400 }
      );
    }

    const sql = getDb();
    const rows = await sql`
      INSERT INTO listed_domains (domain_name, token_id, owner_address)
      VALUES (${domainName}, ${tokenId || null}, ${ownerAddress.toLowerCase()})
      ON CONFLICT (domain_name) DO NOTHING
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Domain is already listed" },
        { status: 409 }
      );
    }

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("[domains/list] Failed:", err);
    return NextResponse.json(
      { error: "Failed to list domain" },
      { status: 500 }
    );
  }
}
