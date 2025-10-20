'use client';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': any;
    }
  }
}

import '@coinbase/onchainkit/styles.css';
import './globals.css';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiProvider } from "wagmi";
import { config } from "../lib/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";

function ThemedOnchainKitProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={config.chains[0]}
      config={{
        appearance: {
          mode: theme === 'dark' ? 'dark' : 'light', // 'light' | 'dark' | 'auto'
        },
        wallet: {
          display: 'modal', // 'modal' | 'drawer'
          preference: 'all', // 'all' | 'smartWalletOnly' | 'eoaOnly'
        },
        // paymaster: process.env.NEXT_PUBLIC_PAYMASTER_URL || 'https://paymaster.base.org', // Paymaster URL when available
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // keep QueryClient stable across renders
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html suppressHydrationWarning>
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              scriptProps={{ async: true }}
            >
              <ThemedOnchainKitProvider>
                {children}
              </ThemedOnchainKitProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
