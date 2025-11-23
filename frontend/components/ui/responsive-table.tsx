"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyState,
  className = "",
}: ResponsiveTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer hover:bg-accent" : ""}
              >
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {column.cell
                      ? column.cell(row[column.accessorKey], row)
                      : row[column.accessorKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row, rowIndex) => (
          <Card
            key={rowIndex}
            className={`transition-all ${
              onRowClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : ""
            }`}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="p-4 space-y-3">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((column, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-start gap-3">
                    <span className="text-sm font-medium text-muted-foreground min-w-fit">
                      {column.mobileLabel || column.header}:
                    </span>
                    <div className="text-sm text-right flex-1">
                      {column.cell
                        ? column.cell(row[column.accessorKey], row)
                        : row[column.accessorKey]}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

// Mobile-optimized action buttons
export function MobileActions({
  actions,
}: {
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost" | "destructive";
    icon?: React.ReactNode;
  }>;
}) {
  if (actions.length === 0) return null;

  if (actions.length === 1) {
    const action = actions[0];
    return (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          action.onClick();
        }}
        variant={action.variant || "default"}
        size="sm"
        className="w-full"
      >
        {action.icon && <span className="mr-2">{action.icon}</span>}
        {action.label}
      </Button>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
          variant={action.variant || "outline"}
          size="sm"
          className="flex-1 min-w-0"
        >
          {action.icon && <span className="mr-1">{action.icon}</span>}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

// Helper component for mobile-friendly stats display
export function StatDisplay({
  label,
  value,
  badge,
  icon,
}: {
  label: string;
  value: string | number;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge}
        <span className="text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}
