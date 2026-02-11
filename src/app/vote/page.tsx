"use client";

import { useAccount } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface ListedDomain {
  id: number;
  domainName: string;
  tokenId: string;
  ownerAddress: string;
  listedAt: string;
  moonCount: number;
  deadCount: number;
  totalVotes: number;
  myVote: string | null | undefined;
}

function VoteCard({
  domain,
  onVote,
  isVoting,
}: {
  domain: ListedDomain;
  onVote: (domainId: number, voteType: "moon" | "dead") => void;
  isVoting: boolean;
}) {
  const total = domain.moonCount + domain.deadCount;
  const moonPct = total > 0 ? Math.round((domain.moonCount / total) * 100) : 50;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-all hover:border-white/20">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="truncate text-lg font-semibold text-white">
            {domain.domainName}
          </h3>
          {domain.tokenId && (
            <span className="ml-2 flex-shrink-0 rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400">
              #{domain.tokenId}
            </span>
          )}
        </div>

        {/* Vote bar */}
        {total > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{domain.moonCount} moon</span>
              <span>{domain.deadCount} dead</span>
            </div>
            <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${moonPct}%` }}
              />
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${100 - moonPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Vote buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => onVote(domain.id, "moon")}
            disabled={isVoting}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              domain.myVote === "moon"
                ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/50"
                : "bg-zinc-800 text-zinc-300 hover:bg-green-500/10 hover:text-green-400"
            } disabled:opacity-50`}
          >
            <span className="text-lg">🚀</span>
            Moon
          </button>
          <button
            onClick={() => onVote(domain.id, "dead")}
            disabled={isVoting}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              domain.myVote === "dead"
                ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                : "bg-zinc-800 text-zinc-300 hover:bg-red-500/10 hover:text-red-400"
            } disabled:opacity-50`}
          >
            <span className="text-lg">💀</span>
            Dead
          </button>
        </div>

        {domain.myVote && (
          <p className="mt-2 text-center text-xs text-zinc-500">
            You voted {domain.myVote === "moon" ? "🚀 moon" : "💀 dead"}
          </p>
        )}
      </div>
    </div>
  );
}

export default function VotePage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [votingId, setVotingId] = useState<number | null>(null);

  const { data: domains, isLoading } = useQuery<ListedDomain[]>({
    queryKey: ["listed-domains", address],
    queryFn: async () => {
      const params = address ? `?voter=${address}` : "";
      const res = await fetch(`/api/domains/listed${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 10_000,
  });

  const voteMutation = useMutation({
    mutationFn: async ({
      domainId,
      voteType,
    }: {
      domainId: number;
      voteType: "moon" | "dead";
    }) => {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId,
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
      queryClient.invalidateQueries({ queryKey: ["listed-domains"] });
    },
    onSettled: () => {
      setVotingId(null);
    },
  });

  const handleVote = (domainId: number, voteType: "moon" | "dead") => {
    if (!isConnected) return;
    setVotingId(domainId);
    voteMutation.mutate({ domainId, voteType });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Vote</h1>
        <p className="mt-2 text-zinc-400">
          Will it send? Vote 🚀 moon or 💀 dead on listed domains.
        </p>
      </div>

      {voteMutation.error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {voteMutation.error.message}
        </div>
      )}

      {!isConnected && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10">
            <h2 className="text-xl font-semibold text-white">
              Connect Your Wallet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
              Connect your wallet to vote on domains.
            </p>
          </div>
        </div>
      )}

      {isConnected && isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl border border-white/5 bg-zinc-900"
            />
          ))}
        </div>
      )}

      {isConnected && !isLoading && (!domains || domains.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10">
            <h2 className="text-xl font-semibold text-white">
              No Domains Listed Yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
              No one has listed their domains for voting yet. Go to My Domains
              and list one to get started!
            </p>
          </div>
        </div>
      )}

      {isConnected && domains && domains.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <VoteCard
              key={domain.id}
              domain={domain}
              onVote={handleVote}
              isVoting={votingId === domain.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
