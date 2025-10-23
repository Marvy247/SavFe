"use client";

import { useReadContract, useChainId } from "wagmi";
import { Address } from "viem";

type DisplayNameProps = {
  address: Address | undefined;
};

function truncateAddress(address: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function DisplayName({ address }: DisplayNameProps) {
  if (!address) return <span></span>;

  const chainId = useChainId();

  // Basenames contract addresses for different chains
  const basenamesAddresses = {
    8453: "0x03c4738Ee98bE3447F61d9146524975282ecD2c17", // Base mainnet
    84532: "0x4B1488B7a6B320d2D721406204aBc3eeAa9AD329", // Base Sepolia
  } as const;

  const contractAddress = basenamesAddresses[chainId as keyof typeof basenamesAddresses];

  if (!contractAddress) {
    // Fallback to truncated address if chain not supported
    return <span>{truncateAddress(address)}</span>;
  }

  const basenamesContract = {
    address: contractAddress as Address,
    abi: [
      {
        inputs: [{ internalType: "address", name: "addr", type: "address" }],
        name: "getName",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ],
  } as const;

  const { data: basename, isLoading } = useReadContract({
    ...basenamesContract,
    functionName: "getName",
    args: [address],
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (basename && basename.trim() !== "") {
    return <span>{basename}.base.eth</span>;
  }

  return <span>{truncateAddress(address)}</span>;
}
