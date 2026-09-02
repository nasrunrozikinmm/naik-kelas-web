"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

// MUI Icons
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GavelIcon from "@mui/icons-material/Gavel";
import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

type Transaction = {
  id: string;
  user: string;
  product: string;
  amount: number;
  status: string;
  time: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total_gmv: 0,
    active_orders: 0,
    pending_approvals: 0,
    rejected_talents: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [transactions] = useState<Transaction[]>([
    { id: "ORD-2904", user: "Andini Putri", product: "Beasiswa LPDP Mentoring", amount: 450000, status: "completed", time: "2 Menit Lalu" },
    { id: "ORD-2903", user: "Rian Pratama", product: "Mastering IELTS Prep", amount: 720000, status: "pending", time: "15 Menit Lalu" },
    { id: "ORD-2902", user: "Siti Rahma", product: "Public Speaking Course", amount: 299000, status: "cancelled", time: "1 Jam Lalu" },
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const response = await apiClient.get(endpoints.admin.dashboard);
        if (response.data?.success && response.data?.data && isMounted) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ringkasan Operasional"
        description="Pantau metrik transaksi, pertumbuhan GMV, dan status moderasi sistem secara real-time."
        action={
          <button className="flex items-center gap-1.5 px-4 py-2 bg-surface-container rounded-xl text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors shadow-xs">
            <DownloadIcon sx={{ fontSize: 18 }} />
            <span>Ekspor Laporan</span>
          </button>
        }
      />

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total GMV Platform"
          value={isLoading ? "..." : formatCurrency(stats.total_gmv)}
          subtitle="Akumulasi seluruh transaksi"
          trend={{ value: 12.5, isPositive: true }}
          color="primary"
          icon={<AccountBalanceWalletIcon sx={{ fontSize: 24 }} />}
        />
        <StatCard
          title="Pesanan Aktif"
          value={isLoading ? "..." : formatNumber(stats.active_orders)}
          subtitle="Sesi mentoring berjalan"
          color="secondary"
          icon={<ShoppingBagIcon sx={{ fontSize: 24 }} />}
        />
        <StatCard
          title="Verifikasi Talent Pending"
          value={isLoading ? "..." : formatNumber(stats.pending_approvals)}
          subtitle="Menunggu review berkas"
          color="warning"
          icon={<VerifiedUserIcon sx={{ fontSize: 24 }} />}
        />
        <StatCard
          title="Talent Ditolak / Revisi"
          value={isLoading ? "..." : formatNumber(stats.rejected_talents)}
          subtitle="Perlu tindak lanjut"
          color="error"
          icon={<GavelIcon sx={{ fontSize: 24 }} />}
        />
      </div>

      {/* Graphs and Pending Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-base text-on-surface">Tren Transaksi Mingguan</h4>
              <p className="text-xs text-on-surface-variant">Aktivitas volume penjualan dalam 7 hari terakhir</p>
            </div>
            <select className="bg-surface-container px-3 py-1.5 text-xs font-semibold rounded-xl border border-outline-variant/40 focus:ring-primary text-on-surface">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>

          <div className="h-60 flex items-end justify-between gap-3 px-4 pb-4 border-b border-outline-variant/30">
            <div className="w-full bg-primary/20 rounded-t-xl hover:bg-primary/40 transition-all cursor-pointer" style={{ height: "60%" }} />
            <div className="w-full bg-primary/20 rounded-t-xl hover:bg-primary/40 transition-all cursor-pointer" style={{ height: "45%" }} />
            <div className="w-full bg-primary/20 rounded-t-xl hover:bg-primary/40 transition-all cursor-pointer" style={{ height: "75%" }} />
            <div className="w-full bg-primary/20 rounded-t-xl hover:bg-primary/40 transition-all cursor-pointer" style={{ height: "90%" }} />
            <div className="w-full bg-primary rounded-t-xl transition-all cursor-pointer relative group" style={{ height: "100%" }}>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-xs whitespace-nowrap">
                Puncak
              </span>
            </div>
            <div className="w-full bg-primary/20 rounded-t-xl hover:bg-primary/40 transition-all cursor-pointer" style={{ height: "55%" }} />
            <div className="w-full bg-primary/20 rounded-t-xl hover:bg-primary/40 transition-all cursor-pointer" style={{ height: "70%" }} />
          </div>

          <div className="flex justify-between text-xs font-semibold text-on-surface-variant mt-3 px-4">
            <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
          </div>
        </div>

        {/* Moderasi Menunggu Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-base text-on-surface mb-1">Perlu Ditinjau</h4>
            <p className="text-xs text-on-surface-variant mb-4">Pengajuan talent & konten baru</p>

            <div className="space-y-3">
              <div className="p-3.5 border border-outline-variant/30 rounded-xl bg-surface-container-low/40 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                    B
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-on-surface truncate">Budi Santoso</p>
                    <p className="text-[11px] text-on-surface-variant truncate">Mentor - Matematika Terapan</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    Talent
                  </span>
                </div>
              </div>

              <div className="p-3.5 border border-outline-variant/30 rounded-xl bg-surface-container-low/40 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container text-white flex items-center justify-center font-bold text-xs">
                    <LibraryBooksIcon sx={{ fontSize: 16 }} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-on-surface truncate">Mastering Essay Beasiswa</p>
                    <p className="text-[11px] text-on-surface-variant truncate">Listing Kursus Baru</p>
                  </div>
                  <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
                    Kursus
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/admin/talent-approval"
            className="block text-center text-primary text-xs font-bold hover:underline mt-4 pt-3 border-t border-outline-variant/30"
          >
            Lihat Semua Antrean ({isLoading ? "..." : stats.pending_approvals}) →
          </Link>
        </div>
      </div>

      {/* Transaksi Terbaru Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
          <div>
            <h4 className="font-bold text-base text-on-surface">Transaksi Terbaru</h4>
            <p className="text-xs text-on-surface-variant">Daftar transaksi pembayaran yang masuk ke sistem.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Siswa</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Layanan / Mentor</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nominal</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-primary">#{trx.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                        {trx.user.charAt(0)}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-on-surface">{trx.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">{trx.product}</td>
                  <td className="px-6 py-4 text-xs sm:text-sm font-bold text-on-surface">{formatCurrency(trx.amount)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={trx.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">{trx.time}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      aria-label="Aksi Transaksi"
                      className="p-1 text-on-surface-variant hover:text-primary rounded-lg transition-colors"
                    >
                      <MoreVertIcon sx={{ fontSize: 18 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-surface-container-low/30 border-t border-outline-variant/30 flex justify-between items-center text-xs text-on-surface-variant">
          <p>Menampilkan 3 transaksi terbaru</p>
          <div className="flex gap-1">
            <button
              aria-label="Halaman Sebelumnya"
              className="p-1.5 border border-outline-variant/40 rounded-lg hover:bg-surface-variant disabled:opacity-40"
              disabled
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </button>
            <button
              aria-label="Halaman Berikutnya"
              className="p-1.5 border border-outline-variant/40 rounded-lg hover:bg-surface-variant"
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
