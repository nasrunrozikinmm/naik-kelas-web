"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { formatDate } from "@/lib/utils/format";
import type { UserListItem } from "@/types/domain";

// MUI Icons
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(endpoints.admin.users);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun siswa, mentor, dan administrator pada sistem Naik Kelas."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-container rounded-xl text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors shadow-xs"
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
              <span>Muat Ulang</span>
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs">
              <AddIcon sx={{ fontSize: 18 }} />
              <span>Tambah User</span>
            </button>
          </div>
        }
      />

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-low/30">
          <div className="relative w-full sm:w-80">
            <SearchIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-xs text-on-surface-variant self-end sm:self-center">
            Total: <strong>{filteredUsers.length}</strong> pengguna
          </span>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Tanggal Bergabung
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-6">
                    <TableSkeleton rows={4} cols={4} />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-on-surface-variant text-xs">
                    Tidak ada data pengguna yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {user.name?.[0] || "U"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-on-surface text-xs sm:text-sm truncate">{user.name}</p>
                          <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant">
                      {formatDate(user.created_at || user.joinDate || "")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        aria-label="Opsi User"
                        className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-lg transition-colors"
                      >
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
