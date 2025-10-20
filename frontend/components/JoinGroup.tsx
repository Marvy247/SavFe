"use client";
import React, { useState } from "react";
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { FACTORY_ABI, FACTORY_ADDRESS } from "../lib/contract";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JoinGroup({ disabled }: { disabled?: boolean }) {
  const [groupId, setGroupId] = useState<string>("");

  const joinGroupCalls = groupId ? [{
    to: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "joinGroup",
    args: [BigInt(groupId)],
  }] : [];

  const handleJoinGroupSuccess = (response: any) => {
    console.log('Join group successful:', response);
    toast.success('Successfully joined group!');
  };

  const handleJoinGroupError = (error: any) => {
    console.error('Join group failed:', error);
    toast.error('Failed to join group. Please try again.');
  };



  return (
    <Card className="gradient-card-hover animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {/* <Users className="h-5 w-5 text-primary" /> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M168,144a40,40,0,1,1-40-40A40,40,0,0,1,168,144ZM64,56A32,32,0,1,0,96,88,32,32,0,0,0,64,56Zm128,0a32,32,0,1,0,32,32A32,32,0,0,0,192,56Z"
                opacity="0.2"
              ></path>
              <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1,0-16,24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.85,8,57,57,0,0,0-98.15,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Join Group
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Become a member of an existing group
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
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
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            placeholder="Enter Group ID"
            min="0"
            disabled={disabled}
          />
        </div>

        <Transaction
          calls={joinGroupCalls}
          onSuccess={handleJoinGroupSuccess}
          onError={handleJoinGroupError}
        >
          <TransactionButton
            disabled={!groupId}
            className="w-full"
            text="Join Group"
          />
        </Transaction>


      </CardContent>
    </Card>
  );
}
