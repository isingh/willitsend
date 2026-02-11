import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { domaTestnet } from "./chains";

export const config = getDefaultConfig({
  appName: "Will It Send",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [domaTestnet],
  ssr: true,
});
