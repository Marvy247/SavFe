"use client";

import React, { useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  hash: `0x${string}`;
  description: string;
  timestamp: number;
}

interface TransactionStatusTrackerProps {
  hash?: `0x${string}`;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function TransactionStatusTracker({
  hash,
  description = "Transaction",
  onSuccess,
  onError,
}: TransactionStatusTrackerProps) {
  const { data, isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (hash && isLoading) {
      toast.loading(`${description} pending...`, {
        id: hash,
        description: "Waiting for blockchain confirmation",
      });
    }

    if (isSuccess) {
      toast.success(`${description} successful!`, {
        id: hash,
        description: "Transaction confirmed on blockchain",
        action: {
          label: "View",
          onClick: () =>
            window.open(`https://explorer.celo.org/alfajores/tx/${hash}`, "_blank"),
        },
      });
      onSuccess?.();
    }

    if (isError) {
      toast.error(`${description} failed`, {
        id: hash,
        description: error?.message || "Transaction was rejected",
      });
      onError?.(error as Error);
    }
  }, [hash, isLoading, isSuccess, isError, description, error, onSuccess, onError]);

  return null;
}

// Global transaction tracker for multiple transactions
export function GlobalTransactionTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const addTransaction = (hash: `0x${string}`, description: string) => {
    setTransactions((prev) => [
      ...prev,
      { hash, description, timestamp: Date.now() },
    ]);
  };

  const removeTransaction = (hash: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.hash !== hash));
  };

  const pendingTransactions = transactions.slice(0, 3); // Show max 3

  if (transactions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-50 max-w-md"
      >
        <Card className="border-2 border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <h3 className="font-semibold">
                  {transactions.length} Active Transaction{transactions.length > 1 ? "s" : ""}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? "+" : "−"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setTransactions([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <div className="space-y-2">
                {pendingTransactions.map((tx) => (
                  <TransactionItem
                    key={tx.hash}
                    transaction={tx}
                    onRemove={removeTransaction}
                  />
                ))}
                {transactions.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{transactions.length - 3} more transaction{transactions.length - 3 > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

function TransactionItem({
  transaction,
  onRemove,
}: {
  transaction: Transaction;
  onRemove: (hash: string) => void;
}) {
  const { data, isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: transaction.hash,
  });

  const getStatusIcon = () => {
    if (isSuccess) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (isError) return <XCircle className="h-4 w-4 text-destructive" />;
    return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
  };

  const getStatusText = () => {
    if (isSuccess) return "Confirmed";
    if (isError) return "Failed";
    return "Pending";
  };

  useEffect(() => {
    if (isSuccess || isError) {
      const timer = setTimeout(() => {
        onRemove(transaction.hash);
      }, 5000); // Auto-remove after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isSuccess, isError, transaction.hash, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
    >
      <div className="flex items-center gap-3 flex-1">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">
            {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
          </p>
        </div>
        <Badge variant={isSuccess ? "default" : isError ? "destructive" : "secondary"}>
          {getStatusText()}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 ml-2"
        onClick={() =>
          window.open(`https://explorer.celo.org/alfajores/tx/${transaction.hash}`, "_blank")
        }
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

// Hook to use the transaction tracker
export function useTransactionTracker() {
  return {
    trackTransaction: (hash: `0x${string}`, description: string) => {
      toast.loading(description, {
        id: hash,
        description: "Waiting for confirmation...",
      });
    },
  };
}
