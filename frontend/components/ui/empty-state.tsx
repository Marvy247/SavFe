import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode | LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        {Icon && (
          <div className="mb-6">
            {typeof Icon === 'function' ? (
              <Icon className="h-16 w-16 text-muted-foreground/50" />
            ) : (
              <div className="text-6xl">{Icon}</div>
            )}
          </div>
        )}
        <h3 className="text-2xl font-semibold mb-2 text-center">{title}</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          {action && (
            <Button onClick={action.onClick} size="lg">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="lg">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-built empty states for common scenarios
export function NoSavingsEmptyState({ onCreateSaving }: { onCreateSaving: () => void }) {
  return (
    <EmptyState
      icon="🎯"
      title="No savings goals yet"
      description="Start your savings journey today! Create your first savings goal and watch your wealth grow."
      action={{
        label: "Create Savings Goal",
        onClick: onCreateSaving,
      }}
      secondaryAction={{
        label: "Learn More",
        onClick: () => window.open("/landing", "_blank"),
      }}
    />
  );
}

export function NoGroupsEmptyState({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <EmptyState
      icon="👥"
      title="No groups joined"
      description="Join or create a rotating savings group to save together with friends and family."
      action={{
        label: "Create Group",
        onClick: onCreateGroup,
      }}
      secondaryAction={{
        label: "Explore Groups",
        onClick: () => {}, // Add explore functionality
      }}
    />
  );
}

export function NoTransactionsEmptyState() {
  return (
    <EmptyState
      icon="📊"
      title="No transactions yet"
      description="Your transaction history will appear here once you start saving or participating in groups."
    />
  );
}

export function NoAchievementsEmptyState({ onMintBadge }: { onMintBadge: () => void }) {
  return (
    <EmptyState
      icon="🏅"
      title="No badges yet"
      description="Start saving to unlock achievements and mint your first badge NFT!"
      action={{
        label: "Mint Your First Badge",
        onClick: onMintBadge,
      }}
    />
  );
}

export function NotConnectedEmptyState() {
  return (
    <EmptyState
      icon="🔌"
      title="Wallet not connected"
      description="Connect your wallet to start using PiggySavfe and access all features."
    />
  );
}
