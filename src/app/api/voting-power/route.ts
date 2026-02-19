import { NextRequest, NextResponse } from "next/server";
import { getVotingPower } from "@/lib/voting-power";

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "address query parameter is required" },
        { status: 400 }
      );
    }

    const result = await getVotingPower(address);

    return NextResponse.json({
      weight: result.weight,
      matchedRule: result.matchedRule
        ? {
            id: result.matchedRule.id,
            description: result.matchedRule.description,
            weight: result.matchedRule.weight,
          }
        : null,
      rules: result.rules.map((r) => ({
        id: r.id,
        description: r.description,
        weight: r.weight,
        tokens: r.tokens.map((t) => ({
          name: t.name,
          symbol: t.symbol,
        })),
      })),
    });
  } catch (err) {
    console.error("[voting-power] Failed:", err);
    return NextResponse.json(
      { error: "Failed to check voting power" },
      { status: 500 }
    );
  }
}
