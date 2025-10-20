"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FACTORY_ABI, FACTORY_ADDRESS, publicClient } from "@/lib/contract";
import { formatEther, parseEther } from "viem";
import { Trophy, Users, Clock, Target, Plus } from "lucide-react";

interface Challenge {
  id: number;
  name: string;
  targetAmount: bigint;
  duration: bigint;
  startTime: bigint;
  participants: readonly `0x${string}`[];
  active: boolean;
  category?: string;
  currentTotal: bigint;
}

interface UserContribution {
  challengeId: number;
  amount: bigint;
  rank: number;
}

export default function SavingsChallenges() {
  const { address } = useAccount();
  const [challengeName, setChallengeName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userContributions, setUserContributions] = useState<UserContribution[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "joined">("all");
  const [sortBy, setSortBy] = useState<"deadline" | "popularity" | "progress">("deadline");
  const [contributeModal, setContributeModal] = useState<{ open: boolean; challengeId: number | null; amount: string }>({ open: false, challengeId: null, amount: "" });

  const { data: challengeCounter } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "challengeCounter",
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (challengeCounter && address) {
        const numChallenges = Number(challengeCounter);
        const challengesData: Challenge[] = [];
        const contributions: UserContribution[] = [];

        for (let i = 1; i <= numChallenges; i++) {
          try {
            const challenge = await publicClient.readContract({
              address: FACTORY_ADDRESS,
              abi: FACTORY_ABI,
              functionName: "getChallenge",
              args: [BigInt(i)],
            }) as Challenge;

            if (challenge) {
              challengesData.push({ ...challenge, id: i });

              // Check user participation and contribution
              if (challenge.participants.includes(address as `0x${string}`)) {
                const userContrib = await publicClient.readContract({
                  address: FACTORY_ADDRESS,
                  abi: FACTORY_ABI,
                  functionName: "getUserContribution",
                  args: [BigInt(i), address],
                }) as bigint;

                const rank = await publicClient.readContract({
                  address: FACTORY_ADDRESS,
                  abi: FACTORY_ABI,
                  functionName: "getUserRank",
                  args: [BigInt(i), address],
                }) as number;

                contributions.push({ challengeId: i, amount: userContrib, rank });
              }
            }
          } catch (error) {
            console.error(`Error fetching challenge ${i}:`, error);
          }
        }

        setChallenges(challengesData);
        setUserContributions(contributions);
      }
    };
    fetchChallenges();
  }, [challengeCounter, address]);

  const handleCreateChallenge = () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createChallenge",
      args: [challengeName, parseEther(targetAmount), BigInt(duration), category || ""],
    });
    // Reset form
    setChallengeName("");
    setTargetAmount("");
    setDuration("");
    setCategory("");
  };

  const handleJoinChallenge = (challengeId: number) => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "joinChallenge",
      args: [BigInt(challengeId)],
    });
  };

  const handleContributeToChallenge = (challengeId: number, amount: string) => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "contributeToChallenge",
      args: [BigInt(challengeId)],
      value: parseEther(amount),
    });
    setContributeModal({ open: false, challengeId: null, amount: "" });
  };

  const handleCompleteChallenge = (challengeId: number) => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "completeChallenge",
      args: [BigInt(challengeId)],
    });
  };

  const filteredAndSortedChallenges = challenges
    .filter(challenge => {
      if (filter === "all") return true;
      if (filter === "active") return challenge.active;
      if (filter === "completed") return !challenge.active;
      if (filter === "joined") return challenge.participants.includes(address as `0x${string}`);
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "deadline") {
        const aDeadline = Number(a.startTime) + Number(a.duration);
        const bDeadline = Number(b.startTime) + Number(b.duration);
        return aDeadline - bDeadline;
      }
      if (sortBy === "popularity") return b.participants.length - a.participants.length;
      if (sortBy === "progress") {
        const aProgress = Number(a.currentTotal) / Number(a.targetAmount);
        const bProgress = Number(b.currentTotal) / Number(b.targetAmount);
        return bProgress - aProgress;
      }
      return 0;
    });

  const getUserContribution = (challengeId: number) => {
    return userContributions.find(c => c.challengeId === challengeId);
  };

  const formatTimeRemaining = (challenge: Challenge) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(challenge.startTime) + Number(challenge.duration);
    const remaining = endTime - now;
    if (remaining <= 0) return "Ended";
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Create Challenge Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Challenge Name"
              value={challengeName}
              onChange={(e) => setChallengeName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Target Amount (ETH)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Duration (days)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation Fund</SelectItem>
                <SelectItem value="emergency">Emergency Savings</SelectItem>
                <SelectItem value="goal">Personal Goal</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateChallenge} disabled={!challengeName || !targetAmount || !duration}>
            Create Challenge
          </Button>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Challenges</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="joined">My Challenges</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedChallenges.map((challenge) => {
          const userContrib = getUserContribution(challenge.id);
          const progress = Number(challenge.currentTotal) / Number(challenge.targetAmount) * 100;
          const isJoined = challenge.participants.includes(address as `0x${string}`);

          return (
            <Card key={challenge.id} className="border-l-4 border-l-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{challenge.name}</CardTitle>
                    {challenge.category && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {challenge.category}
                      </Badge>
                    )}
                  </div>
                  <Badge variant={challenge.active ? "default" : "secondary"}>
                    {challenge.active ? "Active" : "Completed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatEther(challenge.currentTotal)} ETH</span>
                    <span>{formatEther(challenge.targetAmount)} ETH</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{challenge.participants.length} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTimeRemaining(challenge)}</span>
                  </div>
                </div>

                {/* User Contribution */}
                {isJoined && userContrib && (
                  <div className="bg-primary/5 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Your Contribution</span>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Rank #{userContrib.rank}</span>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-primary">
                      {formatEther(userContrib.amount)} ETH
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!isJoined ? (
                    <Button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={!challenge.active}
                      className="w-full"
                    >
                      Join Challenge
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Dialog
                        open={contributeModal.open && contributeModal.challengeId === challenge.id}
                        onOpenChange={(open) =>
                          setContributeModal({ open, challengeId: open ? challenge.id : null, amount: "" })
                        }
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            Contribute
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Contribute to {challenge.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              type="number"
                              placeholder="Amount in ETH"
                              value={contributeModal.amount}
                              onChange={(e) =>
                                setContributeModal(prev => ({ ...prev, amount: e.target.value }))
                              }
                            />
                            <Button
                              onClick={() => handleContributeToChallenge(challenge.id, contributeModal.amount)}
                              disabled={!contributeModal.amount || !challenge.active}
                              className="w-full"
                            >
                              Contribute
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        onClick={() => handleCompleteChallenge(challenge.id)}
                        disabled={!challenge.active}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAndSortedChallenges.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">No challenges found</p>
          <p className="text-sm text-muted-foreground">Create your first challenge or join existing ones!</p>
        </div>
      )}
    </div>
  );
}
