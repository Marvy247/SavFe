"use client";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI, publicClient } from "../lib/contract";
import { formatEther } from "viem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, DollarSign, AlertCircle, Clock, Target, Trophy } from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'contribution' | 'join' | 'payout' | 'message' | 'challenge_created' | 'challenge_joined' | 'challenge_contributed' | 'challenge_completed';
  groupId?: number;
  challengeId?: number;
  user: string;
  amount?: bigint;
  message?: string;
  timestamp: number;
}

export default function GroupActivityFeed() {
  const { address } = useAccount();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recent activities from user's groups and challenges
  const loadActivities = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const userActivities: ActivityItem[] = [];

      // Load group activities
      const groupCounter = await publicClient.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "groupCounter",
      });

      const totalGroups = Number(groupCounter);

      // Load recent messages from user's groups
      for (let groupId = 1; groupId <= totalGroups; groupId++) {
        try {
          const groupData = await publicClient.readContract({
            address: FACTORY_ADDRESS,
            abi: FACTORY_ABI,
            functionName: "getGroup",
            args: [BigInt(groupId)],
          });

          const [creator, members] = groupData as [string, string[]];

          // Only load activities for groups the user is a member of
          if (members.includes(address)) {
            // Get recent messages
            const messages = await publicClient.readContract({
              address: FACTORY_ADDRESS,
              abi: FACTORY_ABI,
              functionName: "getRecentGroupMessages",
              args: [BigInt(groupId), BigInt(3)], // Get last 3 messages
            });

            const messageArray = messages as any[];
            messageArray.forEach((msg: any) => {
              if (msg.timestamp > 0) {
                userActivities.push({
                  id: `msg-${groupId}-${msg.timestamp}`,
                  type: 'message',
                  groupId,
                  user: msg.sender,
                  message: msg.content,
                  timestamp: Number(msg.timestamp),
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error loading activities for group ${groupId}:`, error);
        }
      }

      // Load challenge activities
      const challengeCounter = await publicClient.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "challengeCounter",
      });

      const totalChallenges = Number(challengeCounter);

      for (let challengeId = 1; challengeId <= totalChallenges; challengeId++) {
        try {
          const challenge = await publicClient.readContract({
            address: FACTORY_ADDRESS,
            abi: FACTORY_ABI,
            functionName: "getChallenge",
            args: [BigInt(challengeId)],
          }) as any;

          if (challenge && challenge.participants.includes(address)) {
            // Add challenge creation activity
            if (challenge.startTime > 0) {
              userActivities.push({
                id: `challenge-created-${challengeId}`,
                type: 'challenge_created',
                challengeId,
                user: challenge.creator || 'Unknown',
                message: `Created challenge: ${challenge.name}`,
                timestamp: Number(challenge.startTime),
              });
            }

            // Add user's join activity
            if (challenge.participants.includes(address)) {
              userActivities.push({
                id: `challenge-joined-${challengeId}-${address}`,
                type: 'challenge_joined',
                challengeId,
                user: address,
                message: `Joined challenge: ${challenge.name}`,
                timestamp: Number(challenge.startTime) + 60, // Assume joined shortly after creation
              });
            }
          }
        } catch (error) {
          console.error(`Error loading challenge ${challengeId}:`, error);
        }
      }

      // Sort by timestamp (most recent first) and take top 20
      userActivities.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(userActivities.slice(0, 20));

    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Failed to load recent activities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [address]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'join':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'payout':
        return <DollarSign className="h-4 w-4 text-purple-600" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
      case 'challenge_created':
        return <Target className="h-4 w-4 text-orange-600" />;
      case 'challenge_joined':
        return <Users className="h-4 w-4 text-indigo-600" />;
      case 'challenge_contributed':
        return <DollarSign className="h-4 w-4 text-emerald-600" />;
      case 'challenge_completed':
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const userShort = `${activity.user.slice(0, 6)}...${activity.user.slice(-4)}`;

    switch (activity.type) {
      case 'contribution':
        return `${userShort} contributed ${activity.amount ? formatEther(activity.amount) : '0'} ETH`;
      case 'join':
        return `${userShort} joined the group`;
      case 'payout':
        return `${userShort} received a payout of ${activity.amount ? formatEther(activity.amount) : '0'} ETH`;
      case 'message':
        return `${userShort}: ${activity.message}`;
      case 'challenge_created':
        return `${userShort} created a new savings challenge`;
      case 'challenge_joined':
        return `${userShort} joined a savings challenge`;
      case 'challenge_contributed':
        return `${userShort} contributed to a challenge`;
      case 'challenge_completed':
        return `${userShort} completed a savings challenge! 🎉`;
      default:
        return `${userShort} performed an action`;
    }
  };

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
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-16" />
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
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-card-foreground">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Latest updates from your groups
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground">
                    {getActivityText(activity)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {activity.groupId && (
                      <Badge variant="outline" className="text-xs">
                        Group #{activity.groupId}
                      </Badge>
                    )}
                    {activity.challengeId && (
                      <Badge variant="outline" className="text-xs">
                        Challenge #{activity.challengeId}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Activity from your groups will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
