"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  color?: "primary" | "secondary" | "tertiary" | "success" | "warning" | "error";
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = "primary",
  onClick,
  className = ""
}: StatCardProps) {
  const iconColorStyles = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-amber-500/10 text-amber-600",
    error: "bg-error/10 text-error"
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-primary/40 hover:shadow-md" : "hover:border-outline-variant"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${iconColorStyles}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              trend.isPositive !== false
                ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400"
            }`}
          >
            {trend.value}
            {trend.label && <span className="text-[10px] font-normal opacity-80">{trend.label}</span>}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs sm:text-sm font-medium text-on-surface-variant line-clamp-1">{title}</p>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mt-1 tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-on-surface-variant/80 mt-1 line-clamp-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
