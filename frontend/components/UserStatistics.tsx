'use client';
import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { SAVFE_ABI, SAVFE_ADDRESS, FACTORY_ABI, FACTORY_ADDRESS, CHILD_SAVFE_ABI } from '../lib/contract';
import { formatEther } from 'viem';
import { publicClient } from '../lib/contract';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserStatistics() {
  const { address } = useAccount();

  // Read Savfe contract data
  const { data: joinLimitFee, isLoading: isLoadingJoinLimitFee } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'JoinLimitFee',
  });

  const { data: savingFee, isLoading: isLoadingSavingFee } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'SavingFee',
  });

  const { data: userCount, isLoading: isLoadingUserCount } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'userCount',
  });

  // Read Savfe contract data for platform earnings
  const { data: contractEarnings, isLoading: isLoadingContractEarnings } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'contractEarnings',
  });

  const { data: groupCounter, isLoading: isLoadingGroupCounter } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'groupCounter',
  });

  // Get user's child contract address
  const { data: childContractAddress } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'getUserChildContractAddressByAddress',
    args: address ? [address] : [],
    query: {
      enabled: !!address,
    }
  });

  const { data: savingsNames, isLoading: isLoadingSavingsNames } = useReadContract({
    address: childContractAddress as `0x${string}` | undefined,
    abi: CHILD_SAVFE_ABI,
    functionName: 'getSavingsNames',
    args: [],
    query: {
      enabled: !!childContractAddress,
    }
  });

  // Calculate active savings count and total savings count
  const [activeSavingsCount, setActiveSavingsCount] = React.useState<number>(0);
  const [totalSavingsCount, setTotalSavingsCount] = React.useState<number>(0);
  const [isCalculatingStats, setIsCalculatingStats] = React.useState(false);

  React.useEffect(() => {
    const calculateSavingsStats = async () => {
      if (!childContractAddress || !savingsNames || !(savingsNames as any).savingsNames) {
        setActiveSavingsCount(0);
        setTotalSavingsCount(0);
        return;
      }

      setIsCalculatingStats(true);
      const savingsList = (savingsNames as any).savingsNames as string[];
      let activeCount = 0;
      const totalCount = savingsList.length;

      // Count active savings (still valid)
      for (const savingName of savingsList) {
        try {
          const savingData = await publicClient.readContract({
            address: childContractAddress as `0x${string}`,
            abi: CHILD_SAVFE_ABI,
            functionName: 'getSaving',
            args: [savingName],
          });

          if (savingData && (savingData as any).isValid) {
            activeCount++;
          }
        } catch (error) {
          console.error(`Error fetching saving ${savingName}:`, error);
        }
      }

      setActiveSavingsCount(activeCount);
      setTotalSavingsCount(totalCount);
      setIsCalculatingStats(false);
    };

    calculateSavingsStats();
  }, [childContractAddress, savingsNames]);

  const isLoadingSavings = isLoadingSavingsNames || isCalculatingStats;

  if (!address) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Please connect your wallet to view statistics</p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = isLoadingJoinLimitFee || isLoadingSavingFee || isLoadingUserCount || isLoadingContractEarnings || isLoadingGroupCounter || isLoadingSavingsNames || isLoadingSavings;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Platform Statistics */}
      <Card className="gradient-card-hover animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208V64H48ZM208,208H48V80H208Z"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Platform Stats
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Overall platform metrics
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Users</span>
              {isLoadingUserCount ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <Badge variant="secondary" className="text-sm">
                  {userCount ? Number(userCount) : 0}
                </Badge>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Groups</span>
              {isLoadingGroupCounter ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <Badge variant="secondary" className="text-sm">
                  {groupCounter ? Number(groupCounter) : 0}
                </Badge>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Platform Earnings</span>
              {isLoadingContractEarnings ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {contractEarnings ? formatEther(contractEarnings as bigint) : '0'} ETH
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Structure */}
      <Card className="gradient-card-hover animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M240,112v32a16,16,0,0,1-16,16h-8l-18.1,50.69a8,8,0,0,1-7.54,5.31H177.64a8,8,0,0,1-7.54-5.31L166.29,200H97.71L93.9,210.69A8,8,0,0,1,86.36,216H73.64a8,8,0,0,1-7.54-5.31L53,174a79.7,79.7,0,0,1-21-54h0a80,80,0,0,1,80-80h32a80,80,0,0,1,73.44,48.22,82.22,82.22,0,0,1,2.9,7.78H224A16,16,0,0,1,240,112Z" opacity="0.2"></path>
                <path d="M192,116a12,12,0,1,1-12-12A12,12,0,0,1,192,116ZM152,64H112a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm96,48v32a24,24,0,0,1-24,24h-2.36l-16.21,45.38A16,16,0,0,1,190.36,224H177.64a16,16,0,0,1-15.07-10.62L160.65,208h-57.3l-1.92,5.38A16,16,0,0,1,86.36,224H73.64a16,16,0,0,1-15.07-10.62L46,178.22a87.69,87.69,0,0,1-21.44-48.38A16,16,0,0,0,16,144a8,8,0,0,1-16,0,32,32,0,0,1,24.28-31A88.12,88.12,0,0,1,112,32H216a8,8,0,0,1,0,16H194.61a87.93,87.93,0,0,1,30.17,37c.43,1,.85,2,1.25,3A24,24,0,0,1,248,112Zm-16,0a8,8,0,0,0-8-8h-3.66a8,8,0,0,1-7.64-5.6A71.9,71.9,0,0,0,144,48H112A72,72,0,0,0,58.91,168.64a8,8,0,0,1,1.64,2.71L73.64,208H86.36l3.82-10.69A8,8,0,0,1,97.71,192h68.58a8,8,0,0,1,7.53,5.31L177.64,208h12.72l18.11-50.69A8,8,0,0,1,216,152h8a8,8,0,0,0,8-8Z"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Fee Structure
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Current platform fees
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Join Fee</span>
              {isLoadingJoinLimitFee ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {joinLimitFee ? formatEther(joinLimitFee as bigint) : '0'} ETH
                </span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Saving Fee</span>
              {isLoadingSavingFee ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {savingFee ? formatEther(savingFee as bigint) : '0'} ETH
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card className="gradient-card-hover animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M168,144a40,40,0,1,1-40-40A40,40,0,0,1,168,144ZM64,56A32,32,0,1,0,96,88,32,32,0,0,0,64,56Zm128,0a32,32,0,1,0,32,32A32,32,0,0,0,192,56Z" opacity="0.2"></path>
                <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1,0-16,24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.85,8,57,57,0,0,0-98.15,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,0,1,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Your Activity
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Personal savings stats
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Savings</span>
              {isLoadingSavings ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <Badge variant="secondary" className="text-sm">
                  {activeSavingsCount}
                </Badge>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Savings</span>
              {isLoadingSavings ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <Badge variant="secondary" className="text-sm">
                  {totalSavingsCount}
                </Badge>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Groups Joined</span>
              <Badge variant="secondary" className="text-sm">
                0
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}