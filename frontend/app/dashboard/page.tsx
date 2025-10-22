"use client";
import { writeContract } from 'wagmi/actions';
import '@web3modal/wagmi/react';
import { config } from "@/lib/wagmi";
import CreateGroup from "@/components/CreateGroup";
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
import GroupExplorer from "@/components/GroupExplorer";
import GroupsTable from "@/components/GroupsTable";
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
import JoinGroup from "@/components/JoinGroup";
import MyGroups from "@/components/MyGroups";
import GroupCards from "@/components/GroupCards";
import PiggySavfeActions from "@/components/PiggySavfeActions";
import WithdrawEarnings from "@/components/WithdrawEarnings";
import NFTGallery from "@/components/NFTGallery";
import SavingsChallenges from "@/components/SavingsChallenges";
import AISavingsSuggestions from "@/components/AISavingsSuggestions";
import EmergencyWithdraw from "@/components/EmergencyWithdraw";
import DashboardHeader from "@/components/DashboardHeader";
import JoinSavfeCard from "@/components/JoinPiggySavfeCard";

import SavingsVisualization from "@/components/SavingsVisualization";
const QuickActions = dynamic(() => import("@/components/QuickActions"), {
  ssr: false,
  loading: () => null,
});
const Identity = dynamic(() => import('@coinbase/onchainkit/identity').then(mod => mod.Identity), { ssr: false });
const Avatar = dynamic(() => import('@coinbase/onchainkit/identity').then(mod => mod.Avatar), { ssr: false });
const Name = dynamic(() => import('@coinbase/onchainkit/identity').then(mod => mod.Name), { ssr: false });
import { Swap } from '@coinbase/onchainkit/swap';
import { FundButton } from '@coinbase/onchainkit/fund';
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
import { FACTORY_ABI, SAVFE_ADDRESS, SAVFE_ABI, readGroupData } from "@/lib/contract";
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
    functionName: 'getUserChildContractAddressByAddress',
    args: address ? [address] : [],
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
      id: "savings",
      label: "Savings",
      description: "Manage your individual and group savings goals",
      icon: <Target className="h-5 w-5" />
    },
    {
      id: "challenges",
      label: "Challenges",
      description: "Participate in savings challenges and earn rewards",
      icon: <Target className="h-5 w-5" />
    },
    {
      id: "ai",
      label: "AI",
      description: "Get personalized savings recommendations powered by AI",
      icon: <Brain className="h-5 w-5" />
    },
    {
      id: "fund",
      label: "Fund & Swap",
      description: "Add funds to your wallet and swap tokens",
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    },
    {
      id: "achievements",
      label: "Achievements",
      description: "View your earned badges and achievements",
      icon: <Award className="h-5 w-5" />
    }
  ];

  // Auto-join user if they don't have a child contract
  React.useEffect(() => {
    if (address && (!childContractAddress || childContractAddress === "0x0000000000000000000000000000000000000000")) {
      // Auto-join the user by calling the contract directly
      const autoJoin = async () => {
        try {
          // Use wagmi to call joinSavfe
          await writeContract(config, {
            address: SAVFE_ADDRESS,
            abi: SAVFE_ABI,
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background dark:bg-black flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome to PiggySavfe</CardTitle>
            <CardDescription>Please connect your wallet to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* @ts-expect-error: w3m-button is a custom element from web3modal */}
            <w3m-button size="md" />
          </CardContent>
        </Card>
      </div>
    );
  }

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

              {activeTab === "ai" && (
                <AISavingsSuggestions />
              )}

              {activeTab === "fund" && (
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                        <CardTitle>Fund Your Wallet</CardTitle>
                        <CardDescription>
                            Add funds to your wallet to start saving. You can use a credit card or transfer from another wallet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-4">
                        <FundButton fiatCurrency="USD" openIn="popup" popupSize="md" />
                    </CardContent>
                  </Card>
                  <Card className="gradient-card-hover">
                    <CardHeader>
                      <CardTitle>Token Swap</CardTitle>
                      <CardDescription>Exchange tokens before depositing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Swap />
                    </CardContent>
                  </Card>
                  <WithdrawEarnings />
                </div>
              )}

              {activeTab === "achievements" && (
                <NFTGallery />
              )}

              {activeTab === "savings" && (
                <div className="space-y-8">
                  <SavingsOverview />
                  <SavingsVisualization />
                  <MyGroups />
                  <GroupCards />
                  <GroupsTable />
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div id="savings-dashboard">
                <SavingsDashboard />
              </div>
              <Card id="savfe-actions" className="gradient-card-hover">

                <CardContent>
                  <PiggySavfeActions />
                </CardContent>
              </Card>
              <CreateGroup />

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
