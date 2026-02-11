const DOMA_API_URL =
  process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL ||
  "https://api.doma.xyz/graphql";

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

  try {
    const res = await fetch(DOMA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { ownedBy: [caip10Address] },
      }),
    });

    if (!res.ok) {
      console.error("Doma API request failed:", res.status);
      return [];
    }

    const json = await res.json();

    interface NameItem {
      name: string;
      expiresAt: string;
      tokenizedAt: string;
      tokens?: { tokenId: string; ownerAddress: string }[];
    }

    const items: NameItem[] = json.data?.names?.items ?? [];

    return items.map((item) => ({
      id: item.name,
      name: item.name,
      tokenId: item.tokens?.[0]?.tokenId ?? "",
      owner: item.tokens?.[0]?.ownerAddress ?? caip10Address,
      registeredAt: item.tokenizedAt,
      expiresAt: item.expiresAt,
    }));
  } catch (err) {
    console.error("Failed to fetch domain NFTs:", err);
    return [];
  }
}
