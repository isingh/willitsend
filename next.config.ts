import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure environment variables are available at build time
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
};

export default nextConfig;
