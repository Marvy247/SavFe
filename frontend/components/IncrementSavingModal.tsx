"use client";
import React, { useState } from "react";
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { SAVFE_ABI, SAVFE_ADDRESS } from "../lib/contract";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import TokenSelector from "./TokenSelector";

interface IncrementSavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  savingName: string;
  tokenAddress: string;
}

export default function IncrementSavingModal({
  isOpen,
  onClose,
  savingName,
  tokenAddress: initialTokenAddress,
}: IncrementSavingModalProps) {
  const [incrementAmount, setIncrementAmount] = useState<string>("");
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>(initialTokenAddress || "0x0000000000000000000000000000000000000000");

  const incrementSavingCalls = (savingName && incrementAmount && selectedTokenAddress) ? [{
    to: SAVFE_ADDRESS as `0x${string}`,
    abi: SAVFE_ABI,
    functionName: "incrementSaving",
    args: [
      savingName,
      selectedTokenAddress,
      selectedTokenAddress === "0x0000000000000000000000000000000000000000"
        ? BigInt(Math.floor(parseFloat(incrementAmount) * 10 ** 18))
        : BigInt(Math.floor(parseFloat(incrementAmount))),
    ],
    value: selectedTokenAddress === "0x0000000000000000000000000000000000000000"
      ? BigInt(Math.floor(parseFloat(incrementAmount) * 10 ** 18))
      : BigInt(0),
  }] : [];

  const handleIncrementSavingSuccess = (response: any) => {
    console.log('Increment saving successful:', response);
    toast.success('Saving incremented successfully!');
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleIncrementSavingError = (error: any) => {
    console.error('Increment saving failed:', error);
    toast.error('Failed to increment saving. Please try again.');
  };





  const handleClose = () => {
    setIncrementAmount("");
    onClose();
  };

  const isLoading = false; // Transaction component handles loading state

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Increment Saving</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Saving Name</Label>
            <div className="mt-1 p-2 bg-muted rounded-md">
              <span className="text-sm">{savingName}</span>
            </div>
          </div>

          <div>
            <Label
              htmlFor="incrementAmount"
              className="text-sm font-medium"
            >
              Increment Amount
            </Label>
            <div className="relative mt-1">
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
                  {selectedTokenAddress === "0x0000000000000000000000000000000000000000" ? "ETH" : "Token"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Select Token
            </Label>
            <TokenSelector
              value={selectedTokenAddress}
              onChange={setSelectedTokenAddress}
              className="mt-1"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Transaction
              calls={incrementSavingCalls}
              onSuccess={handleIncrementSavingSuccess}
              onError={handleIncrementSavingError}
            >
              <TransactionButton
                disabled={!incrementAmount}
                className="flex-1"
                text="Increment"
              />
            </Transaction>
          </div>
        </div>


      </div>
    </div>
  );
}
