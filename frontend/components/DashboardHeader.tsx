"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";

export default function DashboardHeader() {
  const { address } = useAccount();

  // Mock data - replace with real data from your backend or state management
  const user = {
    totalSavings: "1.234 ETH",
    level: 5,
    progressToNextLevel: 60, // percentage
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar address={address} className="h-16 w-16" />
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back, <Name address={address} />
            </h2>
            <p className="text-muted-foreground">Here is your savings summary.</p>
          </div>
        </div>
        <div className="w-full sm:w-auto flex flex-col gap-4 sm:items-end">
            <div className="flex items-center gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Total Savings</p>
                    <p className="text-2xl font-bold">{user.totalSavings}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-2xl font-bold">{user.level}</p>
                </div>
            </div>
            <div className="w-full sm:w-64">
                <Progress value={user.progressToNextLevel} />
                <p className="text-xs text-muted-foreground mt-1 text-right">{100 - user.progressToNextLevel}% to next level</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
