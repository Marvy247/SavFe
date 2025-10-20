'use client';
import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { SAVFE_ABI, SAVFE_ADDRESS, CHILD_SAVFE_ABI } from '../lib/contract';
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
import { Progress } from '@/components/ui/progress';

export default function SavingsOverview() {
  const { address } = useAccount();

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

  // Calculate comprehensive savings stats
  const [stats, setStats] = React.useState({
    totalSavings: 0,
    activeSavings: 0,
    totalSavingsCount: 0,
    nextMaturity: null as Date | null,
    averageProgress: 0,
    emergencyFundStatus: 'none' as 'none' | 'building' | 'adequate' | 'excellent',
  });
  const [isCalculatingStats, setIsCalculatingStats] = React.useState(false);

  React.useEffect(() => {
    const calculateStats = async () => {
      if (!childContractAddress || !savingsNames || !(savingsNames as any).savingsNames) {
        setStats({
          totalSavings: 0,
          activeSavings: 0,
          totalSavingsCount: 0,
          nextMaturity: null,
          averageProgress: 0,
          emergencyFundStatus: 'none',
        });
        return;
      }

      setIsCalculatingStats(true);
      const savingsList = (savingsNames as any).savingsNames as string[];
      let totalAmount = BigInt(0);
      let activeCount = 0;
      let earliestMaturity: Date | null = null;
      let totalProgress = 0;
      let progressCount = 0;

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
            totalAmount += (savingData as any).amount;

            // Calculate progress (time-based)
            const maturityTime = Number((savingData as any).maturityTime);
            const currentTime = Math.floor(Date.now() / 1000);
            const totalDuration = maturityTime - ((savingData as any).createdAt || currentTime - 86400 * 30); // Assume 30 days if no createdAt
            const elapsed = currentTime - ((savingData as any).createdAt || currentTime - 86400 * 30);
            const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            totalProgress += progress;
            progressCount++;

            // Track next maturity
            const maturityDate = new Date(maturityTime * 1000);
            if (!earliestMaturity || maturityDate < earliestMaturity) {
              earliestMaturity = maturityDate;
            }
          }
        } catch (error) {
          console.error(`Error fetching saving ${savingName}:`, error);
        }
      }

      // Determine emergency fund status
      const totalEth = Number(formatEther(totalAmount));
      let emergencyFundStatus: 'none' | 'building' | 'adequate' | 'excellent' = 'none';
      if (totalEth >= 10) emergencyFundStatus = 'excellent';
      else if (totalEth >= 5) emergencyFundStatus = 'adequate';
      else if (totalEth >= 1) emergencyFundStatus = 'building';

      setStats({
        totalSavings: Number(formatEther(totalAmount)),
        activeSavings: activeCount,
        totalSavingsCount: savingsList.length,
        nextMaturity: earliestMaturity,
        averageProgress: progressCount > 0 ? totalProgress / progressCount : 0,
        emergencyFundStatus,
      });
      setIsCalculatingStats(false);
    };

    calculateStats();
  }, [childContractAddress, savingsNames]);

  if (!address) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Please connect your wallet to view savings overview</p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = isLoadingSavingsNames || isCalculatingStats;

  const getEmergencyFundColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'adequate': return 'bg-blue-100 text-blue-800';
      case 'building': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmergencyFundIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '🛡️';
      case 'adequate': return '✅';
      case 'building': return '🚧';
      default: return '❓';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Savings */}
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
                <path d="M152,144a40,40,0,1,1-40-40A40,40,0,0,1,152,144ZM128,104a24,24,0,1,0,24,24A24,24,0,0,0,128,104Z" opacity="0.2"></path>
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v40h48A8,8,0,0,1,192,128Z"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Total Savings
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Your total saved amount
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  `${stats.totalSavings.toFixed(4)} ETH`
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Goals</span>
              {isLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <Badge variant="secondary" className="text-sm">
                  {stats.activeSavings}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Maturity */}
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
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v40h48A8,8,0,0,1,192,128Z"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Next Maturity
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Closest savings goal
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : stats.nextMaturity ? (
              <div>
                <p className="text-lg font-semibold">
                  {stats.nextMaturity.toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((stats.nextMaturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No active savings</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Savings Progress */}
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
                <path d="M152,144a40,40,0,1,1-40-40A40,40,0,0,1,152,144ZM128,104a24,24,0,1,0,24,24A24,24,0,0,0,128,104Z" opacity="0.2"></path>
                <path d="M200,80a8,8,0,0,1-8,8h-8v16a8,8,0,0,1-16,0V88h-8a8,8,0,0,1,0-16h32A8,8,0,0,1,200,80Zm-8,32a8,8,0,0,1-8,8H152a8,8,0,0,1,0-16h32A8,8,0,0,1,192,112Zm24-64H152a8,8,0,0,1,0-16h56a8,8,0,0,1,0,16ZM96,208a8,8,0,0,1-8,8H56a16,16,0,0,1-16-16V80a8,8,0,0,1,16,0v96a0,0,0,0,1,0,0H88A8,8,0,0,1,96,208Zm104-40H152a8,8,0,0,1,0-16h48a0,0,0,0,1,0,0V80a8,8,0,0,1,16,0v88A16,16,0,0,1,200,184Z"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Progress
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Average completion
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <Progress value={stats.averageProgress} className="w-full" />
            )}
            <div className="text-sm text-muted-foreground text-center">
              {isLoading ? (
                <Skeleton className="h-4 w-16 mx-auto" />
              ) : (
                `${stats.averageProgress.toFixed(1)}% complete`
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Fund Status */}
      <Card className="gradient-card-hover animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">{getEmergencyFundIcon(stats.emergencyFundStatus)}</span>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Emergency Fund
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Financial security status
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <Badge className={`text-sm ${getEmergencyFundColor(stats.emergencyFundStatus)}`}>
                {stats.emergencyFundStatus.charAt(0).toUpperCase() + stats.emergencyFundStatus.slice(1)}
              </Badge>
            )}
            <p className="text-sm text-muted-foreground">
              {stats.emergencyFundStatus === 'excellent' && 'Well protected! 🎉'}
              {stats.emergencyFundStatus === 'adequate' && 'Good coverage 👍'}
              {stats.emergencyFundStatus === 'building' && 'Keep saving! 💪'}
              {stats.emergencyFundStatus === 'none' && 'Start building today'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
