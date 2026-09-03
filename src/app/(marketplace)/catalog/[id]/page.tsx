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
import { mockFeaturedCatalogs } from "@/lib/mock/data";

// MUI Icons
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LanguageIcon from "@mui/icons-material/Language";

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
          const mockMatch = mockFeaturedCatalogs.find(
            (m) => m.id === c.id || m.title.toLowerCase() === c.title?.toLowerCase()
          );

          setCatalog({
            id: c.id,
            title: c.title,
            type: c.type,
            price: c.price,
            category: c.category?.name || c.category || mockMatch?.category || "Pendidikan",
            excerpt: c.description || mockMatch?.excerpt || c.title,
            description: c.description || mockMatch?.description || mockMatch?.excerpt,
            image: c.image || mockMatch?.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=640",
            badge: { label: c.type === "live_session" ? "Sesi Live" : c.type === "mentoring" ? "Mentoring" : "Kursus", variant: "primary" },
            talentName: c.talent_profile?.display_name || c.talentName || mockMatch?.talentName || (c.talent_profile_id ? `Mentor ${c.talent_profile_id.substring(0, 5)}` : "Dr. Amanda Wijaya, M.Sc."),
            talentAvatar: c.talent_profile?.avatar_url || c.talentAvatar || mockMatch?.talentAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
            talentTitle: c.talent_profile?.expertise || c.talentTitle || mockMatch?.talentTitle || "Alumni Oxford University",
            institution: c.institution || mockMatch?.institution || "Awardee LPDP Luar Negeri",
            talentBio: c.talent_profile?.bio || c.talentBio || mockMatch?.talentBio || "Berpengalaman mendampingi 80+ awardee lolos seleksi beasiswa S2/S3 di universitas top dunia dengan kurikulum komprehensif dan mentoring 1-on-1 personal.",
            talentExpertise: c.talent_profile?.languages || c.talentExpertise || mockMatch?.talentExpertise || ["Beasiswa LPDP", "Motivation Letter", "Mock Interview", "Study Plan"],
            talentRating: c.talent_profile?.rating || c.rating || mockMatch?.talentRating || 4.95,
            talentReviewsCount: c.reviewsCount || mockMatch?.talentReviewsCount || 142,
            talentSessionsCount: c.talent_profile?.total_sales || c.soldCount || mockMatch?.talentSessionsCount || 310,
            talentExperienceYears: c.talent_profile?.experience_years || mockMatch?.talentExperienceYears || 5,
            talentLanguages: mockMatch?.talentLanguages || ["Bahasa Indonesia", "English (Fluent)"],
            isVerified: c.talent_profile?.verification_status === "verified" || mockMatch?.isVerified !== false,
            talent_profile_id: c.talent_profile_id || mockMatch?.talent_profile_id || "mentor-amanda",
            reviewsCount: c.reviewsCount || mockMatch?.reviewsCount || 142,
            soldCount: c.soldCount || mockMatch?.soldCount || 310,
            rating: c.rating || mockMatch?.rating || 4.95
          });
          return;
        }
      } catch (error) {
        console.error("Failed to fetch catalog detail", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      // Check fallback mock
      const matchedMock = mockFeaturedCatalogs.find((m) => m.id === resolvedParams.id) || mockFeaturedCatalogs[0];
      if (matchedMock && isMounted) {
        setCatalog({
          ...matchedMock,
          category: matchedMock.category || "Pendidikan",
          description: matchedMock.description || matchedMock.excerpt,
          talentName: matchedMock.talentName,
          talentAvatar: matchedMock.talentAvatar,
          talentTitle: matchedMock.talentTitle,
          institution: matchedMock.institution,
          talentBio: matchedMock.talentBio,
          talentExpertise: matchedMock.talentExpertise,
          talentRating: matchedMock.talentRating,
          talentReviewsCount: matchedMock.talentReviewsCount,
          talentSessionsCount: matchedMock.talentSessionsCount,
          talentExperienceYears: matchedMock.talentExperienceYears,
          talentLanguages: matchedMock.talentLanguages,
          isVerified: matchedMock.isVerified,
          talent_profile_id: matchedMock.talent_profile_id
        });
      }

      if (isMounted) {
        setLoading(false);
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
                <Link
                  href={`/profile/${catalog.talent_profile_id || catalog.id}`}
                  className="inline-flex items-center gap-2.5 p-1 -m-1 rounded-xl hover:bg-surface-variant/40 transition-all group"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary shrink-0 shadow-xs border border-outline-variant/30 flex items-center justify-center text-white font-bold text-xs">
                    {catalog.talentAvatar ? (
                      <Image
                        src={catalog.talentAvatar}
                        alt={catalog.talentName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      catalog.talentName?.[0] || "M"
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                        {catalog.talentName}
                      </span>
                      {catalog.isVerified !== false && (
                        <VerifiedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                      )}
                    </div>
                    {(catalog.talentTitle || catalog.institution) && (
                      <p className="text-[11px] text-on-surface-variant font-medium">
                        {catalog.talentTitle || catalog.institution}
                      </p>
                    )}
                  </div>
                </Link>
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-on-surface">Profil &amp; Informasi Mentor</h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        <VerifiedIcon sx={{ fontSize: 16 }} />
                        <span>Terverifikasi Resmi</span>
                      </span>
                    </div>

                    {/* Mentor Bento Profile Card */}
                    <div className="p-6 rounded-2xl bg-surface-container-low/40 border border-outline-variant/30 space-y-6">
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-primary shrink-0 shadow-sm border border-outline-variant/30 flex items-center justify-center text-white font-extrabold text-3xl">
                          {catalog.talentAvatar ? (
                            <Image
                              src={catalog.talentAvatar}
                              alt={catalog.talentName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            catalog.talentName?.[0] || "M"
                          )}
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xl font-bold text-on-surface">{catalog.talentName}</h4>
                            {catalog.isVerified !== false && (
                              <VerifiedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-primary">
                            {catalog.talentTitle || catalog.institution || "Mentor Akademis Naik Kelas"}
                          </p>
                          {catalog.institution && catalog.talentTitle && (
                            <p className="text-xs text-on-surface-variant">
                              {catalog.institution}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Mentor Quick Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                            <StarIcon sx={{ fontSize: 18 }} />
                            <span>{(catalog.talentRating || catalog.rating || 4.9).toFixed(1)}</span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">
                            {catalog.talentReviewsCount || catalog.reviewsCount || 128} Ulasan Siswa
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                          <p className="font-bold text-sm text-on-surface">
                            {catalog.talentSessionsCount || catalog.soldCount || 300}+ Sesi
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">Bimbingan Selesai</p>
                        </div>

                        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                          <p className="font-bold text-sm text-on-surface">
                            {catalog.talentExperienceYears || 5}+ Tahun
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">Jam Terbang Mengajar</p>
                        </div>
                      </div>

                      {/* Bio Narrative */}
                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-on-surface">Tentang Mentor:</h5>
                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                          {catalog.talentBio ||
                            "Berpengalaman mendampingi puluhan siswa meraih beasiswa prestisius dan kelulusan tes target dengan kurikulum terstruktur serta bimbingan 1-on-1 yang intensif dan suportif."}
                        </p>
                      </div>

                      {/* Expertise Chips */}
                      {catalog.talentExpertise && catalog.talentExpertise.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-bold text-sm text-on-surface">Bidang Keahlian &amp; Bimbingan:</h5>
                          <div className="flex flex-wrap gap-2">
                            {catalog.talentExpertise.map((exp, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-surface-container-high text-on-surface border border-outline-variant/30"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages Spoken */}
                      {catalog.talentLanguages && catalog.talentLanguages.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <LanguageIcon sx={{ fontSize: 16 }} className="text-primary" />
                          <span className="font-medium">Bahasa Pengantar:</span>
                          <span className="font-semibold text-on-surface">
                            {catalog.talentLanguages.join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Action Navigation Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-outline-variant/30">
                        <Link
                          href={`/profile/${catalog.talent_profile_id || catalog.id}`}
                          className="flex-1 py-2.5 px-4 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-2"
                        >
                          <span>Lihat Profil Publik Lengkap</span>
                          <ArrowForwardIcon sx={{ fontSize: 15 }} />
                        </Link>
                        <Link
                          href={`/chat?recipient=${catalog.talent_profile_id || catalog.id}`}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-xs text-center transition-all flex items-center justify-center gap-2 shadow-xs"
                        >
                          <ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />
                          <span>Kirim Pesan / Tanya Mentor</span>
                        </Link>
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

                {/* Promo Card / Secondary Action: Chat Mentor */}
                <div className="bg-primary text-white p-6 rounded-2xl relative overflow-hidden shadow-md">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                      <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
                      <h4 className="font-bold text-base">Punya Pertanyaan?</h4>
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed">
                      Konsultasikan kebutuhan atau jadwal bimbingan Anda langsung dengan <strong>{catalog.talentName}</strong> sebelum melakukan pembayaran.
                    </p>
                    <Link
                      href={`/chat?recipient=${catalog.talent_profile_id || catalog.id}`}
                      className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-white text-primary font-bold text-xs rounded-xl shadow-xs hover:bg-white/90 active:scale-95 transition-all text-center"
                    >
                      Hubungi Mentor Sekarang
                    </Link>
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
