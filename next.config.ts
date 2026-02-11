import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure environment variables are available at build time
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_DOMA_SUBGRAPH_URL: process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL,
  },
};

export default nextConfig;
