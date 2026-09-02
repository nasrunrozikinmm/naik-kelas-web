"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/AppShell";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { formatCurrency } from "@/lib/utils/format";
import type { CatalogDetail } from "@/types/domain";

// MUI Icons
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";

const AddToCartButton = dynamic(
  () => import("@/components/AddToCartButton").then((m) => m.AddToCartButton),
  { ssr: false }
);

type Props = { params: Promise<{ id: string }> };

export default function CatalogDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const [catalog, setCatalog] = useState<CatalogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"deskripsi" | "kurikulum" | "ulasan" | "mentor">("deskripsi");

  useEffect(() => {
    let isMounted = true;

    const fetchCatalog = async () => {
      try {
        const response = await apiClient.get(endpoints.catalog.detail(resolvedParams.id));
        const c = response.data?.data;
        if (c && isMounted) {
          setCatalog({
            id: c.id,
            title: c.title,
            type: c.type,
            price: c.price,
            category: c.category || "Pendidikan",
            excerpt: c.description || c.title,
            description: c.description,
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=640",
            badge: { label: c.type === "live_session" ? "Sesi Live" : c.type === "mentoring" ? "Mentoring" : "Kursus", variant: "primary" },
            talentName: c.talent_profile_id ? `Mentor ${c.talent_profile_id.substring(0, 5)}` : "Mentor Naik Kelas",
            reviewsCount: 128,
            soldCount: 45,
            rating: 4.9
          });
        }
      } catch (error) {
        console.error("Failed to fetch catalog detail", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCatalog();

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-on-surface-variant font-medium">Memuat rincian layanan...</p>
        </div>
      </AppShell>
    );
  }

  if (!catalog) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">Layanan Tidak Ditemukan</h2>
          <p className="text-on-surface-variant max-w-md mx-auto text-sm">
            Katalog yang Anda cari mungkin telah dinonaktifkan atau tautan yang Anda gunakan salah.
          </p>
          <Link href="/" className="inline-block px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm">
            Kembali ke Beranda
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="bg-background pb-16">
        {/* Header Hero */}
        <div className="bg-surface border-b border-outline-variant/40 pt-8 pb-10 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto mb-6">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium flex-wrap">
              <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
              <ChevronRightIcon sx={{ fontSize: 16 }} className="text-outline" />
              <span className="capitalize">{catalog.category}</span>
              <ChevronRightIcon sx={{ fontSize: 16 }} className="text-outline" />
              <span className="text-on-surface font-semibold truncate max-w-[200px]">{catalog.title}</span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
            <div className="relative w-full md:w-80 h-56 md:h-64 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-surface-container-high">
              <Image
                src={catalog.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=640"}
                alt={catalog.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-4">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                {catalog.badge?.label || "Layanan Pilihan"}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface leading-tight tracking-tight">
                {catalog.title}
              </h1>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1 font-semibold">
                  <StarIcon sx={{ color: "#f59e0b", fontSize: 18 }} />
                  <span>{catalog.rating}</span>
                  <span className="text-on-surface-variant font-normal">({catalog.reviewsCount} Ulasan)</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-outline-variant" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                    {catalog.talentName[0]}
                  </div>
                  <span className="font-semibold text-on-surface">{catalog.talentName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs & Sticky Checkout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Main Tabs Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tab Selector */}
              <div className="flex gap-2 border-b border-outline-variant/40 pb-2 overflow-x-auto">
                {(["deskripsi", "kurikulum", "ulasan", "mentor"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-bold capitalize rounded-xl transition-all ${
                      activeTab === tab
                        ? "bg-primary text-white shadow-xs"
                        : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-xs">
                {activeTab === "deskripsi" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-on-surface">Tentang Layanan Ini</h3>
                    <p className="text-on-surface-variant leading-relaxed text-sm sm:text-base">
                      {catalog.description ||
                        "Bimbingan intensif dan pendampingan menyeluruh yang dirancang untuk mempersiapkan Anda menghadapi seleksi beasiswa, tes kemahiran bahasa, dan wawancara akademis dengan percaya diri."}
                    </p>
                    <div className="pt-4 space-y-2">
                      <h4 className="font-bold text-sm text-on-surface">Yang Akan Anda Dapatkan:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
                        <li>Sesi tatap muka daring 1-on-1 bersama mentor ahli.</li>
                        <li>Review essay dan motivation letter personal tanpa batas revisi selama sesi aktif.</li>
                        <li>Akses ke bank soal dan materi eksklusif alumni penerima beasiswa.</li>
                        <li>Konsultasi chat pendampingan selama 30 hari.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "kurikulum" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-on-surface">Rencana Belajar</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
                        <p className="font-bold text-sm text-on-surface">Modul 1: Pemetaan Potensi & Profiling</p>
                        <p className="text-xs text-on-surface-variant mt-1">Identifikasi kekuatan dan strategi memilih universitas tujuan.</p>
                      </div>
                      <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
                        <p className="font-bold text-sm text-on-surface">Modul 2: Bedah Essay & Motivation Letter</p>
                        <p className="text-xs text-on-surface-variant mt-1">Struktur narasi persuasif yang memikat komite penyeleksi beasiswa.</p>
                      </div>
                      <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
                        <p className="font-bold text-sm text-on-surface">Modul 3: Simulasi Wawancara Mendalam</p>
                        <p className="text-xs text-on-surface-variant mt-1">Latihan menjawab pertanyaan jebakan dengan teknik STAR.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ulasan" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-on-surface">Ulasan Siswa</h3>
                    <div className="p-5 rounded-2xl bg-surface-container-low/40 border border-outline-variant/30">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
                            R
                          </div>
                          <div>
                            <p className="font-bold text-sm text-on-surface">Riana Putri</p>
                            <p className="text-xs text-on-surface-variant">Penerima Beasiswa LPDP</p>
                          </div>
                        </div>
                        <div className="text-amber-500 text-xs">★★★★★</div>
                      </div>
                      <p className="mt-3 text-sm text-on-surface-variant italic">
                        &quot;Mentoring ini sangat personal. Essay saya dibedah sampai detail terkecil. Sangat membantu mewujudkan impian saya!&quot;
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "mentor" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-on-surface">Profil Mentor</h3>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="w-20 h-20 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-2xl shrink-0">
                        {catalog.talentName?.[0] || "M"}
                      </div>
                      <div className="space-y-3 flex-1">
                        <div>
                          <h4 className="text-xl font-bold text-on-surface">{catalog.talentName}</h4>
                          <p className="text-xs text-primary font-semibold mt-0.5">Mentor Terverifikasi Naik Kelas</p>
                        </div>
                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                          Memiliki dedikasi tinggi dalam membimbing siswa meraih prestasi akademik tertinggi dengan pengalaman kurikulum teruji.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Sticky Checkout Box */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm">
                  <div className="mb-6">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                      Biaya Investasi
                    </span>
                    <p className="text-3xl font-extrabold text-primary">
                      {formatCurrency(catalog.price)}
                    </p>
                  </div>

                  <div className="space-y-3.5 mb-8 text-sm text-on-surface-variant">
                    <div className="flex items-center gap-3">
                      <AccessTimeIcon sx={{ fontSize: 18, color: "primary.main" }} />
                      <span>Durasi Akses: 30 Hari Penuh</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: "secondary.main" }} />
                      <span className="font-semibold text-secondary">Sisa Kuota: 5 Peserta</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <SchoolOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                      <span>Sertifikat Resmi Selesai Program</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <AddToCartButton catalog={catalog} />
                  </div>

                  <div className="space-y-2.5 pt-6 border-t border-outline-variant/30 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <LockOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />
                      <span>File Materi Aman & Terproteksi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BoltOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />
                      <span>Akses Langsung Terbuka Setelah Verifikasi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
