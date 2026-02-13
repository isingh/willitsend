import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, type Address, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { addEnsContracts } from "@ensdomains/ensjs";
import { getName } from "@ensdomains/ensjs/public";

const ensClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
});

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address || !isAddress(address)) {
    return NextResponse.json(
      { error: "Valid address parameter is required" },
      { status: 400 },
    );
  }

  try {
    const result = await getName(ensClient, {
      address: address as Address,
    });

    const name = result?.name && result?.match ? result.name : null;

    return NextResponse.json(
      { name },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    console.error("[ens] Resolution failed for", address, err);
    return NextResponse.json({ name: null });
  }
}
