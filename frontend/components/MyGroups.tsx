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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

interface GroupData {
  id: number;
  creator: string;
  members: string[];
  contributionAmount: bigint;
  contributionPeriod: number;
  currentRound: number;
  contributionsThisRound: number;
  pot: bigint;
}

export default function MyGroups() {
  const { address, isConnected } = useAccount();
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read group counter
  const { data: groupCounter } = useReadContract({
    abi: FACTORY_ABI,
    address: FACTORY_ADDRESS,
    functionName: "groupCounter",
  });

  // Write contract for contributions and withdrawals
  const { writeContract, isPending } = useWriteContract();

  // Load user's groups
  const loadUserGroups = async () => {
    if (!groupCounter || !address) return;

    setIsLoading(true);
    setError(null);
    const totalGroups = Number(groupCounter);
    const userGroupsData: GroupData[] = [];

    // Load groups in batches to avoid overwhelming the blockchain
    const batchSize = 3;
    for (let i = 0; i <= totalGroups + 1; i += batchSize) {
      const batch = [];
      for (let j = 1; j <= batchSize && i + j < totalGroups + 1; j++) {
        const groupId = i + j;
        try {
          const groupData = await fetchGroupData(groupId);
          if (groupData && groupData.members.includes(address)) {
            batch.push({
              id: groupId,
              creator: groupData.creator,
              members: groupData.members,
              contributionAmount: groupData.contributionAmount,
              contributionPeriod: groupData.contributionPeriod,
              currentRound: groupData.currentRound,
              contributionsThisRound: groupData.contributionsThisRound,
              pot: groupData.pot,
            });
          }
        } catch (error) {
          console.error(`Error loading group ${groupId}:`, error);
        }
      }
      userGroupsData.push(...batch);

      // Small delay between batches
      if (i + batchSize < totalGroups) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    setUserGroups(userGroupsData);
    setIsLoading(false);
  };

  // Helper function to fetch group data
  const fetchGroupData = async (groupId: number) => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching group ${groupId}:`, error);
    }
    return null;
  };

  useEffect(() => {
    if (address && groupCounter) {
      loadUserGroups();
    }
  }, [address, groupCounter]);

  const handleContribute = (groupId: number, contributionAmount: bigint) => {
    writeContract({
      abi: FACTORY_ABI,
      address: FACTORY_ADDRESS,
      functionName: "contribute",
      args: [groupId],
      value: contributionAmount,
    });
  };

  const handleWithdraw = (groupId: number) => {
    // Trigger payout for the beneficiary
    writeContract({
      abi: FACTORY_ABI,
      address: FACTORY_ADDRESS,
      functionName: "withdrawPayout",
      args: [groupId],
    });
  };

  const getUserContributionStatus = (group: GroupData) => {
    if (!address) return { hasContributed: false, isBeneficiary: false, canWithdraw: false };

    const isMember = group.members.includes(address);
    const isBeneficiary = isMember && group.members[(group.currentRound - 1) % group.members.length] === address;
    const canWithdraw = isBeneficiary && group.contributionsThisRound === group.members.length;

    // For simplicity, assume user has contributed if they're a member and it's not their turn to be beneficiary
    // In a real implementation, you'd track individual contributions
    const hasContributed = isMember && !isBeneficiary;

    return { hasContributed, isBeneficiary, canWithdraw };
  };

  const getProgressPercentage = (group: GroupData) => {
    return group.members.length > 0 ? (group.contributionsThisRound / group.members.length) * 100 : 0;
  };

  if (!isConnected) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-muted-foreground">
            Connect your wallet to view your group savings
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="border-l-4 border-l-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full mb-4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error Loading Groups
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadUserGroups} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-card-foreground">
                My Groups
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Groups you're participating in
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {userGroups.length} groups
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {userGroups.length > 0 ? (
          <div className="space-y-4">
            {userGroups.map((group) => {
              const { hasContributed, isBeneficiary, canWithdraw } = getUserContributionStatus(group);
              const progressPercentage = getProgressPercentage(group);

              return (
                <Card key={group.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-card-foreground">
                          Group #{group.id}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Round {group.currentRound}
                          </Badge>
                          {isBeneficiary && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              Your Turn
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-card-foreground">
                          {formatEther(group.pot)} ETH
                        </p>
                        <p className="text-xs text-muted-foreground">Total Pot</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Contribution</p>
                          <p className="text-sm font-medium">
                            {formatEther(group.contributionAmount)} ETH
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Period</p>
                          <p className="text-sm font-medium">
                            {Math.floor(group.contributionPeriod / 86400)} days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Members</p>
                          <p className="text-sm font-medium">{group.members.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-muted-foreground">Round Progress</p>
                        <p className="text-xs text-muted-foreground">
                          {group.contributionsThisRound} / {group.members.length} contributed
                        </p>
                      </div>
                      <Progress value={progressPercentage} className="w-full h-2" />
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {hasContributed ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Contributed</span>
                          </div>
                        ) : isBeneficiary ? (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">Beneficiary</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Pending Contribution</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {!hasContributed && !isBeneficiary && (
                          <Button
                            size="sm"
                            onClick={() => handleContribute(group.id, group.contributionAmount)}
                            disabled={isPending}
                          >
                            {isPending ? "Contributing..." : "Contribute"}
                          </Button>
                        )}
                        {canWithdraw && (
                          <Button
                            size="sm"
                            onClick={() => handleWithdraw(group.id)}
                            variant="default"
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isPending ? "Withdrawing..." : "Withdraw"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No groups yet</p>
            <p className="text-sm">Join a group below to start saving together!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
