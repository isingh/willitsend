export default function LeaderboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="mt-2 text-zinc-400">
          See who holds the most valuable domain portfolios on Doma.
        </p>
      </div>

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
          <h2 className="text-xl font-semibold text-white">Coming Soon</h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            The leaderboard is under development. Soon you&apos;ll be able to see
            top domain holders ranked by portfolio value and activity.
          </p>
        </div>
      </div>
    </div>
  );
}
