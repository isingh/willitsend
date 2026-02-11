"use client";

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

export function DomainCard({ domain }: { domain: DomainNFT }) {
  const expiring = isExpiringSoon(domain.expiresAt);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-5 transition-all hover:border-indigo-500/50 hover:bg-zinc-900/80">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-white">
            {domain.name}
          </h3>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            Token #{domain.tokenId}
          </p>
        </div>
        <div className="ml-3 flex-shrink-0">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">
            DOT
          </span>
        </div>
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
    </div>
  );
}
