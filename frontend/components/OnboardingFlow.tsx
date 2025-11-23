"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowRight, Wallet, Target, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding && isConnected) {
      setShowOnboarding(true);
    }
  }, [isConnected]);

  const steps: OnboardingStep[] = [
    {
      id: "connect",
      title: "Connect Your Wallet",
      description: "First, connect your wallet to get started with PiggySavfe",
      icon: <Wallet className="h-8 w-8" />,
      completed: isConnected,
    },
    {
      id: "join",
      title: "Join PiggySavfe",
      description: "Create your free account to start saving and earning rewards",
      icon: <Users className="h-8 w-8" />,
      completed: false,
      action: {
        label: "Join Now",
        onClick: () => {
          // Trigger join modal
        },
      },
    },
    {
      id: "savings",
      title: "Create Your First Savings Goal",
      description: "Set a savings goal and watch your wealth grow securely on the blockchain",
      icon: <Target className="h-8 w-8" />,
      completed: false,
      action: {
        label: "Create Goal",
        onClick: () => {
          document.getElementById("savfe-actions")?.scrollIntoView({ behavior: "smooth" });
        },
      },
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  if (!showOnboarding) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleSkip}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-primary/20 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-sm">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleSkip}>
                  Skip
                </Button>
              </div>
              <Progress value={progress} className="mb-4" />
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {steps[currentStep].icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-1">
                    {steps[currentStep].title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {steps[currentStep].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Steps List */}
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      index === currentStep
                        ? "bg-primary/10 border border-primary/20"
                        : index < currentStep
                        ? "opacity-50"
                        : "opacity-30"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{step.title}</p>
                      {index === currentStep && (
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex-1"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleComplete} className="flex-1">
                    Get Started
                  </Button>
                )}
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <p className="text-xs text-muted-foreground">Secure</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <p className="text-xs text-muted-foreground">Join Fee</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Mini onboarding checklist that shows in dashboard
export function OnboardingChecklist() {
  const { address, isConnected } = useAccount();
  const [isExpanded, setIsExpanded] = useState(true);
  const [steps, setSteps] = useState([
    { id: "connect", label: "Connect wallet", completed: false },
    { id: "join", label: "Join PiggySavfe", completed: false },
    { id: "savings", label: "Create first savings goal", completed: false },
    { id: "group", label: "Join or create a group", completed: false },
  ]);

  useEffect(() => {
    if (isConnected) {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === "connect" ? { ...step, completed: true } : step
        )
      );
    }
  }, [isConnected]);

  const completedSteps = steps.filter((s) => s.completed).length;
  const isComplete = completedSteps === steps.length;

  if (isComplete) return null;

  return (
    <Card className="gradient-card-hover border-2 border-primary/20">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Getting Started</CardTitle>
              <CardDescription className="text-sm">
                {completedSteps} of {steps.length} steps completed
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isExpanded ? "−" : "+"}
          </Button>
        </div>
        <Progress value={(completedSteps / steps.length) * 100} className="mt-3" />
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  step.completed ? "opacity-50" : ""
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={`text-sm ${step.completed ? "line-through" : "font-medium"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
