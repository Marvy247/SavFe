"use client";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo?: string;
}

interface TokenSelectorProps {
  value: string;
  onChange: (address: string) => void;
  className?: string;
}

// Tokens available on Lisk Sepolia testnet
const LISK_SEPOLIA_TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ether (Native)",
    address: "0x0000000000000000000000000000000000000000", // Native token on Lisk Sepolia
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83",
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda", // Placeholder - replace with actual USDT on Lisk Sepolia
    decimals: 6,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x0000000000000000000000000000000000000000", // Placeholder - replace with actual DAI on Lisk Sepolia
    decimals: 18,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x0000000000000000000000000000000000000000", // Placeholder - replace with actual WBTC on Lisk Sepolia
    decimals: 8,
  },
];

export default function TokenSelector({ value, onChange, className = "" }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedToken = LISK_SEPOLIA_TOKENS.find(token => token.address === value);

  const handleSelect = (token: Token) => {
    onChange(token.address);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm flex items-center justify-between hover:bg-accent hover:text-accent-foreground"
      >
        <div className="flex items-center space-x-2">
          {selectedToken ? (
            <>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold">{selectedToken.symbol.slice(0, 2)}</span>
              </div>
              <span>{selectedToken.symbol}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedToken.name}
              </Badge>
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

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {LISK_SEPOLIA_TOKENS.map((token, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(token)}
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold">{token.symbol.slice(0, 2)}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">{token.symbol}</div>
                <div className="text-xs text-muted-foreground">{token.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export { LISK_SEPOLIA_TOKENS };
export type { Token };
