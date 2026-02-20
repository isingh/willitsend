"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Vote" },
  { href: "/domains", label: "My Domains" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <div className="flex items-center gap-1.5">
          {/* Mobile menu button — 44px touch target */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 active:bg-zinc-800 sm:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              )}
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <span className="text-lg font-bold text-white sm:text-xl">
              Will It Moon
            </span>
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-400 sm:text-xs">
              beta
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="address"
        />
      </div>

      {/* Mobile nav dropdown — full-width, large touch targets */}
      {mobileOpen && (
        <nav className="border-t border-white/10 bg-zinc-950/95 backdrop-blur-md sm:hidden">
          <div className="mx-auto max-w-6xl px-4 py-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex h-12 items-center rounded-lg px-4 text-base font-medium transition-colors active:bg-zinc-800 ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
