"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getMyCatalogs, deleteCatalog } from "@/lib/api/catalog";
import type { Catalog } from "@/types/domain";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VideoCameraFrontOutlinedIcon from "@mui/icons-material/VideoCameraFrontOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";

export default function TalentCatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCatalogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyCatalogs();
      setCatalogs(data);
    } catch (error) {
      console.error("Failed to fetch talent catalogs", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await deleteCatalog(deleteId);
      setCatalogs((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete catalog", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCatalogs = useMemo(() => {
    return catalogs.filter((cat) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = cat.title?.toLowerCase().includes(q);
        const matchesCategory = cat.category?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory) return false;
      }

      // Status
      if (statusFilter !== "all" && cat.status !== statusFilter) {
        return false;
      }

      // Type
      if (typeFilter !== "all" && cat.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [catalogs, searchQuery, statusFilter, typeFilter]);

  // Statistics
  const totalCount = catalogs.length;
  const activeCount = catalogs.filter((c) => c.status === "published" || c.status === "active").length;
  const pendingCount = catalogs.filter((c) => c.status === "pending_review").length;
  const draftCount = catalogs.filter((c) => c.status === "draft" || c.status === "rejected").length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "live_session":
        return <VideoCameraFrontOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />;
      case "recorded_course":
        return <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} className="text-secondary" />;
      case "document_material":
        return <DescriptionOutlinedIcon sx={{ fontSize: 16 }} className="text-warning" />;
      case "chat_consultation":
        return <ChatOutlinedIcon sx={{ fontSize: 16 }} className="text-success" />;
      default:
        return <LayersOutlinedIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "live_session":
        return "Live Session";
      case "recorded_course":
        return "Video Belajar";
      case "document_material":
        return "Materi Dokumen";
      case "chat_consultation":
        return "Konsultasi Chat";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan Saya"
        description="Kelola seluruh katalog layanan bimbingan, kelas rekaman, dan dokumen materi Anda."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCatalogs}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-container rounded-xl text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors shadow-xs"
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
              <span>Muat Ulang</span>
            </button>
            <Link
              href="/talent/catalogs/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              <span>Buat Layanan Baru</span>
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Layanan"
          value={totalCount}
          subtitle="Katalog terdaftar"
          color="primary"
          icon={<LayersOutlinedIcon sx={{ fontSize: 22 }} />}
        />
        <StatCard
          title="Layanan Aktif"
          value={activeCount}
          subtitle="Tampil di marketplace"
          color="success"
          icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
        />
        <StatCard
          title="Menunggu Review"
          value={pendingCount}
          subtitle="Sedang ditinjau admin"
          color="warning"
          icon={<HourglassEmptyOutlinedIcon sx={{ fontSize: 22 }} />}
        />
        <StatCard
          title="Draft / Ditolak"
          value={draftCount}
          subtitle="Belum dipublikasikan"
          color="secondary"
          icon={<EditNoteOutlinedIcon sx={{ fontSize: 22 }} />}
        />
      </div>

      {/* Filters & Content Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-3 bg-surface-container-low/30">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {[
              { id: "all", label: "Semua" },
              { id: "published", label: "Aktif" },
              { id: "pending_review", label: "Menunggu Review" },
              { id: "draft", label: "Draft" },
              { id: "rejected", label: "Ditolak" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? "bg-primary text-white shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Type dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <SearchIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                placeholder="Cari judul layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
            >
              <option value="all">Semua Tipe</option>
              <option value="live_session">Live Session</option>
              <option value="recorded_course">Video Belajar</option>
              <option value="document_material">Materi Dokumen</option>
              <option value="chat_consultation">Konsultasi Chat</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-6">
          </div>
        ) : filteredCatalogs.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Tidak ada layanan ditemukan"
              description={
                searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Coba ubah kata kunci pencarian atau reset filter."
                  : "Mulai tawarkan keahlian Anda dengan membuat layanan bimbingan pertama."
              }
              action={
                searchQuery || statusFilter !== "all" || typeFilter !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setTypeFilter("all");
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                  <th className="px-6 py-3.5 font-bold text-on-surface-variant uppercase tracking-wider">
                    Layanan
                  </th>
                  <th className="px-6 py-3.5 font-bold text-on-surface-variant uppercase tracking-wider">
                    Tipe & Kategori
                  </th>
                  <th className="px-6 py-3.5 font-bold text-on-surface-variant uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3.5 font-bold text-on-surface-variant uppercase tracking-wider">
                    Durasi / Kuota
                  </th>
                  <th className="px-6 py-3.5 font-bold text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 font-bold text-on-surface-variant uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredCatalogs.map((catalog) => (
                  <tr key={catalog.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-on-surface line-clamp-1 max-w-sm">
                        {catalog.title}
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        Dibuat: {formatDate(catalog.created_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                        {getTypeIcon(catalog.type)}
                        <span>{getTypeLabel(catalog.type)}</span>
                      </div>
                      {catalog.category?.name && (
                        <div className="text-[11px] text-on-surface-variant mt-0.5">
                          {catalog.category.name}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 font-bold text-on-surface">
                      {formatCurrency(catalog.price)}
                    </td>

                    <td className="px-6 py-4 text-on-surface-variant">
                      <div>{catalog.duration ? `${catalog.duration} Menit` : "-"}</div>
                      <div className="text-[11px]">
                        {catalog.quota ? `Maks. ${catalog.quota} siswa` : "Tanpa kuota"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={catalog.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/catalog/${catalog.id}`}
                          target="_blank"
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-lg transition-colors"
                          title="Lihat Halaman Publik"
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </Link>

                        <Link
                          href={`/talent/catalogs/${catalog.id}/edit`}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-lg transition-colors"
                          title="Edit Layanan"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </Link>

                        <button
                          onClick={() => setDeleteId(catalog.id)}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-variant rounded-lg transition-colors"
                          title="Hapus Layanan"
                        >
                          <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Hapus Layanan?"
        message="Layanan yang dihapus tidak akan dapat diakses lagi oleh siswa di katalog marketplace. Lanjutkan?"
        confirmLabel="Hapus Layanan"
        confirmColor="error"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
