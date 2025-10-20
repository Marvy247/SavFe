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
import { Users, Clock, DollarSign, Eye, TrendingUp } from "lucide-react";

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

export default function GroupCards() {
  const { address, isConnected } = useAccount();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);

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

  const handleViewDetails = (group: GroupData) => {
    setSelectedGroup(group);
  };

  const handleCloseDetails = () => {
    setSelectedGroup(null);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const isMember = isUserMember(group);
          const progressPercentage = getProgressPercentage(group);
          const groupStatus = getGroupStatus(group);

          return (
            <Card key={group.id} className="animate-fade-in hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-card-foreground">
                    Group #{group.id}
                  </CardTitle>
                  <Badge className={`text-xs ${groupStatus.color}`}>
                    {groupStatus.status}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {group.members.length} members • Round {group.currentRound}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-card-foreground">
                    {formatEther(group.pot)} ETH
                  </p>
                  <p className="text-xs text-muted-foreground">Total Pot</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contribution</p>
                      <p className="font-medium">{formatEther(group.contributionAmount)} ETH</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Period</p>
                      <p className="font-medium">{Math.floor(group.contributionPeriod / 86400)}d</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-muted-foreground">Round Progress</p>
                    <p className="text-xs text-muted-foreground">
                      {group.contributionsThisRound}/{group.members.length}
                    </p>
                  </div>
                  <Progress value={progressPercentage} className="w-full h-2" />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(group)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  {!isMember && (
                    <Button
                      size="sm"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={!isConnected || isPending}
                      className="flex-1"
                    >
                      {isPending ? "Joining..." : "Join"}
                    </Button>
                  )}
                  {isMember && (
                    <Badge variant="secondary" className="flex-1 justify-center">
                      <Users className="h-3 w-3 mr-1" />
                      Member
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {groups.length === 0 && !isLoading && (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No groups available</p>
            <p className="text-sm text-muted-foreground">
              Be the first to create a savings group!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Group Details Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseDetails} />
          <div className="relative bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Group #{selectedGroup.id} Details</h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Group Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Group Overview
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Creator</span>
                        <span className="text-sm font-mono">
                          {selectedGroup.creator.slice(0, 8)}...{selectedGroup.creator.slice(-6)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Members</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedGroup.members.length} members
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Round</span>
                        <Badge variant="secondary" className="text-xs">
                          Round {selectedGroup.currentRound}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Financial Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Contribution</span>
                        <span className="text-sm font-medium">
                          {formatEther(selectedGroup.contributionAmount)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Period</span>
                        <span className="text-sm font-medium">
                          {Math.floor(selectedGroup.contributionPeriod / 86400)} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Pot</span>
                        <span className="text-sm font-medium">
                          {formatEther(selectedGroup.pot)} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Round Progress */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Current Round Progress
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Round {selectedGroup.currentRound} Contributions
                      </span>
                      <span className="text-sm font-medium">
                        {selectedGroup.contributionsThisRound} / {selectedGroup.members.length} completed
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${selectedGroup.members.length > 0 ? (selectedGroup.contributionsThisRound / selectedGroup.members.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    {selectedGroup.contributionsThisRound === selectedGroup.members.length && (
                      <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>All members have contributed! Payout will be triggered automatically.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Group Members
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedGroup.members.map((member, index) => (
                      <div
                        key={member}
                        className={`flex items-center justify-between p-2 rounded-lg border ${
                          index === (selectedGroup.currentRound - 1) % selectedGroup.members.length
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-muted/50'
                        }`}
                      >
                        <span className="text-sm font-mono">
                          {member.slice(0, 6)}...{member.slice(-4)}
                        </span>
                        {index === (selectedGroup.currentRound - 1) % selectedGroup.members.length && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                            Beneficiary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedGroup.members.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No members have joined this group yet.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleCloseDetails}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>

                  {!isUserMember(selectedGroup) && (
                    <Button
                      onClick={() => handleJoinGroup(selectedGroup.id)}
                      className="flex-1"
                      disabled={!isConnected || isPending}
                    >
                      {isPending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          <span>Joining...</span>
                        </div>
                      ) : (
                        'Join Group'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
