import { createPublicClient, http } from "viem";
import { baseSepolia } from "wagmi/chains";

export const FACTORY_ADDRESS = "0x657740711A1Cd13412e81dE1cDF1F055C8AF28C6" as `0x${string}`;

export const SAVFE_ADDRESS = "0x462d4b5435FdFBa96EbB1f9EBe60b1d7c721B1fa" as `0x${string}`;

export const NFT_ADDRESS = "0x81B0EA2170617800303c7d85e46C77A63a5A945c" as `0x${string}`;

export const NFT_ABI = [
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

// Create a public client for reading contract data
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export const FACTORY_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_savfeContract",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "challengeCounter",
    "inputs": [],
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
    "name": "completeChallenge",
    "inputs": [
      {
        "name": "_challengeId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "contractEarnings",
    "inputs": [],
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
    "name": "contribute",
    "inputs": [
      {
        "name": "_groupId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "contributeToChallenge",
    "inputs": [
      {
        "name": "_challengeId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "createChallenge",
    "inputs": [
      {
        "name": "_name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_targetAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_duration",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createGroup",
    "inputs": [
      {
        "name": "_contributionAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_contributionPeriod",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getChallenge",
    "inputs": [
      {
        "name": "_challengeId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "creator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "targetAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "duration",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "totalContributions",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "active",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "participants",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getGroup",
    "inputs": [
      {
        "name": "_groupId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "creator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "members",
        "type": "address[]",
        "internalType": "address[]"
      },
      {
        "name": "contributionAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "contributionPeriod",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "currentRound",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "lastPayoutTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "contributionsThisRound",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "pot",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getGroupStatus",
    "inputs": [
      {
        "name": "_groupId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "groupCounter",
    "inputs": [],
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
    "name": "joinChallenge",
    "inputs": [
      {
        "name": "_challengeId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "joinGroup",
    "inputs": [
      {
        "name": "_groupId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "savfeContract",
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
    "name": "triggerAutomaticPayout",
    "inputs": [
      {
        "name": "_groupId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawEarnings",
    "inputs": [
      {
        "name": "_to",
        "type": "address",
        "internalType": "address payable"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "ChallengeCompleted",
    "inputs": [
      {
        "name": "challengeId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "winner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ChallengeContribution",
    "inputs": [
      {
        "name": "challengeId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "participant",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ChallengeCreated",
    "inputs": [
      {
        "name": "challengeId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "name",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "targetAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "duration",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ChallengeJoined",
    "inputs": [
      {
        "name": "challengeId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "participant",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ContributionMade",
    "inputs": [
      {
        "name": "groupId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "member",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "fee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GroupCreated",
    "inputs": [
      {
        "name": "groupId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "contributionAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "contributionPeriod",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "JoinedGroup",
    "inputs": [
      {
        "name": "groupId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "member",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PayoutMade",
    "inputs": [
      {
        "name": "groupId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "round",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "beneficiary",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Withdrawn",
    "inputs": [
      {
        "name": "member",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
]

export const SAVFE_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_stableCoin",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "ChildContractGasFee",
    "inputs": [],
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
    "name": "JoinLimitFee",
    "inputs": [],
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
    "name": "SavingFee",
    "inputs": [],
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
    "name": "createSaving",
    "inputs": [
      {
        "name": "nameOfSaving",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "maturityTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "penaltyPercentage",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "safeMode",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "tokenToSave",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "dripFountain",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "editFees",
    "inputs": [
      {
        "name": "_joinFee",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_savingFee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "editStableCoin",
    "inputs": [
      {
        "name": "_newStableCoin",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "fountain",
    "inputs": [],
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
    "name": "getUserChildContractAddress",
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
    "name": "getUserChildContractAddressByAddress",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
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
    "name": "incrementGroupJoins",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "incrementSaving",
    "inputs": [
      {
        "name": "nameOfSavings",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "tokenToRetrieve",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "joinSavfe",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
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
    "name": "sendAsOriginalToken",
    "inputs": [
      {
        "name": "originalToken",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "ownerAddress",
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
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "setChildContractGasFee",
    "inputs": [
      {
        "name": "_fee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setJoinLimitFee",
    "inputs": [
      {
        "name": "_fee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setSavingFee",
    "inputs": [
      {
        "name": "_fee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stableCoin",
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
    "name": "totalUsers",
    "inputs": [],
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
    "name": "userCount",
    "inputs": [],
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
    "name": "userGroupJoins",
    "inputs": [
      {
        "name": "",
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
    "name": "withdrawFee",
    "inputs": [
      {
        "name": "_to",
        "type": "address",
        "internalType": "address payable"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawSaving",
    "inputs": [
      {
        "name": "nameOfSavings",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "JoinedSavfe",
    "inputs": [
      {
        "name": "userAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Received",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SavingCreated",
    "inputs": [
      {
        "name": "nameOfSaving",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "token",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TokenWithdrawal",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  }
];

export const CHILD_SAVFE_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_ownerAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_stableCoin",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "SavfeAddress",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address payable"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createSaving",
    "inputs": [
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "maturityTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "penaltyPercentage",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "tokenId",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amountToRetrieve",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isSafeMode",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getSaving",
    "inputs": [
      {
        "name": "nameOfSaving",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct ChildSavfe.SavingDataStruct",
        "components": [
          {
            "name": "isValid",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "amount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "tokenId",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "startTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "penaltyPercentage",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "maturityTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "isSafeMode",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSavingMode",
    "inputs": [
      {
        "name": "nameOfSaving",
        "type": "string",
        "internalType": "string"
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
    "name": "incrementSaving",
    "inputs": [
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "savingPlusAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "childContractGasFee",
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
    "stateMutability": "payable"
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
    "name": "savings",
    "inputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "isValid",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "tokenId",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "penaltyPercentage",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "maturityTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isSafeMode",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "stableCoin",
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
    "name": "withdrawSaving",
    "inputs": [
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "payable"
  }
];

// Utility function to read group data
export async function readGroupData(groupId: number) {
  try {
    // Read group data directly from the contract
    const result = await publicClient.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "getGroup",
      args: [BigInt(groupId)],
    });

    // Parse the result
    const [
      creator,
      members,
      contributionAmount,
      contributionPeriod,
      currentRound,
      lastPayoutTime,
      contributionsThisRound,
      pot,
    ] = result as any[];

    return {
      creator,
      members,
      contributionAmount,
      contributionPeriod: Number(contributionPeriod),
      currentRound: Number(currentRound),
      lastPayoutTime: Number(lastPayoutTime),
      contributionsThisRound: Number(contributionsThisRound),
      pot,
    };
  } catch (error) {
    console.error(`Error reading group ${groupId}:`, error);
    // Return null if the group doesn't exist or there's an error
    return null;
  }
}

// Utility function to read PiggySavfe data
export async function readPiggySavfeData() {
  try {
    // Read some example data from the PiggySavfe contract
    const joinLimitFee = await publicClient.readContract({
      address: SAVFE_ADDRESS,
      abi: SAVFE_ABI,
      functionName: "JoinLimitFee",
    });

    const savingFee = await publicClient.readContract({
      address: SAVFE_ADDRESS,
      abi: SAVFE_ABI,
      functionName: "SavingFee",
    });

    const fountain = await publicClient.readContract({
      address: SAVFE_ADDRESS,
      abi: SAVFE_ABI,
      functionName: "fountain",
    });

    return {
      joinLimitFee,
      savingFee,
      fountain,
    };
  } catch (error) {
    console.error("Error reading Savfe data:", error);
    return null;
  }
}

// Group Management
export async function createGroup(contributionAmount: bigint, contributionPeriod: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createGroup',
      args: [contributionAmount, contributionPeriod],
    });
    return request;
  } catch (error) {
    console.error("Error creating group:", error);
    return null;
  }
}

export async function joinGroup(groupId: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'joinGroup',
      args: [groupId],
    });
    return request;
  } catch (error) {
    console.error("Error joining group:", error);
    return null;
  }
}

export async function contribute(groupId: bigint, amount: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'contribute',
      args: [groupId],
      value: amount,
    });
    return request;
  } catch (error) {
    console.error("Error contributing to group:", error);
    return null;
  }
}

export async function withdrawEarnings(to: `0x${string}`) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'withdrawEarnings',
      args: [to],
    });
    return request;
  } catch (error) {
    console.error("Error withdrawing earnings:", error);
    return null;
  }
}

export async function getGroupStatus(groupId: bigint) {
  try {
    const result = await publicClient.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "getGroupStatus",
      args: [groupId],
    });
    return result;
  } catch (error) {
    console.error("Error getting group status:", error);
    return null;
  }
}

export async function triggerAutomaticPayout(groupId: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'triggerAutomaticPayout',
      args: [groupId],
    });
    return request;
  } catch (error) {
    console.error("Error triggering automatic payout:", error);
    return null;
  }
}

// Social & Gamification
export async function sendMessage(groupId: bigint, message: string) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'sendMessage',
      args: [groupId, message],
    });
    return request;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

export async function getGroupMessages(groupId: bigint) {
  try {
    const result = await publicClient.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "getGroupMessages",
      args: [groupId],
    });
    return result;
  } catch (error) {
    console.error("Error getting group messages:", error);
    return null;
  }
}

export async function getRecentGroupMessages(groupId: bigint, limit: bigint) {
  try {
    const result = await publicClient.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "getRecentGroupMessages",
      args: [groupId, limit],
    });
    return result;
  } catch (error) {
    console.error("Error getting recent group messages:", error);
    return null;
  }
}

export async function createChallenge(name: string, targetAmount: bigint, duration: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createChallenge',
      args: [name, targetAmount, duration],
    });
    return request;
  } catch (error) {
    console.error("Error creating challenge:", error);
    return null;
  }
}

export async function joinChallenge(challengeId: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'joinChallenge',
      args: [challengeId],
    });
    return request;
  } catch (error) {
    console.error("Error joining challenge:", error);
    return null;
  }
}

export async function contributeToChallenge(challengeId: bigint, amount: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'contributeToChallenge',
      args: [challengeId],
      value: amount,
    });
    return request;
  } catch (error) {
    console.error("Error contributing to challenge:", error);
    return null;
  }
}

export async function completeChallenge(challengeId: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'completeChallenge',
      args: [challengeId],
    });
    return request;
  } catch (error) {
    console.error("Error completing challenge:", error);
    return null;
  }
}

export async function getChallenge(challengeId: bigint) {
  try {
    const result = await publicClient.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "getChallenge",
      args: [challengeId],
    });
    return result;
  } catch (error) {
    console.error("Error getting challenge:", error);
    return null;
  }
}

// NFT Badges
export async function mintBadge(to: `0x${string}`, name: string, description: string, imageURI: string) {
  try {
    const { request } = await publicClient.simulateContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'mintBadge',
      args: [to, name, description, imageURI],
    });
    return request;
  } catch (error) {
    console.error("Error minting badge:", error);
    return null;
  }
}

export async function mintTypedBadge(to: `0x${string}`, name: string, description: string, imageURI: string, badgeType: string) {
  try {
    const { request } = await publicClient.simulateContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'mintTypedBadge',
      args: [to, name, description, imageURI, badgeType],
    });
    return request;
  } catch (error) {
    console.error("Error minting typed badge:", error);
    return null;
  }
}

export async function stakeBadge(tokenId: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'stakeBadge',
      args: [tokenId],
    });
    return request;
  } catch (error) {
    console.error("Error staking badge:", error);
    return null;
  }
}

export async function unstakeBadge(tokenId: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'unstakeBadge',
      args: [tokenId],
    });
    return request;
  } catch (error) {
    console.error("Error unstaking badge:", error);
    return null;
  }
}

export async function claimBadgeRewards(tokenId: bigint) {
  try {
    const { request } = await publicClient.simulateContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'claimBadgeRewards',
      args: [tokenId],
    });
    return request;
  } catch (error) {
    console.error("Error claiming badge rewards:", error);
    return null;
  }
}

export async function getBadgeDetails(tokenId: bigint) {
  try {
    const result = await publicClient.readContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: "getBadgeDetails",
      args: [tokenId],
    });
    return result;
  } catch (error) {
    console.error("Error getting badge details:", error);
    return null;
  }
}

export async function getUserBadges(user: `0x${string}`) {
  try {
    const result = await publicClient.readContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: "getUserBadges",
      args: [user],
    });
    return result;
  } catch (error) {
    console.error("Error getting user badges:", error);
    return null;
  }
}