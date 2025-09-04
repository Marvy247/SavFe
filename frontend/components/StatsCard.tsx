import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = "",
}: StatsCardProps) {
  return (
    <div className={`gradient-card rounded-xl p-6 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {trend && (
          <div
            className={`flex items-center space-x-1 text-xs ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <svg
              className={`h-3 w-3 ${
                trend.isPositive ? "rotate-0" : "rotate-180"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
