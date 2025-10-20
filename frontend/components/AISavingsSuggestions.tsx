"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Lightbulb, TrendingUp, Target, PiggyBank, ChevronDown, ChevronUp, Clock, Zap, CheckCircle, Star, Filter, SortAsc } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: "budget" | "investment" | "goal" | "habit";
  impact: "high" | "medium" | "low";
  actionable: boolean;
  estimatedTime: string;
  difficulty: "easy" | "medium" | "hard";
  potentialSavings: string;
  reasoning: string;
  quickAction?: {
    label: string;
    action: () => void;
  };
}

const mockSuggestions: Suggestion[] = [
  {
    id: "1",
    title: "Optimize Daily Coffee Budget",
    description: "Switching to home-brewed coffee could save you $150/month. Consider a reusable thermos for convenience.",
    category: "budget",
    impact: "medium",
    actionable: true,
    estimatedTime: "2 weeks",
    difficulty: "easy",
    potentialSavings: "$150/month",
    reasoning: "Based on average coffee spending of $5/day, home brewing costs ~$1/day. This represents 30% of your daily discretionary spending.",
  },
  {
    id: "2",
    title: "Emergency Fund Target",
    description: "Based on your income, aim for 6 months of expenses ($12,000) in your emergency fund. You're currently at 40%.",
    category: "goal",
    impact: "high",
    actionable: true,
    estimatedTime: "6 months",
    difficulty: "medium",
    potentialSavings: "$7,200",
    reasoning: "Financial experts recommend 3-6 months of expenses for emergency funds. Your current $4,800 covers only 2 months.",
  },
  {
    id: "3",
    title: "Subscription Audit",
    description: "You have 8 active subscriptions totaling $89/month. Review and cancel unused services to save $45/month.",
    category: "budget",
    impact: "medium",
    actionable: true,
    estimatedTime: "1 day",
    difficulty: "easy",
    potentialSavings: "$45/month",
    reasoning: "Analysis of your subscription data shows 50% of services are underutilized. Canceling unused subscriptions could save $540 annually.",
  },
  {
    id: "4",
    title: "High-Yield Savings Account",
    description: "Move your emergency fund to a high-yield savings account earning 4.5% APY instead of 0.5% at your current bank.",
    category: "investment",
    impact: "high",
    actionable: true,
    estimatedTime: "1 week",
    difficulty: "easy",
    potentialSavings: "$216/year",
    reasoning: "Current account earns 0.5% APY on $4,800 balance. High-yield accounts offer 4.5% APY, increasing earnings by $216 annually.",
  },
  {
    id: "5",
    title: "Meal Planning Habit",
    description: "Planning meals weekly could reduce food waste by 30% and save $80/month on groceries.",
    category: "habit",
    impact: "medium",
    actionable: true,
    estimatedTime: "1 month",
    difficulty: "medium",
    potentialSavings: "$80/month",
    reasoning: "Food waste analysis shows 25% of groceries are discarded. Meal planning reduces impulse purchases and waste by 30%.",
  },
];

export default function AISavingsSuggestions() {
  const [suggestions] = useState<Suggestion[]>(mockSuggestions);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("impact");
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());
  const [showNotification, setShowNotification] = useState(false);
  const [newSuggestionsCount, setNewSuggestionsCount] = useState(0);

  // Filter and sort suggestions
  const filteredAndSortedSuggestions = suggestions
    .filter(suggestion => {
      if (filterCategory !== "all" && suggestion.category !== filterCategory) return false;
      if (filterImpact !== "all" && suggestion.impact !== filterImpact) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "impact") {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      }
      if (sortBy === "category") {
        return a.category.localeCompare(b.category);
      }
      if (sortBy === "potential") {
        // Simple sorting by potential savings (this would need more sophisticated parsing in real implementation)
        return b.potentialSavings.localeCompare(a.potentialSavings);
      }
      return 0;
    });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "budget":
        return <PiggyBank className="h-4 w-4" />;
      case "investment":
        return <TrendingUp className="h-4 w-4" />;
      case "goal":
        return <Target className="h-4 w-4" />;
      case "habit":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleApplySuggestion = (suggestionId: string) => {
    setAppliedSuggestions(prev => new Set(prev).add(suggestionId));
  };

  const toggleExpanded = (suggestionId: string) => {
    setExpandedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
      }
      return newSet;
    });
  };

  const handleQuickAction = (suggestion: Suggestion) => {
    // Placeholder for quick actions - would integrate with actual features
    console.log(`Quick action for suggestion: ${suggestion.title}`);
    // For now, just mark as applied
    handleApplySuggestion(suggestion.id);
  };

  const handleExportSuggestions = () => {
    const applied = suggestions.filter(s => appliedSuggestions.has(s.id));
    const exportData = {
      appliedSuggestions: applied,
      totalPotentialSavings: applied.reduce((sum, s) => sum + parseFloat(s.potentialSavings.replace(/[^0-9.]/g, '')), 0),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'savings-suggestions-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareSuggestions = () => {
    const applied = suggestions.filter(s => appliedSuggestions.has(s.id));
    const shareText = `I've implemented ${applied.length} AI savings suggestions and could save $${applied.reduce((sum, s) => sum + parseFloat(s.potentialSavings.replace(/[^0-9.]/g, '')), 0)} annually! Check out SavFe for personalized savings recommendations.`;

    if (navigator.share) {
      navigator.share({
        title: 'My Savings Success with SavFe',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // Show toast notification
      console.log('Copied to clipboard!');
    }
  };

  // Simulate new suggestions notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setNewSuggestionsCount(2);
      setShowNotification(true);
    }, 3000); // Show notification after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {showNotification && newSuggestionsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                {newSuggestionsCount} new personalized suggestions available!
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNotification(false)}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowNotification(false);
                  setNewSuggestionsCount(0);
                }}
              >
                View Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Savings Suggestions</h2>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="goal">Goal</SelectItem>
              <SelectItem value="habit">Habit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterImpact} onValueChange={setFilterImpact}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impact</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="impact">Impact</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="potential">Potential</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Export/Share Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExportSuggestions}>
          📥 Export Applied
        </Button>
        <Button variant="outline" size="sm" onClick={handleShareSuggestions}>
          📤 Share Success
        </Button>
      </div>

      <AnimatePresence>
        <motion.div
          className="grid gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {filteredAndSortedSuggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="gradient-card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(suggestion.category)}
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(suggestion.impact)}>
                        {suggestion.impact} impact
                      </Badge>
                      <Badge className={getDifficultyColor(suggestion.difficulty)}>
                        {suggestion.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{suggestion.description}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{suggestion.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{suggestion.potentialSavings}</span>
                    </div>
                  </div>

                  {/* Progress bar for applied suggestions */}
                  {appliedSuggestions.has(suggestion.id) && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Implementation Progress</span>
                        <span className="text-sm text-muted-foreground">75%</span>
                      </div>
                      <Progress value={75} className="w-full h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {suggestion.actionable && !appliedSuggestions.has(suggestion.id) && (
                        <Button
                          onClick={() => handleApplySuggestion(suggestion.id)}
                          variant="outline"
                          size="sm"
                        >
                          Apply Suggestion
                        </Button>
                      )}
                      {appliedSuggestions.has(suggestion.id) && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Applied
                        </Badge>
                      )}
                      <Button
                        onClick={() => handleQuickAction(suggestion)}
                        variant="ghost"
                        size="sm"
                      >
                        Quick Action
                      </Button>
                    </div>

                    <Collapsible
                      open={expandedSuggestions.has(suggestion.id)}
                      onOpenChange={() => toggleExpanded(suggestion.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedSuggestions.has(suggestion.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="ml-1">Why this?</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Savings Potential Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Savings Potential</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your current spending patterns and goals, you could potentially save up to $450/month by implementing these suggestions.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div>
              <p className="text-2xl font-bold text-primary">$450</p>
              <p className="text-sm text-muted-foreground">Monthly Savings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">$5,400</p>
              <p className="text-sm text-muted-foreground">Yearly Savings</p>
            </div>
          </div>

          {/* Implementation Progress */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Implementation Progress</span>
              <span className="text-sm text-muted-foreground">
                {appliedSuggestions.size} of {suggestions.length} applied
              </span>
            </div>
            <Progress
              value={(appliedSuggestions.size / suggestions.length) * 100}
              className="w-full h-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Keep implementing suggestions to maximize your savings potential!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Help Us Improve</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            How accurate and helpful are these suggestions? Your feedback helps us provide better recommendations.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-1" />
              Very Helpful
            </Button>
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-1" />
              Somewhat Helpful
            </Button>
            <Button variant="outline" size="sm">
              <Star className="h-4 w-4 mr-1" />
              Not Helpful
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
