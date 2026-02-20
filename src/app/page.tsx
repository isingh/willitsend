"use client";

import { useAccount } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import { AddressDisplay } from "@/components/AddressDisplay";
import { VotingPowerMeter } from "@/components/VotingPowerMeter";

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

interface VotingPowerRule {
  id: string;
  description: string;
  weight: number;
  minBalance?: string;
  tokens: { name: string; symbol: string }[];
}

interface VotingPowerData {
  weight: number;
  matchedRule: { id: string; description: string; weight: number } | null;
  rules: VotingPowerRule[];
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-all hover:border-white/20">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-base font-semibold text-white sm:text-lg">
            <Link
              href={`/domain/${encodeURIComponent(domain.domainName)}`}
              className="hover:text-indigo-400 transition-colors"
            >
              {domain.domainName}
            </Link>
          </h3>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              href={`/domain/${encodeURIComponent(domain.domainName)}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 active:bg-zinc-800 hover:text-white transition-colors"
              title="View details"
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
                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                />
              </svg>
            </Link>
            <span className="text-xs text-zinc-500 whitespace-nowrap">
              {timeAgo(domain.listedAt)}
            </span>
          </div>
        </div>

        <AddressDisplay
          address={domain.ownerAddress}
          label="Owned by"
          className="mt-1.5 text-xs text-zinc-500"
        />

        {/* Vote bar */}
        {total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{domain.moonCount} moon</span>
              <span>{domain.deadCount} dead</span>
            </div>
            <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-zinc-800">
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

        {/* Vote buttons — 48px tall for comfortable thumb tap */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => onVote(domain.id, "moon")}
            disabled={isVoting}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all sm:h-11 ${
              domain.myVote === "moon"
                ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/50"
                : "bg-zinc-800 text-zinc-300 active:bg-green-500/10 active:text-green-400 hover:bg-green-500/10 hover:text-green-400"
            } disabled:opacity-50`}
          >
            <span className="text-lg">🚀</span>
            Moon
          </button>
          <button
            onClick={() => onVote(domain.id, "dead")}
            disabled={isVoting}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all sm:h-11 ${
              domain.myVote === "dead"
                ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                : "bg-zinc-800 text-zinc-300 active:bg-red-500/10 active:text-red-400 hover:bg-red-500/10 hover:text-red-400"
            } disabled:opacity-50`}
          >
            <span className="text-lg">💀</span>
            Dead
          </button>
        </div>

        {domain.myVote && (
          <p className="mt-2.5 text-center text-xs text-zinc-500">
            You voted {domain.myVote === "moon" ? "🚀 moon" : "💀 dead"}
          </p>
        )}
      </div>
    </div>
  );
}

type SectionTab = "all" | "recent" | "mooning" | "dying";

const VALID_TABS: SectionTab[] = ["all", "recent", "mooning", "dying"];

function isValidTab(value: string | null): value is SectionTab {
  return value !== null && VALID_TABS.includes(value as SectionTab);
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [votingId, setVotingId] = useState<number | null>(null);

  const tabParam = searchParams.get("tab");
  const activeTab: SectionTab = isValidTab(tabParam) ? tabParam : "all";

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const handleTabChange = useCallback((tab: SectionTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/", { scroll: false });
    setCurrentPage(1);
  }, [searchParams, router]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

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
    if (activeTab === "all") {
      list = [...list].sort((a, b) => {
        const aVotes = a.moonCount + a.deadCount;
        const bVotes = b.moonCount + b.deadCount;
        if (bVotes !== aVotes) return bVotes - aVotes;
        return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
      });
    } else if (activeTab === "recent") {
      list = [...list].sort(
        (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
      );
    } else if (activeTab === "mooning") {
      list = [...list].sort((a, b) => b.moonCount - a.moonCount);
    } else if (activeTab === "dying") {
      list = [...list].sort((a, b) => b.deadCount - a.deadCount);
    }

    return list;
  }, [domains, search, activeTab]);

  // Clamp page if filtered results shrink below current page
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedDomains = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const tabs: { key: SectionTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "recent", label: "Recent" },
    { key: "mooning", label: "Mooning 🚀" },
    { key: "dying", label: "Dying 💀" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Vote</h1>
          <p className="mt-1 text-sm text-zinc-400 sm:mt-2 sm:text-base">
            Will it moon? Vote 🚀 or 💀 on listed domains.
          </p>
        </div>
        {isConnected && (
          <Link
            href="/domains"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-500/10 px-4 text-sm font-medium text-indigo-400 transition-colors active:bg-indigo-500/20 hover:bg-indigo-500/20 sm:h-10"
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
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {voteMutation.error.message}
        </div>
      )}

      {/* Voting Power Progression */}
      {isConnected && votingPower && (
        <VotingPowerMeter votingPower={votingPower} />
      )}

      {!isConnected && (
        <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 sm:p-10">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Connect Your Wallet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
              Connect your wallet to vote on domains.
            </p>
          </div>
        </div>
      )}

      {isConnected && isLoading && (
        <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-white/5 bg-zinc-900"
            />
          ))}
        </div>
      )}

      {isConnected && !isLoading && (!domains || domains.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 sm:p-10">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Horizontally scrollable tab bar on mobile */}
            <div className="tabs-scroll -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="inline-flex gap-1 rounded-xl bg-zinc-900 p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex h-9 items-center whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors sm:h-8 sm:px-3 ${
                      activeTab === tab.key
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 active:text-zinc-300 hover:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/50 sm:h-10 sm:w-64"
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
            <>
              <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3">
                {paginatedDomains.map((domain) => (
                  <VoteCard
                    key={domain.id}
                    domain={domain}
                    onVote={handleVote}
                    isVoting={votingId === domain.id}
                  />
                ))}
              </div>
              <Pagination
                totalItems={filtered.length}
                currentPage={safePage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
