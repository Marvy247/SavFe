"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/lib/contract";
import { formatEther, parseEther } from "viem";

interface Challenge {
  name: string;
  targetAmount: bigint;
  duration: bigint;
  startTime: bigint;
  participants: readonly `0x${string}`[];
  active: boolean;
}

export default function SavingsChallenges() {
  const { address } = useAccount();
  const [challengeName, setChallengeName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const { data: challengeCounter } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "challengeCounter",
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (challengeCounter) {
        const numChallenges = Number(challengeCounter);
        const challengesData: Challenge[] = [];
        for (let i = 1; i <= numChallenges; i++) {
          // const challenge = await getChallenge(BigInt(i));
          // challengesData.push(challenge);
        }
        setChallenges(challengesData);
      }
    };
    fetchChallenges();
  }, [challengeCounter]);

  const handleCreateChallenge = () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createChallenge",
      args: [challengeName, parseEther(targetAmount), BigInt(duration)],
    });
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
  };

  const handleCompleteChallenge = (challengeId: number) => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "completeChallenge",
      args: [BigInt(challengeId)],
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Challenge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              placeholder="Duration (seconds)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateChallenge}>Create Challenge</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((challenge, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {challenge.name}
                <Badge variant={challenge.active ? "default" : "secondary"}>
                  {challenge.active ? "Active" : "Completed"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Target: {formatEther(challenge.targetAmount)} ETH</p>
              <p>Duration: {challenge.duration.toString()} seconds</p>
              <p>Participants: {challenge.participants.length}</p>
              <div className="flex space-x-2 mt-2">
                <Button
                  onClick={() => handleJoinChallenge(index + 1)}
                  disabled={!challenge.active || challenge.participants.includes(address as `0x${string}`)}
                >
                  Join Challenge
                </Button>
                <Input type="number" placeholder="Amount" id={`amount-${index}`} />
                <Button
                  onClick={() => {
                    const amount = (document.getElementById(`amount-${index}`) as HTMLInputElement).value;
                    handleContributeToChallenge(index + 1, amount);
                  }}
                  disabled={!challenge.active}
                >
                  Contribute
                </Button>
                <Button
                  onClick={() => handleCompleteChallenge(index + 1)}
                  disabled={!challenge.active}
                >
                  Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}