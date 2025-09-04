"use client";
import React, { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract,
} from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS } from "../lib/contract";
import { formatEther } from "viem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminWithdrawEarnings() {
  const { address } = useAccount();
  const [isOwner, setIsOwner] = useState(false);

  // Check if current user is the owner
  const { data: ownerAddress } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "owner",
  });

  // Get fountain amount
  const { data: fountainAmount } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "fountain",
  });

  useEffect(() => {
    if (ownerAddress && address && typeof ownerAddress === "string" && typeof address === "string") {
      setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
    }
  }, [ownerAddress, address]);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleWithdraw = async () => {
    try {
      writeContract({
        address: SAVFE_ADDRESS,
        abi: SAVFE_ABI,
        functionName: "dripFountain",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = isPending || isConfirming;

  // For now, we'll show the fountain amount as the available earnings
  // In a real implementation, you'd need to get the contract balance
  const availableEarnings = fountainAmount && typeof fountainAmount === "bigint" ? fountainAmount : BigInt(0);

  if (!isOwner) {
    return null; // Don't show component if user is not owner
  }

  return (
    <Card className="gradient-card-hover animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a8,8,0,0,1-8,8H136v16a8,8,0,0,1-16,0V156H96a8,8,0,0,1,0-16h24V124a8,8,0,0,1,16,0v16h24A8,8,0,0,1,168,148Z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Admin: Withdraw Platform Earnings
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Withdraw accumulated platform fees from individual savings
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              Admin Only
            </Badge>
            <div className="text-xs text-muted-foreground">
              Only contract owner can access this function
            </div>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Available Earnings
            </div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {fountainAmount && typeof fountainAmount === "bigint" ? formatEther(fountainAmount) : "0"} ETH
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Reserved Fountain
            </div>
            <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
              {fountainAmount && typeof fountainAmount === "bigint" ? formatEther(fountainAmount) : "0"} ETH
            </div>
          </div>
        </div>

        <Button
          onClick={handleWithdraw}
          disabled={isLoading || availableEarnings === BigInt(0)}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <span>
                {isPending ? "Confirm in Wallet..." : "Withdrawing..."}
              </span>
            </div>
          ) : (
            `Withdraw ${fountainAmount && typeof fountainAmount === "bigint" ? formatEther(fountainAmount) : "0"} ETH`
          )}
        </Button>

        {/* Status Messages */}
        {txHash && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Transaction: </span>
            <a
              href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-mono"
            >
              {txHash.slice(0, 8)}...{txHash.slice(-6)}
            </a>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Platform earnings withdrawn successfully!</span>
          </div>
        )}

        {isError && (
          <div className="flex items-start space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            <svg
              className="h-4 w-4 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Withdrawal failed. You may not have permission or there are no
              earnings to withdraw.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
