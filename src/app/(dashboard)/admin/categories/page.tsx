"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { DynamicForm } from "@/components/dynamic-form";
import { getCategoryFormConfig } from "@/lib/forms/categoryForm";
import { useConfirm } from "@/hooks/useConfirm";
import { formatDate } from "@/lib/utils/format";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/category";
import type { Category } from "@/types/domain";

// MUI Icons
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CircularProgress from "@mui/material/CircularProgress";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "parents" | "subcategories" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [initialParentId, setInitialParentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { confirm } = useConfirm();

  const fetchCategoriesList = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
      setFeedbackMsg({
        type: "error",
        message: "Gagal memuat daftar kategori",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesList();
  }, [fetchCategoriesList]);

  // Parent Categories & Map
  const parentCategories = useMemo(() => {
    return categories.filter((c) => !c.parent_id);
  }, [categories]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const parents = categories.filter((c) => !c.parent_id).length;
    const subcategories = categories.filter((c) => !!c.parent_id).length;
    const active = categories.filter((c) => c.status === "active" || !c.status).length;
    return { total, parents, subcategories, active };
  }, [categories]);

  // Dynamic Form Configuration
  const categoryFormConfig = useMemo(() => {
    return getCategoryFormConfig({
      parentCategories,
      initialData: selectedCategory || (initialParentId ? { parent_id: initialParentId } : null),
      isEdit: modalMode === "edit",
    });
  }, [parentCategories, selectedCategory, initialParentId, modalMode]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Filter tab
      if (filterTab === "parents" && cat.parent_id) return false;
      if (filterTab === "subcategories" && !cat.parent_id) return false;
      if (filterTab === "active" && cat.status === "inactive") return false;
      if (filterTab === "inactive" && cat.status !== "inactive") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(q);
        const matchesSlug = cat.slug.toLowerCase().includes(q);
        const parentName = cat.parent_id ? categoryMap.get(cat.parent_id)?.toLowerCase() || "" : "";
        if (!matchesName && !matchesSlug && !parentName.includes(q)) return false;
      }

      return true;
    });
  }, [categories, filterTab, searchQuery, categoryMap]);

  // Open Create Modal
  const handleOpenCreate = (parentId?: string) => {
    setModalMode("create");
    setSelectedCategory(null);
    setInitialParentId(parentId || "");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (category: Category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setInitialParentId("");
    setIsModalOpen(true);
  };

  // Handle Form Submit using DynamicForm
  const handleFormSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      const name = String(data.name || "").trim();
      const slug = String(data.slug || "").trim();
      const parent_id = data.parent_id ? String(data.parent_id) : undefined;
      const status = String(data.status || "active");

      if (modalMode === "create") {
        await createCategory({
          name,
          slug,
          parent_id,
          status,
        });
        setFeedbackMsg({
          type: "success",
          message: `Kategori "${name}" berhasil dibuat!`,
        });
      } else if (selectedCategory) {
        await updateCategory(selectedCategory.id, {
          name,
          slug,
          parent_id,
          status,
        });
        setFeedbackMsg({
          type: "success",
          message: `Kategori "${name}" berhasil diperbarui!`,
        });
      }

      setIsModalOpen(false);
      fetchCategoriesList();
    } catch (err: any) {
      console.error("Failed to save category", err);
      setFeedbackMsg({
        type: "error",
        message: err.response?.data?.error?.message || "Gagal menyimpan data kategori",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (category: Category) => {
    const isConfirmed = await confirm({
      title: "Hapus Kategori?",
      message: `Apakah Anda yakin ingin menghapus kategori "${category.name}"? Pastikan tidak ada layanan yang terhubung dengan kategori ini.`,
      confirmLabel: "Ya, Hapus",
      confirmColor: "error",
    });

    if (!isConfirmed) return;

    try {
      await deleteCategory(category.id);
      setFeedbackMsg({
        type: "success",
        message: `Kategori "${category.name}" berhasil dihapus.`,
      });
      fetchCategoriesList();
    } catch (err: any) {
      console.error("Failed to delete category", err);
      setFeedbackMsg({
        type: "error",
        message: err.response?.data?.error?.message || "Gagal menghapus kategori. Kategori mungkin sedang digunakan.",
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Manajemen Kategori"
        description="Kelola kategori induk, subkategori, serta hierarki taksonomi marketplace Naik Kelas"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchCategoriesList}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container rounded-[10px] text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors shadow-xs"
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
              <span>Muat Ulang</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenCreate()}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-[10px] text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              <span>Tambah Kategori</span>
            </button>
          </div>
        }
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
          title="Total Kategori"
          value={stats.total}
          icon={<CategoryOutlinedIcon sx={{ fontSize: 24 }} />}
          color="primary"
          subtitle="Semua kategori & subkategori"
        />
        <StatCard
          title="Kategori Induk"
          value={stats.parents}
          icon={<FolderOutlinedIcon sx={{ fontSize: 24 }} />}
          color="secondary"
          subtitle="Kategori tingkat utama"
        />
        <StatCard
          title="Subkategori"
          value={stats.subcategories}
          icon={<AccountTreeOutlinedIcon sx={{ fontSize: 24 }} />}
          color="tertiary"
          subtitle="Kategori cabang/anak"
        />
        <StatCard
          title="Kategori Aktif"
          value={stats.active}
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 24 }} />}
          color="success"
          subtitle="Tampil di pencarian siswa"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-outline-variant/20">
          {[
            { id: "all", label: "Semua Kategori", count: stats.total },
            { id: "parents", label: "Kategori Induk", count: stats.parents },
            { id: "subcategories", label: "Subkategori", count: stats.subcategories },
            { id: "active", label: "Aktif", count: stats.active },
            { id: "inactive", label: "Nonaktif" },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all rounded-[10px] flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
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

        {/* Search input */}
        <div className="relative w-full">
          <SearchIcon
            sx={{ fontSize: 18 }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Cari berdasarkan nama kategori, slug, atau kategori induk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredCategories.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Tidak ada kategori ditemukan"
              description="Belum ada data kategori yang sesuai dengan filter atau kriteria pencarian Anda."
              icon={<CategoryOutlinedIcon sx={{ fontSize: 40 }} />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-bold">
                  <th className="py-3 px-4">Nama Kategori</th>
                  <th className="py-3 px-4">Slug URL</th>
                  <th className="py-3 px-4">Tingkat Hierarki</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredCategories.map((category) => {
                  const isSub = Boolean(category.parent_id);
                  const parentName = category.parent_id ? categoryMap.get(category.parent_id) : null;

                  return (
                    <tr
                      key={category.id}
                      className="hover:bg-surface-container/50 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {isSub ? (
                            <div className="flex items-center text-on-surface-variant pl-4">
                              <SubdirectoryArrowRightIcon sx={{ fontSize: 16 }} className="text-outline" />
                              <div className="p-1.5 bg-surface-container rounded-[8px] text-tertiary ml-1">
                                <AccountTreeOutlinedIcon sx={{ fontSize: 14 }} />
                              </div>
                            </div>
                          ) : (
                            <div className="p-1.5 bg-primary/10 rounded-[8px] text-primary">
                              <FolderOutlinedIcon sx={{ fontSize: 16 }} />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-on-surface text-xs block">
                              {category.name}
                            </span>
                            {parentName && (
                              <span className="text-[10px] text-on-surface-variant">
                                Bagian dari: <strong className="text-on-surface">{parentName}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant">
                        /{category.slug}
                      </td>

                      {/* Hierarchy Level */}
                      <td className="py-3 px-4">
                        {isSub ? (
                          <span className="px-2 py-0.5 bg-surface-container text-tertiary font-semibold rounded-[8px] text-[10px]">
                            Subkategori
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded-[8px] text-[10px]">
                            Kategori Induk
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={category.status || "active"}
                          label={category.status === "inactive" ? "Nonaktif" : "Aktif"}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isSub && (
                            <button
                              type="button"
                              onClick={() => handleOpenCreate(category.id)}
                              className="px-2 py-1 bg-surface-container text-primary font-bold text-[11px] rounded-[8px] hover:bg-primary/10 transition-colors flex items-center gap-1"
                              title="Tambah Subkategori"
                            >
                              <AddIcon sx={{ fontSize: 13 }} />
                              <span>Subkategori</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(category)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-[8px] transition-colors"
                            title="Edit Kategori"
                          >
                            <EditOutlinedIcon sx={{ fontSize: 16 }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-[8px] transition-colors"
                            title="Hapus Kategori"
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
      </div>

      {/* Modal Dialog (Tambah / Edit Kategori dengan Dynamic Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          <div className="relative bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-[10px]">
                  <CategoryOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">
                    {modalMode === "create" ? "Tambah Kategori Baru" : "Edit Kategori"}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Atur nama, tautan slug, dan relasi hierarki kategori melalui Dynamic Form
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[8px] transition-colors"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Dynamic Form Engine */}
            <div className="pt-1">
              <DynamicForm
                key={selectedCategory ? `edit-${selectedCategory.id}` : `create-${initialParentId || "root"}`}
                config={categoryFormConfig}
                onSubmit={handleFormSubmit}
                isLoading={isSubmitting}
                hideSubmitButton={true}
                extraActions={
                  <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-on-surface bg-surface-container rounded-[10px] hover:bg-surface-variant transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 text-xs font-bold text-white bg-primary rounded-[10px] hover:bg-primary/90 transition-all shadow-xs flex items-center gap-1.5"
                    >
                      {isSubmitting && <CircularProgress size={14} color="inherit" />}
                      <span>{modalMode === "create" ? "Simpan Kategori" : "Perbarui Kategori"}</span>
                    </button>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
