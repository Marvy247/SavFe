"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { WalletCard } from "./WalletCard";
import MobileMenu from "./MobileMenu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";
import { SAVFE_ABI, SAVFE_ADDRESS } from "@/lib/contract";


export default function Header() {
  const { isConnected, address } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const { data: ownerAddress } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "owner",
  });

  // Fix hydration mismatch by only showing connection status after client mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check admin status
  useEffect(() => {
    if (ownerAddress && address && typeof ownerAddress === "string" && typeof address === "string") {
      setIsAdmin(ownerAddress.toLowerCase() === address.toLowerCase());
    }
  }, [ownerAddress, address]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* Custom Lock-themed Logo */}
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">SavFe</h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Smarter and Secure
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 ml-25">
              <a
                href="/"
                className="group relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                <span className="relative z-10">Home</span>
                <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>

              <a
                href="/dashboard"
                className="group relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                <span className="relative z-10">Dashboard</span>
                <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>

              <a
                href="/landing"
                className="group relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                <span className="relative z-10">About</span>
                <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>

              <Separator orientation="vertical" className="h-6" />

              <a
                href="https://sepolia-blockscout.lisk.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                <span className="relative z-10">Explorer</span>
                <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>

            <a
              href="https://docs.lisk.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            >
              <span className="relative z-10">Docs</span>
              <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
            {isAdmin && (
              <a
                href="/admin"
                className="group relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                <span className="relative z-10">Admin</span>
                <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
            )}
          </nav>
        </div>

          {/* Right side - Stats, Wallet and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Connection Status - Only show after client mount to prevent hydration mismatch */}
            {isClient && isConnected && (
              <div className="hidden md:flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse mr-2"></div>
                  Connected
                </Badge>
              </div>
            )}

            {/* Network Status */}
            <div className="hidden sm:flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                Lisk
              </Badge>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              <WalletCard />
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </header>
  );
}
