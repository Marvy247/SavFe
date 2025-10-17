"use client";
import React, { useState } from "react";
import { 
  Wallet, 
  WalletDropdown, 
  WalletDropdownDisconnect,
  WalletDropdownLink,
  ConnectWallet
} from '@coinbase/onchainkit/wallet';
import { 
  Identity, 
  Name, 
  Avatar, 
  Address 
} from '@coinbase/onchainkit/identity';
import { FundButton } from '@coinbase/onchainkit/fund';
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const WalletCard = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const [showFundCard, setShowFundCard] = useState(false);

  if (isConnecting) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="text-sm text-muted-foreground">Connecting wallet...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your wallet to access SavFe features
              </p>
            </div>
            <ConnectWallet />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <Wallet>
        <ConnectWallet>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
            <Identity address={address} className="flex items-center space-x-3">
              <Avatar className="h-10 w-10" />
              <div className="flex flex-col">
                <Name className="font-semibold text-sm" />
                <Address className="text-xs text-muted-foreground" />
              </div>
            </Identity>
            <Badge variant="secondary" className="ml-auto">
              Connected
            </Badge>
          </div>
        </ConnectWallet>
        
        <WalletDropdown>
          <Identity address={address} hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
          </Identity>
          
          <WalletDropdownLink
            icon="wallet"
            href="https://keys.coinbase.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wallet Settings
          </WalletDropdownLink>
          
          <WalletDropdownLink
            icon="activity"
            href={`https://sepolia.basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </WalletDropdownLink>
          
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>

      {/* Fund Wallet Button */}
      <div className="flex items-center justify-center">
        <FundButton
          fiatCurrency="USD"
          openIn="popup"
          popupSize="md"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium cursor-pointer"
        >
          💰 Fund Wallet
        </FundButton>
      </div>
    </div>
  );
};

// Compact version for header/navbar with Fund button
export const WalletCardCompact = () => {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <ConnectWallet>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
          Connect
        </Button>
      </ConnectWallet>
    );
  }

  return (
    <>
      <Wallet>
        <ConnectWallet>
          <Identity address={address} className="flex items-center space-x-2 px-2 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
            <Avatar className="h-6 w-6" />
            <Name className="hidden sm:block text-sm font-medium text-foreground" />
          </Identity>
        </ConnectWallet>

        <WalletDropdown>
          <Identity address={address} hasCopyAddressOnClick>
            <Avatar className="h-8 w-8" />
            <Name />
            <Address />
          </Identity>

          <WalletDropdownLink
            icon="wallet"
            href="https://keys.coinbase.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wallet Settings
          </WalletDropdownLink>

          <WalletDropdownLink
            icon="activity"
            href={`https://sepolia.basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </WalletDropdownLink>

          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>

      {/* Fund Button */}
      <FundButton
        fiatCurrency="USD"
        openIn="popup"
        popupSize="md"
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-1 rounded text-sm font-medium transition-colors cursor-pointer"
      >
        Fund
      </FundButton>
    </>
  );
};
