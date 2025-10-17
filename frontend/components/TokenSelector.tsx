"use client";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

interface TokenData {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo?: string;
  chainId?: number;
}

interface TokenSelectorProps {
  value: string;
  onChange: (address: string) => void;
  className?: string;
}

// Tokens available on Base Sepolia testnet (chainId: 84532)
const BASE_SEPOLIA_TOKENS: TokenData[] = [
  {
    symbol: "ETH",
    name: "Ether",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    chainId: 84532,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83",
    decimals: 6,
    chainId: 84532,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda",
    decimals: 6,
    chainId: 84532,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x0000000000000000000000000000000000000001",
    decimals: 18,
    chainId: 84532,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x0000000000000000000000000000000000000002",
    decimals: 8,
    chainId: 84532,
  },
];

// Token icon component
const TokenIcon = ({ symbol }: { symbol: string }) => {
  const icons: Record<string, string> = {
    ETH: "⟠",
    USDC: "💵",
    USDT: "💲",
    DAI: "◈",
    WBTC: "₿",
  };

  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg font-bold">
      {icons[symbol] || symbol.slice(0, 2)}
    </div>
  );
};

// Token row with balance
const TokenRowWithBalance = ({
  token,
  onClick,
  isSelected
}: {
  token: TokenData;
  onClick: () => void;
  isSelected: boolean;
}) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
    token: token.address === "0x0000000000000000000000000000000000000000"
      ? undefined
      : token.address as `0x${string}`,
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-3 text-left hover:bg-accent transition-colors flex items-center justify-between ${
        isSelected ? 'bg-accent' : ''
      }`}
    >
      <div className="flex items-center space-x-3 flex-1">
        <TokenIcon symbol={token.symbol} />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">{token.symbol}</span>
            <Badge variant="outline" className="text-xs">
              {token.name}
            </Badge>
          </div>
          {balance && (
            <div className="text-xs text-muted-foreground mt-0.5">
              Balance: {parseFloat(formatUnits(balance.value, token.decimals)).toFixed(4)}
            </div>
          )}
        </div>
      </div>
      {isSelected && (
        <svg
          className="w-5 h-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
};

export default function TokenSelector({ value, onChange, className = "" }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedToken = BASE_SEPOLIA_TOKENS.find(token => token.address === value);

  const filteredTokens = BASE_SEPOLIA_TOKENS.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (token: TokenData) => {
    onChange(token.address);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Token Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 border border-input bg-background rounded-lg text-sm flex items-center justify-between hover:bg-accent hover:border-primary/50 transition-all"
      >
        <div className="flex items-center space-x-3">
          {selectedToken ? (
            <>
              <TokenIcon symbol={selectedToken.symbol} />
              <div className="flex flex-col items-start">
                <span className="font-semibold">{selectedToken.symbol}</span>
                <span className="text-xs text-muted-foreground">{selectedToken.name}</span>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Select token...</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <Input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          {/* Token List */}
          <div className="overflow-y-auto max-h-80">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <TokenRowWithBalance
                  key={token.address}
                  token={token}
                  onClick={() => handleSelect(token)}
                  isSelected={token.address === value}
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No tokens found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              Showing {filteredTokens.length} of {BASE_SEPOLIA_TOKENS.length} tokens on Base Sepolia
            </p>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
}

// Enhanced TokenSelector with OnchainKit components
export function EnhancedTokenSelector({ value, onChange, className = "" }: TokenSelectorProps) {
  const selectedToken = BASE_SEPOLIA_TOKENS.find(token => token.address === value);

  return (
    <div className={className}>
      <TokenSelector value={value} onChange={onChange} />
      
      {/* Display selected token info */}
      {selectedToken && (
        <div className="mt-2 p-2 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <TokenIcon symbol={selectedToken.symbol} />
            <div className="flex-1">
              <div className="text-sm font-semibold">{selectedToken.symbol}</div>
              <div className="text-xs text-muted-foreground">{selectedToken.name}</div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {selectedToken.decimals} decimals
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact token display component
export function TokenDisplay({ address }: { address: string }) {
  const token = BASE_SEPOLIA_TOKENS.find(t => t.address === address);
  
  if (!token) return null;

  return (
    <div className="flex items-center space-x-2">
      <TokenIcon symbol={token.symbol} />
      <div>
        <div className="font-semibold text-sm">{token.symbol}</div>
        <div className="text-xs text-muted-foreground">{token.name}</div>
      </div>
    </div>
  );
}

export { BASE_SEPOLIA_TOKENS };export type { TokenData as Token };
