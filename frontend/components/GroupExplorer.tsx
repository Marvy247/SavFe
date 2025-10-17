/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "../lib/contract";
import { formatEther } from "viem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function GroupExplorer({ groupId }: { groupId: number }) {
  const { address, isConnected } = useAccount();
  const [group, setGroup] = useState<any>(null);

  // --- read contract
  const { data, error, isLoading } = useReadContract({
    abi: FACTORY_ABI,
    address: FACTORY_ADDRESS,
    functionName: "getGroup",
    args: [groupId],
  });

  // --- write contract
  const { writeContract, isPending } = useWriteContract();

  useEffect(() => {
    if (data) {
      const g = data as any[];

      // Check if this is a non-existent group (all default values)
      const isNonExistentGroup =
        g[0] === "0x0000000000000000000000000000000000000000" && // zero address creator
        g[1].length === 0 && // empty members array
        Number(g[2]) === 0 && // zero contribution amount
        Number(g[3]) === 0; // zero contribution period

      if (isNonExistentGroup) {
        setGroup(null);
      } else {
        setGroup({
          creator: g[0],
          members: g[1],
          contributionAmount: g[2],
          contributionPeriod: Number(g[3]),
          currentRound: Number(g[4]),
          contributionsThisRound: Number(g[6]),
          pot: g[7],
        });
      }
    } else {
      setGroup(null);
    }
  }, [data]);

  const handleContribute = () => {
    writeContract({
      abi: FACTORY_ABI,
      address: FACTORY_ADDRESS,
      functionName: "contribute",
      args: [groupId],
      value: group.contributionAmount,
    });
  };

  const handleWithdraw = () => {
    // For now, this will trigger the payout if the user is the beneficiary
    // In a real implementation, this might call a claim function
    console.log("Withdraw functionality for group savings");
    // You could implement logic to check if user is beneficiary and trigger payout
  };

  const isUserMember = group && address ? group.members.includes(address) : false;
  const isUserBeneficiary = isUserMember && group && group.members[(group.currentRound - 1) % group.members.length] === address;
  const canWithdraw = isUserBeneficiary && group && group.contributionsThisRound === group.members.length;

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-6">
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <Skeleton className="h-4 w-28" />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !group) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Group Not Found
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            The group with ID #{groupId} doesn't exist or hasn't been created yet.
            Please check the group ID and try again, or create a new group.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard?tab=group'}
            >
              Browse Groups
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="h-4 w-4 text-primary-foreground" />
            </div> */}
            <div>
              <CardTitle className="text-lg font-bold text-card-foreground">
                Group #{groupId}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Group details and statistics
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {group.members.length} members
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Round Progress */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Round Progress
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Round {group.currentRound}</span>
              <span className="text-sm font-medium">
                {group.contributionsThisRound} / {group.members.length} contributions
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(group.contributionsThisRound / group.members.length) * 100}%`,
                }}
              ></div>
            </div>
            {group.contributionsThisRound === group.members.length && (
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
                <span>All members have contributed! Payout will be triggered automatically.</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Group Stats */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Group Statistics
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Creator</span>
                <span className="text-sm font-mono text-foreground">
                  {group.creator.slice(0, 8)}...{group.creator.slice(-6)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Round
                </span>
                <Badge variant="secondary" className="text-xs">
                  {group.currentRound}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Period</span>
                <span className="text-sm font-medium text-foreground">
                  {Math.floor(group.contributionPeriod / 86400)} days
                </span>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Financial Details
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Contribution
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatEther(group.contributionAmount)} ETH
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Pot</span>
                <span className="text-sm font-medium text-foreground">
                  {formatEther(group.pot)} ETH
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  This Round
                </span>
                <Badge variant="outline" className="text-xs">
                  {group.contributionsThisRound}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Join Group Button */}
          {!isUserMember && (
            <Button
                onClick={() => writeContract({ abi: FACTORY_ABI, address: FACTORY_ADDRESS, functionName: 'joinGroup', args: [groupId] })}
                disabled={!isConnected || isPending}
                className="w-full"
                size="lg"
            >
                {isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        <span>Joining...</span>
                    </div>
                ) : (
                    "Join Group"
                )}
            </Button>
          )}
          {/* Contribute Button */}
          <Button
            onClick={handleContribute}
            disabled={!isConnected || isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span>Contributing...</span>
              </div>
            ) : (
              `Contribute ${formatEther(group.contributionAmount)} ETH`
            )}
          </Button>

          {/* Withdraw Button - Only show if user is member and can withdraw */}
          {isUserMember && canWithdraw && (
            <Button
              onClick={handleWithdraw}
              variant="outline"
              className="w-full border-green-500 text-green-600 hover:bg-green-50"
              size="lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Withdraw Group Savings
            </Button>
          )}

          {/* Status Messages */}
          {isUserMember && !canWithdraw && (
            <div className="text-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {isUserBeneficiary ? (
                <span>Waiting for all members to contribute this round</span>
              ) : (
                <span>You are a member of this group</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
