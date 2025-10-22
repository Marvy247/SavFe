import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask, walletConnect } from "wagmi/connectors";

// This is your WalletConnect Project ID
const projectId = "ba5022e3d5959b0901411949b04d2b3b";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    // Order matters. The coinbaseWallet with preference: 'all' should handle most cases.
    coinbaseWallet({
        appName: "SavFe",
        preference: "all", // This is the key to enable both EOA and Smart Wallets
    }),
    injected(),
    walletConnect({ projectId }),
    metaMask(),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true, // Enable SSR for Next.js
});
