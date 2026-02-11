"use client";

import { useAccount } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Link from "next/link";

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

function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
          <span className="ml-2 flex-shrink-0 text-xs text-zinc-500">
            {timeAgo(domain.listedAt)}
          </span>
        </div>

        <p className="mt-1 font-mono text-xs text-zinc-500">
          {truncateAddress(domain.ownerAddress)}
        </p>

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

type SectionTab = "all" | "recent" | "most-voted";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [votingId, setVotingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<SectionTab>("all");
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    if (!domains) return [];
    let list = domains;

    // Apply search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.domainName.toLowerCase().includes(q) ||
          d.ownerAddress.toLowerCase().includes(q)
      );
    }

    // Apply tab sorting/filtering
    if (activeTab === "recent") {
      list = [...list].sort(
        (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
      );
    } else if (activeTab === "most-voted") {
      list = [...list].sort((a, b) => b.totalVotes - a.totalVotes);
    }

    return list;
  }, [domains, search, activeTab]);

  const tabs: { key: SectionTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "recent", label: "Recently Listed" },
    { key: "most-voted", label: "Most Voted" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Vote</h1>
          <p className="mt-2 text-zinc-400">
            Will it send? Vote 🚀 moon or 💀 dead on listed domains.
          </p>
        </div>
        {isConnected && (
          <Link
            href="/domains"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
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
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
              />
            </svg>
            My Domains
          </Link>
        )}
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
              No one has listed their domains for voting yet. Go to{" "}
              <Link href="/domains" className="text-indigo-400 underline hover:text-indigo-300">
                My Domains
              </Link>{" "}
              and list one to get started!
            </p>
          </div>
        </div>
      )}

      {isConnected && domains && domains.length > 0 && (
        <>
          {/* Search and tabs */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 rounded-lg bg-zinc-900 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search domains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-900 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/50 sm:w-64"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-zinc-500">
                No domains match your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((domain) => (
                <VoteCard
                  key={domain.id}
                  domain={domain}
                  onVote={handleVote}
                  isVoting={votingId === domain.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
