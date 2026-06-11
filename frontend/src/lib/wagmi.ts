import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { x1Testnet, x1Mainnet } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "PredictX",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "predictx_placeholder",
  chains: [x1Testnet, x1Mainnet],
  ssr: true,
});
