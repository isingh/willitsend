import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Will It Send - Doma Domain NFT Viewer",
  description:
    "Connect your wallet to view and manage your tokenized domain NFTs on the Doma chain.",
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
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
