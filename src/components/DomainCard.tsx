"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DomainNFT } from "@/lib/doma";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000; // 90 days
}

export interface ListedDomainInfo {
  id: number;
  listedAt: string;
  moonCount: number;
  deadCount: number;
  totalVotes: number;
}

export function DomainCard({
  domain,
  listingInfo,
}: {
  domain: DomainNFT;
  listingInfo?: ListedDomainInfo;
}) {
  const expiring = isExpiringSoon(domain.expiresAt);
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [listed, setListed] = useState(!!listingInfo);

  const listMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/domains/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: domain.name,
          tokenId: domain.tokenId,
          ownerAddress: address,
        }),
      });
      if (res.status === 409) {
        setListed(true);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to list");
      }
      return res.json();
    },
    onSuccess: () => {
      setListed(true);
      queryClient.invalidateQueries({ queryKey: ["listed-domains"] });
    },
  });

  const total = listingInfo ? listingInfo.moonCount + listingInfo.deadCount : 0;
  const moonPct = total > 0 ? Math.round((listingInfo!.moonCount / total) * 100) : 50;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-5 transition-all hover:border-indigo-500/50 hover:bg-zinc-900/80">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-white">
            {domain.name}
          </h3>
        </div>
        {listed && listingInfo && (
          <span className="ml-2 flex-shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
            Listed {formatDate(listingInfo.listedAt)}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-zinc-500">Registered</p>
          <p className="text-zinc-300">{formatDate(domain.registeredAt)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Expires</p>
          <p
            className={
              expiring
                ? "font-medium text-amber-400"
                : "text-zinc-300"
            }
          >
            {formatDate(domain.expiresAt)}
            {expiring && (
              <span className="ml-1 text-xs text-amber-500">Soon</span>
            )}
          </p>
        </div>
      </div>

      {/* Vote results if listed and has votes */}
      {listed && listingInfo && total > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{listingInfo.moonCount} moon</span>
            <span>{listingInfo.deadCount} dead</span>
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
          <p className="mt-1 text-center text-xs text-zinc-500">
            {listingInfo.totalVotes} total vote{listingInfo.totalVotes !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* List for voting button */}
      <div className="mt-4">
        {listed ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Listed for voting
          </span>
        ) : (
          <button
            onClick={() => listMutation.mutate()}
            disabled={listMutation.isPending}
            className="w-full rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20 disabled:opacity-50"
          >
            {listMutation.isPending ? "Listing..." : "List for Voting"}
          </button>
        )}
        {listMutation.error && (
          <p className="mt-1 text-xs text-red-400">
            {listMutation.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
