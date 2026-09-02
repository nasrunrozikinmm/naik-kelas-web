"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
  className = ""
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30 ${className}`}>
      <div className="space-y-1">
        {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-on-surface-variant max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
