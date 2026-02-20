import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Will it Moon - Vote for your favorite Doma Domains",
  description:
    "Connect your wallet to vote on your favorite doma domains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 font-sans antialiased">
        <Providers>
          <Header />
          <main className="mobile-shell mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
