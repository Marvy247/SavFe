"use client";
import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "../lib/contract";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function CreateGroup() {
  const [amount, setAmount] = useState<string>("");
  const [period, setPeriod] = useState<string>("");

  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
    error,
  } = useWriteContract();

  // Wait for transaction to be mined
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleCreateGroup = async () => {
    // Validate inputs
    const amountValue = parseFloat(amount);
    const periodValue = parseInt(period);

    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    if (isNaN(periodValue) || periodValue <= 0) {
      alert("Please enter a valid period greater than 0 days");
      return;
    }

    // Convert ETH amount to wei (1 ETH = 10^18 wei)
    const amountWei = BigInt(Math.floor(amountValue * 10 ** 18));
    // Convert period from days to seconds
    const periodSeconds = BigInt(periodValue * 24 * 60 * 60);

    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createGroup",
      args: [amountWei, periodSeconds],
    });
  };

  const isLoading = isWriting || isConfirming;

  return (
    <Card className="gradient-card-hover animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {/* <Plus className="h-5 w-5 text-primary" /> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M224,128a95.76,95.76,0,0,1-31.8,71.37A72,72,0,0,0,128,160a40,40,0,1,0-40-40,40,40,0,0,0,40,40,72,72,0,0,0-64.2,39.37h0A96,96,0,1,1,224,128Z"
                opacity="0.2"
              ></path>
              <path d="M168,56a8,8,0,0,1,8-8h16V32a8,8,0,0,1,16,0V48h16a8,8,0,0,1,0,16H208V80a8,8,0,0,1-16,0V64H176A8,8,0,0,1,168,56Zm62.56,54.68a103.92,103.92,0,1,1-85.24-85.24,8,8,0,0,1-2.64,15.78A88.07,88.07,0,0,0,40,128a87.62,87.62,0,0,0,22.24,58.41A79.66,79.66,0,0,1,98.3,157.66a48,48,0,1,1,59.4,0,79.66,79.66,0,0,1,36.06,28.75A87.62,87.62,0,0,0,216,128a88.85,88.85,0,0,0-1.22-14.68,8,8,0,1,1,15.78-2.64ZM128,152a32,32,0,1,0-32-32A32,32,0,0,0,128,152Zm0,64a87.57,87.57,0,0,0,53.92-18.5,64,64,0,0,0-107.84,0A87.57,87.57,0,0,0,128,216Z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Create New Group
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Start a new rotating savings group
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-sm font-semibold text-card-foreground"
            >
              Contribution Amount (ETH)
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.1"
                step="0.01"
                min="0"
                className="pr-12"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Badge variant="secondary" className="text-xs">
                  ETH
                </Badge>
              </div>
            </div>
          </div>

          {/* Period Input */}
          <div className="space-y-2">
            <Label
              htmlFor="period"
              className="text-sm font-semibold text-card-foreground"
            >
              Contribution Period (days)
            </Label>
            <div className="relative">
              <Input
                id="period"
                type="number"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="30"
                min="1"
                className="pr-12"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Badge variant="secondary" className="text-xs">
                  days
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleCreateGroup}
          disabled={!amount || !period || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <span>
                {isWriting ? "Confirm in Wallet..." : "Creating Group..."}
              </span>
            </div>
          ) : (
            "Create Group"
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
            <span>Group created successfully!</span>
          </div>
        )}

        {error && (
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
            <span className="break-all">
              Error: {error.message.split("\n")[0]}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
