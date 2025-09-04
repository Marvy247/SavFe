"use client";
import React from "react";
import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "../lib/contract";
import { formatEther } from "viem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EarningsDisplay() {
  const { data, error, isLoading } = useReadContract({
    abi: FACTORY_ABI,
    address: FACTORY_ADDRESS,
    functionName: "contractEarnings",
  });

  if (isLoading) {
    return (
      <Card className="gradient-card-hover animate-fade-in">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="text-muted-foreground">Loading earnings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="gradient-card-hover animate-fade-in">
        <CardContent className="flex items-center space-x-2 py-8 text-destructive">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error loading earnings</span>
        </CardContent>
      </Card>
    );
  }

  const earnings = data ? formatEther(data as bigint) : "0";

  return (
    <Card className="gradient-card-hover animate-fade-in">
      <CardHeader className="">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {/* <DollarSign className="h-5 w-5 text-primary" /> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M240,112v32a16,16,0,0,1-16,16h-8l-18.1,50.69a8,8,0,0,1-7.54,5.31H177.64a8,8,0,0,1-7.54-5.31L166.29,200H97.71L93.9,210.69A8,8,0,0,1,86.36,216H73.64a8,8,0,0,1-7.54-5.31L53,174a79.7,79.7,0,0,1-21-54h0a80,80,0,0,1,80-80h32a80,80,0,0,1,73.44,48.22,82.22,82.22,0,0,1,2.9,7.78H224A16,16,0,0,1,240,112Z"
                opacity="0.2"
              ></path>
              <path d="M192,116a12,12,0,1,1-12-12A12,12,0,0,1,192,116ZM152,64H112a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm96,48v32a24,24,0,0,1-24,24h-2.36l-16.21,45.38A16,16,0,0,1,190.36,224H177.64a16,16,0,0,1-15.07-10.62L160.65,208h-57.3l-1.92,5.38A16,16,0,0,1,86.36,224H73.64a16,16,0,0,1-15.07-10.62L46,178.22a87.69,87.69,0,0,1-21.44-48.38A16,16,0,0,0,16,144a8,8,0,0,1-16,0,32,32,0,0,1,24.28-31A88.12,88.12,0,0,1,112,32H216a8,8,0,0,1,0,16H194.61a87.93,87.93,0,0,1,30.17,37c.43,1,.85,2,1.25,3A24,24,0,0,1,248,112Zm-16,0a8,8,0,0,0-8-8h-3.66a8,8,0,0,1-7.64-5.6A71.9,71.9,0,0,0,144,48H112A72,72,0,0,0,58.91,168.64a8,8,0,0,1,1.64,2.71L73.64,208H86.36l3.82-10.69A8,8,0,0,1,97.71,192h68.58a8,8,0,0,1,7.53,5.31L177.64,208h12.72l18.11-50.69A8,8,0,0,1,216,152h8a8,8,0,0,0,8-8Z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Platform Earnings
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Total fees collected
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg text-left flex flex-row items-center gap-x-4">
          <div className="text-4xl font-bold text-foreground mb-2">
            {earnings}
          </div>
          <Badge variant="secondary" className="text-sm">
            ETH
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
