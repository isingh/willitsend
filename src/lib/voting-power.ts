import { createPublicClient, http, parseUnits, type Address } from "viem";
import { domaMainnet } from "@/config/chains";
import votingConfig from "@/config/tokenlist.json";

const DOMA_CHAIN_ID = domaMainnet.id; // 97477

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** A token entry from the remote tokenlist (Uniswap-style format). */
interface TokenListToken {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

/** The remote tokenlist response format. */
interface TokenListResponse {
  name?: string;
  tokens: TokenListToken[];
}

export interface ResolvedToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface VotingRule {
  id: string;
  description: string;
  weight: number;
  condition: string;
  minBalance: string;
  tokens: ResolvedToken[];
}

export interface VotingPowerResult {
  weight: number;
  matchedRule: VotingRule | null;
  rules: VotingRule[];
}

// ── Remote tokenlist cache ──────────────────────────────────────────────
let cachedTokens: ResolvedToken[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch the Doma ecosystem token list from the CDN.
 * Filters to only tokens on the Doma chain and caches the result.
 */
async function fetchTokenList(): Promise<ResolvedToken[]> {
  const now = Date.now();
  if (cachedTokens && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedTokens;
  }

  try {
    const res = await fetch(votingConfig.tokenlistUrl, {
      next: { revalidate: 300 }, // Next.js fetch cache: 5 min
    });

    if (!res.ok) {
      console.error(
        `[voting-power] Failed to fetch tokenlist: ${res.status} ${res.statusText}`
      );
      return cachedTokens ?? [];
    }

    const data: TokenListResponse = await res.json();

    // Filter to Doma chain tokens only
    const domaTokens = data.tokens
      .filter((t) => t.chainId === DOMA_CHAIN_ID)
      .map((t) => ({
        address: t.address,
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals,
      }));

    console.debug(
      `[voting-power] Fetched tokenlist: ${domaTokens.length} Doma tokens from ${data.tokens.length} total`
    );

    cachedTokens = domaTokens;
    cacheTimestamp = now;
    return domaTokens;
  } catch (err) {
    console.error("[voting-power] Failed to fetch tokenlist:", err);
    // Return stale cache if available, otherwise empty
    return cachedTokens ?? [];
  }
}

// ── On-chain balance checking ───────────────────────────────────────────
const client = createPublicClient({
  chain: domaMainnet,
  transport: http(),
});

/**
 * Check if a wallet holds at least `minBalance` of any token in the list.
 * Returns true on first qualifying token (short-circuits).
 */
async function checkHoldsAnyToken(
  address: Address,
  tokens: ResolvedToken[],
  minBalance: string
): Promise<boolean> {
  for (const token of tokens) {
    try {
      const balance = await client.readContract({
        address: token.address as Address,
        abi: ERC20_BALANCE_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      const minBalanceWei = parseUnits(minBalance, token.decimals);

      if (balance >= minBalanceWei) {
        return true;
      }
    } catch (err) {
      console.error(
        `[voting-power] Failed to check balance for ${token.symbol} (${token.address}):`,
        err
      );
      // Continue checking other tokens
    }
  }
  return false;
}

/**
 * Calculate the voting power for a wallet address.
 * Fetches the remote tokenlist, evaluates all rules, returns highest matching weight.
 * Fails open: returns default weight (1) if fetches/checks fail.
 */
export async function getVotingPower(
  address: string
): Promise<VotingPowerResult> {
  const tokens = await fetchTokenList();
  const checksumAddress = address as Address;

  // Build resolved rules (attach fetched tokens to each rule)
  const resolvedRules: VotingRule[] = votingConfig.rules.map((rule) => ({
    ...rule,
    tokens,
  }));

  let bestWeight = votingConfig.defaultWeight;
  let bestRule: VotingRule | null = null;

  // If no tokens in the list, skip checks and return default
  if (tokens.length === 0) {
    return { weight: bestWeight, matchedRule: null, rules: resolvedRules };
  }

  // Evaluate all rules, pick highest weight
  const results = await Promise.allSettled(
    resolvedRules.map(async (rule) => {
      const qualifies = await checkHoldsAnyToken(
        checksumAddress,
        rule.tokens,
        rule.minBalance
      );
      return { rule, qualifies };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.qualifies) {
      if (result.value.rule.weight > bestWeight) {
        bestWeight = result.value.rule.weight;
        bestRule = result.value.rule;
      }
    }
  }

  return {
    weight: bestWeight,
    matchedRule: bestRule,
    rules: resolvedRules,
  };
}
