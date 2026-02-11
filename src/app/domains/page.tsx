import { DomainGrid } from "@/components/DomainGrid";

export default function DomainsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Domains</h1>
        <p className="mt-2 text-zinc-400">
          View the tokenized domain NFTs in your connected wallet.
        </p>
      </div>
      <DomainGrid />
    </div>
  );
}
