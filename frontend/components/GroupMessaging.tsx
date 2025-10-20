"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const ScrollArea = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`max-h-64 overflow-y-auto ${className || ""}`}>{children}</div>;
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/lib/contract";

interface Message {
  sender: `0x${string}`;
  content: string;
  timestamp: bigint;
}

export default function GroupMessaging({ groupId }: { groupId: number }) {
  const { address } = useAccount();
  const [message, setMessage] = useState("");

  // Use the actual factory contract address and ABI
  const { data: messages } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getGroupMessages",
    args: [BigInt(groupId)],
  }) as { data: Message[] | undefined };

  const { writeContract } = useWriteContract();

  const sendMessage = () => {
    if (!message.trim()) return;

    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "sendMessage",
      args: [BigInt(groupId), message],
    });

    setMessage("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 mb-4">
          <div className="space-y-2">
            {messages?.map((msg: Message, index: number) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  msg.sender === address ? "bg-primary text-primary-foreground ml-8" : "bg-muted mr-8"
                }`}
              >
                <p className="text-sm font-medium">
                  {msg.sender === address ? "You" : `${msg.sender.slice(0, 6)}...${msg.sender.slice(-4)}`}
                </p>
                <p>{msg.content}</p>
                <p className="text-xs opacity-70">
                  {new Date(Number(msg.timestamp) * 1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}
