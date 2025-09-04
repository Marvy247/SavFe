"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Groups", href: "/dashboard" },
      { name: "Savings", href: "/dashboard" },
      { name: "Analytics", href: "/dashboard" },
    ],
    company: [
      { name: "About", href: "/landing" },
      { name: "Documentation", href: "https://docs.lisk.com/" },
      { name: "Explorer", href: "https://sepolia-blockscout.lisk.com/" },
      { name: "Support", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Disclaimer", href: "#" },
    ],
    social: [
      { name: "Twitter", href: "#", icon: "🐦" },
      { name: "Discord", href: "#", icon: "💬" },
      { name: "GitHub", href: "#", icon: "💻" },
      { name: "Telegram", href: "#", icon: "📱" },
    ],
  };

  return (
    <footer className="relative mt-16 pt-12 pb-8 border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2] bg-[size:20px_20px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
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
                <div>
                  <h3 className="text-xl font-bold text-foreground">SavFe</h3>
                  <p className="text-sm text-muted-foreground">Smarter and Secure</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Experience the future of savings with blockchain-powered trust and transparency.
                Join a community building wealth together through decentralized savings groups.
              </p>

              {/* Network badge */}
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <div className="h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></div>
                  Built on Lisk
                </Badge>
              </div>
            </div>

            {/* Product links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Product</h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Social */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Legal</h4>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Community</h4>
                <div className="flex space-x-3">
                  {footerLinks.social.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-lg"
                      title={social.name}
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Bottom section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
              <p>© {currentYear} SavFe. All rights reserved.</p>
            </div>

            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>Secure</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <span>Transparent</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <span>Community-Driven</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
