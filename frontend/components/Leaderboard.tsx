"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Shield, Star } from 'lucide-react';

// Mock data for the leaderboard
const mockLeaderboardData = [
  { rank: 1, user: '0xAbC...123', points: 12500, avatar: '/avatars/01.png', tier: 'Diamond' },
  { rank: 2, user: '0xDeF...456', points: 11800, avatar: '/avatars/02.png', tier: 'Diamond' },
  { rank: 3, user: '0xGHi...789', points: 11200, avatar: '/avatars/03.png', tier: 'Gold' },
  { rank: 4, user: '0xJkL...012', points: 10500, avatar: '/avatars/04.png', tier: 'Gold' },
  { rank: 5, user: '0xMnP...345', points: 9800, avatar: '/avatars/05.png', tier: 'Silver' },
  { rank: 6, user: '0xQrS...678', points: 9200, avatar: '/avatars/06.png', tier: 'Silver' },
  { rank: 7, user: '0xTuV...901', points: 8500, avatar: '/avatars/07.png', tier: 'Bronze' },
  { rank: 8, user: '0xWxy...234', points: 7800, avatar: '/avatars/08.png', tier: 'Bronze' },
  { rank: 9, user: '0xZaB...567', points: 7200, avatar: '/avatars/09.png', tier: 'Bronze' },
  { rank: 10, user: '0xCdE...890', points: 6500, avatar: '/avatars/10.png', tier: 'Bronze' },
];

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'Diamond':
      return <Crown className="h-5 w-5 text-blue-400" />;
    case 'Gold':
      return <Shield className="h-5 w-5 text-yellow-500" />;
    case 'Silver':
      return <Star className="h-5 w-5 text-gray-400" />;
    default:
      return null;
  }
};

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState(mockLeaderboardData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((entry) => (
              <TableRow key={entry.rank}>
                <TableCell className="font-medium">{entry.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback>{entry.user.slice(2, 4)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span>{entry.user}</span>
                      {getTierIcon(entry.tier)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{entry.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
