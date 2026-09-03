"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils/format";
import { getAdminTransactions, OrderListItem } from "@/lib/api/order";

// MUI Icons
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import Drawer from "@mui/material/Drawer";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [selectedDrawer, setSelectedDrawer] = useState<OrderListItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminTransactions(1, 100);
      setTransactions(res?.items || (Array.isArray(res) ? res : []));
    } catch (error) {
      console.error("Failed to fetch admin transactions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = transactions.length;
    const paid = transactions.filter((t) => ["paid", "active", "completed"].includes(t.status)).length;
    const pending = transactions.filter((t) => t.status === "pending_payment").length;
    const cancelled = transactions.filter((t) => t.status === "cancelled").length;

    const totalGMV = transactions
      .filter((t) => ["paid", "active", "completed"].includes(t.status))
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totalFee = transactions
      .filter((t) => ["paid", "active", "completed"].includes(t.status))
      .reduce((acc, curr) => acc + (curr.platform_fee || 0), 0);

    return { total, paid, pending, cancelled, totalGMV, totalFee };
  }, [transactions]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      // Status Tab filter
      if (statusTab === "paid" && !["paid", "active", "completed"].includes(trx.status)) return false;
      if (statusTab === "pending" && trx.status !== "pending_payment") return false;
      if (statusTab === "cancelled" && trx.status !== "cancelled") return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = trx.id.toLowerCase().includes(q);
        const matchesTitle = trx.catalog_title?.toLowerCase().includes(q);
        const matchesStudent = trx.student_name?.toLowerCase().includes(q);
        const matchesTalent = trx.talent_name?.toLowerCase().includes(q);
        const matchesProvider = trx.payment_provider?.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesStudent && !matchesTalent && !matchesProvider) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, statusTab, searchQuery]);

  const getStatusBadgeInfo = (status: string) => {
    switch (status) {
      case "paid":
        return { status: "success", label: "Lunas / Terbayar" };
      case "active":
        return { status: "active", label: "Aktif Berjalan" };
      case "completed":
        return { status: "success", label: "Selesai" };
      case "pending_payment":
        return { status: "pending", label: "Menunggu Pembayaran" };
      case "cancelled":
        return { status: "cancelled", label: "Dibatalkan" };
      default:
        return { status: "inactive", label: status };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Manajemen Transaksi"
        description="Pantau seluruh transaksi pesanan, pembayaran siswa, komisi platform, dan bagi hasil mentor"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchTransactions}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container rounded-[10px] text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors shadow-xs"
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
              <span>Muat Ulang</span>
            </button>
          </div>
        }
      />

      {/* Copy Alert Notification */}
      {copiedId && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 rounded-[10px] text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircleOutlineIcon sx={{ fontSize: 16 }} className="text-emerald-600" />
            <span>ID Pesanan <strong>{copiedId}</strong> berhasil disalin ke clipboard!</span>
          </div>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transaksi"
          value={stats.total}
          icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 24 }} />}
          color="primary"
          subtitle={`GMV: ${formatRupiah(stats.totalGMV)}`}
        />
        <StatCard
          title="Transaksi Berhasil"
          value={stats.paid}
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 24 }} />}
          color="success"
          subtitle="Sudah dibayar & diverifikasi"
        />
        <StatCard
          title="Menunggu Pembayaran"
          value={stats.pending}
          icon={<PendingOutlinedIcon sx={{ fontSize: 24 }} />}
          color="warning"
          subtitle="Menunggu siswa checkout"
        />
        <StatCard
          title="Pendapatan Platform"
          value={formatRupiah(stats.totalFee)}
          icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 24 }} />}
          color="tertiary"
          subtitle="Total komisi platform Naik Kelas"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-outline-variant/20">
          {[
            { id: "all", label: "Semua Transaksi", count: stats.total },
            { id: "paid", label: "Berhasil / Lunas", count: stats.paid },
            { id: "pending", label: "Menunggu Pembayaran", count: stats.pending },
            { id: "cancelled", label: "Dibatalkan", count: stats.cancelled },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
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

        {/* Search and Filter Inputs */}
        <div className="relative w-full">
          <SearchIcon
            sx={{ fontSize: 18 }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Cari berdasarkan Order ID, judul layanan, nama siswa, atau mentor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Tidak ada transaksi ditemukan"
              description="Belum ada riwayat transaksi yang cocok dengan filter atau kata kunci pencarian Anda."
              icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 40 }} />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-bold">
                  <th className="py-3 px-4">Order ID & Layanan</th>
                  <th className="py-3 px-4">Partisipan</th>
                  <th className="py-3 px-4">Nominal Finansial</th>
                  <th className="py-3 px-4">Status Pesanan</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4">Waktu Transaksi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredTransactions.map((trx) => {
                  const statusInfo = getStatusBadgeInfo(trx.status);
                  const netTalent = (trx.amount || 0) - (trx.platform_fee || 0);

                  return (
                    <tr
                      key={trx.id}
                      onClick={() => setSelectedDrawer(trx)}
                      className="hover:bg-surface-container/50 transition-colors cursor-pointer group"
                    >
                      {/* Order ID & Catalog */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-[6px]">
                              #{trx.id.substring(0, 8)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(trx.id);
                              }}
                              className="p-1 text-on-surface-variant hover:text-primary rounded-[6px] transition-colors"
                              title="Salin Order ID"
                            >
                              <ContentCopyIcon sx={{ fontSize: 13 }} />
                            </button>
                          </div>
                          <p className="font-bold text-on-surface text-xs line-clamp-1 group-hover:text-primary transition-colors">
                            {trx.catalog_title || "Layanan Belajar"}
                          </p>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                            {trx.catalog_type || "Mentoring"}
                          </span>
                        </div>
                      </td>

                      {/* Participants */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-on-surface font-medium">
                            <SchoolOutlinedIcon sx={{ fontSize: 14 }} className="text-primary" />
                            <span className="truncate">{trx.student_name || "Siswa"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px]">
                            <BadgeOutlinedIcon sx={{ fontSize: 14 }} className="text-secondary" />
                            <span className="truncate">{trx.talent_name || "Mentor"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 font-medium">
                          <p className="font-bold text-on-surface text-xs">
                            {formatRupiah(trx.amount)}
                          </p>
                          <div className="text-[10px] text-on-surface-variant flex items-center gap-2">
                            <span>Fee: {formatRupiah(trx.platform_fee)}</span>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              Net: {formatRupiah(netTalent)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={statusInfo.status}
                          label={statusInfo.label}
                        />
                      </td>

                      {/* Payment Provider */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <PaymentOutlinedIcon sx={{ fontSize: 14 }} className="text-on-surface-variant" />
                          <span className="font-medium text-on-surface capitalize">
                            {trx.payment_provider || "Midtrans"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                        {formatDate(trx.created_at)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedDrawer(trx)}
                          className="px-2.5 py-1 bg-surface-container text-primary font-bold text-xs rounded-[8px] hover:bg-primary/10 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bento Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedDrawer)}
        onClose={() => setSelectedDrawer(null)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 520 },
            backgroundColor: "var(--color-surface-container-lowest, #ffffff)",
            borderLeft: "1px solid var(--color-outline-variant, #e0e2ec)",
          },
        }}
      >
        {selectedDrawer && (
          <div className="h-full flex flex-col justify-between text-on-surface">
            {/* Drawer Header */}
            <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-[10px]">
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Detail Transaksi</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-xs font-semibold text-on-surface-variant">
                      #{selectedDrawer.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedDrawer.id)}
                      className="p-1 text-on-surface-variant hover:text-primary rounded-[6px] transition-colors"
                      title="Salin ID Pesanan"
                    >
                      <ContentCopyIcon sx={{ fontSize: 12 }} />
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDrawer(null)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[8px] transition-colors"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Drawer Body (Bento Cards) */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Status Bento Card */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant block mb-1">Status Pembayaran</span>
                  <StatusBadge
                    status={getStatusBadgeInfo(selectedDrawer.status).status}
                    label={getStatusBadgeInfo(selectedDrawer.status).label}
                  />
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-on-surface-variant block mb-0.5">Tanggal Dibuat</span>
                  <span className="font-bold text-on-surface">
                    {formatDate(selectedDrawer.created_at)}
                  </span>
                </div>
              </div>

              {/* Financial Breakdown Bento Card */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-on-surface pb-2 border-b border-outline-variant/20">
                  <PaymentsOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />
                  <span>Rincian Finansial & Bagi Hasil</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-on-surface">
                    <span className="text-on-surface-variant">Nilai Pesanan Bruto (Siswa Bayar)</span>
                    <span className="font-bold text-sm text-on-surface">
                      {formatRupiah(selectedDrawer.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                    <span>Potongan Komisi Platform (10%)</span>
                    <span className="font-semibold">- {formatRupiah(selectedDrawer.platform_fee)}</span>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className="font-bold text-on-surface">Hak Pendapatan Bersih (Mentor)</span>
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(selectedDrawer.amount - selectedDrawer.platform_fee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Info Bento Card */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 space-y-2.5 shadow-xs">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Informasi Layanan
                </span>
                <p className="font-bold text-sm text-on-surface">
                  {selectedDrawer.catalog_title || "Layanan Belajar"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold rounded-[8px] text-[10px] uppercase">
                    {selectedDrawer.catalog_type || "Mentoring"}
                  </span>
                </div>
              </div>

              {/* Participants Bento Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-bold">
                    <SchoolOutlinedIcon sx={{ fontSize: 15 }} className="text-primary" />
                    <span>Siswa (Pembeli)</span>
                  </div>
                  <p className="font-bold text-on-surface text-xs">{selectedDrawer.student_name || "Siswa"}</p>
                </div>

                <div className="p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-bold">
                    <BadgeOutlinedIcon sx={{ fontSize: 15 }} className="text-secondary" />
                    <span>Mentor (Penyedia)</span>
                  </div>
                  <p className="font-bold text-on-surface text-xs">{selectedDrawer.talent_name || "Mentor"}</p>
                </div>
              </div>

              {/* Gateway & Payment Info Bento Card */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 space-y-2.5 shadow-xs">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Gateway Pembayaran
                </span>
                <div className="space-y-1.5 text-on-surface">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Payment Provider</span>
                    <span className="font-bold capitalize">{selectedDrawer.payment_provider || "Midtrans"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Waktu Pembayaran Diverifikasi</span>
                    <span>{selectedDrawer.paid_at ? formatDate(selectedDrawer.paid_at) : "Belum terverifikasi"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low/40 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopy(selectedDrawer.id)}
                className="px-4 py-2 bg-surface-container text-on-surface text-xs font-bold rounded-[10px] hover:bg-surface-variant transition-colors flex items-center gap-1.5"
              >
                <ContentCopyIcon sx={{ fontSize: 14 }} />
                <span>Salin Order ID</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDrawer(null)}
                className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-[10px] hover:bg-primary/90 transition-all shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
