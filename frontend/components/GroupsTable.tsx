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
import { Eye, LucideTable, Users } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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
          // Continue loading other groups even if one fails
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

  const [selectedGroup, setSelectedGroup] = React.useState<GroupData | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleViewGroup = (groupId: number) => {
    const group = groups.find((g) => g.id === groupId) || null;
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  const handleRefresh = () => {
    loadAllGroups();
  };

  const handleWithdraw = (groupId: number) => {
    // For now, this will trigger the payout if the user is the beneficiary
    console.log(`Withdraw functionality for group ${groupId}`);
    // You could implement logic to check if user is beneficiary and trigger payout
  };

  const canUserWithdraw = (group: GroupData) => {
    if (!address || !group) return false;
    const isUserMember = group.members.includes(address);
    const isUserBeneficiary = isUserMember && group.members[(group.currentRound - 1) % group.members.length] === address;
    return isUserBeneficiary && group.contributionsThisRound === group.members.length;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <LucideTable className="h-4 w-4 text-primary" />
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
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {groups.length} groups
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="text-muted-foreground">Loading groups...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group ID</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Contribution</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Current Round</TableHead>
                  <TableHead>Total Pot</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">#{group.id}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {group.creator.slice(0, 8)}...{group.creator.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{group.members.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatEther(group.contributionAmount)} ETH
                    </TableCell>
                    <TableCell>{Math.floor(group.contributionPeriod / 86400)} days</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {group.currentRound}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatEther(group.pot)} ETH</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewGroup(group.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        {canUserWithdraw(group) ? (
                          <Button
                            size="sm"
                            onClick={() => handleWithdraw(group.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="mr-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Withdraw
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleJoinGroup(group.id)}
                            disabled={!isConnected || isPending}
                          >
                            {isPending ? "Joining..." : "Join"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {groups.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Table className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p>No groups available to join</p>
                <p className="text-xs mt-1">
                  Create a new group to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Group Details Modal */}
      {selectedGroup && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isModalOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Group #{selectedGroup.id} Details</h2>
                <button
                  onClick={handleCloseModal}
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
                    onClick={handleCloseModal}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>

                  {canUserWithdraw(selectedGroup) ? (
                    <Button
                      onClick={() => handleWithdraw(selectedGroup.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          <span>Withdrawing...</span>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </Button>
                  ) : (
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
    </Card>
  );
}
