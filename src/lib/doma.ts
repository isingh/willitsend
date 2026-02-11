const DOMA_SUBGRAPH_URL = "https://api.doma.xyz/graphql";

export interface DomainNFT {
  id: string;
  name: string;
  tokenId: string;
  owner: string;
  registeredAt?: string;
  expiresAt?: string;
}

/**
 * Fetch domain NFTs owned by a wallet address from the Doma subgraph.
 * The query shape may need adjusting once the exact subgraph schema is confirmed.
 */
export async function fetchDomainNFTs(
  walletAddress: string
): Promise<DomainNFT[]> {
  const query = `
    query GetDomainsByOwner($owner: String!) {
      domains(where: { owner: $owner }) {
        id
        name
        tokenId
        owner
        registeredAt
        expiresAt
      }
    }
  `;

  try {
    const res = await fetch(DOMA_SUBGRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { owner: walletAddress.toLowerCase() },
      }),
    });

    if (!res.ok) {
      console.error("Subgraph request failed:", res.status);
      return [];
    }

    const json = await res.json();
    return (json.data?.domains as DomainNFT[]) ?? [];
  } catch (err) {
    console.error("Failed to fetch domain NFTs:", err);
    return [];
  }
}
