"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Star,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Lock,
  CheckCircle,
  Clock,
  Zap,
  Crown,
  Medal,
  Flame,
  Gift,
  Share2,
  Filter,
  Search,
  BarChart3,
  User,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

const ACHIEVEMENTS: Achievement[] = [
  // Savings Milestones
  {
    id: 'first_savings',
    title: 'First Steps',
    description: 'Create your first savings goal',
    category: 'savings',
    rarity: 'common',
    icon: '🎯',
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
    icon: '📅',
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
    icon: '🏆',
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
    icon: '💎',
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
    icon: '🐋',
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
    icon: '👥',
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
    icon: '👑',
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
    icon: '🎖️',
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
    icon: '⚡',
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
    icon: '🔥',
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
    icon: '🚀',
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
    icon: '🌟',
    points: 750,
    requirements: [
      { type: 'streak_days', value: 31, description: '31 consecutive days' }
    ],
    rewards: { points: 750, nft: true, title: 'Savings Legend' }
  }
];

// User progress interface
interface UserProgress {
  unlockedAchievements: string[];
  achievementProgress: Record<string, { current: number; max: number; lastUpdated: Date }>;
  totalPoints: number;
  level: number;
  streakDays: number;
  lastActivity: Date;
}

export default function AchievementsSystem() {
  const { address } = useAccount();
  const [userProgress, setUserProgress] = useState<UserProgress>({
    unlockedAchievements: [],
    achievementProgress: {},
    totalPoints: 0,
    level: 1,
    streakDays: 0,
    lastActivity: new Date()
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);

  // Load user progress from localStorage and contract
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`savfe_achievements_${address}`);
      if (stored) {
        setUserProgress(JSON.parse(stored));
      }
    }
  }, [address]);

  // Save progress to localStorage
  useEffect(() => {
    if (address) {
      localStorage.setItem(`savfe_achievements_${address}`, JSON.stringify(userProgress));
    }
  }, [userProgress, address]);

  // Calculate achievement progress (this would be enhanced with real contract data)
  const calculateProgress = (achievement: Achievement): { current: number; max: number } => {
    // Mock progress calculation - in real implementation, this would query contracts
    const progress = userProgress.achievementProgress[achievement.id];
    if (progress) return progress;

    // Default mock values based on achievement type
    switch (achievement.requirements[0].type) {
      case 'savings_created':
        return { current: Math.floor(Math.random() * achievement.requirements[0].value), max: achievement.requirements[0].value };
      case 'total_saved':
        return { current: Math.floor(Math.random() * achievement.requirements[0].value * 0.8), max: achievement.requirements[0].value };
      case 'streak_days':
        return { current: Math.floor(Math.random() * achievement.requirements[0].value * 0.6), max: achievement.requirements[0].value };
      default:
        return { current: 0, max: achievement.requirements[0].value };
    }
  };

  // Filter achievements
  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    const matchesSearch = achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnlocked = !showUnlockedOnly || userProgress.unlockedAchievements.includes(achievement.id);

    return matchesCategory && matchesRarity && matchesSearch && matchesUnlocked;
  });

  // Get achievement stats
  const stats = {
    total: ACHIEVEMENTS.length,
    unlocked: userProgress.unlockedAchievements.length,
    completionRate: Math.round((userProgress.unlockedAchievements.length / ACHIEVEMENTS.length) * 100),
    totalPoints: userProgress.totalPoints,
    currentLevel: userProgress.level,
    pointsToNextLevel: (userProgress.level * 500) - (userProgress.totalPoints % (userProgress.level * 500))
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return <Target className="h-4 w-4" />;
      case 'groups': return <Users className="h-4 w-4" />;
      case 'challenges': return <Zap className="h-4 w-4" />;
      case 'consistency': return <Calendar className="h-4 w-4" />;
      case 'special': return <Crown className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const handleShareAchievement = (achievement: Achievement) => {
    const shareText = `🏆 I just unlocked the "${achievement.title}" achievement on SavFe! ${achievement.description}`;
    if (navigator.share) {
      navigator.share({
        title: 'Achievement Unlocked!',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Achievement shared to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Achievements</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your savings journey and unlock rewards
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Level {stats.currentLevel}</div>
            <div className="text-xs text-muted-foreground">{stats.pointsToNextLevel} pts to next</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalPoints}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="gradient-card-hover">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.unlocked}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
              <div className="text-xs text-muted-foreground">of {stats.total} achievements</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
              <Progress value={stats.completionRate} className="w-full h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{userProgress.streakDays}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Keep it up!</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {ACHIEVEMENTS.filter(a => a.rarity === 'legendary' && userProgress.unlockedAchievements.includes(a.id)).length}
              </div>
              <div className="text-sm text-muted-foreground">Legendary</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="groups">Groups</SelectItem>
                <SelectItem value="challenges">Challenges</SelectItem>
                <SelectItem value="consistency">Consistency</SelectItem>
                <SelectItem value="special">Special</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarity</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showUnlockedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            >
              {showUnlockedOnly ? 'Show All' : 'Unlocked Only'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Savings
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="consistency" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Consistency
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Special
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredAchievements.map((achievement) => {
                const isUnlocked = userProgress.unlockedAchievements.includes(achievement.id);
                const progress = calculateProgress(achievement);
                const progressPercent = (progress.current / progress.max) * 100;

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                      isUnlocked ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-primary/10' : ''
                    }`}>
                      {isUnlocked && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{achievement.icon}</div>
                            <div>
                              <CardTitle className="text-lg">{achievement.title}</CardTitle>
                              <CardDescription className="text-sm">
                                {achievement.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(achievement.category)}
                            {achievement.category}
                          </Badge>
                          <Badge variant="secondary">
                            {achievement.points} pts
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {!isUnlocked && (
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-muted-foreground">
                                  {progress.current}/{progress.max}
                                </span>
                              </div>
                              <Progress value={progressPercent} className="w-full h-2" />
                            </div>

                            <div className="space-y-2">
                              {achievement.requirements.map((req, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{req.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {isUnlocked && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Unlocked!</span>
                            </div>

                            {achievement.rewards && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium">Rewards:</div>
                                <div className="flex flex-wrap gap-1">
                                  {achievement.rewards.points && (
                                    <Badge variant="secondary">
                                      <Coins className="h-3 w-3 mr-1" />
                                      {achievement.rewards.points} pts
                                    </Badge>
                                  )}
                                  {achievement.rewards.nft && (
                                    <Badge variant="secondary">
                                      <Gift className="h-3 w-3 mr-1" />
                                      NFT
                                    </Badge>
                                  )}
                                  {achievement.rewards.title && (
                                    <Badge variant="secondary">
                                      <Crown className="h-3 w-3 mr-1" />
                                      {achievement.rewards.title}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShareAchievement(achievement)}
                              className="w-full"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Achievement
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredAchievements.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No achievements found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Try adjusting your filters or search query to find more achievements.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Achievement Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Achievement Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries({
              common: ACHIEVEMENTS.filter(a => a.rarity === 'common').length,
              rare: ACHIEVEMENTS.filter(a => a.rarity === 'rare').length,
              epic: ACHIEVEMENTS.filter(a => a.rarity === 'epic').length,
              legendary: ACHIEVEMENTS.filter(a => a.rarity === 'legendary').length,
            }).map(([rarity, total]) => {
              const unlocked = ACHIEVEMENTS.filter(a =>
                a.rarity === rarity && userProgress.unlockedAchievements.includes(a.id)
              ).length;

              return (
                <div key={rarity} className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getRarityColor(rarity)} px-2 py-1 rounded`}>
                    {unlocked}/{total}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">{rarity}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
