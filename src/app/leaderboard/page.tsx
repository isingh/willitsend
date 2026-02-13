"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AddressDisplay } from "@/components/AddressDisplay";

interface LeaderboardEntry {
  rank: number;
  id: number;
  domainName: string;
  ownerAddress: string;
  moonCount: number;
  deadCount: number;
  totalVotes: number;
  score: number;
}

export default function LeaderboardPage() {
  const { data: entries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 15_000,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="mt-2 text-zinc-400">
          Top domains ranked by community votes. Score = moons - deads.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-white/5 bg-zinc-900"
            />
          ))}
        </div>
      )}

      {!isLoading && (!entries || entries.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <svg
                className="h-8 w-8 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.016 6.016 0 0 1-2.77.96m0 0a6.016 6.016 0 0 1-2.77-.96"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">No Votes Yet</h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
              The leaderboard will populate once domains receive votes. Head to
              the Vote page to get started!
            </p>
          </div>
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/50 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3 text-center">🚀 Moon</th>
                <th className="px-4 py-3 text-center">💀 Dead</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="bg-zinc-900 transition-colors hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                        entry.rank === 1
                          ? "bg-amber-500/20 text-amber-400"
                          : entry.rank === 2
                            ? "bg-zinc-400/20 text-zinc-300"
                            : entry.rank === 3
                              ? "bg-orange-500/20 text-orange-400"
                              : "text-zinc-500"
                      }`}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <Link
                        href={`/domain/${encodeURIComponent(entry.domainName)}`}
                        className="font-medium text-white transition-colors hover:text-indigo-400"
                      >
                        {entry.domainName}
                      </Link>
                      <AddressDisplay
                        address={entry.ownerAddress}
                        className="text-xs text-zinc-500"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-green-400">
                    {entry.moonCount}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-red-400">
                    {entry.deadCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-sm font-semibold ${
                        entry.score > 0
                          ? "text-green-400"
                          : entry.score < 0
                            ? "text-red-400"
                            : "text-zinc-400"
                      }`}
                    >
                      {entry.score > 0 ? "+" : ""}
                      {entry.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
