"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const EXPLORER_URL = "https://explorer.doma.xyz";
const DOMA_API_URL =
  process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL || "https://api.doma.xyz/graphql";
const DOMA_API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY || "";
const DOMA_CAIP2_NETWORK_ID = "eip155:97477";

function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

async function fetchPrimaryDomaName(
  address: string
): Promise<string | null> {
  const caip10Address = `${DOMA_CAIP2_NETWORK_ID}:${address}`;

  const query = `
    query GetPrimaryName($ownedBy: [AddressCAIP10!]) {
      names(ownedBy: $ownedBy, take: 1) {
        items {
          name
        }
      }
    }
  `;

  try {
    const res = await fetch(DOMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(DOMA_API_KEY ? { "Api-Key": DOMA_API_KEY } : {}),
      },
      body: JSON.stringify({
        query,
        variables: { ownedBy: [caip10Address] },
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.names?.items?.[0]?.name ?? null;
  } catch {
    return null;
  }
}

export function AddressDisplay({
  address,
  label,
  className = "",
}: {
  address: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const { data: domaName } = useQuery({
    queryKey: ["doma-name", address.toLowerCase()],
    queryFn: () => fetchPrimaryDomaName(address),
    staleTime: 5 * 60_000,
    enabled: !!address,
  });

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = `${EXPLORER_URL}/address/${address}`;
  const displayText = domaName || truncateAddress(address);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {label && <span>{label}</span>}
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono transition-colors hover:text-indigo-400"
        title={address}
      >
        {displayText}
      </a>
      <button
        onClick={handleCopy}
        className="inline-flex text-zinc-600 transition-colors hover:text-zinc-300"
        title={copied ? "Copied!" : "Copy address"}
      >
        {copied ? (
          <svg
            className="h-3.5 w-3.5 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        ) : (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 13.5 2.25H10.5a2.25 2.25 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"
            />
          </svg>
        )}
      </button>
    </span>
  );
}
