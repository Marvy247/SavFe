"use client";
import CreateGroup from "@/components/CreateGroup";
import EarningsDisplay from "@/components/EarningsDisplay";
import Footer from "@/components/Footer";
import GroupExplorer from "@/components/GroupExplorer";
import GroupsTable from "@/components/GroupsTable";
import Header from "@/components/Header";
import JoinGroup from "@/components/JoinGroup";
import SavfeActions from "@/components/SavfeActions";
import WithdrawEarnings from "@/components/WithdrawEarnings";
import AdminWithdrawEarnings from "@/components/AdminWithdrawEarnings";

import PenaltyCalculator from "@/components/PenaltyCalculator";
import TransactionHistory from "@/components/TransactionHistory";
import SavingsVisualization from "@/components/SavingsVisualization";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS, readGroupData } from "@/lib/contract";
import { formatEther } from "viem";

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

export default function DashboardPage() {
  const [gid, setGid] = useState(1);
  const [activeTab, setActiveTab] = useState("individual");
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [totalPot, setTotalPot] = useState("0");
  const [totalMembers, setTotalMembers] = useState(0);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Read group counter
  const { data: groupCounter } = useReadContract({
    abi: FACTORY_ABI,
    address: FACTORY_ADDRESS,
    functionName: "groupCounter",
  });

  // Load all groups and calculate summary statistics
  useEffect(() => {
    const loadGroupsData = async () => {
      if (!groupCounter) return;

      const totalGroups = Number(groupCounter);
      const groupsData: GroupData[] = [];
      let totalPotValue = BigInt(0);
      let totalMembersCount = 0;

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

      // Calculate summary statistics
      groupsData.forEach(group => {
        totalPotValue += group.pot;
        totalMembersCount += group.members.length;
      });

      setGroups(groupsData);
      setTotalPot(formatEther(totalPotValue));
      setTotalMembers(totalMembersCount);
    };

    loadGroupsData();
  }, [groupCounter]);

  const UserStatistics = dynamic(() => import("@/components/UserStatistics"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
  });

  const SavingsDashboard = dynamic(() => import("@/components/SavingsDashboard"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
  });

  const tabs = [
    {
      id: "individual",
      label: "Individual Savings",
      description: "Create and manage your personal savings goals",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: "group",
      label: "Group Savings",
      description: "Join rotating savings groups and collaborate with others",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-black">
      <Header />
      <div className="relative flex w-full flex-col items-start justify-start overflow-hidden ">
        <BackgroundRippleEffect />
        <div className="z-10 mt-10 w-full">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Badge
              variant="secondary"
              className="text-sm font-medium rounded-full py-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1"></span>{" "}
              Dashboard
            </Badge>
          </div>
          <h2 className="relative z-10 mx-auto max-w-4xl text-center text-2xl text-neutral-800 md:text-4xl lg:text-5xl dark:text-neutral-100">
            Your{" "}
            <div className="text-5xl font-bold">Savings Dashboard</div>
          </h2>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-4">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>

          {/* Tab Content */}
          {activeTab === "group" && (
            <div className="space-y-8">
              {/* Group Savings Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <EarningsDisplay />

                  {/* Group Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="gradient-card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Groups</p>
                  <p className="text-2xl font-bold">{groups.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="gradient-card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Pot Value</p>
                  <p className="text-2xl font-bold">{totalPot} ETH</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="gradient-card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold">{totalMembers}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="gradient-card-hover">
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
                            <path
                              d="M192,112a80,80,0,1,1-80-80A80,80,0,0,1,192,112Z"
                              opacity="0.2"
                            ></path>
                            <path d="M229.66,218.34,179.6,168.28a88.21,88.21,0,1,0-11.32,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                          </svg>
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-card-foreground">
                            Group Explorer
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            Browse and interact with savings groups
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="groupId"
                          className="text-sm font-semibold text-card-foreground"
                        >
                          Group ID
                        </Label>
                        <Input
                          id="groupId"
                          type="number"
                          value={gid}
                          onChange={(e) => setGid(Number(e.target.value))}
                          min="0"
                          className="w-full"
                        />
                      </div>
                      <GroupExplorer groupId={gid} />
                    </CardContent>
                  </Card>

                  <WithdrawEarnings />
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <CreateGroup />
                  <JoinGroup />
                </div>
              </div>

              <GroupsTable />
            </div>
          )}

          {activeTab === "individual" && (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* User Statistics - Overview First */}
              <UserStatistics />

              {/* Savings Dashboard - Current State */}
              <SavingsDashboard />

              {/* Admin Withdraw Earnings - Platform Admin Only */}
              <AdminWithdrawEarnings />

              {/* Savings Visualization - Analytics & Progress */}
              <SavingsVisualization />

              {/* Savfe Actions - Main Actions (Prominent Position) */}
              <Card className="gradient-card-hover">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Savings Actions</CardTitle>
                      <CardDescription>Create and manage your personal savings goals</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <SavfeActions />
                </CardContent>
              </Card>

              {/* Penalty Calculator - Educational Tool */}
              <PenaltyCalculator />

              {/* Transaction History - Historical Data (Bottom) */}
              <TransactionHistory />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
