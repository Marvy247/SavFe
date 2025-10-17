"use client";

import { WagmiProvider } from "wagmi";
import { config } from "../lib/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";

export function Providers({ children }: { children: ReactNode }) {
  // keep QueryClient stable across renders
  const [queryClient] = useState(() => new QueryClient());

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={config.chains[0]}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </OnchainKitProvider>
  );
}
