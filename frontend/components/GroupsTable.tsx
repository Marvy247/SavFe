"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS, readGroupData } from "../lib/contract";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, DollarSign, TrendingUp, Eye, UserPlus } from "lucide-react";

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

export default function GroupsTable() {
  const { address, isConnected } = useAccount();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read group counter
  const { data: groupCounter } = useReadContract({
    abi: FACTORY_ABI,
    address: FACTORY_ADDRESS,
    functionName: "groupCounter",
  });

  // Write contract for joining groups
  const { writeContract, isPending } = useWriteContract();

  // Load all groups
  const loadAllGroups = async () => {
    if (!groupCounter) return;

    setIsLoading(true);
    setError(null);
    const totalGroups = Number(groupCounter);
    const groupsData: GroupData[] = [];

    // Load groups in batches to avoid overwhelming the blockchain
    const batchSize = 3;
    for (let i = 0; i <= totalGroups + 1; i += batchSize) {
      const batch = [];
      for (let j = 1; j <= batchSize && i + j < totalGroups + 1; j++) {
        const groupId = i + j;
        try {
          const groupData = await readGroupData(groupId);
          if (groupData) {
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
      groupsData.push(...batch);

      // Small delay between batches
      if (i + batchSize < totalGroups) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    setGroups(groupsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllGroups();
  }, [groupCounter]);

  const handleJoinGroup = (groupId: number) => {
    writeContract({
      abi: FACTORY_ABI,
      address: FACTORY_ADDRESS,
      functionName: "joinGroup",
      args: [groupId],
    });
  };

  const isUserMember = (group: GroupData) => {
    return address ? group.members.includes(address) : false;
  };

  const getProgressPercentage = (group: GroupData) => {
    return group.members.length > 0 ? (group.contributionsThisRound / group.members.length) * 100 : 0;
  };

  const getGroupStatus = (group: GroupData) => {
    const progress = getProgressPercentage(group);
    if (progress === 100) return { status: "Ready to Payout", color: "bg-green-100 text-green-800" };
    if (progress >= 50) return { status: "Active", color: "bg-blue-100 text-blue-800" };
    return { status: "Forming", color: "bg-yellow-100 text-yellow-800" };
  };

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
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
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-destructive"
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
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error Loading Groups
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadAllGroups} variant="outline">
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
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-card-foreground">
                All Available Groups
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Browse and join rotating savings groups
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {groups.length} groups
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((group) => {
              const isMember = isUserMember(group);
              const progressPercentage = getProgressPercentage(group);
              const groupStatus = getGroupStatus(group);

              return (
                <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        Group #{group.id}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-xs ${groupStatus.color}`}>
                          {groupStatus.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Round {group.currentRound}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatEther(group.pot)} ETH pot</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{group.members.length} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{Math.floor(group.contributionPeriod / 86400)}d period</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Round Progress</span>
                          <span className="text-xs text-muted-foreground">
                            {group.contributionsThisRound}/{group.members.length}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="w-full h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* Open details modal */}}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    {!isMember && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={!isConnected || isPending}
                      >
                        {isPending ? "Joining..." : (
                          <>
                            <UserPlus className="h-3 w-3 mr-1" />
                            Join
                          </>
                        )}
                      </Button>
                    )}
                    {isMember && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Member
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No groups available</p>
            <p className="text-sm">Be the first to create a savings group!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
