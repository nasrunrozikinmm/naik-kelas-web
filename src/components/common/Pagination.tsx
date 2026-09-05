"use client";

import React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 20, 50],
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 3) {
        pages.push("...");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePrev = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-sm text-on-surface-variant ${className}`}
    >
      {/* Left: Summary text & Per Page selector */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <p className="text-xs sm:text-sm">
          Menampilkan <span className="font-semibold text-on-surface">{startItem}</span> -{" "}
          <span className="font-semibold text-on-surface">{endItem}</span> dari{" "}
          <span className="font-semibold text-on-surface">{total}</span> data
        </p>

        {onPerPageChange && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="hidden md:inline">Baris:</span>
            <select
              aria-label="Jumlah baris per halaman"
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-2 py-1 text-xs text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-xs"
            >
              {perPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / hal
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Navigation buttons */}
      <nav aria-label="Navigasi Halaman" className="flex items-center gap-1">
        {/* Prev button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className={`flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-semibold transition-colors ${
            page <= 1
              ? "opacity-40 cursor-not-allowed border-outline-variant/20 text-on-surface-variant"
              : "border-outline-variant/40 hover:bg-surface-container text-on-surface cursor-pointer shadow-xs"
          }`}
        >
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-on-surface-variant"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === page;

            return (
              <button
                type="button"
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? "page" : undefined}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "border border-outline-variant/30 hover:bg-surface-container text-on-surface hover:border-outline-variant/60"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          className={`flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-semibold transition-colors ${
            page >= totalPages
              ? "opacity-40 cursor-not-allowed border-outline-variant/20 text-on-surface-variant"
              : "border-outline-variant/40 hover:bg-surface-container text-on-surface cursor-pointer shadow-xs"
          }`}
        >
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </button>
      </nav>
    </div>
  );
}

