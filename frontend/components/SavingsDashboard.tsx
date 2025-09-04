'use client';
import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SAVFE_ABI, SAVFE_ADDRESS, CHILD_SAVFE_ABI, publicClient } from '../lib/contract';
import { formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
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
import { Skeleton } from '@/components/ui/skeleton';
import IncrementSavingModal from './IncrementSavingModal';
import WithdrawSavingModal from './WithdrawSavingModal';
import toast from 'react-hot-toast';

interface SavingData {
  name: string;
  amount: bigint;
  maturityTime: bigint;
  penaltyPercentage: number;
  token: string;
  isActive: boolean;
  timeRemaining: number;
}

const SavingCard = ({ name, childContractAddress, onIncrement, onWithdraw }: { name: string, childContractAddress: `0x${string}`, onIncrement: (name: string) => void, onWithdraw: (name: string) => void }) => {
  const { data: saving, isLoading } = useReadContract({
    address: childContractAddress,
    abi: CHILD_SAVFE_ABI,
    functionName: 'getSaving',
    args: [name],
  });



  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-px w-full my-4" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!saving || !(saving as any).isValid) {
    return null;
  }

  const formatTimeRemaining = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);

    if (days > 0) {
      return `${days} days, ${hours} hours`;
    } else if (hours > 0) {
      return `${hours} hours`;
    } else {
      return 'Less than 1 hour';
    }
  };

  const getMaturityStatus = (timeRemaining: number) => {
    if (timeRemaining <= 0) {
      return { status: 'Matured', color: 'bg-green-100 text-green-800' };
    } else if (timeRemaining <= 86400) { // Less than 1 day
      return { status: 'Almost Ready', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'Growing', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const timeRemaining = Number((saving as any).maturityTime) - Math.floor(Date.now() / 1000);
  const maturityStatus = getMaturityStatus(timeRemaining);

  // Debug logging for maturity time
  console.log(`Saving "${name}":`, {
    maturityTime: (saving as any).maturityTime,
    currentTime: Math.floor(Date.now() / 1000),
    timeRemaining,
    isMatured: timeRemaining <= 0,
    isValid: (saving as any).isValid
  });



  return (
    <Card className="border-l-4 border-l-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              {name}
            </h3>
            <Badge className={`text-xs ${maturityStatus.color}`}>
              {maturityStatus.status}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-card-foreground">
              {formatEther((saving as any).amount)} ETH
            </p>
            <p className="text-xs text-muted-foreground">
              {(saving as any).tokenId === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'ERC20'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Time Remaining</p>
            <p className="text-sm font-medium">
              {timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Matured'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Penalty Rate</p>
            <p className="text-sm font-medium">{Number((saving as any).penaltyPercentage)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium">
              {(saving as any).isValid ? 'Active' : 'Completed'}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onIncrement(name)}
          >
            Increment
          </Button>
          {(saving as any).isValid && (
            <Button
              size="sm"
              onClick={() => onWithdraw(name)}
              variant={timeRemaining <= 0 ? "default" : "secondary"}
            >
              Withdraw
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function SavingsDashboard() {
  const { address } = useAccount();
  const [isIncrementModalOpen, setIsIncrementModalOpen] = useState(false);
  const [selectedSavingName, setSelectedSavingName] = useState<string>('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedWithdrawSavingName, setSelectedWithdrawSavingName] = useState<string>('');
  const queryClient = useQueryClient();

  const openIncrementModal = (savingName: string) => {
    setSelectedSavingName(savingName);
    setIsIncrementModalOpen(true);
  };

  const closeIncrementModal = () => {
    setIsIncrementModalOpen(false);
    setSelectedSavingName('');
    // Invalidate queries to refresh data after increment
    queryClient.invalidateQueries({ queryKey: ['getSavingsNames'] });
    queryClient.invalidateQueries({ queryKey: ['getSaving'] });
    queryClient.invalidateQueries({ queryKey: ['getUserChildContractAddress'] });
    queryClient.invalidateQueries({ queryKey: ['getUserChildContractAddressByAddress'] });
  };

  const openWithdrawModal = (savingName: string) => {
    setSelectedWithdrawSavingName(savingName);
    setIsWithdrawModalOpen(true);
  };

  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setSelectedWithdrawSavingName('');
    // Invalidate queries to refresh data after withdrawal
    queryClient.invalidateQueries({ queryKey: ['getSavingsNames'] });
    queryClient.invalidateQueries({ queryKey: ['getSaving'] });
    queryClient.invalidateQueries({ queryKey: ['getUserChildContractAddress'] });
    queryClient.invalidateQueries({ queryKey: ['getUserChildContractAddressByAddress'] });
  };

  const { data: childContractAddress, refetch: refetchChildContract } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'getUserChildContractAddressByAddress',
    args: address ? [address] : [],
    query: {
      enabled: !!address,
    }
  });

  const { data: savingsNames, isLoading: isLoadingSavingsNames, refetch: refetchSavingsNames } = useReadContract({
    address: childContractAddress as `0x${string}` | undefined,
    abi: CHILD_SAVFE_ABI,
    functionName: 'getSavingsNames',
    args: [],
    query: {
      enabled: !!childContractAddress,
    }
  });

  // Filter to only show active (valid) savings
  const [activeSavingsNames, setActiveSavingsNames] = React.useState<string[]>([]);
  const [isFilteringSavings, setIsFilteringSavings] = React.useState(false);

  React.useEffect(() => {
    const filterActiveSavings = async () => {
      if (!childContractAddress || !savingsNames || !(savingsNames as any).savingsNames) {
        setActiveSavingsNames([]);
        return;
      }

      setIsFilteringSavings(true);
      const allSavingsNames = (savingsNames as any).savingsNames as string[];
      const activeNames: string[] = [];

      // Check each saving to see if it's still valid and avoid duplicates
      const seenNames = new Set<string>();

      for (const savingName of allSavingsNames) {
        if (seenNames.has(savingName)) {
          continue; // Skip duplicate saving name
        }
        seenNames.add(savingName);

        try {
          const savingData = await publicClient.readContract({
            address: childContractAddress as `0x${string}`,
            abi: CHILD_SAVFE_ABI,
            functionName: 'getSaving',
            args: [savingName],
          });

          if (savingData && (savingData as any).isValid) {
            activeNames.push(savingName);
          }
        } catch (error) {
          console.error(`Error fetching saving ${savingName}:`, error);
        }
      }

      setActiveSavingsNames(activeNames);
      setIsFilteringSavings(false);
    };

    filterActiveSavings();
  }, [childContractAddress, savingsNames]);

  const isLoading = isLoadingSavingsNames || isFilteringSavings;

  // Debug logging and force refetch if needed
  React.useEffect(() => {
    console.log('SavingsDashboard - childContractAddress:', childContractAddress);
    console.log('SavingsDashboard - savingsNames:', savingsNames);

    // If we have a child contract address but no savings names, try to refetch
    if (childContractAddress && (!savingsNames || !(savingsNames as any).savingsNames || (savingsNames as any).savingsNames.length === 0)) {
      console.log('SavingsDashboard - Forcing refetch of savings names');
      refetchSavingsNames();
    }
  }, [childContractAddress, savingsNames, refetchSavingsNames]);

  // Also refetch child contract address periodically or when needed
  React.useEffect(() => {
    if (address && !childContractAddress) {
      console.log('SavingsDashboard - No child contract address, refetching...');
      refetchChildContract();
    }
  }, [address, childContractAddress, refetchChildContract]);

  if (!address) {
    return (
      <div className="space-y-6">
        <Card className="animate-fade-in">
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Please connect your wallet to view savings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingSavingsNames) {
    return (
      <div className="space-y-6">
        <Card className="animate-fade-in">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-12 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-px w-full my-4" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IncrementSavingModal
        isOpen={isIncrementModalOpen}
        onClose={closeIncrementModal}
        savingName={selectedSavingName}
        tokenAddress={''}
      />
      <WithdrawSavingModal
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
        savingName={selectedWithdrawSavingName}
        childContractAddress={childContractAddress as `0x${string}`}
      />
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M200,80a56.06,56.06,0,0,0-56-56H112A56.06,56.06,0,0,0,56,80v96a16,16,0,0,0,16,16h8v16a8,8,0,0,1-16,0V192H56a32,32,0,0,1-32-32V80a72.08,72.08,0,0,1,72-72h32a72.08,72.08,0,0,1,72,72v96a32,32,0,0,1-32,32h-8v16a8,8,0,0,1-16,0V192h8A16,16,0,0,0,200,176Z"></path>
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-card-foreground">
                  Your Savings Dashboard
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Track your savings goals and progress
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {activeSavingsNames.length}
            </Badge>
          </div>
        </CardHeader>

      <CardContent>
        {activeSavingsNames.length > 0 ? (
          <div className="space-y-4">
            {activeSavingsNames.map((name: string) => (
              <SavingCard key={name} name={name} childContractAddress={childContractAddress as `0x${string}`} onIncrement={openIncrementModal} onWithdraw={openWithdrawModal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <svg
              className="h-12 w-12 mx-auto mb-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="text-lg font-medium">No savings yet</p>
            <p className="text-sm">Create your first savings goal to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
  );
}
