"use client";
import dynamic from 'next/dynamic';
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

import { useState, useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LandingPage() {
  const { isConnected, address } = useAccount();
  const [isClient, setIsClient] = useState(false);

  // Fix hydration mismatch by only showing connection status after client mount
  useEffect(() => {
    setIsClient(true);
    AOS.init({
      duration: 800,
      once: false,
      offset: 100,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-black dark:via-black dark:to-primary/10">
      <Header />
      <div className="relative flex w-full flex-col items-start justify-start overflow-hidden pb-20">
        <BackgroundRippleEffect />
        <div className="z-10 mt-40 w-full">
          <div className="flex justify-center items-center space-x-2 mb-6" data-aos="fade-down">
            <Badge
              variant="secondary"
              className="text-sm font-medium rounded-full py-2 px-4 shadow-lg backdrop-blur-sm bg-white/10 dark:bg-black/20 border border-white/20"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse mr-2"></span>{" "}
              Built on Base
            </Badge>
          </div>
          <h1 className="relative z-10 mx-auto max-w-5xl text-center text-3xl md:text-5xl lg:text-8xl font-extrabold text-neutral-900 dark:text-white leading-tight" data-aos="fade-up" data-aos-delay="200">
            Unlock Smarter Savings
            <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              with PiggySavfe
            </span>
          </h1>
          <p className="relative z-10 mx-auto mt-6 max-w-3xl text-center text-lg md:text-xl text-neutral-700 dark:text-neutral-300 leading-relaxed" data-aos="fade-up" data-aos-delay="400">
            Join decentralized rotating savings groups, earn rewards, and build wealth securely without intermediaries.
            <span className="text-primary font-semibold block mt-2">
              Powered by smart contracts on Base.
            </span>
          </p>

          <div className="flex justify-center mt-10 space-x-6" data-aos="fade-up" data-aos-delay="600">
            {isClient && isConnected ? (
              <Link href="/dashboard">
                <Button size="lg" className="px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-primary hover:bg-primary/90">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <ConnectWallet />
            )}
            <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold border-2 hover:bg-primary hover:text-white transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Key Stats Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-black/50 backdrop-blur-sm" data-aos="fade-up">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground font-medium">Active Savers</p>
            </div>
            <div className="p-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">$2M+</div>
              <p className="text-muted-foreground font-medium">Total Saved</p>
            </div>
            <div className="p-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground font-medium">Groups Created</p>
            </div>
            <div className="p-6" data-aos="zoom-in" data-aos-delay="400">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">99.9%</div>
              <p className="text-muted-foreground font-medium">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4" data-aos="fade-up">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-down">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How PiggySavfe Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple steps to start saving smarter with your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group" data-aos="fade-right" data-aos-delay="200">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Join or Create a Group</h3>
              <p className="text-muted-foreground text-lg">
                Connect your wallet and join an existing rotating savings group or create your own with friends and family.
              </p>
            </div>

            <div className="text-center group" data-aos="fade-up" data-aos-delay="400">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Contribute Regularly</h3>
              <p className="text-muted-foreground text-lg">
                Make fixed contributions each cycle. Your savings are securely locked in smart contracts on the blockchain.
              </p>
            </div>

            <div className="text-center group" data-aos="fade-left" data-aos-delay="600">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Receive Payouts</h3>
              <p className="text-muted-foreground text-lg">
                Take turns receiving the full pot each cycle. Build wealth faster through community-powered savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-blue-500/5" data-aos="fade-up">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-down">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose PiggySavfe?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of savings with blockchain-powered trust, transparency, and community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2" data-aos="flip-left" data-aos-delay="200">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Bank-Grade Security</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Every transaction is immutably recorded on the Base blockchain, ensuring unparalleled security and complete transparency.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2" data-aos="flip-up" data-aos-delay="400">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Community Powered</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Join a thriving community of savers. Build wealth together through trustless, decentralized rotating savings groups.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2" data-aos="flip-right" data-aos-delay="600">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Enjoy instant transactions and real-time updates, powered by Base's high-performance Layer 2 blockchain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4" data-aos="fade-up">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-down">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real stories from savers building their future with PiggySavfe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg" data-aos="slide-right" data-aos-delay="200">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-primary">A</span>
                </div>
                <div>
                  <h4 className="font-semibold">Alice Johnson</h4>
                  <p className="text-sm text-muted-foreground">Small Business Owner</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "PiggySavfe helped me save consistently without the hassle of traditional banks. The community aspect makes it fun and motivating!"
              </p>
            </div>

            <div className="p-8 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg" data-aos="slide-up" data-aos-delay="400">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-primary">B</span>
                </div>
                <div>
                  <h4 className="font-semibold">Bob Smith</h4>
                  <p className="text-sm text-muted-foreground">Freelancer</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "The transparency of blockchain gives me peace of mind. I've grown my savings faster than ever before."
              </p>
            </div>

            <div className="p-8 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg" data-aos="slide-left" data-aos-delay="600">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-primary">C</span>
                </div>
                <div>
                  <h4 className="font-semibold">Carol Davis</h4>
                  <p className="text-sm text-muted-foreground">Teacher</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "Easy to use and incredibly secure. PiggySavfe has changed how I think about saving money."
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
