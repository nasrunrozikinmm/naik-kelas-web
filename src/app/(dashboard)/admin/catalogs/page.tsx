"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { useConfirm } from "@/hooks/useConfirm";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import {
  getAdminCatalogs,
  getAdminCatalogStats,
  moderateCatalogStatus,
  deleteCatalog,
} from "@/lib/api/catalog";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  getCatalogTypeLabel,
  getCatalogTypeIcon,
  getCatalogStatusLabel,
} from "@/lib/utils/catalog";
import type { Catalog, Category, ScheduleSlot, CatalogStats } from "@/types/domain";

// MUI Icons
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CircularProgress from "@mui/material/CircularProgress";

function AdminCatalogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDrawer, setSelectedDrawer] = useState<Catalog | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [stats, setStats] = useState<CatalogStats>({
    total: 0,
    active: 0,
    pending: 0,
    rejected_or_archived: 0,
  });
  const debouncedQuery = useDebounce(searchQuery, 350);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { confirm } = useConfirm();
  const statusParam = searchParams.get("status");
  const statusFilter = ["all", "pending_review", "active", "draft", "rejected", "archived"].includes(statusParam || "")
    ? statusParam!
    : "all";

  const handleStatusChange = (status: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") params.delete("status");
    else params.set("status", status);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  const fetchStats = useCallback(async () => {
    try {
      const s = await getAdminCatalogStats();
      if (s) setStats(s);
    } catch (err) {
      console.error("Failed to load admin catalog stats", err);
    }
  }, []);

  // Load catalogs and categories
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [catRes, categoriesRes] = await Promise.all([
        getAdminCatalogs({
          status: statusFilter === "all" ? undefined : statusFilter,
          category_id: categoryFilter === "all" ? undefined : categoryFilter,
          q: debouncedQuery.trim() || undefined,
          page,
          per_page: perPage,
        }),
        apiClient.get(endpoints.categories.list),
        fetchStats(),
      ]);

      setCatalogs(catRes.items || []);
      setTotal(catRes.total || 0);
      if (categoriesRes.data?.data) {
        setCategories(categoriesRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load admin catalogs", err);
      setFeedbackMsg({
        type: "error",
        message: "Gagal memuat data katalog layanan",
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter, debouncedQuery, page, perPage, fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  // Catalogs to display (server filtered)
  const filteredCatalogs = catalogs;

  // Action: Moderation status change
  const handleModerate = async (
    id: string,
    newStatus: "published" | "active" | "rejected" | "archived" | "draft"
  ) => {
    let confirmTitle = "Konfirmasi Moderasi Layanan";
    let confirmMessage = "Apakah Anda yakin ingin memperbarui status layanan ini?";
    let confirmColor: "primary" | "error" = "primary";
    let confirmLabel = "Ya, Lanjutkan";

    if (newStatus === "published" || newStatus === "active") {
      confirmTitle = "Setujui & Terbitkan Layanan?";
      confirmMessage =
        "Layanan akan segera aktif dan dapat ditemukan serta dipesan oleh siswa di marketplace Naik Kelas.";
      confirmLabel = "Ya, Terbitkan";
      confirmColor = "primary";
    } else if (newStatus === "rejected") {
      confirmTitle = "Tolak Layanan Ini?";
      confirmMessage =
        "Status layanan akan diubah menjadi Ditolak dan talent harus memperbaiki layanannya sebelum mengajukan kembali.";
      confirmLabel = "Ya, Tolak Layanan";
      confirmColor = "error";
    } else if (newStatus === "archived") {
      confirmTitle = "Arsipkan Layanan Ini?";
      confirmMessage =
        "Layanan akan dinonaktifkan sementara dan tidak dapat dipesan hingga diaktifkan kembali.";
      confirmLabel = "Ya, Arsipkan";
      confirmColor = "primary";
    }

    const isConfirmed = await confirm({
      title: confirmTitle,
      message: confirmMessage,
      confirmLabel,
      confirmColor,
    });

    if (!isConfirmed) return;

    try {
      setIsActionLoading(true);
      await moderateCatalogStatus(id, newStatus);
      fetchStats();
      setFeedbackMsg({
        type: "success",
        message: `Status layanan berhasil diperbarui menjadi ${getCatalogStatusLabel(newStatus)}`,
      });

      // Update in local state
      setCatalogs((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );

      if (selectedDrawer?.id === id) {
        setSelectedDrawer((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Failed to moderate catalog", err);
      setFeedbackMsg({
        type: "error",
        message: "Gagal memperbarui status layanan",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Delete catalog
  const handleDelete = async (id: string, title: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Layanan Permanen?",
      message: `Apakah Anda yakin ingin menghapus layanan "${title}" secara permanen? Data yang telah dihapus tidak dapat dipulihkan.`,
      confirmLabel: "Hapus Permanen",
      confirmColor: "error",
    });

    if (!isConfirmed) return;

    try {
      setIsActionLoading(true);
      await deleteCatalog(id);
      fetchStats();
      setFeedbackMsg({
        type: "success",
        message: "Layanan berhasil dihapus dari sistem",
      });
      setCatalogs((prev) => prev.filter((c) => c.id !== id));
      if (selectedDrawer?.id === id) {
        setSelectedDrawer(null);
      }
    } catch (err) {
      console.error("Failed to delete catalog", err);
      setFeedbackMsg({
        type: "error",
        message: "Gagal menghapus layanan",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const found = categories.find((c) => c.id === categoryId);
    return found ? found.name : "Umum";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Moderasi Layanan"
        description="Kelola, tinjau, dan atur status publikasi seluruh katalog marketplace Naik Kelas"
      />

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-[10px] flex items-center justify-between text-xs font-semibold shadow-xs ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? (
              <CheckCircleOutlineIcon sx={{ fontSize: 18 }} className="text-emerald-600" />
            ) : (
              <CancelOutlinedIcon sx={{ fontSize: 18 }} className="text-red-600" />
            )}
            <span>{feedbackMsg.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="p-1 text-on-surface-variant hover:text-on-surface rounded-[10px] transition-colors"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Layanan"
          value={stats.total}
          icon={<LayersOutlinedIcon sx={{ fontSize: 24 }} />}
          color="primary"
          subtitle="Semua katalog terdaftar"
        />
        <StatCard
          title="Menunggu Review"
          value={stats.pending}
          icon={<HourglassEmptyIcon sx={{ fontSize: 24 }} />}
          color="warning"
          subtitle="Perlu moderasi admin"
        />
        <StatCard
          title="Layanan Aktif"
          value={stats.active}
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 24 }} />}
          color="success"
          subtitle="Tampil di marketplace"
        />
        <StatCard
          title="Ditolak / Arsip"
          value={stats.rejected_or_archived}
          icon={<ArchiveOutlinedIcon sx={{ fontSize: 24 }} />}
          color="secondary"
          subtitle="Tidak aktif sementara"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-outline-variant/20">
          {[
            { id: "all", label: "Semua", count: stats.total },
            { id: "pending_review", label: "Menunggu Review", count: stats.pending },
            { id: "active", label: "Aktif", count: stats.active },
            { id: "draft", label: "Draft" },
            { id: "rejected", label: "Ditolak" },
            { id: "archived", label: "Diarsipkan" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleStatusChange(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all rounded-[10px] flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.id === "pending_review"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <SearchIcon
              sx={{ fontSize: 18 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="text"
              placeholder="Cari berdasarkan judul layanan, deskripsi, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-64 flex items-center gap-2">
            <FilterListIcon sx={{ fontSize: 18 }} className="text-on-surface-variant shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredCatalogs.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Tidak ada layanan ditemukan"
              description="Belum ada data layanan yang sesuai dengan filter atau kriteria pencarian saat ini."
              icon={<LayersOutlinedIcon sx={{ fontSize: 40 }} />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-bold">
                  <th className="py-3 px-4">Layanan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga & Kuota</th>
                  <th className="py-3 px-4">Sesi Live</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Dibuat Pada</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredCatalogs.map((catalog) => {
                  const slotsCount = catalog.schedule_slots?.length || 0;
                  return (
                    <tr
                      key={catalog.id}
                      className="hover:bg-surface-container/50 transition-colors"
                    >
                      {/* Title & Type */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5 max-w-xs sm:max-w-sm">
                          {catalog.image_url ? (
                            <div className="w-10 h-10 rounded-[10px] overflow-hidden relative bg-surface-container shrink-0 mt-0.5 border border-outline-variant/30 shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={catalog.image_url}
                                alt={catalog.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="p-2 rounded-[10px] bg-surface-container shrink-0 mt-0.5">
                              {getCatalogTypeIcon(catalog.type)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-on-surface line-clamp-1">
                              {catalog.title}
                            </p>
                            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                              {getCatalogTypeLabel(catalog.type)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-on-surface font-medium">
                        {getCategoryName(catalog.category_id)}
                      </td>

                      {/* Price & Quota */}
                      <td className="py-3 px-4 font-semibold">
                        <p className="text-on-surface">{formatCurrency(catalog.price)}</p>
                        <p className="text-[11px] text-on-surface-variant font-normal">
                          {catalog.duration ? `${catalog.duration} mnt` : "Fleksibel"}
                          {catalog.quota ? ` • Kuota ${catalog.quota}` : ""}
                        </p>
                      </td>

                      {/* Schedule Slots */}
                      <td className="py-3 px-4">
                        {catalog.type === "live_session" ? (
                          <span className="inline-flex items-center gap-1 text-on-surface-variant font-medium">
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} className="text-primary" />
                            <span>{slotsCount} Slot Jadwal</span>
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/60">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={catalog.status}
                          label={getCatalogStatusLabel(catalog.status)}
                        />
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-on-surface-variant">
                        {formatDate(catalog.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDrawer(catalog)}
                            className="px-2.5 py-1.5 bg-surface-container text-primary font-bold text-xs rounded-[10px] hover:bg-primary/10 transition-colors flex items-center gap-1"
                            title="Detail & Moderasi"
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                            <span>Moderasi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(catalog.id, catalog.title)}
                            disabled={isActionLoading}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-[10px] transition-colors"
                            title="Hapus Layanan"
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <div className="p-4 border-t border-outline-variant/30">
            <Pagination
              page={page}
              perPage={perPage}
              total={total}
              onPageChange={setPage}
              onPerPageChange={(pp) => {
                setPerPage(pp);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Moderation Detail Drawer */}
      {selectedDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedDrawer(null)}
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-surface-container-lowest shadow-2xl border-l border-outline-variant/40 flex flex-col">
              {/* Drawer Header */}
              <div className="p-6 border-b border-outline-variant/40 flex items-center justify-between">
                <div className="space-y-1 overflow-hidden pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Detail Layanan
                    </span>
                    <StatusBadge
                      status={selectedDrawer.status}
                      label={getCatalogStatusLabel(selectedDrawer.status)}
                    />
                  </div>
                  <h2 className="text-base font-bold text-on-surface line-clamp-1">
                    {selectedDrawer.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDrawer(null)}
                  className="p-2 rounded-[10px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Cover Banner Preview */}
                {selectedDrawer.image_url && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-outline-variant/40 bg-surface-container shadow-2xs relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedDrawer.image_url}
                      alt={selectedDrawer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Meta Bento Card */}
                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-3">
                  <p className="text-xs font-bold text-on-surface flex items-center gap-2">
                    <PaymentsOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />
                    <span>Ringkasan Parameter Layanan</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Kategori</span>
                      <span className="font-bold text-on-surface">
                        {getCategoryName(selectedDrawer.category_id)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Tipe</span>
                      <span className="font-bold text-on-surface">
                        {getCatalogTypeLabel(selectedDrawer.type)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Harga</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(selectedDrawer.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Durasi</span>
                      <span className="font-bold text-on-surface">
                        {selectedDrawer.duration ? `${selectedDrawer.duration} Menit` : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Kuota Maksimal</span>
                      <span className="font-bold text-on-surface">
                        {selectedDrawer.quota ? `${selectedDrawer.quota} Siswa` : "Fleksibel"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Dibuat Pada</span>
                      <span className="font-bold text-on-surface">
                        {formatDate(selectedDrawer.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-2">
                  <p className="text-xs font-bold text-on-surface">Deskripsi Lengkap Layanan</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {selectedDrawer.description || "Tidak ada deskripsi yang dicantumkan."}
                  </p>
                </div>

                {/* Requirements */}
                {selectedDrawer.requirements && (
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-2">
                    <p className="text-xs font-bold text-on-surface">Persyaratan Peserta</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                      {selectedDrawer.requirements}
                    </p>
                  </div>
                )}

                {/* Schedule Slots (If Live Session) */}
                {selectedDrawer.type === "live_session" && (
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />
                        <span>Daftar Slot Jadwal ({selectedDrawer.schedule_slots?.length || 0})</span>
                      </p>
                    </div>

                    {!selectedDrawer.schedule_slots || selectedDrawer.schedule_slots.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic">
                        Belum ada slot waktu yang dijadwalkan oleh talent.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDrawer.schedule_slots.map((slot: ScheduleSlot, sIdx: number) => (
                          <div
                            key={slot.id || sIdx}
                            className="p-3 bg-surface-container rounded-[10px] border border-outline-variant/30 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-on-surface">
                                {formatDate(slot.start_time)}
                              </p>
                              <div className="flex items-center gap-3 text-on-surface-variant text-[11px]">
                                <span className="flex items-center gap-1">
                                  <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
                                  {new Date(slot.start_time).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(slot.end_time).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GroupOutlinedIcon sx={{ fontSize: 13 }} />
                                  {slot.booked_count || 0}/{slot.capacity} kuota
                                </span>
                              </div>
                            </div>
                            <StatusBadge status={slot.status || "available"} size="small" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Action Bar */}
              <div className="p-6 border-t border-outline-variant/40 bg-surface-container-low flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleDelete(selectedDrawer.id, selectedDrawer.title)}
                  className="px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-300 dark:border-red-800 rounded-[10px] transition-colors"
                >
                  Hapus
                </button>

                <div className="flex items-center gap-2">
                  {selectedDrawer.status !== "active" && selectedDrawer.status !== "published" ? (
                    <>
                      {selectedDrawer.status !== "rejected" && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleModerate(selectedDrawer.id, "rejected")}
                          className="px-4 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-[10px] transition-colors"
                        >
                          Tolak Layanan
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleModerate(selectedDrawer.id, "published")}
                        className="px-5 py-2.5 text-xs font-bold bg-primary text-white hover:bg-primary/90 rounded-[10px] transition-all shadow-xs flex items-center gap-1.5"
                      >
                        {isActionLoading && <CircularProgress size={14} color="inherit" />}
                        <span>Setujui & Publikasikan</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleModerate(selectedDrawer.id, "archived")}
                      className="px-5 py-2.5 text-xs font-bold bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-container-high rounded-[10px] transition-colors"
                    >
                      Arsipkan Layanan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCatalogsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-on-surface-variant">Memuat katalog...</div>}>
      <AdminCatalogsContent />
    </Suspense>
  );
}
