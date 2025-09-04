"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PenaltyCalculator() {
  const [savingAmount, setSavingAmount] = useState<string>("");
  const [penaltyPercentage, setPenaltyPercentage] = useState<string>("");
  const [daysRemaining, setDaysRemaining] = useState<string>("");
  const [totalDays, setTotalDays] = useState<string>("");
  const [calculatedPenalty, setCalculatedPenalty] = useState<number | null>(null);

  const calculatePenalty = () => {
    const amount = parseFloat(savingAmount);
    const penalty = parseFloat(penaltyPercentage);
    const remaining = parseFloat(daysRemaining);
    const total = parseFloat(totalDays);

    if (amount && penalty && remaining && total) {
      // Calculate penalty based on time remaining
      // Penalty decreases linearly as maturity approaches
      const timeRatio = remaining / total;
      const adjustedPenalty = penalty * timeRatio;
      const penaltyAmount = (amount * adjustedPenalty) / 100;

      setCalculatedPenalty(penaltyAmount);
    }
  };

  const getPenaltySeverity = (penalty: number, amount: number) => {
    const ratio = penalty / amount;
    if (ratio < 0.05) return { level: "Low", color: "bg-green-100 text-green-800" };
    if (ratio < 0.15) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "High", color: "bg-red-100 text-red-800" };
  };

  return (
    <Card className="gradient-card-hover animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M200,80a56.06,56.06,0,0,0-56-56H112A56.06,56.06,0,0,0,56,80v96a16,16,0,0,0,16,16h8v16a8,8,0,0,1-16,0V192H56a32,32,0,0,1-32-32V80a72.08,72.08,0,0,1,72-72h32a72.08,72.08,0,0,1,72,72v96a32,32,0,0,1-32,32h-8v16a8,8,0,0,1-16,0V192h8A16,16,0,0,0,200,176Z"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Penalty Calculator
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Calculate potential penalties for early withdrawal
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="savingAmount"
              className="text-sm font-semibold text-card-foreground"
            >
              Saving Amount (ETH)
            </Label>
            <Input
              id="savingAmount"
              type="number"
              value={savingAmount}
              onChange={(e) => setSavingAmount(e.target.value)}
              placeholder="1.0"
              step="0.01"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="penaltyPercentage"
              className="text-sm font-semibold text-card-foreground"
            >
              Penalty Percentage (%)
            </Label>
            <Input
              id="penaltyPercentage"
              type="number"
              value={penaltyPercentage}
              onChange={(e) => setPenaltyPercentage(e.target.value)}
              placeholder="10"
              min="0"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="daysRemaining"
              className="text-sm font-semibold text-card-foreground"
            >
              Days Remaining
            </Label>
            <Input
              id="daysRemaining"
              type="number"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(e.target.value)}
              placeholder="30"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="totalDays"
              className="text-sm font-semibold text-card-foreground"
            >
              Total Maturity Days
            </Label>
            <Input
              id="totalDays"
              type="number"
              value={totalDays}
              onChange={(e) => setTotalDays(e.target.value)}
              placeholder="365"
              min="1"
            />
          </div>
        </div>

        <Button
          onClick={calculatePenalty}
          disabled={!savingAmount || !penaltyPercentage || !daysRemaining || !totalDays}
          className="w-full"
          size="lg"
        >
          Calculate Penalty
        </Button>

        {calculatedPenalty !== null && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Penalty Calculation
                </h3>
                <div className="text-3xl font-bold text-destructive mb-2">
                  {calculatedPenalty.toFixed(4)} ETH
                </div>
                <Badge
                  className={`text-sm ${
                    getPenaltySeverity(calculatedPenalty, parseFloat(savingAmount)).color
                  }`}
                >
                  {getPenaltySeverity(calculatedPenalty, parseFloat(savingAmount)).level} Penalty
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Net Withdrawal</p>
                  <p className="text-lg font-semibold">
                    {(parseFloat(savingAmount) - calculatedPenalty).toFixed(4)} ETH
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Penalty Rate</p>
                  <p className="text-lg font-semibold">
                    {((calculatedPenalty / parseFloat(savingAmount)) * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Time to Maturity</p>
                  <p className="text-lg font-semibold">
                    {((parseFloat(daysRemaining) / parseFloat(totalDays)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Early Withdrawal Impact
                    </p>
                    <p className="text-xs text-amber-700">
                      Withdrawing now will reduce your savings by{" "}
                      {((calculatedPenalty / parseFloat(savingAmount)) * 100).toFixed(1)}%.
                      Consider waiting longer to minimize penalties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
