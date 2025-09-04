/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPublicClient, http } from "viem";
import { liskSepolia } from "wagmi/chains";

export const FACTORY_ADDRESS = "0x10b7AF494CC98c059952Bf8259dD80c3A936817a" as `0x${string}`;

export const SAVFE_ADDRESS = "0x6516023FfBf905f4c5530Cb7B1FB08d7Ed080579" as `0x${string}`;

// Create a public client for reading contract data
export const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http(),
});

export const FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "groupId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "member",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "ContributionMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "groupId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "contributionAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "contributionPeriod",
        type: "uint256",
      },
    ],
    name: "GroupCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "groupId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "member",
        type: "address",
      },
    ],
    name: "JoinedGroup",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "groupId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "round",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PayoutMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "member",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [],
    name: "contractEarnings",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_groupId", type: "uint256" }],
    name: "contribute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_contributionAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_contributionPeriod",
        type: "uint256",
      },
    ],
    name: "createGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_groupId", type: "uint256" }],
    name: "getGroup",
    outputs: [
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "address[]", name: "members", type: "address[]" },
      {
        internalType: "uint256",
        name: "contributionAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "contributionPeriod",
        type: "uint256",
      },
      { internalType: "uint256", name: "currentRound", type: "uint256" },
      { internalType: "uint256", name: "lastPayoutTime", type: "uint256" },
      {
        internalType: "uint256",
        name: "contributionsThisRound",
        type: "uint256",
      },
      { internalType: "uint256", name: "pot", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "groupCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_groupId", type: "uint256" }],
    name: "joinGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address payable", name: "_to", type: "address" }],
    name: "withdrawEarnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
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


export const CHILD_SAVFE_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_ownerAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_stableCoin",
          "type": "address"
        }
      ],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "nameOfSaving",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SavingCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "nameOfSaving",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountAdded",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalAmountNow",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SavingIncremented",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "nameOfSaving",
          "type": "string"
        }
      ],
      "name": "SavingWithdrawn",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "getSavingsNames",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string[]",
              "name": "savingsNames",
              "type": "string[]"
            }
          ],
          "internalType": "struct ChildSavfe.SavingsNamesObj",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "nameOfSaving",
          "type": "string"
        }
      ],
      "name": "getSaving",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bool",
              "name": "isValid",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "tokenId",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "startTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "penaltyPercentage",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maturityTime",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isSafeMode",
              "type": "bool"
            }
          ],
          "internalType": "struct ChildSavfe.SavingDataStruct",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
];

// Savfe contract ABI
export const SAVFE_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_stableCoin",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "nameOfSaving",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "tokenToSave",
        "type": "address"
      }
    ],
    "name": "SavingCreated",
    "type": "event"
  },
  {
    inputs: [],
    name: "JoinLimitFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SavingFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "childContractGasFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contractEarnings",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fountain",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserChildContractAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "nameOfSaving",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "maturityTime",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "penaltyPercentage",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "safeMode",
        type: "bool",
      },
      {
        internalType: "address",
        name: "tokenToSave",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "createSaving",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "nameOfSavings",
        type: "string",
      },
      {
        internalType: "address",
        name: "tokenToRetrieve",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "incrementSaving",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "nameOfSaving",
        type: "string",
      },
    ],
    name: "withdrawSaving",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "joinSavfe",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ownerAddress",
        type: "address",
      },
    ],
    name: "getUserChildContractAddressByAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dripFountain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newStableCoin",
        type: "address",
      },
    ],
    name: "editStableCoin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Utility function to read Savfe data
export async function readSavfeData() {
  try {
    // Read some example data from the Savfe contract
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
