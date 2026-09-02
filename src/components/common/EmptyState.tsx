"use client";

import React from "react";
import InboxIcon from "@mui/icons-material/Inbox";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = <InboxIcon sx={{ fontSize: 48 }} className="text-outline" />,
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest/50 ${className}`}
    >
      <div className="p-4 rounded-2xl bg-surface-container-low text-on-surface-variant mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
