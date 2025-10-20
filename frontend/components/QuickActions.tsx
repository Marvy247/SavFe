'use client';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onCreateSaving?: () => void;
  onEmergencyWithdraw?: () => void;
  onIncrementSaving?: () => void;
}

export default function QuickActions({
  onCreateSaving,
  onEmergencyWithdraw,
  onIncrementSaving
}: QuickActionsProps) {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !address) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-2 min-w-[200px]">
            <h3 className="text-sm font-semibold text-center mb-2">Quick Actions</h3>

            <Button
              size="sm"
              onClick={onCreateSaving}
              className="w-full justify-start"
            >
              💰 Create Saving
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onIncrementSaving}
              className="w-full justify-start"
            >
              📈 Add to Saving
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={onEmergencyWithdraw}
              className="w-full justify-start"
            >
              🚨 Emergency
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
