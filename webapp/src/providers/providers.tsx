import { ExtensionProvider } from "./polkadot-extension-provider";
import { LightClientApiProvider } from "./lightclient-api-provider";

import { http, createConfig, webSocket } from "wagmi";
import { westendAssetHub } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const config = createConfig({
  chains: [westendAssetHub],
  transports: {
    [westendAssetHub.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ExtensionProvider>
      <LightClientApiProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </LightClientApiProvider>
    </ExtensionProvider>
  );
}
