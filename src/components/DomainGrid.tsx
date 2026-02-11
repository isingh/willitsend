"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { fetchDomainNFTs } from "@/lib/doma";
import { DomainCard } from "./DomainCard";

export function DomainGrid() {
  const { address, isConnected } = useAccount();

  const { data: domains, isLoading } = useQuery({
    queryKey: ["domains", address],
    queryFn: () => {
      if (!address) return [];
      return fetchDomainNFTs(address);
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
            <svg
              className="h-8 w-8 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">
            Connect Your Wallet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            Link your wallet to view the domain NFTs (DOTs) you own on the
            Doma chain.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-xl border border-white/5 bg-zinc-900"
          />
        ))}
      </div>
    );
  }

  if (!domains || domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10">
          <h2 className="text-xl font-semibold text-white">
            No Domains Found
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            This wallet doesn&apos;t own any tokenized domains on Doma yet.
            Tokenize a domain at{" "}
            <a
              href="https://doma.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              doma.xyz
            </a>{" "}
            to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Your Domains{" "}
          <span className="text-sm font-normal text-zinc-500">
            ({domains.length})
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>
    </div>
  );
}
