import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { domaMainnet } from "./chains";

export const config = getDefaultConfig({
  appName: "Will It Send",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [domaMainnet],
  ssr: true,
});
