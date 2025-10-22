"use client";

import { useEnsName } from "wagmi";
import { Address } from "viem";

type DisplayNameProps = {
  address: Address;
};

function truncateAddress(address: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function DisplayName({ address }: DisplayNameProps) {
  const { data: ensName, isLoading } = useEnsName({
    address,
    chainId: 84532, // Base Sepolia
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (ensName) {
    return <span>{ensName}</span>;
  }

  return <span>{truncateAddress(address)}</span>;
}
