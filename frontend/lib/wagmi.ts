import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask, safe, walletConnect } from "wagmi/connectors";

const projectId = "ba5022e3d5959b0901411949b04d2b3b";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [injected(), walletConnect({ projectId }), metaMask(), coinbaseWallet(), safe()],

  transports: {
    [baseSepolia.id]: http(),
  },
});
