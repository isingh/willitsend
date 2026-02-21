"use client";

import { useAccount } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AddressDisplay } from "@/components/AddressDisplay";
import { VotingPowerMeter } from "@/components/VotingPowerMeter";

interface Vote {
  voterAddress: string;
  voteType: "moon" | "dead";
  voteWeight: number;
  votedAt: string;
}

interface VotingPowerData {
  weight: number;
  matchedRule: { id: string; description: string; weight: number } | null;
  rules: { id: string; description: string; weight: number; minBalance?: string; tokens: { name: string; symbol: string }[] }[];
}

interface DomainDetail {
  id: number;
  domainName: string;
  tokenId: string;
  ownerAddress: string;
  listedAt: string;
  moonCount: number;
  deadCount: number;
  totalVotes: number;
  myVote: string | null | undefined;
  votes: Vote[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DomainSharePage() {
  const params = useParams<{ name: string }>();
  const domainName = params.name;
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [isVoting, setIsVoting] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    data: domain,
    isLoading,
    error,
  } = useQuery<DomainDetail>({
    queryKey: ["domain-detail", domainName, address],
    queryFn: async () => {
      const voterParam = address ? `?voter=${address}` : "";
      const res = await fetch(
        `/api/domains/${encodeURIComponent(domainName)}${voterParam}`
      );
      if (res.status === 404) throw new Error("not_found");
      if (!res.ok) throw new Error("Failed to fetch domain");
      return res.json();
    },
  });

  const { data: votingPower } = useQuery<VotingPowerData>({
    queryKey: ["voting-power", address],
    queryFn: async () => {
      const res = await fetch(`/api/voting-power?address=${address}`);
      if (!res.ok) throw new Error("Failed to fetch voting power");
      return res.json();
    },
    enabled: isConnected && !!address,
    staleTime: 60_000,
  });

  const voteMutation = useMutation({
    mutationFn: async (voteType: "moon" | "dead") => {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: domain!.id,
          voterAddress: address,
          voteType,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to vote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domain-detail"] });
    },
    onSettled: () => {
      setIsVoting(false);
    },
  });

  const handleVote = (voteType: "moon" | "dead") => {
    if (!isConnected || !domain) return;
    setIsVoting(true);
    voteMutation.mutate(voteType);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24">
        <div className="h-64 w-full max-w-lg animate-pulse rounded-2xl border border-white/5 bg-zinc-900" />
      </div>
    );
  }

  if (error?.message === "not_found" || !domain) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 sm:p-10">
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Domain Not Found
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            This domain hasn&apos;t been listed for voting yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex h-10 items-center text-sm text-indigo-400 hover:text-indigo-300"
          >
            Browse all domains
          </Link>
        </div>
      </div>
    );
  }

  const total = domain.moonCount + domain.deadCount;
  const moonPct =
    total > 0 ? Math.round((domain.moonCount / total) * 100) : 50;

  return (
    <div className="mx-auto max-w-lg py-2 sm:py-8">
      {/* Back link — 44px touch target */}
      <Link
        href="/"
        className="mb-5 inline-flex h-11 items-center gap-1.5 text-sm text-zinc-400 transition-colors active:text-white hover:text-white sm:mb-6"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Back to all domains
      </Link>

      {/* Domain card */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <div className="p-5 sm:p-6">
          {/* Domain name & share */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                {domain.domainName}
              </h1>
              <AddressDisplay
                address={domain.ownerAddress}
                label="Owned by"
                className="mt-1.5 text-sm text-zinc-500"
              />
            </div>
            <button
              onClick={handleCopyLink}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors active:bg-zinc-700 hover:bg-zinc-700 hover:text-white sm:h-10 sm:w-10"
              title="Copy share link"
            >
              {copied ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                  />
                </svg>
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            Listed {timeAgo(domain.listedAt)}
          </p>

          {/* Vote bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-green-400">
                {domain.moonCount} moon{domain.moonCount !== 1 ? "s" : ""}
              </span>
              <span className="text-red-400">
                {domain.deadCount} dead
              </span>
            </div>
            <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-zinc-800">
              {total > 0 ? (
                <>
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${moonPct}%` }}
                  />
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${100 - moonPct}%` }}
                  />
                </>
              ) : (
                <div className="w-full bg-zinc-700" />
              )}
            </div>
            {total > 0 && (
              <p className="mt-1.5 text-center text-xs text-zinc-500">
                {moonPct}% moon &middot; {total} vote{total !== 1 ? "s" : ""}
              </p>
            )}
            {total === 0 && (
              <p className="mt-1.5 text-center text-xs text-zinc-500">
                No votes yet &mdash; be the first!
              </p>
            )}
          </div>

          {/* Vote error */}
          {voteMutation.error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {voteMutation.error.message}
            </div>
          )}

          {/* Voting Power Progression */}
          {isConnected && votingPower && (
            <VotingPowerMeter votingPower={votingPower} compact />
          )}

          {/* Vote buttons or connect prompt */}
          {isConnected ? (
            address?.toLowerCase() === domain.ownerAddress.toLowerCase() ? (
              <div className="mt-6 rounded-xl border border-white/10 bg-zinc-800/50 p-4 text-center">
                <p className="text-sm text-zinc-400">
                  You can&apos;t vote on your own domain.
                </p>
              </div>
            ) : (
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleVote("moon")}
                  disabled={isVoting}
                  className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all sm:h-11 ${
                    domain.myVote === "moon"
                      ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/50"
                      : "bg-zinc-800 text-zinc-400 active:bg-green-500/10 active:text-green-400 hover:bg-green-500/10 hover:text-green-400"
                  } disabled:opacity-50`}
                >
                  <span className="text-lg">🚀</span>
                  Moon
                </button>
                <button
                  onClick={() => handleVote("dead")}
                  disabled={isVoting}
                  className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all sm:h-11 ${
                    domain.myVote === "dead"
                      ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                      : "bg-zinc-800 text-zinc-400 active:bg-red-500/10 active:text-red-400 hover:bg-red-500/10 hover:text-red-400"
                  } disabled:opacity-50`}
                >
                  <span className="text-lg">💀</span>
                  Dead
                </button>
              </div>
            )
          ) : (
            <div className="mt-6 rounded-xl border border-white/10 bg-zinc-800/50 p-4 text-center">
              <p className="text-sm text-zinc-400">
                Connect your wallet to vote on this domain.
              </p>
            </div>
          )}

          {isConnected && domain.myVote && (
            <div className="mt-3 rounded-lg bg-zinc-800/60 px-3 py-1.5 text-center">
              <p className="text-xs text-zinc-400">
                You voted {domain.myVote === "moon" ? "🚀 moon" : "💀 dead"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Voters list */}
      {domain.votes.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 sm:mt-6">
          <div className="border-b border-white/5 px-5 py-3.5 sm:px-6 sm:py-4">
            <h2 className="text-sm font-semibold text-white">
              Votes ({domain.votes.length})
            </h2>
          </div>
          <ul className="divide-y divide-white/5">
            {domain.votes.map((vote) => (
              <li
                key={vote.voterAddress}
                className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">
                    {vote.voteType === "moon" ? "🚀" : "💀"}
                  </span>
                  <AddressDisplay
                    address={vote.voterAddress}
                    className="text-sm text-zinc-300"
                  />
                  {vote.voteWeight > 1 && (
                    <span className="rounded-full bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">
                      {vote.voteWeight}x
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 whitespace-nowrap pl-2">
                  {timeAgo(vote.votedAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
