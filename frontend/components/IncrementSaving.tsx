"use client";
import React, { useState, useEffect } from "react";
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { useAccount, useReadContract } from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS, CHILD_SAVFE_ABI } from "../lib/contract";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
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

  const incrementSavingCalls = (savingName && incrementAmount && tokenAddress) ? [{
    to: SAVFE_ADDRESS as `0x${string}`,
    abi: SAVFE_ABI,
    functionName: "incrementSaving",
    args: [
      savingName,
      tokenAddress || "0x0000000000000000000000000000000000000000",
      tokenAddress === "0x0000000000000000000000000000000000000000"
        ? BigInt(Math.floor(parseFloat(incrementAmount) * 10 ** 18))
        : BigInt(Math.floor(parseFloat(incrementAmount))),
    ],
    value: tokenAddress === "0x0000000000000000000000000000000000000000"
      ? BigInt(Math.floor(parseFloat(incrementAmount) * 10 ** 18))
      : BigInt(0),
  }] : [];

  const handleIncrementSavingSuccess = (response: any) => {
    console.log('Increment saving successful:', response);
    toast.success('Saving incremented successfully!');
    queryClient.invalidateQueries({ queryKey: ["getSavingsNames"] });
    queryClient.invalidateQueries({ queryKey: ["getSaving"] });
    queryClient.invalidateQueries({ queryKey: ["getUserChildContractAddress"] });
  };

  const handleIncrementSavingError = (error: any) => {
    console.error('Increment saving failed:', error);
    toast.error('Failed to increment saving. Please try again.');
  };



  const isLoading = false; // Transaction component handles loading state

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

        <Transaction
          calls={incrementSavingCalls}
          onSuccess={handleIncrementSavingSuccess}
          onError={handleIncrementSavingError}
        >
          <TransactionButton
            disabled={!savingName || !incrementAmount}
            className="w-full"
            text="Increment Saving"
          />
        </Transaction>
      </CardContent>


    </Card>
  );
}
