'use client';
import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
// import { TransactionHistory as OnchainKitTransactionHistory } from '@coinbase/onchainkit/transaction-history';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SAVFE_ABI, SAVFE_ADDRESS, CHILD_SAVFE_ABI } from '@/lib/contract';
import { formatEther, decodeEventLog } from 'viem';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  token: string;
  timestamp: number;
  txHash: string;
  status: string;
  icon: string;
}

export default function TransactionHistory() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterToken, setFilterToken] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const transactionsPerPage = 3;

  // Use OnchainKit TransactionHistory when available
  const useOnchainKitHistory = false; // Toggle this when OnchainKit component becomes available

  useEffect(() => {
    if (address && publicClient) {
      fetchTransactionHistory();
    }
  }, [address, publicClient]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filterType, filterToken, searchTerm, currentPage]);

  const fetchTransactionHistory = async () => {
    if (!publicClient || !address) return;
    setIsLoading(true);
    try {
      // First, get the user's child contract address
      const childContractAddress = await publicClient.readContract({
        address: SAVFE_ADDRESS,
        abi: SAVFE_ABI,
        functionName: 'getUserChildContractAddressByAddress',
        args: [address],
      }) as `0x${string}`;

      if (childContractAddress === '0x0000000000000000000000000000000000000000') {
        // User hasn't joined Savfe yet
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      // Fetch multiple event types from the child contract
      const eventTypes = [
        {
          name: 'SavingCreated',
          inputs: [
            { indexed: false, internalType: 'string', name: 'nameOfSaving', type: 'string' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'tokenToSave', type: 'address' },
          ],
          type: 'Create Saving',
          icon: '💰'
        },
        {
          name: 'SavingIncremented',
          inputs: [
            { indexed: false, internalType: 'string', name: 'nameOfSaving', type: 'string' },
            { indexed: false, internalType: 'uint256', name: 'amountAdded', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'totalAmountNow', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'token', type: 'address' },
          ],
          type: 'Increment Saving',
          icon: '📈'
        },
        {
          name: 'SavingWithdrawn',
          inputs: [
            { indexed: false, internalType: 'string', name: 'nameOfSaving', type: 'string' },
          ],
          type: 'Withdraw Saving',
          icon: '💸'
        }
      ];

      const allTransactions: Transaction[] = [];

      for (const eventType of eventTypes) {
        try {
          const logs = await publicClient.getLogs({
            address: childContractAddress,
            event: {
              anonymous: false,
              inputs: eventType.inputs,
              name: eventType.name,
              type: 'event',
            },
            fromBlock: 'earliest',
            toBlock: 'latest',
          });

          for (const log of logs) {
            try {
              // Fetch block data to get timestamp
              const block = await publicClient.getBlock({ blockHash: log.blockHash });

              let amount = '0';
              let token = 'ETH';

              // Try to decode the event log using the ABI
              try {
                const decodedLog = decodeEventLog({
                  abi: CHILD_SAVFE_ABI,
                  data: log.data,
                  topics: log.topics,
                });

                if (decodedLog.eventName === 'SavingCreated') {
                  const { amount: eventAmount, tokenToSave } = decodedLog.args as any;
                  amount = eventAmount && typeof eventAmount === 'bigint' ? formatEther(eventAmount) : '0.0000';
                  token = tokenToSave === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'ETH';
                } else if (decodedLog.eventName === 'SavingIncremented') {
                  const { amountAdded } = decodedLog.args as any;
                  amount = amountAdded && typeof amountAdded === 'bigint' ? formatEther(amountAdded) : '0.0000';
                  token = 'ETH'; // Default to ETH for increments
                } else if (decodedLog.eventName === 'SavingWithdrawn') {
                  // SavingWithdrawn event has no args, so fetch amount from localStorage
                  const withdrawals = JSON.parse(localStorage.getItem('savfe_withdrawals') || '[]');
                  const withdrawal = withdrawals.find((w: any) => w.txHash === log.transactionHash);
                  if (withdrawal) {
                    // Ensure amount is a number and format it properly
                    const amt = Number(withdrawal.amount);
                    amount = isNaN(amt) ? '0.0000' : amt.toFixed(4);
                    token = withdrawal.token;
                  } else {
                    amount = 'Withdrawn';
                    token = 'Savings';
                  }
                }
              } catch (decodeError) {
                // Fallback: Try to parse from log.data directly
                console.warn(`Failed to decode ${eventType.name} event, trying manual parsing:`, decodeError);

                // The ABI is now correctly defined, so decodeEventLog should work properly
                // No need for manual parsing anymore
              }

              allTransactions.push({
                id: log.transactionHash,
                type: eventType.type,
                amount,
                token,
                timestamp: Number(block.timestamp),
                txHash: log.transactionHash,
                status: 'Completed',
                icon: eventType.icon,
              });
            } catch (error) {
              console.error(`Error processing ${eventType.name} log:`, error, log);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${eventType.name} events:`, error);
        }
      }

      // Sort by timestamp descending (newest first)
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(allTransactions);
      setCurrentPage(1); // Reset to first page when new data loads
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Filter by token
    if (filterToken !== 'all') {
      filtered = filtered.filter(tx => tx.token === filterToken);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Pagination: slice filtered transactions for current page
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    filtered = filtered.slice(startIndex, endIndex);

    setFilteredTransactions(filtered);
  };

  const exportToCSV = () => {
    // Export all transactions, not just filtered/paginated ones
    const csvContent = [
      [
        'Date',
        'Type',
        'Amount',
        'Token',
        'Status',
        'Transaction Hash',
      ],
      ...transactions.map(tx => [
        new Date(tx.timestamp * 1000).toLocaleString(),
        tx.type,
        tx.amount,
        tx.token,
        tx.status,
        tx.txHash,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'savfe-transaction-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination helpers
  const getTotalPages = () => {
    let filtered = transactions;

    // Apply filters to get total count
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }
    if (filterToken !== 'all') {
      filtered = filtered.filter(tx => tx.token === filterToken);
    }
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return Math.ceil(filtered.length / transactionsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Create Saving': return '💰';
      case 'Increment Saving': return '📈';
      case 'Withdraw Saving': return '💸';
      case 'Join Savfe': return '🎉';
      default: return '📄';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full md:col-span-2" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="rounded-md border">
            <div className="p-4">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If using OnchainKit TransactionHistory, render it instead
  if (useOnchainKitHistory) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M200,80H168V56a24,24,0,0,0-24-24H112A24,24,0,0,0,88,56V80H56a8,8,0,0,0,0,16H64V200a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V96h8a8,8,0,0,0,0-16ZM104,56a8,8,0,0,1,8-8h32a8,8,0,0,1,8,8V80H104ZM184,200a0,0,0,0,1,0,0H72a0,0,0,0,1,0-0V96H184Z"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Transaction History
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Complete audit trail of your savings activities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* TODO: Replace with OnchainKit TransactionHistory when available:
          <OnchainKitTransactionHistory address={address} />
          */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">OnchainKit TransactionHistory component not yet available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M200,80H168V56a24,24,0,0,0-24-24H112A24,24,0,0,0,88,56V80H56a8,8,0,0,0,0,16H64V200a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V96h8a8,8,0,0,0,0-16ZM104,56a8,8,0,0,1,8-8h32a8,8,0,0,1,8,8V80H104ZM184,200a0,0,0,0,1,0,0H72a0,0,0,0,1,0-0V96H184Z"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Transaction History
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Complete audit trail of your savings activities
              </CardDescription>
            </div>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filterType">Filter by Type</Label>
            <select
              id="filterType"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="Create Saving">Create Saving</option>
              <option value="Increment Saving">Increment Saving</option>
              <option value="Withdraw Saving">Withdraw Saving</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filterToken">Filter by Token</Label>
            <select
              id="filterToken"
              value={filterToken}
              onChange={e => setFilterToken(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Tokens</option>
              <option value="ETH">ETH</option>
              <option value="ERC20">ERC20</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Transaction Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(tx => (
                  <TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-sm">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp * 1000).toLocaleDateString()}
                        </span>
                        <span>
                          {new Date(tx.timestamp * 1000).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                        <Badge variant="outline" className="bg-background/50">
                          {tx.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      <div className="flex flex-col">
                        <span>{parseFloat(tx.amount).toFixed(4)}</span>
                        <span className="text-xs text-muted-foreground">{tx.token}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${
                          tx.token === 'ETH'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}
                      >
                        {tx.token}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell>
                      <a
                        href={`https://sepolia.basescan.org/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-mono text-sm transition-colors"
                      >
                        {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredTransactions.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
            <div>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === getTotalPages()}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}