import { publicClient, SAVFE_ADDRESS, FACTORY_ADDRESS, SAVFE_ABI, FACTORY_ABI } from './contract';

// Achievement types and definitions
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'savings' | 'groups' | 'challenges' | 'consistency' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  points: number;
  requirements: {
    type: 'savings_created' | 'total_saved' | 'groups_joined' | 'challenges_completed' | 'streak_days' | 'time_based' | 'special';
    value: number;
    description: string;
  }[];
  rewards?: {
    nft?: boolean;
    points?: number;
    title?: string;
  };
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Savings Milestones
  {
    id: 'first_savings',
    title: 'First Steps',
    description: 'Create your first savings goal',
    category: 'savings',
    rarity: 'common',
    icon: 'Target',
    points: 50,
    requirements: [
      { type: 'savings_created', value: 1, description: 'Create 1 savings goal' }
    ],
    rewards: { points: 50 }
  },
  {
    id: 'savings_streak_7',
    title: 'Week Warrior',
    description: 'Save consistently for 7 days',
    category: 'consistency',
    rarity: 'common',
    icon: 'CalendarDays',
    points: 100,
    requirements: [
      { type: 'streak_days', value: 7, description: '7 consecutive days of saving' }
    ],
    rewards: { points: 100 }
  },
  {
    id: 'savings_streak_30',
    title: 'Month Master',
    description: 'Maintain a 30-day savings streak',
    category: 'consistency',
    rarity: 'rare',
    icon: 'Trophy',
    points: 300,
    requirements: [
      { type: 'streak_days', value: 30, description: '30 consecutive days of saving' }
    ],
    rewards: { points: 300, nft: true }
  },
  {
    id: 'total_saved_1eth',
    title: 'ETH Enthusiast',
    description: 'Save a total of 1 ETH',
    category: 'savings',
    rarity: 'rare',
    icon: 'Gem',
    points: 250,
    requirements: [
      { type: 'total_saved', value: 1, description: 'Save 1 ETH total' }
    ],
    rewards: { points: 250, nft: true }
  },
  {
    id: 'total_saved_10eth',
    title: 'Crypto Whale',
    description: 'Accumulate 10 ETH in savings',
    category: 'savings',
    rarity: 'epic',
    icon: 'Fish',
    points: 500,
    requirements: [
      { type: 'total_saved', value: 10, description: 'Save 10 ETH total' }
    ],
    rewards: { points: 500, nft: true, title: 'Crypto Whale' }
  },

  // Group Achievements
  {
    id: 'first_group_join',
    title: 'Social Saver',
    description: 'Join your first savings group',
    category: 'groups',
    rarity: 'common',
    icon: 'Users',
    points: 75,
    requirements: [
      { type: 'groups_joined', value: 1, description: 'Join 1 savings group' }
    ],
    rewards: { points: 75 }
  },
  {
    id: 'group_leader',
    title: 'Group Leader',
    description: 'Create and lead a savings group',
    category: 'groups',
    rarity: 'rare',
    icon: 'Crown',
    points: 200,
    requirements: [
      { type: 'special', value: 1, description: 'Create a savings group' }
    ],
    rewards: { points: 200, nft: true }
  },
  {
    id: 'group_veteran',
    title: 'Group Veteran',
    description: 'Complete 5 group savings cycles',
    category: 'groups',
    rarity: 'epic',
    icon: 'Medal',
    points: 400,
    requirements: [
      { type: 'special', value: 5, description: 'Complete 5 group cycles' }
    ],
    rewards: { points: 400, nft: true }
  },

  // Challenge Achievements
  {
    id: 'first_challenge',
    title: 'Challenge Accepted',
    description: 'Complete your first savings challenge',
    category: 'challenges',
    rarity: 'common',
    icon: 'Zap',
    points: 100,
    requirements: [
      { type: 'challenges_completed', value: 1, description: 'Complete 1 challenge' }
    ],
    rewards: { points: 100 }
  },
  {
    id: 'challenge_master',
    title: 'Challenge Master',
    description: 'Complete 10 savings challenges',
    category: 'challenges',
    rarity: 'rare',
    icon: 'Flame',
    points: 300,
    requirements: [
      { type: 'challenges_completed', value: 10, description: 'Complete 10 challenges' }
    ],
    rewards: { points: 300, nft: true }
  },

  // Special Achievements
  {
    id: 'early_adopter',
    title: 'Early Adopter',
    description: 'Join SavFe during the beta period',
    category: 'special',
    rarity: 'legendary',
    icon: 'Rocket',
    points: 1000,
    requirements: [
      { type: 'time_based', value: 1, description: 'Beta participant' }
    ],
    rewards: { points: 1000, nft: true, title: 'Beta Pioneer' }
  },
  {
    id: 'perfect_month',
    title: 'Perfect Month',
    description: 'Save every single day for a month',
    category: 'consistency',
    rarity: 'legendary',
    icon: 'Star',
    points: 750,
    requirements: [
      { type: 'streak_days', value: 31, description: '31 consecutive days' }
    ],
    rewards: { points: 750, nft: true, title: 'Savings Legend' }
  }
];

// User progress interface
export interface UserProgress {
  unlockedAchievements: string[];
  claimedRewards: string[];
  achievementProgress: Record<string, { current: number; max: number; lastUpdated: Date }>;
  totalPoints: number;
  level: number;
  streakDays: number;
  lastActivity: Date;
}

// Calculate achievement progress (mock)
export const calculateProgress = (achievement: Achievement, userProgress: UserProgress): { current: number; max: number } => {
  const progress = userProgress.achievementProgress[achievement.id];
  if (progress) return progress;
  switch (achievement.requirements[0].type) {
    case 'savings_created': return { current: Math.min(1, achievement.requirements[0].value), max: achievement.requirements[0].value };
    case 'total_saved': return { current: 0, max: achievement.requirements[0].value };
    case 'streak_days': return { current: 0, max: achievement.requirements[0].value };
    default: return { current: 0, max: achievement.requirements[0].value };
  }
};

export async function getUserGroupJoins(user: `0x${string}`) {
  try {
    const result = await publicClient.readContract({
      address: SAVFE_ADDRESS,
      abi: SAVFE_ABI,
      functionName: "userGroupJoins",
      args: [user],
    });
    return Number(result);
  } catch (error) {
    console.error("Error getting user group joins:", error);
    return 0;
  }
}

export async function getTotalUsers() {
  try {
    const result = await publicClient.readContract({
      address: SAVFE_ADDRESS,
      abi: SAVFE_ABI,
      functionName: "totalUsers",
    });
    return Number(result);
  } catch (error) {
    console.error("Error getting total users:", error);
    return 0;
  }
}

export async function getChallengeCounter() {
  try {
    const result = await publicClient.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "challengeCounter",
    });
    return Number(result);
  } catch (error) {
    console.error("Error getting challenge counter:", error);
    return 0;
  }
}

export async function getGroupCounter() {
  try {
    const result = await publicClient.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "groupCounter",
    });
    return Number(result);
  } catch (error) {
    console.error("Error getting group counter:", error);
    return 0;
  }
}

// Function to get user savings data (this would need to be implemented in the contract)
export async function getUserSavingsData(user: `0x${string}`) {
  try {
    // This is a placeholder - would need contract function to aggregate user savings
    // For now, return mock data structure
    return {
      totalSavingsCreated: 0, // Would need contract function
      totalAmountSaved: 0, // Would need contract function
      currentStreak: 0, // Would need contract function
      longestStreak: 0, // Would need contract function
    };
  } catch (error) {
    console.error("Error getting user savings data:", error);
    return {
      totalSavingsCreated: 0,
      totalAmountSaved: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }
}
