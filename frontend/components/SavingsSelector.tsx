"use client";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useAccount, useReadContract } from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS, CHILD_SAVFE_ABI } from "../lib/contract";
import { formatEther } from "viem";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "wagmi/chains";

interface SavingOption {
  id: string;
  name: string;
  description: string;
  category: string;
  amount: number;
  token: string;
  maturityDate: Date;
  penaltyPercentage: number;
  isMatured: boolean;
  createdDate: Date;
}

interface SavingsSelectorProps {
  value: string;
  onChange: (name: string, saving?: SavingOption) => void;
  className?: string;
}

// Mock existing savings data - simulates real contract data
const MOCK_USER_SAVINGS: SavingOption[] = [
  {
    id: "1",
    name: "Emergency Fund",
    description: "For unexpected expenses",
    category: "Emergency",
    amount: 2.5,
    token: "ETH",
    maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    penaltyPercentage: 5,
    isMatured: false,
    createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
  },
  {
    id: "2",
    name: "Vacation Fund",
    description: "Trip and travel savings",
    category: "Travel",
    amount: 1.8,
    token: "ETH",
    maturityDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago (matured)
    penaltyPercentage: 0,
    isMatured: true,
    createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
  },
  {
    id: "3",
    name: "House Down Payment",
    description: "Savings for home purchase",
    category: "Housing",
    amount: 5.2,
    token: "ETH",
    maturityDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    penaltyPercentage: 10,
    isMatured: false,
    createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
  },
  {
    id: "4",
    name: "Car Fund",
    description: "Vehicle purchase savings",
    category: "Transportation",
    amount: 3.1,
    token: "ETH",
    maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    penaltyPercentage: 7,
    isMatured: false,
    createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  },
];

export default function SavingsSelector({ value, onChange, className = "" }: SavingsSelectorProps) {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [availableSavings, setAvailableSavings] = useState<SavingOption[]>([]);

  // Get user's child contract address
  const { data: childContractAddress } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'getUserChildContractAddress',
    args: [],
    query: {
      enabled: !!address,
    }
  });

  // Get savings names from child contract
  const { data: savingsNames, isLoading: isLoadingSavingsNames } = useReadContract({
    address: childContractAddress as `0x${string}` | undefined,
    abi: CHILD_SAVFE_ABI,
    functionName: 'getSavingsNames',
    args: [],
    query: {
      enabled: !!childContractAddress,
    }
  });

  // Fetch individual saving details when savings names are available
  useEffect(() => {
    console.log('SavingsSelector - childContractAddress:', childContractAddress);
    console.log('SavingsSelector - savingsNames:', savingsNames);

      const fetchSavingsDetails = async () => {
        if (!childContractAddress || !savingsNames || !(savingsNames as any).savingsNames) {
          console.log('SavingsSelector - No data available, setting empty array');
          setAvailableSavings([]);
          return;
        }

        const contractAddr = childContractAddress as `0x${string}`;
        const savingsList = (savingsNames as any).savingsNames as string[];
        console.log('SavingsSelector - Savings list:', savingsList);

        const savingsDetails: SavingOption[] = [];

        // For each saving name, fetch its details from the contract
        for (const savingName of savingsList) {
          try {
            console.log('SavingsSelector - Fetching details for:', savingName);
            // Fetch saving data from contract
            const savingData = await fetchSavingData(contractAddr, savingName) as any;

            const maturityDate = new Date(Number(savingData.maturityTime) * 1000);
            const createdDate = new Date(Number(savingData.startTime) * 1000);
            const isMatured = Date.now() > maturityDate.getTime();

            const savingOption: SavingOption = {
              id: savingName,
              name: savingName,
              description: `Savings goal: ${savingName}`,
              category: "General",
              amount: Number(savingData.amount) / 1e18, // Assuming amount is in wei
              token: savingData.tokenId === "0x0000000000000000000000000000000000000000" ? "ETH" : "ERC20",
              maturityDate,
              penaltyPercentage: Number(savingData.penaltyPercentage),
              isMatured,
              createdDate,
            };

            savingsDetails.push(savingOption);
          } catch (error) {
            console.error(`Error fetching saving data for ${savingName}:`, error);
          }
        }

        console.log('SavingsSelector - Final savings details:', savingsDetails);
        setAvailableSavings(savingsDetails);
      };

      // Helper function to fetch saving data from contract
      const fetchSavingData = async (contractAddr: `0x${string}`, savingName: string) => {
        const publicClient = createPublicClient({
          chain: baseSepolia,
          transport: http(),
        });

        const savingData = await publicClient.readContract({
          address: contractAddr,
          abi: CHILD_SAVFE_ABI,
          functionName: "getSaving",
          args: [savingName],
        });

        return savingData;
      };

    fetchSavingsDetails();
  }, [childContractAddress, savingsNames]);

  const selectedSaving = availableSavings.find(saving => saving.name === value);

  const handleSelect = (saving: SavingOption) => {
    onChange(saving.name, saving);
    setIsOpen(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilMaturity = (maturityDate: Date) => {
    const today = new Date();
    const diffTime = maturityDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!address || isLoadingSavingsNames}
        className={`w-full px-3 py-2 border border-input rounded-md text-sm flex items-center justify-between ${
          !address || isLoadingSavingsNames
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {!address ? (
            <>
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs">⚠️</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium">Connect Wallet</div>
                <div className="text-xs text-muted-foreground">Required to view savings</div>
              </div>
            </>
          ) : isLoadingSavingsNames ? (
            <>
              <div className="w-6 h-6 rounded-full bg-muted animate-pulse flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium">Loading Savings</div>
                <div className="text-xs text-muted-foreground">Fetching your data...</div>
              </div>
            </>
          ) : selectedSaving ? (
            <>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold">{selectedSaving.name.slice(0, 2)}</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium truncate">{selectedSaving.name}</div>
                <div className="text-xs text-muted-foreground flex items-center space-x-2">
                  <span>{selectedSaving.amount} {selectedSaving.token}</span>
                  <Badge variant={selectedSaving.isMatured ? "default" : "secondary"} className="text-xs">
                    {selectedSaving.isMatured ? "Matured" : `${getDaysUntilMaturity(selectedSaving.maturityDate)} days left`}
                  </Badge>
                </div>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {selectedSaving.category}
              </Badge>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs">💰</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium">Select a saving</div>
                <div className="text-xs text-muted-foreground">Choose from your savings</div>
              </div>
            </>
          )}
        </div>
        {address && !isLoadingSavingsNames && (
          <svg
            className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && address && !isLoadingSavingsNames && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-96 overflow-auto">
          {availableSavings.length === 0 ? (
            <div className="px-3 py-4 text-center text-muted-foreground">
              <p className="text-sm">No savings found</p>
              <p className="text-xs">Create a saving first to withdraw</p>
            </div>
          ) : (
            availableSavings.map((saving) => (
              <button
                key={saving.id}
                type="button"
                onClick={() => handleSelect(saving)}
                className="w-full px-3 py-4 text-left hover:bg-accent hover:text-accent-foreground border-b border-border/50 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold">{saving.name.slice(0, 2)}</span>
                      </div>
                      <div className="font-medium text-sm truncate">{saving.name}</div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {saving.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{saving.description}</div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">{saving.amount} {saving.token}</span>
                        <span>Created: {formatDate(saving.createdDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={saving.isMatured ? "default" : "secondary"} className="text-xs">
                          {saving.isMatured ? "Matured" : `Due: ${formatDate(saving.maturityDate)}`}
                        </Badge>
                        {!saving.isMatured && saving.penaltyPercentage > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {saving.penaltyPercentage}% penalty
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && address && !isLoadingSavingsNames && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export { MOCK_USER_SAVINGS };
export type { SavingOption };
