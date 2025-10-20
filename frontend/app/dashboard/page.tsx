"use client";
import CreateGroup from "@/components/CreateGroup";
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
import GroupExplorer from "@/components/GroupExplorer";
import GroupsTable from "@/components/GroupsTable";
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
import JoinGroup from "@/components/JoinGroup";
import MyGroups from "@/components/MyGroups";
import GroupCards from "@/components/GroupCards";
import SavfeActions from "@/components/SavfeActions";
import WithdrawEarnings from "@/components/WithdrawEarnings";
import NFTGallery from "@/components/NFTGallery";
import SavingsChallenges from "@/components/SavingsChallenges";
import AISavingsSuggestions from "@/components/AISavingsSuggestions";
import EmergencyWithdraw from "@/components/EmergencyWithdraw";

import SavingsVisualization from "@/components/SavingsVisualization";
const QuickActions = dynamic(() => import("@/components/QuickActions"), {
  ssr: false,
  loading: () => null,
});
const Identity = dynamic(() => import('@coinbase/onchainkit/identity').then(mod => mod.Identity), { ssr: false });
const Avatar = dynamic(() => import('@coinbase/onchainkit/identity').then(mod => mod.Avatar), { ssr: false });
const Name = dynamic(() => import('@coinbase/onchainkit/identity').then(mod => mod.Name), { ssr: false });
import { Swap } from '@coinbase/onchainkit/swap';
// import { Notification } from '@coinbase/onchainkit/notification'; // Not available yet
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
import { Separator } from "@/components/ui/separator";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { TrendingUp, CheckCircle, Target } from "lucide-react";
import Link from "next/link";

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

  const SavingsOverview = dynamic(() => import("@/components/SavingsOverview"), {
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
    },
    {
      id: "challenges",
      label: "Challenges",
      description: "Participate in savings challenges and earn rewards",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: "ai-suggestions",
      label: "AI Suggestions",
      description: "Get personalized savings recommendations powered by AI",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: "badges",
      label: "Achievements",
      description: "View your earned badges and achievements",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            <div className="flex items-center justify-center gap-4">
              <Identity address={useAccount().address}>
                <Avatar className="h-12 w-12 ring-2 ring-primary/20" />
                <div className="flex flex-col">
                  <Name className="text-lg font-semibold text-foreground" />
                  <span className="text-sm text-muted-foreground">Welcome back!</span>
                </div>
              </Identity>
            </div>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                Welcome to SavFe
              </h1>
              <p className="text-lg text-muted-foreground">
                Your smart savings companion for a better financial future
              </p>
            </div>
          </div>
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
          {activeTab === "challenges" && (
            <div className="space-y-8">
              <SavingsChallenges />
            </div>
          )}

          {activeTab === "ai-suggestions" && (
            <div className="space-y-8">
              <AISavingsSuggestions />

              {/* Success Metrics Section */}
              <Card className="gradient-card-hover">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Your Savings Success</CardTitle>
                  </div>
                  <CardDescription>Track your progress and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">$2,340</div>
                      <div className="text-sm text-muted-foreground">Total Saved This Year</div>
                      <div className="text-xs text-green-600 mt-1">+15% vs last year</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">12</div>
                      <div className="text-sm text-muted-foreground">Suggestions Applied</div>
                      <div className="text-xs text-green-600 mt-1">80% implementation rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">$480</div>
                      <div className="text-sm text-muted-foreground">Monthly Savings</div>
                      <div className="text-xs text-green-600 mt-1">From AI suggestions</div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Recent Achievements</h4>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Budget Master</div>
                          <div className="text-sm text-muted-foreground">Saved $150/month on coffee</div>
                        </div>
                        <Badge variant="secondary">+150 pts</Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Goal Crusher</div>
                          <div className="text-sm text-muted-foreground">Emergency fund at 40%</div>
                        </div>
                        <Badge variant="secondary">+200 pts</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "badges" && (
            <div className="space-y-8">
              <NFTGallery />
            </div>
          )}

          {activeTab === "group" && (
            <div className="space-y-8">
              {/* My Groups - Personalized Section */}
              <MyGroups />

              {/* Group Savings Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
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

                  {/* Browse Groups - Visual Card Layout */}
                  <GroupCards />

                  {/* Alternative Table View */}
                  <GroupsTable />
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <CreateGroup />
                </div>
              </div>
            </div>
          )}

          {activeTab === "individual" && (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Savings Overview - Overview First */}
              <SavingsOverview />

              {/* Savings Dashboard - Current State */}
              <div id="savings-dashboard">
                <SavingsDashboard />
              </div>

              {/* Savings Visualization - Analytics & Progress */}
              <SavingsVisualization />

              {/* Savfe Actions - Main Actions (Prominent Position) */}
              <Card id="savfe-actions" className="gradient-card-hover">
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

              {/* Emergency Withdraw - Critical Feature */}
              <div id="emergency-withdraw">
                <EmergencyWithdraw />
              </div>

              {/* Swap Component - Token Exchange */}
              <Card className="gradient-card-hover">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Token Swap</CardTitle>
                      <CardDescription>Exchange tokens before depositing into savings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Swap />
                </CardContent>
              </Card>

              {/* Quick Actions Floating Bar */}
              <QuickActions
                onCreateSaving={() => {
                  // Scroll to SavfeActions component
                  document.getElementById('savfe-actions')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onEmergencyWithdraw={() => {
                  // Scroll to EmergencyWithdraw component
                  document.getElementById('emergency-withdraw')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onIncrementSaving={() => {
                  // Could open a modal or scroll to increment options
                  document.getElementById('savings-dashboard')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
