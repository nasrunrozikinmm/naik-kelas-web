"use client";

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader, StatCard, StatusBadge, EmptyState, TableSkeleton } from "@/components/common";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getTalentOrders, OrderListItem } from "@/lib/api/order";

// MUI Icons
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import Drawer from "@mui/material/Drawer";

function TalentOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrawer, setSelectedDrawer] = useState<OrderListItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const statusParam = searchParams.get("status");
  const statusFilter = ["all", "active", "pending", "completed", "cancelled"].includes(statusParam || "")
    ? statusParam!
    : "all";

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTalentOrders(1, 100);
      setOrders(res?.items || (Array.isArray(res) ? res : []));
    } catch (error) {
      console.error("Failed to fetch talent orders", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter((o) => ["paid", "active"].includes(o.status)).length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const pending = orders.filter((o) => o.status === "pending_payment").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;

    const totalNetRevenue = orders
      .filter((o) => ["paid", "active", "completed"].includes(o.status))
      .reduce((acc, curr) => acc + ((curr.amount || 0) - (curr.platform_fee || 0)), 0);

    return { total, active, completed, pending, cancelled, totalNetRevenue };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status Filter Tab
      if (statusFilter === "active" && !["paid", "active"].includes(order.status)) return false;
      if (statusFilter === "completed" && order.status !== "completed") return false;
      if (statusFilter === "pending" && order.status !== "pending_payment") return false;
      if (statusFilter === "cancelled" && order.status !== "cancelled") return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesTitle = order.catalog_title?.toLowerCase().includes(q);
        const matchesStudent = order.student_name?.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesStudent) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const getStatusBadgeInfo = (status: string) => {
    switch (status) {
      case "paid":
        return { status: "active", label: "Dibayar / Siap Bimbingan" };
      case "active":
        return { status: "active", label: "Sesi Berjalan" };
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
        title="Pesanan Masuk"
        description="Kelola seluruh pesanan dari siswa, pantau status sesi bimbingan, dan penghasilan bersih Anda."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container rounded-[10px] text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors shadow-xs"
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
              <span>Muat Ulang</span>
            </button>
          </div>
        }
      />

      {/* Copy Alert Banner */}
      {copiedId && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 rounded-[10px] text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircleOutlineIcon sx={{ fontSize: 16 }} className="text-emerald-600" />
            <span>ID Pesanan <strong>{copiedId}</strong> berhasil disalin!</span>
          </div>
        </div>
      )}

      {/* KPI Bento StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pesanan"
          value={stats.total}
          icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 24 }} />}
          color="primary"
          subtitle="Semua pesanan masuk"
        />
        <StatCard
          title="Pesanan Aktif"
          value={stats.active}
          icon={<HourglassEmptyOutlinedIcon sx={{ fontSize: 24 }} />}
          color="warning"
          subtitle="Perlu diproses / bimbingan"
        />
        <StatCard
          title="Pesanan Selesai"
          value={stats.completed}
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 24 }} />}
          color="success"
          subtitle="Sesi mentoring tuntas"
        />
        <StatCard
          title="Pendapatan Bersih"
          value={formatCurrency(stats.totalNetRevenue)}
          icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 24 }} />}
          color="tertiary"
          subtitle="Setelah potongan platform 10%"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/40 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-outline-variant/20">
          {[
            { id: "all", label: "Semua Pesanan", count: stats.total },
            { id: "active", label: "Perlu Diproses / Aktif", count: stats.active },
            { id: "pending", label: "Menunggu Pembayaran", count: stats.pending },
            { id: "completed", label: "Selesai", count: stats.completed },
            { id: "cancelled", label: "Dibatalkan", count: stats.cancelled },
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

        {/* Search Input */}
        <div className="relative w-full">
          <SearchIcon
            sx={{ fontSize: 18 }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Cari berdasarkan ID pesanan, judul layanan, atau nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredOrders.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Tidak ada pesanan ditemukan"
              description="Belum ada pesanan masuk yang sesuai dengan filter atau kata kunci pencarian Anda."
              icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 40 }} />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant font-bold">
                  <th className="py-3 px-4">Pesanan & Layanan</th>
                  <th className="py-3 px-4">Siswa (Pembeli)</th>
                  <th className="py-3 px-4">Pendapatan Bersih</th>
                  <th className="py-3 px-4">Status Pesanan</th>
                  <th className="py-3 px-4">Tanggal Pesanan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusBadgeInfo(order.status);
                  const netIncome = (order.amount || 0) - (order.platform_fee || 0);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedDrawer(order)}
                      className="hover:bg-surface-container/50 transition-colors cursor-pointer group"
                    >
                      {/* Order ID & Catalog */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-[6px]">
                              #{order.id.substring(0, 8)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(order.id);
                              }}
                              className="p-1 text-on-surface-variant hover:text-primary rounded-[6px] transition-colors"
                              title="Salin Order ID"
                            >
                              <ContentCopyIcon sx={{ fontSize: 13 }} />
                            </button>
                          </div>
                          <p className="font-bold text-on-surface text-xs line-clamp-1 group-hover:text-primary transition-colors">
                            {order.catalog_title || "Layanan Belajar"}
                          </p>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                            {order.catalog_type || "Mentoring"}
                          </span>
                        </div>
                      </td>

                      {/* Student */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-[10px] bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            <SchoolOutlinedIcon sx={{ fontSize: 15 }} />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-xs">{order.student_name || "Siswa"}</p>
                            <span className="text-[10px] text-on-surface-variant">Pembeli Terverifikasi</span>
                          </div>
                        </div>
                      </td>

                      {/* Net Revenue */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            {formatCurrency(netIncome)}
                          </p>
                          <div className="text-[10px] text-on-surface-variant flex items-center gap-1.5">
                            <span>Bruto: {formatCurrency(order.amount)}</span>
                            <span>•</span>
                            <span className="text-red-500">Fee: -{formatCurrency(order.platform_fee)}</span>
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

                      {/* Date */}
                      <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedDrawer(order)}
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
            width: { xs: "100%", sm: 500 },
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
                  <h3 className="text-base font-bold text-on-surface">Detail Pesanan Masuk</h3>
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
                  <span className="text-[11px] text-on-surface-variant block mb-1">Status Pesanan</span>
                  <StatusBadge
                    status={getStatusBadgeInfo(selectedDrawer.status).status}
                    label={getStatusBadgeInfo(selectedDrawer.status).label}
                  />
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-on-surface-variant block mb-0.5">Waktu Pesanan</span>
                  <span className="font-bold text-on-surface">
                    {formatDate(selectedDrawer.created_at)}
                  </span>
                </div>
              </div>

              {/* Financial Bento Card */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-on-surface pb-2 border-b border-outline-variant/20">
                  <PaymentsOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />
                  <span>Rincian Penghasilan Bersih Anda</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-on-surface">
                    <span className="text-on-surface-variant">Harga Layanan (Dibayar Siswa)</span>
                    <span className="font-bold text-sm text-on-surface">
                      {formatCurrency(selectedDrawer.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                    <span>Potongan Fee Layanan Platform (10%)</span>
                    <span className="font-semibold">- {formatCurrency(selectedDrawer.platform_fee)}</span>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className="font-bold text-on-surface">Pendapatan Bersih Anda</span>
                    <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(selectedDrawer.amount - selectedDrawer.platform_fee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Info Bento Card */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 space-y-2 shadow-xs">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Layanan Bimbingan
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

              {/* Student Participant Card */}
              <div className="p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/30 space-y-2">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Informasi Siswa
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                    <SchoolOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-xs">{selectedDrawer.student_name || "Siswa"}</p>
                    <span className="text-[11px] text-on-surface-variant">Terdaftar sebagai Siswa Naik Kelas</span>
                  </div>
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 space-y-2 shadow-xs">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Status Pembayaran Gateway
                </span>
                <div className="space-y-1.5 text-on-surface">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Metode Provider</span>
                    <div className="flex items-center gap-1.5 font-bold capitalize">
                      <PaymentOutlinedIcon sx={{ fontSize: 14 }} className="text-on-surface-variant" />
                      <span>{selectedDrawer.payment_provider || "Midtrans"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Status Pelunasan</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedDrawer.paid_at ? "Terverifikasi Lunas" : "Menunggu Pembayaran"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low/40 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopy(selectedDrawer.id)}
                className="px-4 py-2 bg-surface-container text-on-surface text-xs font-bold rounded-[10px] hover:bg-surface-variant transition-colors flex items-center gap-1.5"
              >
                <ContentCopyIcon sx={{ fontSize: 14 }} />
                <span>Salin ID Pesanan</span>
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

export default function TalentOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/40 shadow-xs flex items-center justify-center">
          <span className="text-xs text-on-surface-variant">Memuat pesanan...</span>
        </div>
      }
    >
      <TalentOrdersContent />
    </Suspense>
  );
}
