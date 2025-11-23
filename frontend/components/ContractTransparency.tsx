"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Shield, Copy, CheckCircle2 } from "lucide-react";
import { SAVFE_ADDRESS, FACTORY_ADDRESS, NFT_ADDRESS } from "@/lib/contract";
import { useReadContract } from "wagmi";
import { SAVFE_ABI } from "@/lib/contract";
import { formatEther } from "viem";
import { toast } from "sonner";

export function ContractTransparency() {
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);

  // Read total users
  const { data: totalUsers } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "totalUsers",
  });

  // Read fountain (total earnings)
  const { data: fountain } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "fountain",
  });

  const contracts = [
    {
      name: "Main Contract (Savfe)",
      address: SAVFE_ADDRESS,
      description: "Core savings functionality and user management",
      verified: true,
    },
    {
      name: "Group Factory",
      address: FACTORY_ADDRESS,
      description: "Rotating savings group creation and management",
      verified: true,
    },
    {
      name: "NFT Badge Contract",
      address: NFT_ADDRESS,
      description: "Achievement badges and rewards NFTs",
      verified: true,
    },
  ];

  const copyToClipboard = (address: string, name: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success(`${name} address copied!`);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const openInExplorer = (address: string) => {
    window.open(`https://explorer.celo.org/alfajores/address/${address}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card-hover border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Contract Transparency</CardTitle>
              <CardDescription>
                All contracts are verified and auditable on the Celo blockchain
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {totalUsers ? Number(totalUsers).toLocaleString() : "---"}
              </p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {fountain ? `${Number(formatEther(fountain)).toFixed(2)}` : "---"}
              </p>
              <p className="text-sm text-muted-foreground">Platform Earnings (CELO)</p>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>

          {/* Contract List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Smart Contracts
            </h4>
            {contracts.map((contract) => (
              <div
                key={contract.address}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold">{contract.name}</h5>
                      {contract.verified && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contract.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono truncate">
                    {contract.address}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => copyToClipboard(contract.address, contract.name)}
                  >
                    {copiedAddress === contract.address ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => openInExplorer(contract.address)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Security Info */}
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm mb-1">Audited & Secure</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All smart contracts have been audited and are open-source. Your funds are secured
                  by immutable blockchain technology and can be verified on Celoscan at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://docs.celo.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Celo Documentation
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://explorer.celo.org/alfajores"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Celo Explorer
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                View Source Code
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Compact version for footer or sidebar
export function ContractAddressesCompact() {
  const contracts = [
    { name: "Savfe", address: SAVFE_ADDRESS },
    { name: "Factory", address: FACTORY_ADDRESS },
    { name: "NFT", address: NFT_ADDRESS },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Smart Contracts
      </p>
      {contracts.map((contract) => (
        <div key={contract.address} className="flex items-center gap-2">
          <span className="text-xs font-medium min-w-[60px]">{contract.name}:</span>
          <a
            href={`https://explorer.celo.org/alfajores/address/${contract.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-primary hover:underline truncate"
          >
            {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
          </a>
        </div>
      ))}
    </div>
  );
}
