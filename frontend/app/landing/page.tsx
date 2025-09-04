"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const [isClient, setIsClient] = useState(false);

  // Fix hydration mismatch by only showing connection status after client mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-black">
      <Header />
      <div className="relative flex w-full flex-col items-start justify-start overflow-hidden pb-20">
        <BackgroundRippleEffect />
        <div className="z-10 mt-40 w-full">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Badge
              variant="secondary"
              className="text-sm font-medium rounded-full py-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1"></span>{" "}
              Built on Lisk
            </Badge>
          </div>
          <h2 className="relative z-10 mx-auto max-w-4xl text-center text-2xl text-neutral-800 md:text-4xl lg:text-7xl dark:text-neutral-100">
            SavFe Smarter
            <div className="text-7xl font-bold">Simple, Secure, and Transparent</div>
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-2xl text-center text-balance text-base text-neutral-800 dark:text-neutral-500">
            Save and grow your wealth with confidence in a decentralized platform
            <span className="text-primary font-semibold">
              {" "}
              powered by smart contracts
            </span>
            . No middlemen, just your community.
          </p>

          <div className="flex justify-center mt-8 space-x-4">
            {isClient && isConnected ? (
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="px-8 gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V184a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm0,128H56a8,8,0,0,1-8-8V78.63A23.84,23.84,0,0,0,56,80H216Zm-48-60a12,12,0,1,1,12,12A12,12,0,0,1,168,132Z"></path>
                    </svg>
                    Connect Wallet
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {connectors.map((connector) => (
                    <DropdownMenuItem
                      key={connector.uid}
                      onClick={() => connect({ connector })}
                      className="cursor-pointer"
                    >
                      {connector.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="outline" size="lg" className="px-8">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose SavFe?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of savings with blockchain-powered trust and transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Secure & Transparent</h4>
              <p className="text-muted-foreground">
                All transactions are recorded on the blockchain, ensuring complete transparency and security
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Community Driven</h4>
              <p className="text-muted-foreground">
                Join a community of savers building wealth together through rotating savings groups
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Lightning Fast</h4>
              <p className="text-muted-foreground">
                Experience instant transactions and real-time updates powered by Lisk's fast blockchain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
