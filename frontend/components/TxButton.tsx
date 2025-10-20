"use client";
import React, { useState } from "react";

export default function TxButton({
  label = "Execute",
  fn,
  args = [],
  value,
  className = "",
}: {
  label?: string;
  fn: (...a: any[]) => Promise<any>;
  args?: any[];
  value?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">(
    "idle"
  );
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const click = async () => {
    try {
      setState("pending");
      setError(null);
      const tx = await fn(...args, value ? { value } : {});
      const receipt = await tx.wait();
      setTxHash(receipt.transactionHash || receipt.hash || null);
      setState("success");
    } catch (e: any) {
      setError(e?.message || String(e));
      setState("error");
    }
  };

  const getButtonContent = () => {
    switch (state) {
      case "pending":
        return (
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Confirming...</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Success</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4"
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
            <span>Retry</span>
          </div>
        );
      default:
        return label;
    }
  };

  const getButtonStyles = () => {
    const baseStyles =
      "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed";

    switch (state) {
      case "pending":
        return `${baseStyles} bg-yellow-500 text-yellow-900 hover:bg-yellow-600`;
      case "success":
        return `${baseStyles} bg-green-500 text-white hover:bg-green-600`;
      case "error":
        return `${baseStyles} bg-destructive text-destructive-foreground hover:bg-destructive/90`;
      default:
        return `${baseStyles} bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm`;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={click}
        disabled={state === "pending"}
        className={getButtonStyles()}
      >
        {getButtonContent()}
      </button>

      {txHash && (
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Transaction: </span>
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-mono"
          >
            {txHash.slice(0, 8)}...{txHash.slice(-6)}
          </a>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-2 text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
          <svg
            className="h-3 w-3 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="break-all">{error}</span>
        </div>
      )}
    </div>
  );
}
