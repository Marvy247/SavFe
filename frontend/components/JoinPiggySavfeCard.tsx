"use client";
import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract, useConnect } from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS } from "@/lib/contract";
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
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
import { useQueryClient } from "@tanstack/react-query";

export default function JoinSavfeCard() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const queryClient = useQueryClient();

  const { refetch: refetchChildContract } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'getUserChildContractAddress',
    args: [],
  });

  const joinSavfeCalls = [{
    to: SAVFE_ADDRESS as `0x${string}`,
    abi: SAVFE_ABI,
    functionName: "joinSavfe",
    args: [],
  }];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join SavFe</CardTitle>
        <CardDescription>Join the SavFe platform to start saving.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Transaction
          calls={joinSavfeCalls}
          onSuccess={(response) => {
            toast.success('Successfully joined SavFe!');
            // Invalidate queries immediately to refresh data
            queryClient.invalidateQueries({ queryKey: ['getUserChildContractAddress'] });
            queryClient.invalidateQueries({ queryKey: ['getUserChildContractAddressByAddress'] });
            queryClient.invalidateQueries({ queryKey: ['userCount'] });
            // Refetch child contract specifically
            refetchChildContract();
          }}
          onError={(error) => {
            toast.error('Failed to join SavFe. Please try again.');
          }}
        >
          <TransactionButton
            className="w-full"
            text="Join Savfe"
          />
        </Transaction>
      </CardContent>
    </Card>
  );
}
