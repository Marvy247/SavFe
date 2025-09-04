"use client";
import React from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "../lib/contract";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WithdrawEarnings() {
  const { address } = useAccount();
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
        abi: FACTORY_ABI,
        address: FACTORY_ADDRESS,
        functionName: "withdrawEarnings",
        args: [address],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <Card className="gradient-card-hover animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {/* <Download className="h-5 w-5 text-primary" /> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M184,64V202.31L173.32,186a20,20,0,0,0-36.9,14H56V64a8,8,0,0,1,8-8H176A8,8,0,0,1,184,64Z"
                opacity="0.2"
              ></path>
              <path d="M232,198.65V240a8,8,0,0,1-16,0V198.65A74.84,74.84,0,0,0,192,144v58.35a8,8,0,0,1-14.69,4.38l-10.68-16.31c-.08-.12-.16-.25-.23-.38a12,12,0,0,0-20.89,11.83l22.13,33.79a8,8,0,0,1-13.39,8.76l-22.26-34-.24-.38A28,28,0,0,1,176,176.4V64H160a8,8,0,0,1,0-16h16a16,16,0,0,1,16,16v59.62A90.89,90.89,0,0,1,232,198.65ZM88,56a8,8,0,0,0-8-8H64A16,16,0,0,0,48,64V200a8,8,0,0,0,16,0V64H80A8,8,0,0,0,88,56Zm69.66,42.34a8,8,0,0,0-11.32,0L128,116.69V16a8,8,0,0,0-16,0V116.69L93.66,98.34a8,8,0,0,0-11.32,11.32l32,32a8,8,0,0,0,11.32,0l32-32A8,8,0,0,0,157.66,98.34Z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Withdraw Earnings
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Admin only - withdraw platform fees
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              Admin Action
            </Badge>
            <div className="text-xs text-muted-foreground">
              This action is restricted to the contract owner
            </div>
          </div>
        </div>

        <Button
          onClick={handleWithdraw}
          disabled={isLoading}
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
            "Withdraw Platform Earnings"
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
            <span>Earnings withdrawn successfully!</span>
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
