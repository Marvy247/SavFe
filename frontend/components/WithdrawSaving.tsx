"use client";
import React, { useState } from "react";
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { SAVFE_ABI, SAVFE_ADDRESS } from "../lib/contract";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SavingsSelectorWrapper from "./SavingsSelectorWrapper";
import { SavingOption } from "./SavingsSelector";

export default function WithdrawSaving() {
  const [savingName, setSavingName] = useState<string>("");
  const [selectedSaving, setSelectedSaving] = useState<SavingOption | null>(null);
  const queryClient = useQueryClient();

  const withdrawSavingCalls = (savingName) ? [{
    to: SAVFE_ADDRESS as `0x${string}`,
    abi: SAVFE_ABI,
    functionName: "withdrawSaving",
    args: [savingName],
  }] : [];

  const handleWithdrawSavingSuccess = (response: any) => {
    console.log('Withdraw saving successful:', response);
    toast.success('Saving withdrawn successfully!');

    if (selectedSaving) {
      // Store withdrawal information for transaction history
      const withdrawalInfo = {
        txHash: response.transactionReceipts?.[0]?.transactionHash,
        savingName,
        amount: calculateNetAmount(),
        token: selectedSaving.token,
        timestamp: Date.now(),
        penalty: calculatePenalty(),
        totalSaved: selectedSaving.amount,
        isMatured: selectedSaving.isMatured
      };

      // Store in localStorage for transaction history
      const existingWithdrawals = JSON.parse(localStorage.getItem('savfe_withdrawals') || '[]');
      existingWithdrawals.push(withdrawalInfo);
      localStorage.setItem('savfe_withdrawals', JSON.stringify(existingWithdrawals));

      queryClient.invalidateQueries({ queryKey: ["getSavingsNames"] });
      queryClient.invalidateQueries({ queryKey: ["getSaving"] });
      queryClient.invalidateQueries({ queryKey: ["getUserChildContractAddressByAddress"] });
    }
  };

  const handleWithdrawSavingError = (error: any) => {
    console.error('Withdraw saving failed:', error);
    toast.error('Failed to withdraw saving. Please try again.');
  };

  const handleSavingChange = (name: string, saving?: SavingOption) => {
    setSavingName(name);
    setSelectedSaving(saving || null);
  };



  const calculatePenalty = () => {
    if (!selectedSaving || selectedSaving.isMatured) return 0;
    return (selectedSaving.amount * selectedSaving.penaltyPercentage) / 100;
  };

  const calculateNetAmount = () => {
    if (!selectedSaving) return 0;
    return selectedSaving.amount - calculatePenalty();
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
              <path d="M184,64V202.31L173.32,186a20,20,0,0,0-36.9,14H56V64a8,8,0,0,1,8-8H176A8,8,0,0,1,184,64Z" opacity="0.2"></path>
              <path d="M232,198.65V240a8,8,0,0,1-16,0V198.65A74.84,74.84,0,0,0,192,144v58.35a8,8,0,0,1-14.69,4.38l-10.68-16.31c-.08-.12-.16-.25-.23-.38a12,12,0,0,0-20.89,11.83l22.13,33.79a8,8,0,0,1-13.39,8.76l-22.26-34-.24-.38A28,28,0,0,1,176,176.4V64H160a8,8,0,0,1,0-16h16a16,16,0,0,1,16,16v59.62A90.89,90.89,0,0,1,232,198.65Zm-16,0a8,8,0,0,0-8-8h-3.66a8,8,0,0,1-7.64-5.6A71.9,71.9,0,0,0,144,48H112A72,72,0,0,0,58.91,168.64a8,8,0,0,1,1.64,2.71L73.64,208H86.36l3.82-10.69A8,8,0,0,1,97.71,192h68.58a8,8,0,0,1,7.53,5.31L177.64,208h12.72l18.11-50.69A8,8,0,0,1,216,152h8a8,8,0,0,0,8-8Z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Withdraw Saving
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Withdraw matured savings from your account
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-card-foreground">
            Select Saving to Withdraw
          </Label>
          <SavingsSelectorWrapper
            value={savingName}
            onChange={handleSavingChange}
          />
          <p className="text-xs text-muted-foreground">
            Choose from your existing savings
          </p>
        </div>

        {/* Withdrawal Details */}
        {selectedSaving && (
          <Card className="bg-muted/50 border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Withdrawal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Saved</p>
                  <p className="font-semibold text-lg">{selectedSaving.amount} {selectedSaving.token}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={selectedSaving.isMatured ? "default" : "secondary"}>
                    {selectedSaving.isMatured ? "Matured" : "Not Matured"}
                  </Badge>
                </div>
              </div>

              {!selectedSaving.isMatured && selectedSaving.penaltyPercentage > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Penalty ({selectedSaving.penaltyPercentage}%)</span>
                    <span className="text-destructive font-medium">
                      -{calculatePenalty().toFixed(4)} {selectedSaving.token}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span>You will receive</span>
                      <span className="text-lg text-primary">
                        {calculateNetAmount().toFixed(4)} {selectedSaving.token}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedSaving.isMatured && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-800 font-medium">
                      No penalty - Full amount available
                    </span>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                <p>Maturity Date: {selectedSaving.maturityDate.toLocaleDateString()}</p>
                <p>Created: {selectedSaving.createdDate.toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5 text-amber-600"
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
              <p className="text-sm font-medium text-amber-800">
                Early Withdrawal Notice
              </p>
              <p className="text-xs text-amber-700">
                Withdrawing before maturity may incur penalties based on your savings configuration.
              </p>
            </div>
          </div>
        </div>

        <Transaction
          calls={withdrawSavingCalls}
          onSuccess={handleWithdrawSavingSuccess}
          onError={handleWithdrawSavingError}
        >
          <TransactionButton
            disabled={!savingName}
            className="w-full"
            text={selectedSaving && !selectedSaving.isMatured && selectedSaving.penaltyPercentage > 0 ?
              `Withdraw ${calculateNetAmount().toFixed(4)} ${selectedSaving.token} (with penalty)` :
              "Withdraw Saving"
            }
          />
        </Transaction>
      </CardContent>


    </Card>
  );
}
