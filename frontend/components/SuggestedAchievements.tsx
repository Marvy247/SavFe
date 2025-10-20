"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

// This would be passed in as a prop in a real implementation
const mockSuggestedAchievements = [
  {
    id: 'savings_streak_7',
    title: 'Week Warrior',
    description: 'Save consistently for 7 days',
  },
  {
    id: 'first_group_join',
    title: 'Social Saver',
    description: 'Join your first savings group',
  },
  {
    id: 'first_challenge',
    title: 'Challenge Accepted',
    description: 'Complete your first savings challenge',
  },
];

export default function SuggestedAchievements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span>Next Achievements</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockSuggestedAchievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div>
              <h4 className="font-semibold">{achievement.title}</h4>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
