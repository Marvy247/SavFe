"use client";

import { useReadContract } from "wagmi";
import { Address } from "viem";

type DisplayNameProps = {
  address: Address | undefined;
};

function truncateAddress(address: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Basenames contract on Base mainnet
const basenamesContract = {
  address: "0x03c4738Ee98bE3447F61d9146524975282ecD2c17" as Address,
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

export function DisplayName({ address }: DisplayNameProps) {
  if (!address) return <span></span>;

  const { data: basename, isLoading } = useReadContract({
    ...basenamesContract,
    functionName: "getName",
    args: [address],
    chainId: 8453, // Base mainnet
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (basename && basename.trim() !== "") {
    return <span>{basename}.base.eth</span>;
  }

  return <span>{truncateAddress(address)}</span>;
}
