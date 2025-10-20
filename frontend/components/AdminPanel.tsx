'use client';
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { SAVFE_ABI, SAVFE_ADDRESS, FACTORY_ABI, FACTORY_ADDRESS } from '@/lib/contract';
import { formatEther, parseEther } from 'viem';

export default function AdminPanel() {
  const { address } = useAccount();
  const [isOwner, setIsOwner] = useState(false);
  const [joinLimitFeeInput, setJoinLimitFeeInput] = useState('');
  const [savingFeeInput, setSavingFeeInput] = useState('');

  // Check if current user is the owner
  const { data: ownerAddress } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "owner",
  });

  // Get platform statistics
  const { data: fountainAmount } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "fountain",
  });

  const { data: contractEarnings } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "contractEarnings",
  });

  const { data: userCount } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "userCount",
  });

  const { data: joinLimitFee } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "JoinLimitFee",
  });

  const { data: savingFee } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "SavingFee",
  });

  // Factory contract data
  const { data: groupCounter } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "groupCounter",
  });

  useEffect(() => {
    if (ownerAddress && address && typeof ownerAddress === "string" && typeof address === "string") {
      setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
    }
  }, [ownerAddress, address]);

  useEffect(() => {
    if (joinLimitFee && typeof joinLimitFee === "bigint") {
      setJoinLimitFeeInput(formatEther(joinLimitFee));
    }
    if (savingFee && typeof savingFee === "bigint") {
      setSavingFeeInput(formatEther(savingFee));
    }
  }, [joinLimitFee, savingFee]);

  const dripFountainCalls = [{
    to: SAVFE_ADDRESS as `0x${string}`,
    abi: SAVFE_ABI,
    functionName: "dripFountain",
  }];

  const handleDripFountainSuccess = (response: any) => {
    console.log('Drip fountain successful:', response);
    toast.success('Platform earnings withdrawn successfully!');
  };

  const handleDripFountainError = (error: any) => {
    console.error('Drip fountain failed:', error);
    toast.error('Failed to withdraw platform earnings. Please try again.');
  };

  const setJoinLimitFeeCalls = joinLimitFeeInput ? [{
    to: SAVFE_ADDRESS as `0x${string}`,
    abi: SAVFE_ABI,
    functionName: "setJoinLimitFee",
    args: [parseEther(joinLimitFeeInput)],
  }] : [];

  const handleSetJoinLimitFeeSuccess = (response: any) => {
    console.log('Set join limit fee successful:', response);
    toast.success('Join limit fee updated successfully!');
  };

  const handleSetJoinLimitFeeError = (error: any) => {
    console.error('Set join limit fee failed:', error);
    toast.error('Failed to update join limit fee. Please try again.');
  };

  const setSavingFeeCalls = savingFeeInput ? [{
    to: SAVFE_ADDRESS as `0x${string}`,
    abi: SAVFE_ABI,
    functionName: "setSavingFee",
    args: [parseEther(savingFeeInput)],
  }] : [];

  const handleSetSavingFeeSuccess = (response: any) => {
    console.log('Set saving fee successful:', response);
    toast.success('Saving fee updated successfully!');
  };

  const handleSetSavingFeeError = (error: any) => {
    console.error('Set saving fee failed:', error);
    toast.error('Failed to update saving fee. Please try again.');
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background dark:bg-black flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Platform management and oversight</p>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="gradient-card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platform Earnings</p>
                  <p className="text-2xl font-bold">
                    {fountainAmount && typeof fountainAmount === "bigint" ? formatEther(fountainAmount) : "0"} ETH
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">
                    {userCount && typeof userCount === "bigint" ? userCount.toString() : "0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Groups</p>
                  <p className="text-2xl font-bold">
                    {groupCounter && typeof groupCounter === "bigint" ? groupCounter.toString() : "0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Earnings</p>
                  <p className="text-2xl font-bold">
                    {contractEarnings && typeof contractEarnings === "bigint" ? formatEther(contractEarnings) : "0"} ETH
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Earnings Management */}
        <Card className="gradient-card-hover">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Platform Earnings Management</CardTitle>
                <CardDescription>Withdraw platform earnings from individual savings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Available Earnings
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {fountainAmount && typeof fountainAmount === "bigint" ? formatEther(fountainAmount) : "0"} ETH
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Reserved Fountain
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {fountainAmount && typeof fountainAmount === "bigint" ? formatEther(fountainAmount) : "0"} ETH
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Withdraw Platform Earnings</h3>
                <p className="text-sm text-muted-foreground">
                  Transfer accumulated platform earnings to the admin wallet
                </p>
              </div>
              <Transaction
                calls={dripFountainCalls}
                onSuccess={handleDripFountainSuccess}
                onError={handleDripFountainError}
              >
                <TransactionButton
                  disabled={!fountainAmount || (fountainAmount && typeof fountainAmount === "bigint" && fountainAmount === BigInt(0))}
                  className="w-full sm:w-auto"
                  text={`Withdraw ${fountainAmount && typeof fountainAmount === "bigint" ? formatEther(fountainAmount) : "0"} ETH`}
                />
              </Transaction>
            </div>


          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card className="gradient-card-hover">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Platform Settings</CardTitle>
                <CardDescription>Current platform configuration and fees</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="joinLimitFee" className="text-sm font-medium text-muted-foreground">Join Limit Fee</Label>
                  <Input
                    id="joinLimitFee"
                    type="text"
                    value={joinLimitFeeInput}
                    onChange={(e) => setJoinLimitFeeInput(e.target.value)}
                    placeholder="Enter join limit fee in ETH"
                  />
                  <Transaction
                    calls={setJoinLimitFeeCalls}
                    onSuccess={handleSetJoinLimitFeeSuccess}
                    onError={handleSetJoinLimitFeeError}
                  >
                    <TransactionButton
                      disabled={!joinLimitFeeInput}
                      className="mt-2"
                      text="Update Join Limit Fee"
                    />
                  </Transaction>
                </div>
                <div>
                  <Label htmlFor="savingFee" className="text-sm font-medium text-muted-foreground">Saving Fee</Label>
                  <Input
                    id="savingFee"
                    type="text"
                    value={savingFeeInput}
                    onChange={(e) => setSavingFeeInput(e.target.value)}
                    placeholder="Enter saving fee in ETH"
                  />
                  <Transaction
                    calls={setSavingFeeCalls}
                    onSuccess={handleSetSavingFeeSuccess}
                    onError={handleSetSavingFeeError}
                  >
                    <TransactionButton
                      disabled={!savingFeeInput}
                      className="mt-2"
                      text="Update Saving Fee"
                    />
                  </Transaction>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Platform Owner</Label>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    {ownerAddress && typeof ownerAddress === "string" ? `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}` : "N/A"}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Your Address</Label>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="gradient-card-hover">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl font-bold">System Status</CardTitle>
                <CardDescription>Platform health and operational status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Contract Status</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Operational</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Network Status</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Admin Access</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Verified</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
