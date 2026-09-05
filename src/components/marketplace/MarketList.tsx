"use client";

import { useMemo, useState } from "react";
import { Button } from "@mui/material";
import type { CatalogCardModel, Category } from "@/types/domain";
import { CatalogCard } from "@/components/marketplace/CatalogCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { useDebounce } from "@/hooks/useDebounce";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";

export interface MarketListProps {
  catalogs: CatalogCardModel[];
  categories?: Category[];
  selectedCategory?: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  page?: number;
  perPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

export function MarketList({
  catalogs,
  categories,
  selectedCategory: controlledCategory,
  onSelectCategory,
  searchQuery: controlledQuery,
  onSearchChange,
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}: MarketListProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const [internalCategory, setInternalCategory] = useState<string | null>(null);

  const queryValue = controlledQuery !== undefined ? controlledQuery : internalQuery;
  const debouncedQuery = useDebounce(queryValue, 250);
  const activeCategory =
    controlledCategory !== undefined ? controlledCategory : internalCategory;

  const handleCategoryClick = (catId: string | null) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else {
      setInternalCategory(catId);
    }
  };

  const handleQueryChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalQuery(val);
    }
  };

  const filtered = useMemo(() => {
    return catalogs.filter((c) => {
      // Category match
      if (activeCategory) {
        const matchCat =
          c.category_id === activeCategory ||
          c.category?.toLowerCase() === activeCategory?.toLowerCase();
        if (!matchCat) return false;
      }

      // Query match
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.talentName?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.institution?.toLowerCase().includes(q)
      );
    });
  }, [catalogs, debouncedQuery, activeCategory]);

  const categoryList = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c) => ({ id: c.id, name: c.name }));
    }
    const unique = Array.from(
      new Set(catalogs.map((c) => c.category).filter(Boolean))
    );
    return unique.map((c) => ({ id: c, name: c }));
  }, [categories, catalogs]);

  const isServerSide = Boolean(onSearchChange);
  const displayed = isServerSide ? catalogs : filtered;
  const displayedCount = total !== undefined ? total : displayed.length;

  return (
    <div className="space-y-6">
      {/* Category Filter & Search Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input Bar */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon
              sx={{ fontSize: 20 }}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              type="text"
              value={queryValue}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Cari bimbingan, nama mentor, atau materi..."
              className="w-full pl-10 pr-9 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {queryValue && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 rounded-full"
              >
                <ClearIcon sx={{ fontSize: 16 }} />
              </button>
            )}
          </div>

          {/* Active Result Count */}
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <TuneIcon sx={{ fontSize: 16 }} className="text-primary" />
            <span>
              Menampilkan <strong className="text-on-surface">{displayedCount}</strong> layanan
            </span>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 shrink-0 ${
              activeCategory === null
                ? "bg-primary text-white shadow-xs"
                : "bg-surface-container text-on-surface hover:bg-surface-variant"
            }`}
          >
            Semua Kategori
          </button>
          {categoryList.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategoryClick(c.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 shrink-0 ${
                activeCategory === c.id || activeCategory?.toLowerCase() === c.name.toLowerCase()
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container text-on-surface hover:bg-surface-variant"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      {/* Catalog Cards Grid */}
      {displayed.length === 0 ? (
        <EmptyState
          title="Tidak Ada Layanan Ditemukan"
          description="Coba ubah kata kunci pencarian atau pilih kategori bimbingan lainnya."
          action={
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                handleQueryChange("");
                handleCategoryClick(null);
              }}
              sx={{ borderRadius: 2 }}
            >
              Reset Filter
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((c) => (
              <div key={c.id} className="h-full">
                <CatalogCard catalog={c} />
              </div>
            ))}
          </div>

          {total !== undefined && onPageChange && total > 0 && (
            <div className="pt-4 border-t border-outline-variant/30">
              <Pagination
                page={page || 1}
                perPage={perPage || 20}
                total={total}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
