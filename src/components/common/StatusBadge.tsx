"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "small" | "medium";
  className?: string;
}

export function StatusBadge({ status, label, size = "small", className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const getStyle = () => {
    switch (normalized) {
      case "active":
      case "approved":
      case "verified":
      case "settled":
      case "success":
      case "published":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
      case "pending":
      case "waiting":
      case "draft":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
      case "suspended":
      case "rejected":
      case "failed":
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
      case "inactive":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const displayText =
    label ||
    status.charAt(0).toUpperCase() + status.slice(1);

  const sizeClasses = size === "small" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${getStyle()} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {displayText}
    </span>
  );
}
