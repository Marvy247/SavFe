"use client";
import dynamic from "next/dynamic";
import React from "react";
import { SavingOption } from "./SavingsSelector";

interface SavingsSelectorWrapperProps {
  value: string;
  onChange: (name: string, saving?: SavingOption) => void;
  className?: string;
}

// Dynamically import SavingsSelector with SSR disabled to prevent hydration mismatches
const SavingsSelector = dynamic(() => import("./SavingsSelector").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="w-full px-3 py-2 border border-input bg-muted rounded-md text-sm text-muted-foreground">
      Loading savings selector...
    </div>
  ),
});

export default function SavingsSelectorWrapper(props: SavingsSelectorWrapperProps) {
  return <SavingsSelector {...props} />;
}
