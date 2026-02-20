import { DomainGrid } from "@/components/DomainGrid";

export default function DomainsPage() {
  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">My Domains</h1>
        <p className="mt-1 text-sm text-zinc-400 sm:mt-2 sm:text-base">
          View the tokenized domain NFTs in your connected wallet.
        </p>
      </div>
      <DomainGrid />
    </div>
  );
}
