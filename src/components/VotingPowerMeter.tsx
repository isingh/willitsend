"use client";

import { Fragment } from "react";

export interface VotingPowerMeterData {
  weight: number;
  matchedRule: { id: string; description: string; weight: number } | null;
  rules: {
    id: string;
    description: string;
    weight: number;
    minBalance?: string;
  }[];
}

interface Tier {
  weight: number;
  label: string;
  description: string;
  minBalance?: string;
}

function buildTiers(rules: VotingPowerMeterData["rules"]): Tier[] {
  const base: Tier = {
    weight: 1,
    label: "1x",
    description: "Base voting power",
  };
  const sorted = [...rules]
    .sort((a, b) => a.weight - b.weight)
    .map((r) => ({
      weight: r.weight,
      label: `${r.weight}x`,
      description: r.description,
      minBalance: r.minBalance,
    }));
  return [base, ...sorted];
}

function nextTierHint(tier: Tier): string {
  if (!tier.minBalance) return tier.description;
  const n = parseFloat(tier.minBalance);
  if (n < 1) return "Hold any token";
  return `Hold ${n}+ tokens`;
}

export function VotingPowerMeter({
  votingPower,
  compact = false,
}: {
  votingPower: VotingPowerMeterData;
  compact?: boolean;
}) {
  const tiers = buildTiers(votingPower.rules);
  const currentWeight = votingPower.weight;

  // Find current tier index (last tier where weight <= currentWeight)
  let currentTierIndex = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (tiers[i].weight <= currentWeight) {
      currentTierIndex = i;
      break;
    }
  }

  const nextTier =
    currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  const isMaxTier = !nextTier;

  // Only base tier exists — nothing to show progression for
  if (tiers.length <= 1) {
    return null;
  }

  // ── Compact variant (domain detail page) ──────────────────────────────
  if (compact) {
    return (
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-zinc-800/40 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          {/* Inline stepper dots */}
          <div className="flex flex-shrink-0 items-center">
            {tiers.map((tier, i) => {
              const achieved = tier.weight <= currentWeight;
              const isCurrent = i === currentTierIndex;
              return (
                <Fragment key={tier.weight}>
                  <div
                    className={`rounded-full ${
                      isCurrent
                        ? "h-2 w-2 bg-indigo-400 shadow-[0_0_0_2px_rgba(129,140,248,0.2)]"
                        : achieved
                          ? "h-1.5 w-1.5 bg-indigo-400/60"
                          : "h-1.5 w-1.5 border border-zinc-600"
                    }`}
                  />
                  {i < tiers.length - 1 && (
                    <div
                      className={`mx-0.5 h-px w-2.5 ${
                        tiers[i + 1].weight <= currentWeight
                          ? "bg-indigo-400/50"
                          : "bg-zinc-700"
                      }`}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>

          <p className="min-w-0 truncate text-xs">
            <span
              className={`font-medium ${
                currentWeight > 1 ? "text-indigo-300" : "text-zinc-300"
              }`}
            >
              {currentWeight}x power
            </span>
            {nextTier && (
              <span className="text-zinc-500">
                {" \u00b7 "}
                {nextTierHint(nextTier)} &rarr; {nextTier.label}
              </span>
            )}
            {isMaxTier && currentWeight > 1 && (
              <span className="text-indigo-400/60"> &middot; Max</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  // ── Full variant (home page) ──────────────────────────────────────────
  return (
    <div className="mb-4 rounded-xl border border-white/[0.06] bg-zinc-900 px-4 py-4">
      {/* Label */}
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
        Your Voting Power
      </p>
      {/* Stepper track: dots connected by lines */}
      <div className="flex items-start px-1">
        {tiers.map((tier, i) => {
          const achieved = tier.weight <= currentWeight;
          const isCurrent = i === currentTierIndex;
          return (
            <Fragment key={tier.weight}>
              {/* Tier node: dot + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    isCurrent
                      ? "bg-indigo-400 shadow-[0_0_0_3px_rgba(129,140,248,0.15),0_0_8px_rgba(129,140,248,0.3)]"
                      : achieved
                        ? "bg-indigo-500/60"
                        : "border-[1.5px] border-zinc-600"
                  }`}
                />
                <span
                  className={`mt-1.5 text-xs ${
                    isCurrent
                      ? "font-bold text-indigo-400"
                      : achieved
                        ? "font-medium text-indigo-400/50"
                        : "font-medium text-zinc-600"
                  }`}
                >
                  {tier.label}
                </span>
              </div>

              {/* Connecting line between tiers */}
              {i < tiers.length - 1 && (
                <div
                  className={`mx-1 mt-[4px] h-[1.5px] flex-1 rounded-full ${
                    tiers[i + 1].weight <= currentWeight
                      ? "bg-indigo-500/40"
                      : "bg-zinc-700/80"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Status text */}
      <div className="mt-3 flex items-baseline justify-between gap-2">
        {currentWeight > 1 ? (
          <p className="text-sm text-zinc-300">
            Your votes count as{" "}
            <span className="font-semibold text-indigo-400">
              {currentWeight}
            </span>
          </p>
        ) : (
          <p className="text-sm text-zinc-400">Boost your voting power</p>
        )}
        {nextTier && (
          <p className="flex-shrink-0 text-xs text-zinc-500">
            {nextTierHint(nextTier)} &rarr; {nextTier.label}
          </p>
        )}
        {isMaxTier && currentWeight > 1 && (
          <span className="flex-shrink-0 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
            Max power
          </span>
        )}
      </div>
    </div>
  );
}
