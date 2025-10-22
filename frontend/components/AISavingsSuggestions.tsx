"use client";

import { useState } from "react";
import { useOnchainSuggestions } from "@/lib/useOnchainSuggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Lightbulb, TrendingUp, Target, PiggyBank, ChevronDown, ChevronUp, Clock, Filter, SortAsc, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Re-using the Suggestion type from the hook
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

export default function AISavingsSuggestions() {
  const { suggestions, isLoading } = useOnchainSuggestions();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("impact");
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());

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
      return 0;
    });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "budget": return <PiggyBank className="h-4 w-4" />;
      case "investment": return <TrendingUp className="h-4 w-4" />;
      case "goal": return <Target className="h-4 w-4" />;
      case "habit": return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
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
    if (suggestion.quickAction && suggestion.quickAction.action) {
        suggestion.quickAction.action();
    }
    console.log(`Quick action for suggestion: ${suggestion.title}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Savings Suggestions</h2>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="goal">Goal</SelectItem>
              <SelectItem value="habit">Habit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterImpact} onValueChange={setFilterImpact}>
            <SelectTrigger className="w-28"><SelectValue placeholder="Impact" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impact</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="impact">Impact</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-4 text-muted-foreground">Fetching onchain suggestions...</span>
        </div>
      ) : filteredAndSortedSuggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-muted/50 rounded-lg">
            <Info className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No Suggestions Right Now</h3>
            <p className="text-sm text-muted-foreground">Check back later for new personalized AI suggestions.</p>
        </div>
      ) : (
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
                        <Badge className={getImpactColor(suggestion.impact)}>{suggestion.impact} impact</Badge>
                        <Badge className={getDifficultyColor(suggestion.difficulty)}>{suggestion.difficulty}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{suggestion.description}</p>
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{suggestion.estimatedTime}</span></div>
                      <div className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /><span>{suggestion.potentialSavings}</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      {suggestion.quickAction ? (
                        <Button
                          onClick={() => handleQuickAction(suggestion)}
                          variant="outline"
                          size="sm"
                        >
                          {suggestion.quickAction.label}
                        </Button>
                      ) : <div />}
                      <Collapsible
                        open={expandedSuggestions.has(suggestion.id)}
                        onOpenChange={() => toggleExpanded(suggestion.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {expandedSuggestions.has(suggestion.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
      )}
    </div>
  );
}
