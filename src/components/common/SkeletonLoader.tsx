"use client";

import React from "react";

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 space-y-4 animate-pulse"
        >
          <div className="h-44 bg-surface-container-high rounded-xl w-full" />
          <div className="space-y-2">
            <div className="h-4 bg-surface-container-high rounded w-3/4" />
            <div className="h-3 bg-surface-container-high rounded w-1/2" />
          </div>
          <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
            <div className="h-5 bg-surface-container-high rounded w-1/3" />
            <div className="h-8 bg-surface-container-high rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 space-y-4 animate-pulse"
        >
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high" />
            <div className="w-14 h-5 rounded-full bg-surface-container-high" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-surface-container-high rounded w-1/2" />
            <div className="h-7 bg-surface-container-high rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-surface-container-high rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-outline-variant/20">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-surface-container-high rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
