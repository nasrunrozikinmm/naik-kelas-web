"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { useConfirm } from "@/hooks/useConfirm";
import { formatDate } from "@/lib/utils/format";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { TalentApprovalItem, TalentKYCDocuments } from "@/types/domain";

// MUI Icons
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CircularProgress from "@mui/material/CircularProgress";

export default function TalentApprovalPage() {
  const [requests, setRequests] = useState<TalentApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDrawer, setSelectedDrawer] = useState<TalentApprovalItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRejection, setShowRejection] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { confirm } = useConfirm();

  // Fetch talent approval applications
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(endpoints.admin.talentApprovals + "?status=all");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch approvals", error);
      setFeedbackMsg({
        type: "error",
        message: "Gagal memuat antrean persetujuan talent",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(
      (r) => r.verification_status === "pending" || !r.verification_status
    ).length;
    const verified = requests.filter(
      (r) => r.verification_status === "verified" || r.verification_status === "approved"
    ).length;
    const rejected = requests.filter(
      (r) => r.verification_status === "rejected"
    ).length;

    return { total, pending, verified, rejected };
  }, [requests]);

  // Unique expertise list for dropdown filter
  const expertiseList = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.expertise?.trim()) {
        set.add(r.expertise.trim());
      }
    });
    return Array.from(set);
  }, [requests]);

  // Filtered requests based on status, expertise, and search query
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "pending") {
          if (item.verification_status !== "pending" && item.verification_status) {
            return false;
          }
        } else if (statusFilter === "verified") {
          if (item.verification_status !== "verified" && item.verification_status !== "approved") {
            return false;
          }
        } else if (item.verification_status !== statusFilter) {
          return false;
        }
      }

      // Expertise filter
      if (expertiseFilter !== "all" && item.expertise !== expertiseFilter) {
        return false;
      }

      // Search query filter (name, user_id, bio, or expertise)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.display_name?.toLowerCase().includes(query);
        const matchesId = item.user_id?.toLowerCase().includes(query);
        const matchesExpertise = item.expertise?.toLowerCase().includes(query);
        const matchesBio = item.bio?.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesExpertise && !matchesBio) {
          return false;
        }
      }

      return true;
    });
  }, [requests, statusFilter, expertiseFilter, searchQuery]);

  // Helper to parse KYC documents JSON
  const parseDocuments = (docStr?: string): TalentKYCDocuments | null => {
    if (!docStr) return null;
    try {
      return typeof docStr === "string" ? JSON.parse(docStr) : docStr;
    } catch {
      return null;
    }
  };

  // Action: Approve talent
  const handleApprove = async (talent: TalentApprovalItem) => {
    const isConfirmed = await confirm({
      title: "Setujui Calon Talent?",
      message: `Apakah Anda yakin ingin memverifikasi profil ${talent.display_name}? Pengguna akan menerima hak akses Talent untuk mempublikasikan layanan di marketplace Naik Kelas.`,
      confirmLabel: "Ya, Setujui & Verifikasi",
      confirmColor: "primary",
    });

    if (!isConfirmed) return;

    try {
      setIsActionLoading(true);
      await apiClient.post(endpoints.admin.approveTalent(talent.id));
      setFeedbackMsg({
        type: "success",
        message: `Akun talent ${talent.display_name} berhasil diverifikasi!`,
      });

      // Update in local state
      setRequests((prev) =>
        prev.map((r) => (r.id === talent.id ? { ...r, verification_status: "verified" } : r))
      );

      if (selectedDrawer?.id === talent.id) {
        setSelectedDrawer((prev) => (prev ? { ...prev, verification_status: "verified" } : null));
      }
    } catch (error) {
      console.error("Failed to approve talent", error);
      setFeedbackMsg({
        type: "error",
        message: "Gagal menyetujui akun talent",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Reject talent
  const handleReject = async (talent: TalentApprovalItem) => {
    try {
      setIsActionLoading(true);
      await apiClient.post(endpoints.admin.rejectTalent(talent.id), {
        reason: rejectReason || "Dokumen atau kualifikasi belum memenuhi standar Naik Kelas.",
      });

      setFeedbackMsg({
        type: "success",
        message: `Permohonan talent ${talent.display_name} ditolak.`,
      });

      setRequests((prev) =>
        prev.map((r) => (r.id === talent.id ? { ...r, verification_status: "rejected" } : r))
      );

      if (selectedDrawer?.id === talent.id) {
        setSelectedDrawer((prev) => (prev ? { ...prev, verification_status: "rejected" } : null));
      }
      setShowRejection(false);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject talent", error);
      setFeedbackMsg({
        type: "error",
        message: "Gagal menolak permohonan talent",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getVerificationLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "verified":
      case "approved":
        return "Terverifikasi";
      case "rejected":
        return "Ditolak";
      case "pending":
      default:
        return "Menunggu Review";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Persetujuan Mentor & Talent"
        description="Verifikasi kualifikasi, dokumen KYC, dan kurikulum calon mentor Naik Kelas"
        action={
          <button
            type="button"
            onClick={fetchRequests}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container rounded-[10px] text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors shadow-xs"
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
            <span>Muat Ulang</span>
          </button>
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
          title="Total Pendaftar"
          value={stats.total}
          icon={<GroupOutlinedIcon sx={{ fontSize: 24 }} />}
          color="primary"
          subtitle="Semua calon mentor & talent"
        />
        <StatCard
          title="Menunggu Review"
          value={stats.pending}
          icon={<HourglassEmptyIcon sx={{ fontSize: 24 }} />}
          color="warning"
          subtitle="Perlu verifikasi KYC"
        />
        <StatCard
          title="Terverifikasi"
          value={stats.verified}
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 24 }} />}
          color="success"
          subtitle="Hak akses talent aktif"
        />
        <StatCard
          title="Ditolak / Revisi"
          value={stats.rejected}
          icon={<CancelOutlinedIcon sx={{ fontSize: 24 }} />}
          color="secondary"
          subtitle="Dokumen belum sesuai"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-outline-variant/20">
          {[
            { id: "all", label: "Semua", count: stats.total },
            { id: "pending", label: "Menunggu Review", count: stats.pending },
            { id: "verified", label: "Terverifikasi", count: stats.verified },
            { id: "rejected", label: "Ditolak", count: stats.rejected },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
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
                        : tab.id === "pending"
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

        {/* Search & Expertise Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <SearchIcon
              sx={{ fontSize: 18 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="text"
              placeholder="Cari berdasarkan nama calon mentor, keahlian, atau user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Expertise Dropdown */}
          <div className="w-full sm:w-64 flex items-center gap-2">
            <FilterListIcon sx={{ fontSize: 18 }} className="text-on-surface-variant shrink-0" />
            <select
              value={expertiseFilter}
              onChange={(e) => setExpertiseFilter(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="all">Semua Bidang Keahlian</option>
              {expertiseList.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Talent Approvals Table Container */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredRequests.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Tidak ada calon mentor ditemukan"
              description="Belum ada pendaftaran mentor yang sesuai dengan filter atau kriteria pencarian saat ini."
              icon={<GroupOutlinedIcon sx={{ fontSize: 40 }} />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-bold">
                  <th className="py-3 px-4">Calon Mentor / Talent</th>
                  <th className="py-3 px-4">Bidang Keahlian</th>
                  <th className="py-3 px-4">Kelengkapan Dokumen KYC</th>
                  <th className="py-3 px-4">Status Verifikasi</th>
                  <th className="py-3 px-4">Tgl Pengajuan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredRequests.map((talent) => {
                  const docs = parseDocuments(talent.documents);
                  const hasKtp = Boolean(docs?.ktp_url);
                  const hasIjazah = Boolean(docs?.ijazah_url);

                  return (
                    <tr
                      key={talent.id}
                      className="hover:bg-surface-container/50 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 max-w-xs">
                          <div className="w-9 h-9 rounded-[10px] bg-surface-container text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-outline-variant/30">
                            {talent.display_name?.charAt(0)?.toUpperCase() || "T"}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-on-surface line-clamp-1">
                              {talent.display_name}
                            </p>
                            <span className="text-[11px] text-on-surface-variant">
                              ID: {talent.user_id?.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Expertise */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-surface-container text-primary rounded-[10px] text-xs font-bold inline-block">
                          {talent.expertise || "Umum"}
                        </span>
                      </td>

                      {/* KYC Documents status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[10px] text-[11px] font-semibold ${
                              hasKtp
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            <DescriptionOutlinedIcon sx={{ fontSize: 13 }} />
                            KTP {hasKtp ? "✓" : "-"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[10px] text-[11px] font-semibold ${
                              hasIjazah
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            <SchoolOutlinedIcon sx={{ fontSize: 13 }} />
                            Ijazah {hasIjazah ? "✓" : "-"}
                          </span>
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={talent.verification_status || "pending"}
                          label={getVerificationLabel(talent.verification_status)}
                        />
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-4 text-on-surface-variant">
                        {formatDate(talent.created_at)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDrawer(talent);
                              setShowRejection(false);
                            }}
                            className="px-2.5 py-1.5 bg-surface-container text-primary font-bold text-xs rounded-[10px] hover:bg-primary/10 transition-colors flex items-center gap-1"
                            title="Detail & Verifikasi"
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                            <span>Verifikasi</span>
                          </button>

                          {talent.verification_status !== "verified" &&
                            talent.verification_status !== "approved" && (
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleApprove(talent)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-[10px] transition-colors"
                                title="Setujui Langsung"
                              >
                                <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                              </button>
                            )}
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
                      Detail Verifikasi Talent
                    </span>
                    <StatusBadge
                      status={selectedDrawer.verification_status || "pending"}
                      label={getVerificationLabel(selectedDrawer.verification_status)}
                    />
                  </div>
                  <h2 className="text-base font-bold text-on-surface line-clamp-1">
                    {selectedDrawer.display_name}
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
                {/* Meta Bento Card */}
                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-3">
                  <p className="text-xs font-bold text-on-surface flex items-center gap-2">
                    <PersonOutlineIcon sx={{ fontSize: 16 }} className="text-primary" />
                    <span>Profil & Parameter Kualifikasi</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Nama Lengkap</span>
                      <span className="font-bold text-on-surface">{selectedDrawer.display_name}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Bidang Keahlian</span>
                      <span className="font-bold text-primary">{selectedDrawer.expertise || "Umum"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Pendidikan Terakhir</span>
                      <span className="font-bold text-on-surface">
                        {selectedDrawer.education_level || "S1 / Pendidikan Terkait"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Pengalaman Mengajar</span>
                      <span className="font-bold text-on-surface">
                        {selectedDrawer.experience_years ? `${selectedDrawer.experience_years} Tahun` : "1+ Tahun"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">User ID Pengguna</span>
                      <span className="font-mono text-[11px] text-on-surface">{selectedDrawer.user_id}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Tgl Pendaftaran</span>
                      <span className="font-bold text-on-surface">{formatDate(selectedDrawer.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Bio / Description Bento Card */}
                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-2">
                  <p className="text-xs font-bold text-on-surface">Deskripsi / Bio Calon Mentor</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {selectedDrawer.bio || "Tidak ada deskripsi singkat yang dicantumkan."}
                  </p>
                </div>

                {/* Documents KYC Bento Card */}
                {(() => {
                  const docs = parseDocuments(selectedDrawer.documents);
                  return (
                    <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-3">
                      <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <DescriptionOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />
                        <span>Verifikasi Dokumen KYC (MinIO Object Storage)</span>
                      </p>

                      <div className="space-y-2.5">
                        {/* KTP */}
                        <div>
                          <p className="text-[11px] font-bold text-on-surface mb-1">Kartu Tanda Penduduk (KTP):</p>
                          {docs?.ktp_url ? (
                            <a
                              href={docs.ktp_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-surface-container rounded-[10px] border border-outline-variant/40 hover:border-primary transition-all text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <DescriptionOutlinedIcon sx={{ fontSize: 20 }} className="text-primary" />
                                <div>
                                  <span className="font-bold text-on-surface block">
                                    {docs.ktp_name || "KTP_Identitas.pdf"}
                                  </span>
                                  <span className="text-[10px] text-emerald-600 font-semibold">
                                    Tersimpan aman di MinIO
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-primary font-bold text-xs">
                                <span>Buka Dokumen</span>
                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                              </div>
                            </a>
                          ) : (
                            <div className="p-3 bg-surface-container rounded-[10px] border border-outline-variant/30 text-xs text-on-surface-variant italic">
                              Dokumen KTP belum diunggah oleh talent.
                            </div>
                          )}
                        </div>

                        {/* Ijazah */}
                        <div>
                          <p className="text-[11px] font-bold text-on-surface mb-1">Ijazah Terakhir / Sertifikat:</p>
                          {docs?.ijazah_url ? (
                            <a
                              href={docs.ijazah_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-surface-container rounded-[10px] border border-outline-variant/40 hover:border-secondary transition-all text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <SchoolOutlinedIcon sx={{ fontSize: 20 }} className="text-secondary" />
                                <div>
                                  <span className="font-bold text-on-surface block">
                                    {docs.ijazah_name || "Ijazah_Terakhir.pdf"}
                                  </span>
                                  <span className="text-[10px] text-emerald-600 font-semibold">
                                    Tersimpan aman di MinIO
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-secondary font-bold text-xs">
                                <span>Buka Dokumen</span>
                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                              </div>
                            </a>
                          ) : (
                            <div className="p-3 bg-surface-container rounded-[10px] border border-outline-variant/30 text-xs text-on-surface-variant italic">
                              Dokumen Ijazah belum diunggah oleh talent.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Portfolio link */}
                {selectedDrawer.portfolio && (
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-2">
                    <p className="text-xs font-bold text-on-surface">Tautan Portofolio</p>
                    <a
                      href={selectedDrawer.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-surface-container rounded-[10px] border border-outline-variant/30 hover:border-primary transition-all text-xs"
                    >
                      <span className="font-semibold text-primary truncate max-w-[320px]">
                        {selectedDrawer.portfolio}
                      </span>
                      <OpenInNewIcon sx={{ fontSize: 16 }} className="text-on-surface-variant" />
                    </a>
                  </div>
                )}

                {/* Rejection Form Box */}
                {showRejection && (
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900 space-y-3">
                    <label className="text-xs font-bold text-red-700 dark:text-red-400 block">
                      Alasan Penolakan / Catatan Revisi:
                    </label>
                    <textarea
                      className="w-full bg-surface border border-red-300 dark:border-red-800 rounded-[10px] p-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500/20 text-on-surface h-24"
                      placeholder="Tuliskan catatan mengapa dokumen atau data profil belum memenuhi syarat..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleReject(selectedDrawer)}
                      className="w-full py-2.5 bg-red-600 text-white font-bold rounded-[10px] text-xs hover:bg-red-700 transition-colors shadow-xs"
                    >
                      Kirim Penolakan
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer Action Bar */}
              <div className="p-6 border-t border-outline-variant/40 bg-surface-container-low flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejection(!showRejection)}
                  className="px-4 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-[10px] transition-colors"
                >
                  {showRejection ? "Batal Tolak" : "Tolak Verifikasi"}
                </button>

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleApprove(selectedDrawer)}
                  className="px-5 py-2.5 text-xs font-bold bg-primary text-white hover:bg-primary/90 rounded-[10px] transition-all shadow-xs flex items-center gap-1.5"
                >
                  {isActionLoading && <CircularProgress size={14} color="inherit" />}
                  <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                  <span>Setujui Akun Talent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
