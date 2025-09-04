"use client";
import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS, CHILD_SAVFE_ABI } from "../lib/contract";
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
import { Badge } from "@/components/ui/badge";
import IncrementSaving from "./IncrementSaving";
import WithdrawSaving from "./WithdrawSaving";
import { useQueryClient } from "@tanstack/react-query";

export default function SavfeActions() {
  const [joinAmount, setJoinAmount] = useState<string>("");
  const [savingName, setSavingName] = useState<string>("");
  const [maturityTime, setMaturityTime] = useState<string>("");
  const [penaltyPercentage, setPenaltyPercentage] = useState<string>("");
  const [savingAmount, setSavingAmount] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [safeMode, setSafeMode] = useState<boolean>(false);

  const { address } = useAccount();
  const queryClient = useQueryClient();

  // Check if user has joined SavFe (has child contract)
  const { data: childContractAddress, refetch: refetchChildContract } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'getUserChildContractAddressByAddress',
    args: address ? [address] : [],
  });

  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
    error,
  } = useWriteContract();

  // Wait for transaction to be mined
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Invalidate queries when transaction is successful
  React.useEffect(() => {
    if (isSuccess) {
      console.log('Transaction successful, receipt:', receipt);
      console.log('Transaction successful, invalidating queries...');

      // Invalidate all wagmi queries (broader invalidation)
      queryClient.invalidateQueries({
        predicate: (query) => {
          // Invalidate queries that contain wagmi-related keys or contract function names
          const queryKey = query.queryKey as any[];
          return queryKey.some(key =>
            typeof key === 'string' && (
              key.includes('getSavingsNames') ||
              key.includes('getSaving') ||
              key.includes('getUserChildContractAddress') ||
              key.includes('getUserChildContractAddressByAddress') ||
              key.includes('userCount') ||
              key.includes('contractEarnings') ||
              key.includes('groupCounter') ||
              key.includes('JoinLimitFee') ||
              key.includes('SavingFee') ||
              key.includes('readContract')
            )
          );
        }
      });

      // Also invalidate all queries as fallback
      queryClient.invalidateQueries();

      // Force a delay to ensure blockchain state is updated
      setTimeout(() => {
        console.log('Query invalidation complete');
        // Final invalidation to ensure all data is fresh
        queryClient.invalidateQueries();
      }, 3000);
    }
  }, [isSuccess, queryClient]);

  const handleJoinSavfe = async () => {
    // Convert ETH amount to wei (1 ETH = 10^18 wei)
    const joinAmountWei = BigInt(Math.floor(parseFloat(joinAmount) * 10 ** 18));

    console.log("Joining SavFe with amount:", joinAmountWei);

    try {
      const result = await writeContract({
        address: SAVFE_ADDRESS,
        abi: SAVFE_ABI,
        functionName: "joinSavfe",
        value: joinAmountWei,
      });
      console.log("joinSavfe result:", result);
      // Refetch child contract address after joining
      setTimeout(async () => {
        console.log("Refetching child contract address...");
        const refetchResult = await refetchChildContract();
        console.log("Refetch result:", refetchResult);
        console.log("Child contract address after refetch:", refetchResult.data);
      }, 2000);
    } catch (error) {
      console.error("Error calling joinSavfe:", error);
      toast.error("Failed to join SavFe. Please try again.");
    }
  };

  const handleCreateSaving = async () => {
    console.log("handleCreateSaving called");

    // Check if wallet is connected
    if (!address) {
      console.log("No wallet address found");
      toast.error("Please connect your wallet first.");
      return;
    }

    // Check if user has joined SavFe
    console.log("Checking child contract address:", childContractAddress);
    if (!childContractAddress || childContractAddress === "0x0000000000000000000000000000000000000000") {
      console.log("User hasn't joined SavFe:", childContractAddress);
      toast.error("You must join SavFe before creating a saving. Please join SavFe first.");
      return;
    }

    // Validate required fields
    if (!savingName.trim()) {
      console.log("Saving name is empty");
      toast.error("Please enter a saving name.");
      return;
    }
    if (!maturityTime || parseInt(maturityTime) <= 0) {
      console.log("Invalid maturity time:", maturityTime);
      toast.error("Please enter a valid maturity time.");
      return;
    }
    if (!savingAmount || parseFloat(savingAmount) <= 0) {
      console.log("Invalid saving amount:", savingAmount);
      toast.error("Please enter a valid saving amount.");
      return;
    }

    const maturityTimestamp = Math.floor(Date.now() / 1000) + (parseInt(maturityTime) * 24 * 60 * 60); // Convert days to seconds
    const tokenToSave = tokenAddress || "0x0000000000000000000000000000000000000000"; // address(0) for native token

    // Convert saving amount to wei if it's ETH
    const savingAmountWei = tokenToSave === "0x0000000000000000000000000000000000000000"
      ? BigInt(Math.floor(parseFloat(savingAmount) * 10 ** 18))
      : BigInt(savingAmount);

    console.log("Creating saving with params:", {
      savingName,
      maturityTimestamp,
      penaltyPercentage,
      safeMode,
      tokenToSave,
      savingAmountWei,
      value: tokenToSave === "0x0000000000000000000000000000000000000000" ? savingAmountWei : BigInt(0),
    });

    try {
      const result = writeContract({
        address: SAVFE_ADDRESS,
        abi: SAVFE_ABI,
        functionName: "createSaving",
        args: [
          savingName,
          BigInt(maturityTimestamp),
          BigInt(penaltyPercentage),
          safeMode,
          tokenToSave,
          savingAmountWei,
        ],
        value: tokenToSave === "0x0000000000000000000000000000000000000000" ? savingAmountWei : BigInt(0),
      });
      console.log("writeContract result:", result);
    } catch (error) {
      console.error("Error calling writeContract:", error);
      toast.error("Failed to initiate transaction. Please try again.");
    }
  };

  const isLoading = isWriting || isConfirming;

  return (
    <div className="space-y-6">
      {/* Join Savfe Section */}
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
                Join Savfe
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Join the Savfe platform to start saving
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="joinAmount"
              className="text-sm font-semibold text-card-foreground"
            >
              Join Fee (ETH)
            </Label>
            <div className="relative">
              <Input
                id="joinAmount"
                type="number"
                value={joinAmount}
                onChange={(e) => setJoinAmount(e.target.value)}
                placeholder="0.01"
                step="0.01"
                min="0"
                className="pr-12"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Badge variant="secondary" className="text-xs">
                  ETH
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={handleJoinSavfe}
            disabled={!joinAmount || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span>
                  {isWriting ? "Confirm in Wallet..." : "Joining Savfe..."}
                </span>
              </div>
            ) : (
              "Join Savfe"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Create Saving Section */}
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
                <path d="M200,80a56.06,56.06,0,0,0-56-56H112A56.06,56.06,0,0,0,56,80v96a16,16,0,0,0,16,16h8v16a8,8,0,0,1-16,0V192H56a32,32,0,0,1-32-32V80a72.08,72.08,0,0,1,72-72h32a72.08,72.08,0,0,1,72,72v96a32,32,0,0,1-32,32h-8v16a8,8,0,0,1-16,0V192h8A16,16,0,0,0,200,176Z"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Create Saving
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Create a new savings goal
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="savingName"
                className="text-sm font-semibold text-card-foreground"
              >
                Saving Name
              </Label>
              <Input
                id="savingName"
                type="text"
                value={savingName}
                onChange={(e) => setSavingName(e.target.value)}
                placeholder="My Emergency Fund"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="maturityTime"
                className="text-sm font-semibold text-card-foreground"
              >
                Maturity Time (days)
              </Label>
              <Input
                id="maturityTime"
                type="number"
                value={maturityTime}
                onChange={(e) => setMaturityTime(e.target.value)}
                placeholder="365"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="penaltyPercentage"
                className="text-sm font-semibold text-card-foreground"
              >
                Penalty Percentage
              </Label>
              <Input
                id="penaltyPercentage"
                type="number"
                value={penaltyPercentage}
                onChange={(e) => setPenaltyPercentage(e.target.value)}
                placeholder="10"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="savingAmount"
                className="text-sm font-semibold text-card-foreground"
              >
                Saving Amount
              </Label>
              <div className="relative">
                <Input
                  id="savingAmount"
                  type="number"
                  value={savingAmount}
                  onChange={(e) => setSavingAmount(e.target.value)}
                  placeholder="0.1"
                  step="0.01"
                  min="0"
                  className="pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Badge variant="secondary" className="text-xs">
                    {tokenAddress ? "Tokens" : "ETH"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="tokenAddress"
                className="text-sm font-semibold text-card-foreground"
              >
                Token Address (Optional)
              </Label>
              <Input
                id="tokenAddress"
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x0000000000000000000000000000000000000000 (for ETH)"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for ETH or enter ERC20 token address
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="safeMode"
                checked={safeMode}
                onChange={(e) => setSafeMode(e.target.checked)}
                className="rounded"
              />
              <Label
                htmlFor="safeMode"
                className="text-sm font-semibold text-card-foreground"
              >
                Enable Safe Mode
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Safe mode converts savings to stablecoins for protection against volatility
            </p>
          </div>

          <Button
            onClick={handleCreateSaving}
            disabled={!savingName || !maturityTime || !penaltyPercentage || !savingAmount || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span>
                  {isWriting ? "Confirm in Wallet..." : "Creating Saving..."}
                </span>
              </div>
            ) : (
              "Create Saving"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {txHash && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Transaction: </span>
          <a
            href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-mono"
          >
            {txHash.slice(0, 8)}...{txHash.slice(-6)}
          </a>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Saving Created Successfully!</span>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
          <svg
            className="h-4 w-4 mt-0.5 flex-shrink-0"
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
          <span className="break-all">
            Error: {error.message.split("\n")[0]}
          </span>
        </div>
      )}

      {/* Debug: Child Contract Address */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Child Contract: </span>
        <span className="font-mono text-xs">
          {childContractAddress && typeof childContractAddress === 'string' && childContractAddress !== "0x0000000000000000000000000000000000000000"
            ? `${childContractAddress.slice(0, 8)}...${childContractAddress.slice(-6)}`
            : "Not joined"
          }
        </span>
        <button
          onClick={() => refetchChildContract()}
          className="ml-2 text-xs text-primary hover:underline"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
