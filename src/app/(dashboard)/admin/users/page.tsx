"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { DynamicForm } from "@/components/dynamic-form";
import { getUserCreateFormConfig, getUserEditFormConfig, getUserResetPasswordFormConfig } from "@/lib/forms/userForm";
import { useConfirm } from "@/hooks/useConfirm";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/utils/format";
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  updateAdminUserStatus,
  resetAdminUserPassword,
  type AdminUserListItem,
} from "@/lib/api/adminUser";

// MUI Icons
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CircularProgress from "@mui/material/CircularProgress";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return fallback;
  }
  const response = error.response;
  if (typeof response !== "object" || response === null || !("data" in response)) {
    return fallback;
  }
  const data = response.data;
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return fallback;
  }
  const apiError = data.error;
  if (typeof apiError === "object" && apiError !== null && "message" in apiError && typeof apiError.message === "string") {
    return apiError.message;
  }
  return fallback;
}

function AdminUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const debouncedQuery = useDebounce(searchQuery, 350);

  const roleParam = searchParams.get("role");
  const roleFilter = ["all", "student", "talent", "superadministrator", "suspended"].includes(roleParam || "")
    ? roleParam!
    : "all";
  const statusParam = searchParams.get("status");
  const statusFilter = ["all", "active", "suspended", "inactive"].includes(statusParam || "")
    ? statusParam!
    : "all";

  const updateFilter = (key: "role" | "status", value: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUserListItem | null>(null);

  // Reset Password Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<AdminUserListItem | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { confirm } = useConfirm();

  const fetchUsersList = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAdminUsers({
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        q: debouncedQuery.trim() || undefined,
        page,
        per_page: perPage,
      });
      setUsers(res.items || []);
      setTotal(res.total || 0);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setFeedbackMsg({
        type: "error",
        message: "Gagal memuat data pengguna",
      });
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, debouncedQuery, page, perPage]);

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const totalCount = total;
    const students = users.filter((u) => u.roles?.includes("student") || u.role === "student" || (!u.role && (!u.roles || u.roles.length === 0))).length;
    const talents = users.filter((u) => u.roles?.includes("talent") || u.role === "talent").length;
    const admins = users.filter((u) => u.roles?.includes("superadministrator") || u.role === "superadministrator").length;
    const suspended = users.filter((u) => u.status === "suspended").length;

    return { total: totalCount, students, talents, admins, suspended };
  }, [users, total]);

  // Dynamic Form Configurations
  const userCreateConfig = useMemo(() => getUserCreateFormConfig(), []);
  const userEditConfig = useMemo(() => {
    if (!selectedUserForEdit) return null;
    return getUserEditFormConfig({
      name: selectedUserForEdit.name,
      email: selectedUserForEdit.email,
      phone: selectedUserForEdit.phone,
      role: selectedUserForEdit.role === "talent" ? "talent" : "student",
    });
  }, [selectedUserForEdit]);
  const userResetPasswordConfig = useMemo(() => getUserResetPasswordFormConfig(), []);

  // Filtered Users (server filtered)
  const filteredUsers = users;

  // Action: Create User with DynamicForm
  const handleCreateSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      const name = String(data.name || "").trim();
      const email = String(data.email || "").trim();
      const phone = data.phone ? String(data.phone).trim() : undefined;
      const password = String(data.password || "");
      const role = (data.role || "student") as "student" | "talent";

      await createAdminUser({
        name,
        email,
        phone,
        password,
        role,
      });

      setFeedbackMsg({
        type: "success",
        message: `Pengguna ${name} (${role}) berhasil ditambahkan!`,
      });

      setIsCreateModalOpen(false);
      fetchUsersList();
    } catch (err: unknown) {
      console.error("Failed to create user", err);
      setFeedbackMsg({
        type: "error",
        message: getErrorMessage(err, "Gagal membuat pengguna baru"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: Record<string, unknown>): Promise<void> => {
    if (!selectedUserForEdit) return;
    try {
      setIsSubmitting(true);
      const updatedUser = await updateAdminUser(selectedUserForEdit.id, {
        name: String(data.name || "").trim(),
        email: String(data.email || "").trim(),
        phone: data.phone ? String(data.phone).trim() : undefined,
        role: (data.role || "student") as "student" | "talent",
      });
      setUsers((previousUsers) => previousUsers.map((user) => user.id === updatedUser.id ? updatedUser : user));
      setFeedbackMsg({ type: "success", message: `Data pengguna ${updatedUser.name} berhasil diperbarui.` });
      setIsEditModalOpen(false);
      setSelectedUserForEdit(null);
    } catch (err: unknown) {
      console.error("Failed to update user", err);
      setFeedbackMsg({ type: "error", message: getErrorMessage(err, "Gagal memperbarui pengguna") });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Toggle Status (Suspend / Activate)
  const handleToggleStatus = async (user: AdminUserListItem) => {
    const isCurrentlyActive = user.status === "active";
    const nextStatus = isCurrentlyActive ? "suspended" : "active";

    const isConfirmed = await confirm({
      title: isCurrentlyActive ? "Tangguhkan Akun Pengguna?" : "Aktifkan Kembali Akun?",
      message: isCurrentlyActive
        ? `Apakah Anda yakin ingin menangguhkan akun ${user.name}? Pengguna ini tidak akan dapat login atau melakukan transaksi hingga diaktifkan kembali.`
        : `Apakah Anda yakin ingin mengaktifkan kembali akun ${user.name}? Pengguna akan dapat mengakses platform secara normal.`,
      confirmLabel: isCurrentlyActive ? "Ya, Tangguhkan" : "Ya, Aktifkan",
      confirmColor: isCurrentlyActive ? "error" : "primary",
    });

    if (!isConfirmed) return;

    try {
      await updateAdminUserStatus(user.id, nextStatus);
      setFeedbackMsg({
        type: "success",
        message: `Status pengguna ${user.name} berhasil diubah menjadi ${nextStatus === "active" ? "Aktif" : "Ditangguhkan"}`,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    } catch (err: unknown) {
      console.error("Failed to update user status", err);
      setFeedbackMsg({
        type: "error",
        message: getErrorMessage(err, "Gagal memperbarui status pengguna"),
      });
    }
  };

  // Action: Reset Password with DynamicForm
  const handleResetPasswordSubmit = async (data: Record<string, unknown>) => {
    if (!selectedUserForReset) return;

    try {
      setIsSubmitting(true);
      const password = String(data.password || "");
      await resetAdminUserPassword(selectedUserForReset.id, password);

      setFeedbackMsg({
        type: "success",
        message: `Kata sandi untuk ${selectedUserForReset.name} berhasil diatur ulang!`,
      });
      setIsResetModalOpen(false);
      setSelectedUserForReset(null);
    } catch (err: unknown) {
      console.error("Failed to reset password", err);
      setFeedbackMsg({
        type: "error",
        message: getErrorMessage(err, "Gagal mengatur ulang kata sandi"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "superadministrator":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 13 }} />
            Superadmin
          </span>
        );
      case "talent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <BadgeOutlinedIcon sx={{ fontSize: 13 }} />
            Mentor / Talent
          </span>
        );
      case "student":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <SchoolOutlinedIcon sx={{ fontSize: 13 }} />
            Siswa (Student)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun siswa, mentor, dan administrator pada ekosistem Naik Kelas"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchUsersList}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container rounded-[10px] text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors shadow-xs"
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
              <span>Muat Ulang</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-[10px] text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              <span>Tambah Pengguna</span>
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
          title="Total Pengguna"
          value={stats.total}
          icon={<GroupOutlinedIcon sx={{ fontSize: 24 }} />}
          color="primary"
          subtitle="Semua akun pengguna terdaftar"
        />
        <StatCard
          title="Siswa (Student)"
          value={stats.students}
          icon={<SchoolOutlinedIcon sx={{ fontSize: 24 }} />}
          color="secondary"
          subtitle="Pengguna pencari bimbingan"
        />
        <StatCard
          title="Mentor (Talent)"
          value={stats.talents}
          icon={<BadgeOutlinedIcon sx={{ fontSize: 24 }} />}
          color="tertiary"
          subtitle="Penyedia kursus & layanan"
        />
        <StatCard
          title="Superadministrator"
          value={stats.admins}
          icon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 24 }} />}
          color="success"
          subtitle="Pengelola sistem platform"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40 shadow-xs space-y-4">
        {/* Role Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-outline-variant/20">
          {[
            { id: "all", label: "Semua Pengguna", count: stats.total },
            { id: "student", label: "Siswa", count: stats.students },
            { id: "talent", label: "Mentor / Talent", count: stats.talents },
            { id: "superadministrator", label: "Superadmin", count: stats.admins },
            { id: "suspended", label: "Ditangguhkan", count: stats.suspended },
          ].map((tab) => {
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateFilter("role", tab.id)}
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
                        : tab.id === "suspended" && tab.count > 0
                        ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
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

        {/* Search and Status Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <SearchIcon
              sx={{ fontSize: 18 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="text"
              placeholder="Cari berdasarkan nama pengguna, email, nomor telepon, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="w-full sm:w-56 flex items-center gap-2">
            <FilterListIcon sx={{ fontSize: 18 }} className="text-on-surface-variant shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="suspended">Ditangguhkan</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredUsers.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Tidak ada pengguna ditemukan"
              description="Belum ada data pengguna yang cocok dengan filter atau kata kunci pencarian Anda."
              icon={<GroupOutlinedIcon sx={{ fontSize: 40 }} />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-bold">
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Kontak / Identitas</th>
                  <th className="py-3 px-4">Peran Akses</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4">Tanggal Bergabung</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-container/50 transition-colors"
                  >
                    {/* Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="w-9 h-9 rounded-[10px] bg-surface-container text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-outline-variant/30">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-on-surface line-clamp-1">{user.name}</p>
                          <span className="text-[11px] text-on-surface-variant">
                            ID: {user.id?.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5 text-on-surface font-medium">
                          <EmailOutlinedIcon sx={{ fontSize: 13 }} className="text-on-surface-variant" />
                          <span>{user.email}</span>
                        </p>
                        {user.phone ? (
                          <p className="flex items-center gap-1.5 text-on-surface-variant text-[11px]">
                            <PhoneOutlinedIcon sx={{ fontSize: 13 }} />
                            <span>{user.phone}</span>
                          </p>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant/60">-</span>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((r) => (
                            <span key={r}>{getRoleBadge(r)}</span>
                          ))
                        ) : (
                          getRoleBadge(user.role as string)
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={user.status}
                        label={
                          user.status === "active"
                            ? "Aktif"
                            : user.status === "suspended"
                            ? "Ditangguhkan"
                            : "Nonaktif"
                        }
                      />
                    </td>

                    {/* Join Date */}
                    <td className="py-3 px-4 text-on-surface-variant">
                      {formatDate(user.created_at || user.joinDate || "")}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit User */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForEdit(user);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-primary rounded-[8px] hover:bg-primary/10 transition-colors"
                          title="Edit Data Pengguna"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </button>

                        {/* Reset Password */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForReset(user);
                            setIsResetModalOpen(true);
                          }}
                          className="px-2 py-1 bg-surface-container text-primary font-bold text-xs rounded-[8px] hover:bg-primary/10 transition-colors flex items-center gap-1"
                          title="Reset Password Pengguna"
                        >
                          <LockResetOutlinedIcon sx={{ fontSize: 14 }} />
                          <span>Reset Sandi</span>
                        </button>

                        {/* Suspend / Activate Toggle */}
                        {user.role !== "superadministrator" && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-[8px] transition-colors ${
                              user.status === "active"
                                ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            }`}
                            title={user.status === "active" ? "Tangguhkan Akun" : "Aktifkan Akun"}
                          >
                            {user.status === "active" ? (
                              <BlockOutlinedIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                            )}
                          </button>
                        )}
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

      {/* Modal: Edit Pengguna */}
      {isEditModalOpen && selectedUserForEdit && userEditConfig && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsEditModalOpen(false)}
          />
          <div className="relative bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-[10px]">
                  <EditOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Edit Pengguna</h3>
                  <p className="text-[11px] text-on-surface-variant">Perbarui data dan peran pengguna.</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[8px] transition-colors"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
            <DynamicForm
              key={`edit-user-form-${selectedUserForEdit.id}`}
              config={userEditConfig}
              onSubmit={handleEditSubmit}
              isLoading={isSubmitting}
              hideSubmitButton={true}
              extraActions={
                <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsEditModalOpen(false)}
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
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              }
            />
          </div>
        </div>
      )}

      {/* Modal: Tambah Pengguna Baru dengan Dynamic Form */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
          />

          <div className="relative bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-[10px]">
                  <AddIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Tambah Pengguna Baru</h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Daftarkan akun siswa, mentor, atau administrator melalui Dynamic Form
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[8px] transition-colors"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Dynamic Form Engine */}
            <div className="pt-1">
              <DynamicForm
                key="create-user-form"
                config={userCreateConfig}
                onSubmit={handleCreateSubmit}
                isLoading={isSubmitting}
                hideSubmitButton={true}
                extraActions={
                  <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsCreateModalOpen(false)}
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
                      <span>Simpan Pengguna</span>
                    </button>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reset Kata Sandi dengan Dynamic Form */}
      {isResetModalOpen && selectedUserForReset && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsResetModalOpen(false)}
          />

          <div className="relative bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/40 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 rounded-[10px]">
                  <LockResetOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Reset Kata Sandi</h3>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1">
                    Untuk: {selectedUserForReset.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[8px] transition-colors"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-[10px] text-[11px] text-on-surface-variant">
              Akun Pengguna: <strong className="text-on-surface">{selectedUserForReset.email}</strong>
            </div>

            <div className="pt-1">
              <DynamicForm
                key={`reset-password-${selectedUserForReset.id}`}
                config={userResetPasswordConfig}
                onSubmit={handleResetPasswordSubmit}
                isLoading={isSubmitting}
                hideSubmitButton={true}
                extraActions={
                  <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsResetModalOpen(false)}
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
                      <span>Simpan Kata Sandi</span>
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

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-on-surface-variant">Memuat pengguna...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
