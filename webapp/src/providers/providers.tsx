import "@rainbow-me/rainbowkit/styles.css";
import { ExtensionProvider } from "./polkadot-extension-provider";
import { LightClientApiProvider } from "./lightclient-api-provider";
import { westendAssetHub } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";

const WALLET_CONNECT = import.meta.env.VITE_WALLET_CONNECT;

const config = getDefaultConfig({
  appName: "Kusama Boilerplate",
  projectId: WALLET_CONNECT,
  chains: [westendAssetHub],
  ssr: false,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ExtensionProvider>
      <LightClientApiProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>{children}</RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </LightClientApiProvider>
    </ExtensionProvider>
  );
}
