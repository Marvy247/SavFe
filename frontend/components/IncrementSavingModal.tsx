"use client";
import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS } from "../lib/contract";
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

  // Close modal on successful transaction
  React.useEffect(() => {
    if (isSuccess) {
      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  }, [isSuccess]);

  const handleIncrementSaving = async () => {
    // Validate input
    const amountValue = parseFloat(incrementAmount);

    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid increment amount greater than 0");
      return;
    }

    // Convert incrementAmount to wei if ETH (native token)
    const incrementAmountWei = selectedTokenAddress === "0x0000000000000000000000000000000000000000"
      ? BigInt(Math.floor(amountValue * 10 ** 18))
      : BigInt(Math.floor(amountValue));

    writeContract({
      address: SAVFE_ADDRESS,
      abi: SAVFE_ABI,
      functionName: "incrementSaving",
      args: [
        savingName,
        selectedTokenAddress,
        incrementAmountWei,
      ],
      value: selectedTokenAddress === "0x0000000000000000000000000000000000000000" ? incrementAmountWei : BigInt(0),
    });
  };

  const handleClose = () => {
    setIncrementAmount("");
    onClose();
  };

  const isLoading = isWriting || isConfirming;

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
            <Button
              onClick={handleIncrementSaving}
              disabled={!incrementAmount || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Increment"
              )}
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {txHash && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Transaction: </span>
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono text-xs"
              >
                {txHash.slice(0, 8)}...{txHash.slice(-6)}
              </a>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Saving incremented successfully!</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <div className="flex items-start space-x-2">
              <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="break-all">
                Error: {error.message.split("\n")[0]}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
