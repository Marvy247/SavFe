"use client";
import { writeContract } from 'wagmi/actions';
import '@web3modal/wagmi/react';
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
import DashboardHeader from "@/components/DashboardHeader";
import JoinSavfeCard from "@/components/JoinSavfeCard";

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
import { Target, User, Users, Brain, Award } from "lucide-react";
import Link from "next/link";

import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ABI, SAVFE_ADDRESS, readGroupData } from "@/lib/contract";
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
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("individual");

  const { data: childContractAddress, refetch: refetchChildContract } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getUserChildContractAddress',
    args: [address],
    query: {
      enabled: !!address,
    }
  });

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
      icon: <User className="h-5 w-5" />
    },
    {
      id: "group",
      label: "Group Savings",
      description: "Join rotating savings groups and collaborate with others",
      icon: <Users className="h-5 w-5" />
    },
    {
      id: "challenges",
      label: "Challenges",
      description: "Participate in savings challenges and earn rewards",
      icon: <Target className="h-5 w-5" />
    },
    {
      id: "ai-suggestions",
      label: "AI Suggestions",
      description: "Get personalized savings recommendations powered by AI",
      icon: <Brain className="h-5 w-5" />
    },
    {
      id: "badges",
      label: "Achievements",
      description: "View your earned badges and achievements",
      icon: <Award className="h-5 w-5" />
    }
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background dark:bg-black flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome to SavFe</CardTitle>
            <CardDescription>Please connect your wallet to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <w3m-button size="md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auto-join user if they don't have a child contract
  React.useEffect(() => {
    if (address && (!childContractAddress || childContractAddress === "0x0000000000000000000000000000000000000000")) {
      // Auto-join the user by calling the contract directly
      const autoJoin = async () => {
        try {
          // Use wagmi to call joinSavfe
          await writeContract({
            address: SAVFE_ADDRESS,
            abi: FACTORY_ABI,
            functionName: 'joinSavfe',
            args: [],
          });
          // Refetch child contract address after a delay
          setTimeout(() => {
            refetchChildContract();
          }, 2000);
        } catch (error) {
          console.error('Auto-join failed:', error);
        }
      };
      autoJoin();
    }
  }, [address, childContractAddress, refetchChildContract]);

  return (
    <div className="min-h-screen bg-background dark:bg-black">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardHeader />

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Tab Content */}
              {activeTab === "challenges" && (
                <SavingsChallenges />
              )}

              {activeTab === "ai-suggestions" && (
                <AISavingsSuggestions />
              )}

              {activeTab === "badges" && (
                <NFTGallery />
              )}

              {activeTab === "group" && (
                <div className="space-y-8">
                  <MyGroups />
                  <GroupCards />
                  <GroupsTable />
                </div>
              )}

              {activeTab === "individual" && (
                <div className="space-y-8">
                  <SavingsOverview />
                  <SavingsVisualization />
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div id="savings-dashboard">
                <SavingsDashboard />
              </div>
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
              <CreateGroup />
              <Card className="gradient-card-hover">
                <CardHeader>
                  <CardTitle>Token Swap</CardTitle>
                  <CardDescription>Exchange tokens before depositing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Swap />
                </CardContent>
              </Card>
              <div id="emergency-withdraw">
                <EmergencyWithdraw />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Actions Floating Bar */}
      <div className="block sm:hidden">
        <QuickActions
          onCreateSaving={() => {
            document.getElementById('savfe-actions')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onEmergencyWithdraw={() => {
            document.getElementById('emergency-withdraw')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onIncrementSaving={() => {
            document.getElementById('savings-dashboard')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      <Footer />
    </div>
  );
}
