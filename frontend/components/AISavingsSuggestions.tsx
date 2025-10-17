"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, Target, PiggyBank } from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: "budget" | "investment" | "goal" | "habit";
  impact: "high" | "medium" | "low";
  actionable: boolean;
}

const mockSuggestions: Suggestion[] = [
  {
    id: "1",
    title: "Optimize Daily Coffee Budget",
    description: "Switching to home-brewed coffee could save you $150/month. Consider a reusable thermos for convenience.",
    category: "budget",
    impact: "medium",
    actionable: true,
  },
  {
    id: "2",
    title: "Emergency Fund Target",
    description: "Based on your income, aim for 6 months of expenses ($12,000) in your emergency fund. You're currently at 40%.",
    category: "goal",
    impact: "high",
    actionable: true,
  },
  {
    id: "3",
    title: "Subscription Audit",
    description: "You have 8 active subscriptions totaling $89/month. Review and cancel unused services to save $45/month.",
    category: "budget",
    impact: "medium",
    actionable: true,
  },
  {
    id: "4",
    title: "High-Yield Savings Account",
    description: "Move your emergency fund to a high-yield savings account earning 4.5% APY instead of 0.5% at your current bank.",
    category: "investment",
    impact: "high",
    actionable: true,
  },
  {
    id: "5",
    title: "Meal Planning Habit",
    description: "Planning meals weekly could reduce food waste by 30% and save $80/month on groceries.",
    category: "habit",
    impact: "medium",
    actionable: true,
  },
];

export default function AISavingsSuggestions() {
  const [suggestions] = useState<Suggestion[]>(mockSuggestions);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

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

  const handleApplySuggestion = (suggestionId: string) => {
    setAppliedSuggestions(prev => new Set(prev).add(suggestionId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">AI Savings Suggestions</h2>
      </div>

      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="gradient-card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(suggestion.category)}
                  <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                </div>
                <Badge className={getImpactColor(suggestion.impact)}>
                  {suggestion.impact} impact
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{suggestion.description}</p>
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
                  Applied ✓
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Savings Potential</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your current spending patterns and goals, you could potentially save up to $450/month by implementing these suggestions.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">$450</p>
              <p className="text-sm text-muted-foreground">Monthly Savings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">$5,400</p>
              <p className="text-sm text-muted-foreground">Yearly Savings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
