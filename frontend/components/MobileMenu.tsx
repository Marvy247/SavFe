"use client";
import React, { useState } from "react";
import { WalletCardCompact } from "./WalletCard";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors focus-ring"
        aria-label="Toggle mobile menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background backdrop-blur-3xl">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-card shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
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
                  <span className="text-lg font-semibold">SavFe</span>
                </div>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-6 space-y-2">
                <a
                  href="#groups"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary transition-colors border border-border/50"
                >
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="font-medium">Groups</span>
                </a>

                <a
                  href="#earnings"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary transition-colors border border-border/50"
                >
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <span className="font-medium">Earnings</span>
                </a>

                <a
                  href="#explorer"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary transition-colors border border-border/50"
                >
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="font-medium">Explorer</span>
                </a>

                {/* Wallet and Theme in Mobile Menu */}
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Wallet</span>
                    <div className="flex-shrink-0">
                      <WalletCardCompact />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Notifications</span>
                    <Button variant="outline" size="icon" className="relative h-8 w-8">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a6 6 0 0110.29-4.12L15 9v8z" />
                      </svg>
                      {/* Notification badge */}
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                        3
                      </span>
                    </Button>
                  </div>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-secondary/20">
                <div className="text-center text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">SavFe</p>
                  <p className="text-xs mt-1">Smart and Secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
