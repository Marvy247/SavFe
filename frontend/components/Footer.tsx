"use client";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const { address } = useAccount();

  const footerLinks = {
    product: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Groups", href: "/dashboard" },
      { name: "Savings", href: "/dashboard" },
      { name: "Analytics", href: "/dashboard" },
    ],
    company: [
      { name: "About", href: "/landing" },
      { name: "Documentation", href: "https://docs.celo.org/" },
      { name: "Explorer", href: "https://explorer.celo.org/alfajores" },
      { name: "Support", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Disclaimer", href: "#" },
    ],
    social: [
      { name: "Twitter", href: "https://twitter.com", icon: "🐦" },
      { name: "Discord", href: "https://discord.com", icon: "💬" },
      { name: "GitHub", href: "https://github.com", icon: "💻" },
      { name: "Telegram", href: "https://telegram.org", icon: "📱" },
    ],
  };

  // Generate shareable achievement card
  const generateShareableCard = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/share?address=${address}`;
    
    return {
      title: "🎉 SavFe Achievement",
      description: shareMessage || "I'm building wealth with SavFe - Join the decentralized savings revolution!",
      url: shareUrl,
      image: `${baseUrl}/api/og?address=${address}`, // OG image endpoint
    };
  };

  // Share to social media
  const shareToSocial = (platform: string) => {
    const card = generateShareableCard();
    const text = encodeURIComponent(card.description);
    const url = encodeURIComponent(card.url);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      toast.success(`Opening ${platform} share dialog...`);
    }
  };

  // Copy share link
  const copyShareLink = () => {
    const card = generateShareableCard();
    navigator.clipboard.writeText(card.url);
    toast.success('Share link copied to clipboard!');
  };

  // Generate Farcaster Frame metadata
  const generateFarcasterFrame = () => {
    const card = generateShareableCard();
    
    return {
      "fc:frame": "vNext",
      "fc:frame:image": card.image,
      "fc:frame:button:1": "View Profile",
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target": card.url,
                      "fc:frame:button:2": "Join PiggySavfe",
                      "fc:frame:button:2:action": "link",
                      "fc:frame:button:2:target": `${card.url}/dashboard`,
                      "fc:frame:button:3": "Join PiggySavfe",
                      "fc:frame:button:3:action": "link",
                      "fc:frame:button:3:target": `${card.url}/landing`,
    };
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
                  <h3 className="text-xl font-bold text-foreground">PiggySavfe</h3>
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
                  Built on Celo
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
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
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
                <div className="flex space-x-3 mb-3">
                  {footerLinks.social.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-lg"
                      title={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
                <Button
                  onClick={() => setShowShareCard(!showShareCard)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!address}
                >
                  {showShareCard ? '✕ Close' : '🎨 Share Achievement'}
                </Button>
              </div>
            </div>
          </div>

          {/* Share Achievement Card */}
          {showShareCard && address && (
            <div className="mb-8 animate-fade-in">
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>🎨</span>
                    <span>Share Your Savings Achievement</span>
                  </CardTitle>
                  <CardDescription>
                    Share your progress with the community and inspire others to start saving
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Custom Message */}
                  <div className="space-y-2">
                    <Label htmlFor="shareMessage">Custom Message (Optional)</Label>
                    <Input
                      id="shareMessage"
                      type="text"
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                      placeholder="I'm building wealth with SavFe..."
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      {shareMessage.length}/200 characters
                    </p>
                  </div>

                  {/* Preview Card */}
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-start space-x-3">
                      <div className="text-4xl">🎉</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">PiggySavfe Achievement</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {shareMessage || "I'm building wealth with PiggySavfe - Join the decentralized savings revolution!"}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Celo Alfajores
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      onClick={() => shareToSocial('twitter')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      🐦 Twitter
                    </Button>
                    <Button
                      onClick={() => shareToSocial('telegram')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      📱 Telegram
                    </Button>
                    <Button
                      onClick={() => shareToSocial('facebook')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      📘 Facebook
                    </Button>
                    <Button
                      onClick={copyShareLink}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      🔗 Copy Link
                    </Button>
                  </div>

                  {/* Farcaster Frame Info */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="text-lg">🎭</div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold mb-1">Farcaster Frame Ready</p>
                        <p className="text-xs text-muted-foreground">
                          Your achievement is formatted as a Farcaster Frame and can be shared on Warpcast
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator className="mb-6" />

          {/* Bottom section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
              <p>© {currentYear} SavFe. All rights reserved.</p>
            </div>

            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span>Secure</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span>Transparent</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                <span>Community-Driven</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
