export default function VotePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Vote</h1>
        <p className="mt-2 text-zinc-400">
          Cast your vote on community proposals using your domain NFTs.
        </p>
      </div>

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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Coming Soon</h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            Voting is under development. Domain holders will be able to
            participate in community governance and vote on proposals.
          </p>
        </div>
      </div>
    </div>
  );
}
