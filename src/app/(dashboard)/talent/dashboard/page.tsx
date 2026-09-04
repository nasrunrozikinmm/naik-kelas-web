"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoader";
import { formatCurrency, formatDate } from "@/lib/utils/format";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type Catalog = {
  id: string;
  title: string;
  type: string;
  price: number;
  status: string;
  created_at: string;
  image?: string;
};

export default function TalentDashboardPage() {
  const { displayName } = useAuth();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalogs = async () => {
      try {
        const response = await apiClient.get(endpoints.catalog.me);
        if (isMounted) {
          setCatalogs(response.data?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch talent catalogs", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchCatalogs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Halo, ${displayName || "Mentor"}!`}
        description="Kelola kelas, jadwal bimbingan, dan tinjau pendapatan Anda."
        action={
          <Link
            href="/talent/catalogs/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white! rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
          >
            <AddIcon sx={{ fontSize: 18, color: "#ffffff" }} />
            <span>Buat Layanan Baru</span>
          </Link>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Pendapatan"
          value={formatCurrency(14850000)}
          subtitle="Dapat dicairkan Rp 3.200.000"
          trend={{ value: 8.2, isPositive: true }}
          color="primary"
          icon={<PaymentsOutlinedIcon sx={{ fontSize: 24 }} />}
        />
        <StatCard
          title="Siswa Terbimbing"
          value="42"
          subtitle="12 siswa aktif sesi ini"
          color="secondary"
          icon={<PeopleAltOutlinedIcon sx={{ fontSize: 24 }} />}
        />
        <StatCard
          title="Rating & Ulasan"
          value="4.9 / 5.0"
          subtitle="Dari 38 ulasan terverifikasi"
          color="warning"
          icon={<StarBorderOutlinedIcon sx={{ fontSize: 24 }} />}
        />
      </div>

      {/* Services List Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
          <div>
            <h3 className="font-bold text-base text-on-surface">Layanan & Materi Saya</h3>
            <p className="text-xs text-on-surface-variant">Daftar kelas yang Anda publikasikan di Naik Kelas.</p>
          </div>
          <span className="text-xs text-on-surface-variant">
            Total: <strong>{catalogs.length}</strong> layanan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Layanan</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6">
                    <TableSkeleton rows={3} cols={5} />
                  </td>
                </tr>
              ) : catalogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-xs text-on-surface-variant">
                    Belum ada layanan yang dibuat. Klik &quot;Buat Layanan Baru&quot; untuk memulai.
                  </td>
                </tr>
              ) : (
                catalogs.map((catalog) => (
                  <tr key={catalog.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-surface-variant overflow-hidden shrink-0">
                          <Image
                            src={catalog.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=150"}
                            alt={catalog.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-on-surface">{catalog.title}</p>
                          <p className="text-[11px] text-on-surface-variant">Dibuat: {formatDate(catalog.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant capitalize">
                      {catalog.type === "live_session" ? "Sesi Live" : catalog.type === "mentoring" ? "Mentoring" : "Video Kursus"}
                    </td>
                    <td className="px-6 py-4 text-xs sm:text-sm font-bold text-on-surface">
                      {formatCurrency(catalog.price)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={catalog.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        aria-label="Aksi Layanan"
                        className="p-1 text-on-surface-variant hover:text-primary rounded-lg transition-colors"
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
