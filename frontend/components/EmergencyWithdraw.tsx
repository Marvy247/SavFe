"use client";
import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS } from "../lib/contract";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SavingsSelectorWrapper from "./SavingsSelectorWrapper";
import { SavingOption } from "./SavingsSelector";

export default function EmergencyWithdraw() {
  const [savingName, setSavingName] = useState<string>("");
  const [selectedSaving, setSelectedSaving] = useState<SavingOption | null>(null);
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
    if (isSuccess && selectedSaving) {
      // Store emergency withdrawal information for transaction history
      const emergencyInfo = {
        txHash,
        savingName,
        amount: calculateEmergencyAmount(),
        token: selectedSaving.token,
        timestamp: Date.now(),
        penalty: calculatePenalty(),
        totalSaved: selectedSaving.amount,
        emergencyPenalty: 50
      };

      // Store in localStorage for transaction history
      const existingWithdrawals = JSON.parse(localStorage.getItem('savfe_emergency_withdrawals') || '[]');
      existingWithdrawals.push(emergencyInfo);
      localStorage.setItem('savfe_emergency_withdrawals', JSON.stringify(existingWithdrawals));

      queryClient.invalidateQueries({ queryKey: ["getSavingsNames"] });
      queryClient.invalidateQueries({ queryKey: ["getSaving"] });
      queryClient.invalidateQueries({ queryKey: ["getUserChildContractAddressByAddress"] });
    }
  }, [isSuccess, queryClient, selectedSaving, txHash, savingName]);

  const handleSavingChange = (name: string, saving?: SavingOption) => {
    setSavingName(name);
    setSelectedSaving(saving || null);
  };

  const handleEmergencyWithdraw = async () => {
    writeContract({
      address: SAVFE_ADDRESS,
      abi: SAVFE_ABI,
      functionName: "emergencyWithdraw",
      args: [savingName],
    });
  };

  const calculatePenalty = () => {
    if (!selectedSaving) return 0;
    // Emergency withdrawal penalty is 50%
    return (selectedSaving.amount * 50) / 100;
  };

  const calculateEmergencyAmount = () => {
    if (!selectedSaving) return 0;
    return selectedSaving.amount - calculatePenalty();
  };

  const isLoading = isWriting || isConfirming;

  return (
    <Card className="gradient-card-hover animate-fade-in border-destructive/20">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="text-destructive"
            >
              <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09Zm-13.87,14.19a8.25,8.25,0,0,1-7.22,4.13H40.29a8.25,8.25,0,0,1-7.22-4.13,7.49,7.49,0,0,1,0-7.55L120.3,44.79a8.75,8.75,0,0,1,15.4,0L226.93,194.73A7.49,7.49,0,0,1,223,202.28Z"></path>
              <path d="M120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Z"></path>
              <path d="M128,184a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Emergency Withdrawal
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Emergency access to your savings with 50% penalty
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-card-foreground">
            Select Saving for Emergency Withdrawal
          </Label>
          <SavingsSelectorWrapper
            value={savingName}
            onChange={handleSavingChange}
          />
          <p className="text-xs text-muted-foreground">
            Choose from your existing savings for emergency access
          </p>
        </div>

        {/* Emergency Withdrawal Details */}
        {selectedSaving && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-destructive">Emergency Withdrawal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Saved</p>
                  <p className="font-semibold text-lg">{selectedSaving.amount} {selectedSaving.token}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emergency Penalty</p>
                  <Badge variant="destructive">
                    50%
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Emergency Penalty (50%)</span>
                  <span className="text-destructive font-medium">
                    -{calculatePenalty().toFixed(4)} {selectedSaving.token}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>You will receive</span>
                    <span className="text-lg text-primary">
                      {calculateEmergencyAmount().toFixed(4)} {selectedSaving.token}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Maturity Date: {selectedSaving.maturityDate.toLocaleDateString()}</p>
                <p>Created: {selectedSaving.createdDate.toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-destructive">
                Emergency Withdrawal Warning
              </p>
              <p className="text-xs text-muted-foreground">
                This action will incur a 50% penalty and should only be used in genuine emergencies.
                Consider regular withdrawal if your savings have matured.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleEmergencyWithdraw}
          disabled={!savingName || isLoading}
          className="w-full bg-destructive hover:bg-destructive/90"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <span>
                {isWriting ? "Confirm in Wallet..." : "Processing Emergency Withdrawal..."}
              </span>
            </div>
          ) : (
            `Emergency Withdraw ${calculateEmergencyAmount().toFixed(4)} ${selectedSaving?.token || ''} (50% penalty)`
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
            href={`https://sepolia.basescan.org/tx/${txHash}`}
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
          <span>Emergency withdrawal processed successfully!</span>
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
