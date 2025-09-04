import { createConfig, http } from "wagmi";
import { liskSepolia } from "wagmi/chains";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

const projectId = "ba5022e3d5959b0901411949b04d2b3b";

export const config = createConfig({
  chains: [liskSepolia],
  connectors: [injected(), walletConnect({ projectId }), metaMask(), safe()],

  transports: {
    [liskSepolia.id]: http(),
  },
});
