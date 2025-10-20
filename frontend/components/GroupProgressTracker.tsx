"use client";
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

interface GroupProgressTrackerProps {
  groupId: number;
  members: string[];
  contributionsThisRound: number;
  currentRound: number;
  totalRounds?: number;
  contributionAmount: bigint;
  pot: bigint;
  isUserMember?: boolean;
  userHasContributed?: boolean;
  isUserBeneficiary?: boolean;
}

export default function GroupProgressTracker({
  groupId,
  members,
  contributionsThisRound,
  currentRound,
  totalRounds = 12, // Default to 12 rounds for a year
  contributionAmount,
  pot,
  isUserMember = false,
  userHasContributed = false,
  isUserBeneficiary = false,
}: GroupProgressTrackerProps) {
  const progressPercentage = members.length > 0 ? (contributionsThisRound / members.length) * 100 : 0;
  const overallProgress = ((currentRound - 1) / totalRounds) * 100;

  const getStatusInfo = () => {
    if (progressPercentage === 100) {
      return {
        status: "Ready for Payout",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckCircle,
      };
    } else if (progressPercentage >= 50) {
      return {
        status: "Active Round",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: TrendingUp,
      };
    } else {
      return {
        status: "Collecting Contributions",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: Clock,
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-card-foreground">
            Group #{groupId} Progress
          </CardTitle>
          <Badge className={`text-xs ${statusInfo.color} ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Round Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Current Round Progress
            </h3>
            <span className="text-sm font-medium">
              {contributionsThisRound} / {members.length} contributions
            </span>
          </div>

          <Progress value={progressPercentage} className="w-full h-3" />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Round {currentRound}</span>
            <span>{progressPercentage.toFixed(0)}% complete</span>
          </div>
        </div>

        {/* Overall Group Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Overall Progress
            </h3>
            <span className="text-sm font-medium">
              {currentRound - 1} / {totalRounds} rounds completed
            </span>
          </div>

          <Progress value={overallProgress} className="w-full h-3" />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Group lifecycle</span>
            <span>{overallProgress.toFixed(0)}% complete</span>
          </div>
        </div>

        {/* Member Status Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Member Status
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {members.map((member, index) => {
              const isBeneficiary = index === (currentRound - 1) % members.length;
              const isCurrentUser = isUserMember && member === "current_user_address"; // Replace with actual user address check

              return (
                <div
                  key={member}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isBeneficiary
                      ? 'bg-blue-50 border-blue-200'
                      : isCurrentUser
                      ? 'bg-green-50 border-green-200'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isBeneficiary
                        ? 'bg-blue-100'
                        : isCurrentUser
                        ? 'bg-green-100'
                        : 'bg-muted'
                    }`}>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Member {index + 1}
                        {isCurrentUser && " (You)"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {member.slice(0, 6)}...{member.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isBeneficiary && (
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                        Beneficiary
                      </Badge>
                    )}
                    {isCurrentUser && userHasContributed && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Contributed
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">
              {members.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">
              {currentRound}
            </p>
            <p className="text-xs text-muted-foreground">Current Round</p>
          </div>
        </div>

        {/* User-specific status */}
        {isUserMember && (
          <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
              <div>
                <p className={`text-sm font-medium ${statusInfo.color}`}>
                  {isUserBeneficiary
                    ? "You're the beneficiary this round!"
                    : userHasContributed
                    ? "You've contributed to this round"
                    : "Your contribution is pending"
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {isUserBeneficiary
                    ? "Wait for all contributions to withdraw your payout"
                    : userHasContributed
                    ? "Great job! You're helping the group grow"
                    : "Contribute to keep the group on track"
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
