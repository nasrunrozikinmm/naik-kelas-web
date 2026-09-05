"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export interface UseServerPaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
  initialSearch?: string;
  debounceMs?: number;
}

export function useServerPagination(options: UseServerPaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPerPage = 20,
    initialSearch = "",
    debounceMs = 350,
  } = options;

  const [page, setPage] = useState<number>(initialPage);
  const [perPage, setPerPageState] = useState<number>(initialPerPage);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialSearch);
  const [total, setTotal] = useState<number>(0);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Automatically reset page to 1 when debounced query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const setPerPage = useCallback((newPerPage: number) => {
    setPerPageState(newPerPage);
    setPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / perPage));
  }, [total, perPage]);

  return {
    page,
    setPage,
    perPage,
    setPerPage,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    total,
    setTotal,
    totalPages,
    resetPagination,
  };
}

