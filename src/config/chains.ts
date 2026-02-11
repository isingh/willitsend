import { defineChain } from "viem";

export const domaMainnet = defineChain({
  id: 97_477,
  name: "Doma",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://doma.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Doma Explorer",
      url: "https://explorer.doma.xyz",
    },
  },
});

export const domaTestnet = defineChain({
  id: 97476,
  name: "Doma Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.doma.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Doma Testnet Explorer",
      url: "https://explorer-testnet.doma.xyz",
    },
  },
  testnet: true,
});
