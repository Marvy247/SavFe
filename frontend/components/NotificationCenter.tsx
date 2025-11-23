"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, Clock, TrendingUp, Users, Award, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useReadContract } from "wagmi";
import { SAVFE_ADDRESS, SAVFE_ABI, FACTORY_ADDRESS, FACTORY_ABI } from "@/lib/contract";

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "achievement";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function NotificationCenter() {
  const { address } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Get user's child contract for checking savings
  const { data: childContractAddress } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: "getUserChildContractAddressByAddress",
    args: address ? [address] : [],
    query: {
      enabled: !!address,
    },
  });

  // Generate dynamic notifications based on user activity
  useEffect(() => {
    if (!address) return;

    // Example notifications - In production, these would come from contract events
    const demoNotifications: Notification[] = [
      {
        id: "1",
        type: "info",
        title: "Welcome to PiggySavfe!",
        message: "Start your savings journey by creating your first goal",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        icon: <Users className="h-4 w-4" />,
        action: {
          label: "Create Goal",
          onClick: () => {
            window.location.href = "/dashboard";
          },
        },
      },
      {
        id: "2",
        type: "success",
        title: "Savings Goal Reached!",
        message: "Congratulations! You've reached your Emergency Fund goal",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        id: "3",
        type: "achievement",
        title: "New Achievement Unlocked!",
        message: "You've earned the 'Consistent Saver' badge",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
        icon: <Award className="h-4 w-4" />,
        action: {
          label: "View Badge",
          onClick: () => {
            window.location.href = "/dashboard";
          },
        },
      },
      {
        id: "4",
        type: "warning",
        title: "Group Contribution Due",
        message: "Don't forget to contribute to 'Family Savings' group",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        read: true,
        icon: <Clock className="h-4 w-4" />,
        action: {
          label: "Contribute Now",
          onClick: () => {
            window.location.href = "/dashboard";
          },
        },
      },
    ];

    setNotifications(demoNotifications);
  }, [address, childContractAddress]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-500 bg-green-500/10";
      case "warning":
        return "text-yellow-500 bg-yellow-500/10";
      case "achievement":
        return "text-purple-500 bg-purple-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full text-xs flex items-center justify-center text-white font-semibold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <DropdownMenuLabel className="p-0 text-base font-semibold">
              Notifications
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative"
                >
                  <DropdownMenuItem
                    className={`px-4 py-3 cursor-pointer flex-col items-start gap-2 ${
                      !notification.read ? "bg-accent/50" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {notification.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.action!.onClick();
                        }}
                      >
                        {notification.action.label}
                      </Button>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setNotifications([])}
              >
                Clear all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
