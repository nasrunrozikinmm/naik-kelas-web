"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { useConfirm } from "@/hooks/useConfirm";
import { formatDate } from "@/lib/utils/format";
import type { TalentApprovalItem } from "@/types/domain";

// MUI Icons
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import VerifiedIcon from "@mui/icons-material/Verified";
import GavelIcon from "@mui/icons-material/Gavel";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function TalentApprovalPage() {
  const [requests, setRequests] = useState<TalentApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDrawer, setSelectedDrawer] = useState<TalentApprovalItem | null>(null);
  const [showRejection, setShowRejection] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { confirm } = useConfirm();

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(endpoints.admin.talentApprovals + "?status=pending");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch approvals", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async () => {
    if (!selectedDrawer) return;
    const isConfirmed = await confirm({
      title: "Setujui Calon Talent?",
      message: `Apakah Anda yakin ingin memverifikasi ${selectedDrawer.display_name}? Pengguna akan menerima hak akses Talent untuk mempublikasikan layanan di Naik Kelas.`,
      confirmLabel: "Ya, Setujui",
      confirmColor: "primary"
    });
    if (!isConfirmed) return;

    try {
      await apiClient.post(endpoints.admin.approveTalent(selectedDrawer.id));
      setSelectedDrawer(null);
      fetchRequests();
    } catch (error) {
      console.error("Failed to approve", error);
    }
  };

  const handleReject = async () => {
    if (!selectedDrawer) return;
    try {
      await apiClient.post(endpoints.admin.rejectTalent(selectedDrawer.id), { reason: rejectReason });
      setSelectedDrawer(null);
      setShowRejection(false);
      setRejectReason("");
      fetchRequests();
    } catch (error) {
      console.error("Failed to reject", error);
    }
  };

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Persetujuan Mentor & Talent"
        description="Verifikasi kualifikasi, dokumen KYC, dan kurikulum calon mentor Naik Kelas."
        action={
          <button
            onClick={fetchRequests}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container rounded-xl text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors shadow-xs"
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
            <span>Muat Ulang</span>
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Menunggu Review"
          value={requests.length.toString()}
          subtitle="Verifikasi tertunda"
          color="warning"
          icon={<HourglassEmptyIcon sx={{ fontSize: 24 }} />}
        />
        <StatCard
          title="Terverifikasi Bulan Ini"
          value="48"
          subtitle="+12 dari bulan lalu"
          color="success"
          icon={<VerifiedIcon sx={{ fontSize: 24 }} />}
        />
        <StatCard
          title="Ditolak / Perlu Revisi"
          value="3"
          subtitle="Dokumen tidak lengkap"
          color="error"
          icon={<GavelIcon sx={{ fontSize: 24 }} />}
        />
      </div>

      {/* Talent Queue Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
          <div>
            <h3 className="text-base font-bold text-on-surface">Antrean Verifikasi Dokumen</h3>
            <p className="text-xs text-on-surface-variant">Klik baris untuk membuka panel peninjauan berkas.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Nama Talent
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Keahlian
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Tgl Daftar
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6">
                    <TableSkeleton rows={3} cols={5} />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-on-surface-variant text-xs">
                    Tidak ada antrean verifikasi saat ini.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-surface-container-low/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedDrawer(req);
                      setShowRejection(false);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {req.display_name?.charAt(0) || "T"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-on-surface text-xs sm:text-sm truncate">{req.display_name}</p>
                          <p className="text-[11px] text-on-surface-variant truncate">ID: {req.user_id?.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                        {req.expertise || "Pendidikan"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.verification_status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-xs">
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Drawer: Detail Review */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] bg-surface shadow-2xl z-50 transform transition-transform duration-300 border-l border-outline-variant/40 flex flex-col ${
          selectedDrawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/40">
          <div>
            <div className="mb-1">
              <StatusBadge status={selectedDrawer?.verification_status || "pending"} />
            </div>
            <h4 className="text-lg font-bold text-on-surface">{selectedDrawer?.display_name}</h4>
            <p className="text-xs text-on-surface-variant">{selectedDrawer?.expertise || "Calon Mentor"}</p>
          </div>
          <button
            aria-label="Tutup"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant"
            onClick={() => setSelectedDrawer(null)}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {selectedDrawer && (
            <>
              {/* Profil */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-on-surface flex items-center gap-2 uppercase tracking-wider">
                  <PersonOutlineIcon sx={{ fontSize: 18 }} className="text-primary" />
                  <span>Profil & Kualifikasi</span>
                </h5>
                <div className="bg-surface-container-low/50 p-4 rounded-xl space-y-3 border border-outline-variant/30 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-bold text-on-surface-variant uppercase text-[10px]">Pendidikan</p>
                      <p className="font-semibold text-on-surface text-sm mt-0.5">{selectedDrawer.education_level || "S1 / Pendidikan Terkait"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface-variant uppercase text-[10px]">Pengalaman Mengajar</p>
                      <p className="font-semibold text-on-surface text-sm mt-0.5">{selectedDrawer.experience_years ? `${selectedDrawer.experience_years} Tahun` : "1+ Tahun"}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/20">
                    <p className="font-bold text-on-surface-variant uppercase text-[10px]">Bidang Keahlian</p>
                    <p className="text-primary font-bold text-xs mt-0.5">{selectedDrawer.expertise || "Keahlian Umum"}</p>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/20">
                    <p className="font-bold text-on-surface-variant uppercase text-[10px]">Deskripsi / Bio Singkat</p>
                    <p className="text-on-surface leading-relaxed mt-1">
                      {selectedDrawer.bio || "Tidak ada deskripsi singkat."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dokumen */}
              {(() => {
                let parsedDocs: { ktp_url?: string; ktp_name?: string; ijazah_url?: string; ijazah_name?: string } | null = null;
                if (selectedDrawer.documents) {
                  try {
                    parsedDocs = typeof selectedDrawer.documents === "string" ? JSON.parse(selectedDrawer.documents) : selectedDrawer.documents;
                  } catch {
                    parsedDocs = null;
                  }
                }

                return (
                  <div className="space-y-3">
                    <h5 className="font-bold text-xs text-on-surface flex items-center gap-2 uppercase tracking-wider">
                      <DescriptionOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />
                      <span>Verifikasi Dokumen KYC (MinIO Storage)</span>
                    </h5>
                    <div className="space-y-3">
                      {/* KTP Document */}
                      <div>
                        <p className="text-xs font-bold text-on-surface mb-1.5">Kartu Tanda Penduduk (KTP):</p>
                        {parsedDocs?.ktp_url ? (
                          <a
                            href={parsedDocs.ktp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 hover:border-primary transition-all text-xs group"
                          >
                            <div className="flex items-center gap-2.5">
                              <DescriptionOutlinedIcon sx={{ fontSize: 20 }} className="text-primary" />
                              <div>
                                <span className="font-bold text-on-surface block">{parsedDocs.ktp_name || "KTP_Identitas.pdf"}</span>
                                <span className="text-[10px] text-emerald-600 font-semibold">Tersimpan di MinIO Bucket</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-primary font-bold">
                              <span>Buka</span>
                              <OpenInNewIcon sx={{ fontSize: 14 }} />
                            </div>
                          </a>
                        ) : (
                          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant italic">
                            Dokumen KTP belum diunggah.
                          </div>
                        )}
                      </div>

                      {/* Ijazah Document */}
                      <div>
                        <p className="text-xs font-bold text-on-surface mb-1.5">Ijazah Terakhir / Sertifikat:</p>
                        {parsedDocs?.ijazah_url ? (
                          <a
                            href={parsedDocs.ijazah_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 hover:border-secondary transition-all text-xs group"
                          >
                            <div className="flex items-center gap-2.5">
                              <DescriptionOutlinedIcon sx={{ fontSize: 20 }} className="text-secondary" />
                              <div>
                                <span className="font-bold text-on-surface block">{parsedDocs.ijazah_name || "Ijazah_Terakhir.pdf"}</span>
                                <span className="text-[10px] text-emerald-600 font-semibold">Tersimpan di MinIO Bucket</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-secondary font-bold">
                              <span>Buka</span>
                              <OpenInNewIcon sx={{ fontSize: 14 }} />
                            </div>
                          </a>
                        ) : (
                          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant italic">
                            Dokumen Ijazah belum diunggah.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Portofolio Links */}
              {selectedDrawer.portfolio && (
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider">Tautan Portofolio</h5>
                  <a
                    href={selectedDrawer.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 hover:border-primary transition-all text-xs"
                  >
                    <span className="font-semibold text-primary truncate max-w-[280px]">{selectedDrawer.portfolio}</span>
                    <OpenInNewIcon sx={{ fontSize: 16 }} className="text-outline" />
                  </a>
                </div>
              )}

              {/* Rejection Note */}
              {showRejection && (
                <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-error block">Alasan Penolakan</label>
                  <textarea
                    className="w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-error text-on-surface h-24"
                    placeholder="Tulis alasan mengapa dokumen atau permohonan ditolak..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <button
                    onClick={handleReject}
                    className="w-full py-2 bg-error text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    Kirim Penolakan
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low/30 flex items-center gap-3">
          <button
            onClick={() => setShowRejection(!showRejection)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 dark:bg-red-950/30 text-error rounded-xl text-xs font-bold hover:bg-red-100 transition-colors border border-red-200 dark:border-red-900/50"
          >
            <CancelOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Tolak</span>
          </button>
          <button
            onClick={handleApprove}
            className="flex-2 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
            <span>Setujui Akun Talent</span>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {selectedDrawer && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
          onClick={() => setSelectedDrawer(null)}
        />
      )}
    </div>
  );
}
