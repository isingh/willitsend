import { createPublicClient, http, parseUnits, type Address } from "viem";
import { domaMainnet } from "@/config/chains";
import tokenlist from "@/config/tokenlist.json";

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export interface VotingRule {
  id: string;
  description: string;
  weight: number;
  condition: string;
  tokens: { address: string; name: string; symbol: string; decimals: number }[];
  minBalance: string;
}

export interface VotingPowerResult {
  weight: number;
  matchedRule: VotingRule | null;
  rules: VotingRule[];
}

const client = createPublicClient({
  chain: domaMainnet,
  transport: http(),
});

/**
 * Check if a wallet holds at least `minBalance` of any token in the list.
 * Returns true if the wallet qualifies for the rule.
 */
async function checkRule(
  address: Address,
  rule: VotingRule
): Promise<boolean> {
  for (const token of rule.tokens) {
    try {
      const balance = await client.readContract({
        address: token.address as Address,
        abi: ERC20_BALANCE_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      const minBalanceWei = parseUnits(rule.minBalance, token.decimals);

      if (balance >= minBalanceWei) {
        return true;
      }
    } catch (err) {
      console.error(
        `[voting-power] Failed to check balance for ${token.symbol} (${token.address}):`,
        err
      );
      // Continue checking other tokens — don't fail the whole rule
    }
  }
  return false;
}

/**
 * Calculate the voting power for a wallet address.
 * Evaluates all rules and returns the highest matching weight.
 * Fails open: returns default weight (1) if all checks fail.
 */
export async function getVotingPower(
  address: string
): Promise<VotingPowerResult> {
  const rules = tokenlist.rules as VotingRule[];
  const checksumAddress = address as Address;

  let bestWeight = tokenlist.defaultWeight;
  let bestRule: VotingRule | null = null;

  // Evaluate all rules, pick highest weight
  const results = await Promise.allSettled(
    rules.map(async (rule) => {
      const qualifies = await checkRule(checksumAddress, rule);
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
    rules,
  };
}
