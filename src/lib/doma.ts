const DOMA_API_URL =
  process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL ||
  "https://api.doma.xyz/graphql";

const DOMA_API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY || "";

/** CAIP-2 network ID for Doma mainnet (chain ID 97477). */
const DOMA_CAIP2_NETWORK_ID = "eip155:97477";

export interface DomainNFT {
  id: string;
  name: string;
  tokenId: string;
  owner: string;
  registeredAt?: string;
  expiresAt?: string;
}

/**
 * Fetch domain NFTs owned by a wallet address from the Doma API.
 */
export async function fetchDomainNFTs(
  walletAddress: string
): Promise<DomainNFT[]> {
  const caip10Address = `${DOMA_CAIP2_NETWORK_ID}:${walletAddress}`;

  const query = `
    query GetDomainsByOwner($ownedBy: [AddressCAIP10!]) {
      names(ownedBy: $ownedBy, take: 100) {
        items {
          name
          expiresAt
          tokenizedAt
          tokens {
            tokenId
            ownerAddress
          }
        }
        totalCount
      }
    }
  `;

  const variables = { ownedBy: [caip10Address] };

  console.debug("[doma] fetchDomainNFTs called", {
    walletAddress,
    caip10Address,
    apiUrl: DOMA_API_URL,
    variables,
  });

  try {
    const res = await fetch(DOMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(DOMA_API_KEY ? { "Api-Key": DOMA_API_KEY } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    console.debug("[doma] API response status:", res.status);

    if (!res.ok) {
      const body = await res.text();
      console.error("[doma] API request failed:", res.status, body);
      return [];
    }

    const json = await res.json();

    console.debug("[doma] API raw response:", JSON.stringify(json, null, 2));

    if (json.errors) {
      console.error("[doma] GraphQL errors:", json.errors);
    }

    interface NameItem {
      name: string;
      expiresAt: string;
      tokenizedAt: string;
      tokens?: { tokenId: string; ownerAddress: string }[];
    }

    const items: NameItem[] = json.data?.names?.items ?? [];

    console.debug("[doma] totalCount:", json.data?.names?.totalCount);
    console.debug("[doma] items returned:", items.length);

    const mapped = items.map((item) => ({
      id: item.name,
      name: item.name,
      tokenId: item.tokens?.[0]?.tokenId ?? "",
      owner: item.tokens?.[0]?.ownerAddress ?? caip10Address,
      registeredAt: item.tokenizedAt,
      expiresAt: item.expiresAt,
    }));

    console.debug("[doma] mapped domains:", mapped);

    return mapped;
  } catch (err) {
    console.error("[doma] Failed to fetch domain NFTs:", err);
    return [];
  }
}
