"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PageHeader,
  StatCard,
  StatusBadge,
  EmptyState,
  TableSkeleton,
  Pagination,
} from "@/components/common";
import { useConfirm } from "@/hooks/useConfirm";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getMyCatalogs, getMyCatalogStats, deleteCatalog } from "@/lib/api/catalog";
import {
  CATALOG_STATUS_TABS,
  getCatalogTypeLabel,
  getCatalogTypeIcon,
  getCatalogStatusLabel,
} from "@/lib/utils/catalog";
import type { Catalog, CatalogStats } from "@/types/domain";

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

function TalentCatalogsContent() {
  const { confirm } = useConfirm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
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

  const statusParam = searchParams.get("status");
  const statusFilter = CATALOG_STATUS_TABS.some((tab) => tab.id === statusParam)
    ? statusParam!
    : "all";

  const fetchStats = useCallback(async () => {
    try {
      const s = await getMyCatalogStats();
      if (s) setStats(s);
    } catch (error) {
      console.error("Failed to fetch my catalog stats", error);
    }
  }, []);

  const fetchCatalogs = useCallback(async () => {
    try {
      setLoading(true);
      const [res] = await Promise.all([
        getMyCatalogs({
          status: statusFilter === "all" ? undefined : statusFilter,
          type: typeFilter === "all" ? undefined : typeFilter,
          q: debouncedQuery.trim() || undefined,
          page,
          per_page: perPage,
        }),
        fetchStats(),
      ]);
      setCatalogs(res.items || []);
      setTotal(res.total || 0);
    } catch (error) {
      console.error("Failed to fetch talent catalogs", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, debouncedQuery, page, perPage, fetchStats]);

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, typeFilter]);

  const handleStatusChange = (status: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  const handleDelete = async (catalog: Catalog) => {
    const isConfirmed = await confirm({
      title: "Hapus Layanan?",
      message: (
        <span>
          Apakah Anda yakin ingin menghapus layanan{" "}
          <strong>&quot;{catalog.title}&quot;</strong>? Layanan yang dihapus
          tidak akan dapat diakses lagi oleh siswa di katalog marketplace.
        </span>
      ),
      confirmLabel: "Hapus Layanan",
      confirmColor: "error",
    });

    if (!isConfirmed) return;

    try {
      await deleteCatalog(catalog.id);
      fetchCatalogs();
    } catch (error) {
      console.error("Failed to delete catalog", error);
    }
  };

  const filteredCatalogs = catalogs;

  // Statistics
  const totalCount = total;
  const activeCount = catalogs.filter(
    (c) => c.status === "published" || c.status === "active",
  ).length;
  const pendingCount = catalogs.filter(
    (c) => c.status === "pending_review",
  ).length;
  const draftCount = catalogs.filter(
    (c) => c.status === "draft" || c.status === "rejected",
  ).length;

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
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white! rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
            >
              <AddIcon sx={{ fontSize: 18, color: "#ffffff" }} />
              <span>Buat Layanan Baru</span>
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Layanan"
          value={stats.total}
          subtitle="Katalog terdaftar"
          color="primary"
          icon={<LayersOutlinedIcon sx={{ fontSize: 22 }} />}
        />
        <StatCard
          title="Layanan Aktif"
          value={stats.active}
          subtitle="Tampil di marketplace"
          color="success"
          icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
        />
        <StatCard
          title="Menunggu Review"
          value={stats.pending}
          subtitle="Sedang ditinjau admin"
          color="warning"
          icon={<HourglassEmptyOutlinedIcon sx={{ fontSize: 22 }} />}
        />
        <StatCard
          title="Draft / Ditolak"
          value={stats.rejected_or_archived}
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
            {CATALOG_STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleStatusChange(tab.id)}
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
              <SearchIcon
                sx={{ fontSize: 18 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
              />
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
            <TableSkeleton rows={5} cols={5} />
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
                searchQuery ||
                statusFilter !== "all" ||
                typeFilter !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      handleStatusChange("all");
                      setTypeFilter("all");
                    }}
                    className="px-4 py-2 bg-surface-container rounded-xl text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors"
                  >
                    Reset Filter
                  </button>
                ) : (
                  <Link
                    href="/talent/catalogs/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white! rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <AddIcon sx={{ fontSize: 16, color: "#ffffff" }} />
                    <span>Buat Layanan Baru</span>
                  </Link>
                )
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
                    Status
                  </th>
                  <th className="px-6 py-3.5 font-bold text-on-surface-variant uppercase tracking-wider">
                    Dibuat Pada
                  </th>
                  <th className="px-6 py-3.5 font-bold text-on-surface-variant uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredCatalogs.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-low/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex items-center justify-center shrink-0 border border-outline-variant/30 overflow-hidden relative">
                          <span className="text-on-surface flex items-center justify-center">
                            {getCatalogTypeIcon(item.type)}
                          </span>
                          {item.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                            {item.description || "Tidak ada deskripsi"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-on-surface">
                          {getCatalogTypeLabel(item.type)}
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                          {item.category?.name || "Kategori Umum"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={item.status}
                        label={getCatalogStatusLabel(item.status)}
                      />
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/catalog/${item.id}`}
                          target="_blank"
                          title="Lihat Pratinjau Publik"
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </Link>
                        <Link
                          href={`/talent/catalogs/${item.id}/edit`}
                          title="Edit Layanan"
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Hapus Layanan"
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
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
    </div>
  );
}

export default function TalentCatalogsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/40 shadow-xs flex items-center justify-center">
          <span className="text-xs text-on-surface-variant">
            Memuat layanan...
          </span>
        </div>
      }
    >
      <TalentCatalogsContent />
    </Suspense>
  );
}
