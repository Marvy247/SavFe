import { useAccount, useBalance, useFeeData } from 'wagmi';
import { useState, useEffect } from 'react';
import { Address, formatGwei } from 'viem';

// Re-using the Suggestion type from the component
interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'budget' | 'investment' | 'goal' | 'habit';
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  potentialSavings: string;
  reasoning: string;
  quickAction?: {
    label: string;
    action: () => void;
  };
}

export function useOnchainSuggestions() {
  const { address } = useAccount();
  const { data: feeData } = useFeeData();
  const { data: balance } = useBalance({ address });

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const generateSuggestions = () => {
      const newSuggestions: Suggestion[] = [];

      // 1. Low Gas Fee Suggestion
      if (feeData && feeData.gasPrice) {
        const gasPriceGwei = parseFloat(formatGwei(feeData.gasPrice));
        if (gasPriceGwei < 0.1) { // Example threshold: 0.1 gwei
          newSuggestions.push({
            id: 'gas-fee-suggestion',
            title: 'Gas Fees are Low!',
            description: `Gas fees on Base are currently very low (${gasPriceGwei.toFixed(2)} gwei). It's a great time to make a transaction, like contributing to your savings group.`,
            category: 'habit',
            impact: 'low',
            actionable: true,
            estimatedTime: '2 mins',
            difficulty: 'easy',
            potentialSavings: '$0.50 - $2.00',
            reasoning: 'Performing transactions when the network is not congested can save you money on transaction fees over time.',
            quickAction: {
              label: 'Contribute Now',
              action: () => console.log('Navigate to contribution page'),
            },
          });
        }
      }

      // 2. "Just Got Paid" Suggestion (Simulated)
      // In a real app, this could be triggered by detecting a large incoming transaction.
      newSuggestions.push({
        id: 'post-payment-suggestion',
        title: 'Grow Your Savings After a Payment',
        description: 'Just received a payment? It is a great opportunity to allocate a portion towards your savings goals before you spend it elsewhere.',
        category: 'habit',
        impact: 'medium',
        actionable: true,
        estimatedTime: '5 mins',
        difficulty: 'easy',
        potentialSavings: '5-15% of payment',
        reasoning: 'Behavioral finance shows that saving immediately after receiving income (paying yourself first) dramatically increases savings rates.',
      });

      // 3. Low Balance Suggestion
      if (balance && balance.value < BigInt(10) * BigInt(10) ** BigInt(18)) { // Example: less than 10 of the native token
        newSuggestions.push({
            id: 'low-balance-suggestion',
            title: 'Top Up Your Wallet',
            description: 'Your wallet balance is running low. Top up soon to ensure you can make your next savings contribution without issues.',
            category: 'goal',
            impact: 'high',
            actionable: true,
            estimatedTime: '3 mins',
            difficulty: 'easy',
            potentialSavings: 'N/A',
            reasoning: 'Maintaining a sufficient balance is crucial for uninterrupted participation in your savings groups and avoiding potential penalties.',
            quickAction: {
                label: 'Fund Wallet',
                action: () => {
                    // This would trigger the OnchainKit FundButton functionality
                    // A more robust implementation would use a state management library to trigger the modal
                    console.log('Trigger Fund Wallet Modal');
                },
            },
        });
      }

      setSuggestions(newSuggestions);
    };

    generateSuggestions();
  }, [feeData, balance, address]);

  return { suggestions, isLoading: !suggestions.length };
}
