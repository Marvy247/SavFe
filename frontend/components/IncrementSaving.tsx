"use client";
import React, { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS, CHILD_SAVFE_ABI } from "../lib/contract";
import { useQueryClient } from "@tanstack/react-query";
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
import TokenSelector from "./TokenSelector";

export default function IncrementSaving() {
  const { address } = useAccount();
  const [savingName, setSavingName] = useState<string>("");
  const [incrementAmount, setIncrementAmount] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [savingOptions, setSavingOptions] = useState<string[]>([]);

  // Fetch user's savings to populate options
  const { data: childContractAddress } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "getUserChildContractAddress",
    args: [],
  });

  // Get savings names from child contract
  const { data: savingsNames } = useReadContract({
    address: childContractAddress as `0x${string}` | undefined,
    abi: CHILD_SAVFE_ABI,
    functionName: 'getSavingsNames',
    args: [],
    query: {
      enabled: !!childContractAddress,
    }
  });

  useEffect(() => {
    if (savingsNames && (savingsNames as any).savingsNames) {
      const names = (savingsNames as any).savingsNames as string[];
      setSavingOptions(names);
    } else {
      setSavingOptions([]);
    }
  }, [savingsNames]);

  const queryClient = useQueryClient();

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

  // Invalidate queries when transaction is successful
  React.useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["getSavingsNames"] });
      queryClient.invalidateQueries({ queryKey: ["getSaving"] });
      queryClient.invalidateQueries({ queryKey: ["getUserChildContractAddress"] });
    }
  }, [isSuccess, queryClient]);

  const handleIncrementSaving = async () => {
    const tokenToRetrieve = tokenAddress || "0x0000000000000000000000000000000000000000"; // address(0) for native token

    // Convert incrementAmount to wei if ETH
    const incrementAmountWei = tokenToRetrieve === "0x0000000000000000000000000000000000000000"
      ? BigInt(Math.floor(parseFloat(incrementAmount) * 10 ** 18))
      : BigInt(incrementAmount);

    writeContract({
      address: SAVFE_ADDRESS,
      abi: SAVFE_ABI,
      functionName: "incrementSaving",
      args: [
        savingName,
        tokenToRetrieve,
        incrementAmountWei,
      ],
      value: tokenToRetrieve === "0x0000000000000000000000000000000000000000" ? incrementAmountWei : BigInt(0),
    });
  };

  const isLoading = isWriting || isConfirming;

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
              <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208V64H48ZM208,208H48V80H208Z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Increment Saving
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Add more funds to an existing savings goal
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="savingName"
              className="text-sm font-semibold text-card-foreground"
            >
              Select Saving
            </Label>
            <select
              id="savingName"
              value={savingName}
              onChange={(e) => setSavingName(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Select a saving...</option>
              {savingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="incrementAmount"
              className="text-sm font-semibold text-card-foreground"
            >
              Increment Amount
            </Label>
            <div className="relative">
              <Input
                id="incrementAmount"
                type="number"
                value={incrementAmount}
                onChange={(e) => setIncrementAmount(e.target.value)}
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
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-card-foreground">
            Select Token
          </Label>
          <TokenSelector
            value={tokenAddress}
            onChange={setTokenAddress}
          />
          <p className="text-xs text-muted-foreground">
            Choose the token you want to use for incrementing your savings
          </p>
        </div>

        <Button
          onClick={handleIncrementSaving}
          disabled={!savingName || !incrementAmount || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <span>
                {isWriting ? "Confirm in Wallet..." : "Incrementing Saving..."}
              </span>
            </div>
          ) : (
            "Increment Saving"
          )}
        </Button>
      </CardContent>

      {/* Status Messages */}
      {txHash && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg mx-6 mb-4">
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
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 mx-6 mb-4">
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
          <span>Saving incremented successfully!</span>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 mx-6 mb-4">
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
    </Card>
  );
}
