const DOMA_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL ||
  "https://api-testnet.doma.xyz/graphql";

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

/**
 * Generate mock domain NFTs for development / demo purposes
 */
export function getMockDomainNFTs(walletAddress: string): DomainNFT[] {
  return [
    {
      id: "1",
      name: "example.com",
      tokenId: "1001",
      owner: walletAddress,
      registeredAt: "2025-06-15",
      expiresAt: "2027-06-15",
    },
    {
      id: "2",
      name: "myproject.xyz",
      tokenId: "1002",
      owner: walletAddress,
      registeredAt: "2025-09-01",
      expiresAt: "2026-09-01",
    },
    {
      id: "3",
      name: "web3domains.ai",
      tokenId: "1003",
      owner: walletAddress,
      registeredAt: "2025-11-20",
      expiresAt: "2027-11-20",
    },
    {
      id: "4",
      name: "blockchain.io",
      tokenId: "1004",
      owner: walletAddress,
      registeredAt: "2026-01-10",
      expiresAt: "2028-01-10",
    },
  ];
}
