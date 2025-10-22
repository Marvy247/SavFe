"use client";

import { useAccount, useReadContract, usePublicClient, useWriteContract } from "wagmi";
import { writeContract } from 'wagmi/actions';
import { config } from "@/lib/wagmi";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { NFT_ADDRESS } from "@/lib/contract";

// Define NFT ABI inline since it's not exported from contract.ts
const NFT_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "badgeRewards",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "badgeStakeTime",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "badgeStaked",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "badgeTypes",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "badges",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "description",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "imageURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "claimBadgeRewards",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getApproved",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getBadgeDetails",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "description",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "imageURI",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "badgeType",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "staked",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "stakeTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "rewards",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserBadges",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isApprovedForAll",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "operator",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mintBadge",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "description",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "imageURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "mintTypedBadge",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "description",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "imageURI",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "badgeType",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setApprovalForAll",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "operator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "approved",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stakeBadge",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      {
        "name": "interfaceId",
        "type": "bytes4",
        "internalType": "bytes4"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unstakeBadge",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "userBadges",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "approved",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ApprovalForAll",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "operator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "approved",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BadgeMinted",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "badgeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BadgeRewardClaimed",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "reward",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BadgeStaked",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BadgeUnstaked",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
];
import { Transaction, TransactionButton } from "@coinbase/onchainkit/transaction";
import { toast } from "sonner";

interface BadgeData {
  id: number;
  name: string;
  description: string;
  image: string;
  tokenURI: string;
}

// Achievement types for different milestones
const ACHIEVEMENT_TYPES = [
  {
    id: 1,
    name: "First Savings",
    description: "Created your first savings goal",
    image: "🎯",
    requirement: "Create your first saving"
  },
  {
    id: 2,
    name: "Consistent Saver",
    description: "Made 5 consecutive deposits",
    image: "💪",
    requirement: "Make 5 deposits"
  },
  {
    id: 3,
    name: "Goal Achiever",
    description: "Completed your first savings goal",
    image: "🏆",
    requirement: "Complete a savings goal"
  },
  {
    id: 4,
    name: "Diamond Hands",
    description: "Saved for 30 days without withdrawal",
    image: "💎",
    requirement: "Save for 30 days"
  },
  {
    id: 5,
    name: "Whale Saver",
    description: "Saved over 1 ETH total",
    image: "🐋",
    requirement: "Save 1+ ETH"
  },
];

export default function NFTGallery() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [showMintForm, setShowMintForm] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<number>(1);
  const [customTokenURI, setCustomTokenURI] = useState<string>("");
  const [isLoadingBadges, setIsLoadingBadges] = useState(true);

  const stakeBadge = (tokenId: number) => {
    writeContract(config, {
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: "stakeBadge",
      args: [BigInt(tokenId)],
    });
  };

  const unstakeBadge = (tokenId: number) => {
    writeContract(config, {
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: "unstakeBadge",
      args: [BigInt(tokenId)],
    });
  };

  const claimBadgeRewards = (tokenId: number) => {
    writeContract(config, {
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: "claimBadgeRewards",
      args: [BigInt(tokenId)],
    });
  };

  // Get user's NFT balance
  const { data: nftBalance, refetch: refetchBalance } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Get user's badge token IDs
  const { data: userBadges, refetch: refetchBadges } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "getUserBadges",
    args: address ? [address as `0x${string}`] : undefined,
  });

  useEffect(() => {
    const fetchBadgeMetadata = async () => {
      if (userBadges && address && publicClient) {
        setIsLoadingBadges(true);
        try {
          const badgePromises = (userBadges as bigint[]).map(async (id: bigint) => {
            try {
              // Fetch token URI from contract
              const tokenURI = await publicClient.readContract({
                address: NFT_ADDRESS,
                abi: NFT_ABI,
                functionName: "tokenURI",
                args: [id],
              }) as string;

              // Try to fetch metadata from URI if it's a valid URL
              let metadata = {
                name: `Achievement Badge #${Number(id)}`,
                description: "SavFe Achievement Badge",
                image: "🏅",
              };

              if (tokenURI && (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs'))) {
                try {
                  const response = await fetch(tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/'));
                  if (response.ok) {
                    metadata = await response.json();
                  }
                } catch (error) {
                  console.error('Error fetching metadata:', error);
                }
              }

              return {
                id: Number(id),
                name: metadata.name,
                description: metadata.description,
                image: metadata.image,
                tokenURI: tokenURI,
              };
            } catch (error) {
              console.error(`Error fetching badge ${id}:`, error);
              return {
                id: Number(id),
                name: `Badge #${Number(id)}`,
                description: "Achievement unlocked!",
                image: "🏅",
                tokenURI: "",
              };
            }
          });

          const badgeData = await Promise.all(badgePromises);
          setBadges(badgeData);
        } catch (error) {
          console.error('Error fetching badge metadata:', error);
        } finally {
          setIsLoadingBadges(false);
        }
      } else {
        setIsLoadingBadges(false);
      }
    };

    fetchBadgeMetadata();
  }, [userBadges, address, publicClient]);

  // Generate token URI for selected achievement
  const generateTokenURI = (achievementId: number) => {
    const achievement = ACHIEVEMENT_TYPES.find(a => a.id === achievementId);
    if (!achievement) return "";

    // Create a simple JSON metadata
    const metadata = {
      name: achievement.name,
      description: achievement.description,
      image: achievement.image,
      attributes: [
        {
          trait_type: "Achievement Type",
          value: achievement.name
        },
        {
          trait_type: "Platform",
          value: "SavFe"
        }
      ]
    };

    // For demo purposes, return a data URI
    // In production, you'd upload to IPFS or a server
    return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
  };

  const achievement = ACHIEVEMENT_TYPES.find(a => a.id === selectedAchievement);
  const mintCalls = address && showMintForm && achievement ? [{
    to: NFT_ADDRESS as `0x${string}`,
    abi: NFT_ABI,
    functionName: "mintBadge",
    args: [
      address as `0x${string}`,
      achievement.name,
      achievement.description,
      achievement.image,
    ],
  }] : [];

  const handleMintSuccess = () => {
    toast.success('Achievement NFT minted successfully!');
    setShowMintForm(false);
    setCustomTokenURI("");
    // Refetch badges immediately to update the UI
    refetchBadges();
    refetchBalance();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Achievement Badges</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Collect NFT badges as you reach savings milestones
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="text-sm">
            {nftBalance ? Number(nftBalance) : 0} Badges
          </Badge>
          <Button 
            onClick={() => setShowMintForm(!showMintForm)} 
            variant={showMintForm ? "outline" : "default"}
            size="lg"
          >
            {showMintForm ? 'Cancel' : '🎨 Mint Badge'}
          </Button>
        </div>
      </div>

      {/* Mint Form */}
      {showMintForm && (
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎨</span>
              <span>Mint Achievement NFT</span>
            </CardTitle>
            <CardDescription>
              Mint a badge to commemorate your savings achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Achievement Selection */}
            <div className="space-y-2">
              <Label htmlFor="achievement">Select Achievement</Label>
              <select
                id="achievement"
                value={selectedAchievement}
                onChange={(e) => setSelectedAchievement(Number(e.target.value))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {ACHIEVEMENT_TYPES.map((achievement) => (
                  <option key={achievement.id} value={achievement.id}>
                    {achievement.image} {achievement.name} - {achievement.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Requirement: {ACHIEVEMENT_TYPES.find(a => a.id === selectedAchievement)?.requirement}
              </p>
            </div>

            {/* Custom Token URI (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="tokenURI">Custom Token URI (Optional)</Label>
              <Input
                id="tokenURI"
                type="text"
                value={customTokenURI}
                onChange={(e) => setCustomTokenURI(e.target.value)}
                placeholder="ipfs://... or https://..."
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use default metadata for selected achievement
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">Preview:</p>
              <div className="flex items-center space-x-3">
                <div className="text-4xl">
                  {ACHIEVEMENT_TYPES.find(a => a.id === selectedAchievement)?.image}
                </div>
                <div>
                  <p className="font-medium">
                    {ACHIEVEMENT_TYPES.find(a => a.id === selectedAchievement)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ACHIEVEMENT_TYPES.find(a => a.id === selectedAchievement)?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Mint Button */}
            <Transaction
              calls={mintCalls}
              onSuccess={handleMintSuccess}
              onError={(error) => {
                console.error('Mint failed:', error);
                toast.error('Failed to mint NFT. Please try again.');
              }}
            >
              <TransactionButton
                disabled={!address}
                className="w-full"
                text="Mint Achievement Badge"
              />
            </Transaction>
          </CardContent>
        </Card>
      )}

      {/* Badges Grid */}
      {isLoadingBadges ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : badges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <Card key={badge.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm">
                    {badge.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">#{badge.id}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg mb-3">
                  <span className="text-6xl">{badge.image}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                <div className="flex space-x-2 mt-2">
                  <Button onClick={() => stakeBadge(badge.id)}>Stake</Button>
                  <Button onClick={() => unstakeBadge(badge.id)}>Unstake</Button>
                  <Button onClick={() => claimBadgeRewards(badge.id)}>Claim Rewards</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🏅</div>
            <h3 className="text-xl font-semibold mb-2">No badges yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Start saving to unlock achievements and mint your first badge NFT!
            </p>
            <Button onClick={() => setShowMintForm(true)} variant="outline">
              Mint Your First Badge
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Available Achievements</CardTitle>
          <CardDescription>
            Complete these milestones to earn achievement badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACHIEVEMENT_TYPES.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="text-3xl">{achievement.image}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{achievement.name}</h4>
                  <p className="text-xs text-muted-foreground mb-1">
                    {achievement.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {achievement.requirement}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
