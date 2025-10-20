"use client";
import React, { useState } from "react";
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { useReadContract } from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS, CHILD_SAVFE_ABI } from "../lib/contract";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface WithdrawSavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  savingName: string;
  childContractAddress: `0x${string}`;
}

export default function WithdrawSavingModal({
  isOpen,
  onClose,
  savingName,
  childContractAddress,
}: WithdrawSavingModalProps) {
  const queryClient = useQueryClient();

  // Get saving details
  const { data: saving, isLoading: isLoadingSaving } = useReadContract({
    address: childContractAddress,
    abi: CHILD_SAVFE_ABI,
    functionName: 'getSaving',
    args: [savingName],
  });

  const withdrawSavingCalls = savingName ? [{
    to: SAVFE_ADDRESS as `0x${string}`,
    abi: SAVFE_ABI,
    functionName: "withdrawSaving",
    args: [savingName],
  }] : [];

  const handleWithdrawSavingSuccess = (response: any) => {
    console.log('Withdraw saving successful:', response);
    toast.success('Saving withdrawn successfully!');
    // Invalidate all relevant queries to refresh data across the app
    queryClient.invalidateQueries({ queryKey: ['getSavingsNames'] });
    queryClient.invalidateQueries({ queryKey: ['getSaving'] });
    queryClient.invalidateQueries({ queryKey: ['getUserChildContractAddressByAddress'] });
    queryClient.invalidateQueries({ queryKey: ['userCount'] });
    queryClient.invalidateQueries({ queryKey: ['contractEarnings'] });
    queryClient.invalidateQueries({ queryKey: ['groupCounter'] });
    queryClient.invalidateQueries({ queryKey: ['JoinLimitFee'] });
    queryClient.invalidateQueries({ queryKey: ['SavingFee'] });
    queryClient.invalidateQueries({ queryKey: ['fountain'] });
    // Close modal after a short delay to show success message
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleWithdrawSavingError = (error: any) => {
    console.error('Withdraw saving failed:', error);
    toast.error('Failed to withdraw saving. Please try again.');
  };





  const handleClose = () => {
    onClose();
  };

  const calculatePenalty = () => {
    if (!saving) return 0;
    const timeRemaining = Number((saving as any).maturityTime) - Math.floor(Date.now() / 1000);
    if (timeRemaining <= 0) return 0; // No penalty if matured

    const penaltyPercentage = Number((saving as any).penaltyPercentage);
    const amount = Number(formatEther((saving as any).amount));
    return (amount * penaltyPercentage) / 100;
  };

  const calculateNetAmount = () => {
    if (!saving) return 0;
    const amount = Number(formatEther((saving as any).amount));
    return amount - calculatePenalty();
  };

  const getMaturityStatus = () => {
    if (!saving) return { status: 'Loading...', color: 'bg-gray-100 text-gray-800' };
    const timeRemaining = Number((saving as any).maturityTime) - Math.floor(Date.now() / 1000);

    if (timeRemaining <= 0) {
      return { status: 'Matured', color: 'bg-green-100 text-green-800' };
    } else if (timeRemaining <= 86400) { // Less than 1 day
      return { status: 'Almost Ready', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'Growing', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);

    if (days > 0) {
      return `${days} days, ${hours} hours`;
    } else if (hours > 0) {
      return `${hours} hours`;
    } else {
      return 'Less than 1 hour';
    }
  };

  const isLoading = false; // Transaction component handles loading state
  const maturityStatus = getMaturityStatus();
  const penaltyAmount = calculatePenalty();
  const netAmount = calculateNetAmount();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Withdraw Saving</h3>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground text-xl"
            >
              ✕
            </button>
          </div>

          {isLoadingSaving ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          ) : saving ? (
            <div className="space-y-6">
              {/* Saving Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{savingName}</CardTitle>
                    <Badge className={`text-xs ${maturityStatus.color}`}>
                      {maturityStatus.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Review your withdrawal details below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-lg font-semibold">
                        {formatEther((saving as any).amount)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Token</p>
                      <p className="text-lg font-semibold">
                        {(saving as any).tokenId === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'ERC20'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Maturity Information */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Maturity Status</span>
                      <Badge variant={maturityStatus.status === 'Matured' ? 'default' : 'secondary'}>
                        {maturityStatus.status}
                      </Badge>
                    </div>
                    {(() => {
                      const timeRemaining = Number((saving as any).maturityTime) - Math.floor(Date.now() / 1000);
                      return timeRemaining > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Time remaining: {formatTimeRemaining(timeRemaining)}
                        </p>
                      ) : (
                        <p className="text-sm text-green-600 font-medium">
                          ✅ Ready for withdrawal
                        </p>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawal Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Withdrawal Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Saved</span>
                    <span className="text-sm font-medium">
                      {formatEther((saving as any).amount)} ETH
                    </span>
                  </div>

                  {penaltyAmount > 0 && (
                    <div className="flex justify-between items-center text-orange-600">
                      <span className="text-sm">
                        Early Withdrawal Penalty ({Number((saving as any).penaltyPercentage)}%)
                      </span>
                      <span className="text-sm font-medium">
                        -{penaltyAmount.toFixed(6)} ETH
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>You will receive</span>
                    <span className={penaltyAmount > 0 ? 'text-orange-600' : 'text-green-600'}>
                      {netAmount.toFixed(6)} ETH
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Warning for early withdrawal */}
              {penaltyAmount > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0"
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
                        <p className="text-sm font-medium text-orange-800">
                          Early Withdrawal Notice
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          Withdrawing before maturity will incur a penalty of {Number((saving as any).penaltyPercentage)}%.
                          You will receive {netAmount.toFixed(6)} ETH instead of {formatEther((saving as any).amount)} ETH.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Success message for matured savings */}
              {penaltyAmount === 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
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
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Ready for Withdrawal
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Your savings has matured! You will receive the full amount with no penalties.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Transaction
                  calls={withdrawSavingCalls}
                  onSuccess={handleWithdrawSavingSuccess}
                  onError={handleWithdrawSavingError}
                >
                  <TransactionButton
                    disabled={false}
                    className="flex-1"
                    text={penaltyAmount > 0 ? `Withdraw ${netAmount.toFixed(4)} ETH (with penalty)` : `Withdraw ${netAmount.toFixed(4)} ETH`}
                  />
                </Transaction>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Unable to load saving details</p>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
