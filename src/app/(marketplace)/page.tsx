"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { MarketList } from "@/components/marketplace/MarketList";
import { HeroShortcuts } from "@/components/marketplace/HeroShortcuts";
import { MentorSpotlight } from "@/components/marketplace/MentorSpotlight";
import { CardSkeleton } from "@/components/common/SkeletonLoader";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { mockFeaturedCatalogs } from "@/lib/mock/data";
import type { CatalogCardModel, Category } from "@/types/domain";

import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ForumIcon from "@mui/icons-material/Forum";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function enrichCatalogWithTalent(c: any): CatalogCardModel {
  const p = c.talent_profile;
  const cat = c.category?.name || c.category || "Umum";

  return {
    ...c,
    category: cat,
    excerpt: c.description || c.excerpt || "",
    image: c.image_url || c.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=640",
    talentName: p?.display_name || p?.user?.name || c.talentName || "Mentor Naik Kelas",
    talentAvatar: p?.avatar_url || c.talentAvatar || "",
    talentTitle: p?.expertise || c.talentTitle || "Mentor",
    institution: p?.institution || p?.education_level || c.institution || "",
    talentBio: p?.bio || c.talentBio || "",
    talentExpertise: p?.languages || c.talentExpertise || [],
    talentRating: Number(p?.rating) || c.rating || 5.0,
    talentReviewsCount: c.reviewsCount || 0,
    talentSessionsCount: p?.total_sales || c.soldCount || 0,
    talentExperienceYears: p?.experience_years || 0,
    talentLanguages: p?.languages || ["Bahasa Indonesia"],
    isVerified: p?.verification_status === "verified" || c.isVerified === true,
    talent_profile_id: c.talent_profile_id || p?.id || c.id,
    rating: Number(p?.rating) || c.rating || 5.0,
    reviewsCount: c.reviewsCount || 0
  };
}

export default function MarketplacePage() {
  const [catalogs, setCatalogs] = useState<CatalogCardModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [catRes, cataRes] = await Promise.all([
          apiClient.get(endpoints.categories.list).catch(() => null),
          apiClient.get(`${endpoints.catalog.list}?status=published`).catch(() => null)
        ]);

        if (isMounted) {
          const apiCats = catRes?.data?.data;
          const apiCatalogs = cataRes?.data?.data;

          if (apiCats && Array.isArray(apiCats)) {
            setCategories(apiCats);
          }

          if (apiCatalogs && Array.isArray(apiCatalogs)) {
            setCatalogs(apiCatalogs.map(enrichCatalogWithTalent));
          } else {
            setCatalogs([]);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch marketplace data", error);
        if (isMounted) {
          setCatalogs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleShortcutSelect = (keyword: string) => {
    const matched = categories.find(
      (c) =>
        c.name.toLowerCase().includes(keyword.toLowerCase()) ||
        c.slug?.toLowerCase().includes(keyword.toLowerCase())
    );
    if (matched) {
      setSelectedCategory(matched.id);
      setSearchQuery("");
    } else {
      setSelectedCategory(null);
      setSearchQuery(keyword);
    }
  };

  const handleMentorSelect = (mentorName: string) => {
    setSelectedCategory(null);
    setSearchQuery(mentorName);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById("katalog-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToMentors = () => {
    const el = document.getElementById("mentor-spotlight");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen">
        {/* Hero Area */}
        <section className="relative w-full overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Marketplace Edukasi & Mentoring Terverifikasi #1</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface leading-tight tracking-tight">
                  Temukan Mentor dan <span className="text-primary">Materi Belajar</span> Terbaik
                </h1>

                <p className="text-sm sm:text-base text-on-surface-variant max-w-lg leading-relaxed">
                  Dapatkan pendampingan eksklusif dari alumni beasiswa dunia, tutor berprestasi, dan kurikulum teruji untuk mempercepat impian akademis dan karier Anda.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={scrollToCatalog}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
                  >
                    <span>Jelajahi Kelas & Layanan</span>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={scrollToMentors}
                    className="px-5 py-3 bg-surface-container hover:bg-surface-variant text-on-surface font-bold text-sm rounded-xl transition-all"
                  >
                    Lihat Profil Mentor
                  </button>
                </div>
              </div>

              {/* Hero Visual Spotlight Card */}
              <div className="hidden md:block relative h-full">
                <div className="relative p-5 rounded-3xl border border-outline-variant/30 shadow-xl bg-surface-container-lowest/90 backdrop-blur-xs">
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=640"
                      alt="Belajar Bersama Mentor"
                      fill
                      priority
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-emerald-500/95 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>LIVE INTERAKTIF</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-primary">Sesi Terdekat</p>
                      <p className="text-base font-bold text-on-surface">Bedah Esai Beasiswa LPDP & Oxford</p>
                    </div>
                    <button
                      type="button"
                      onClick={scrollToCatalog}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      Ikuti Sesi
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Thematic Hero Shortcuts */}
            <HeroShortcuts onSelectShortcut={handleShortcutSelect} />
          </div>
        </section>

        {/* 1. Marketplace Content Layout (Katalog sebelum talent/mentor) */}
        <section id="katalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 scroll-mt-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                Katalog Layanan & Kelas Bimbingan
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Pilih bimbingan 1-on-1 privat, live session, video course terstruktur, atau konsultasi esai terarah.
              </p>
            </div>
          </div>

          {loading ? (
            <CardSkeleton count={6} />
          ) : (
            <MarketList
              catalogs={catalogs}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </section>

        {/* 2. Mentor Spotlight Section (Kredibilitas Talent / Mentor) */}
        <div id="mentor-spotlight">
          <MentorSpotlight onSelectMentor={handleMentorSelect} />
        </div>

        {/* 3. Value Proposition Grid: Mengapa Memilih Belajar di Naik Kelas? */}
        <section className="bg-surface-container-low py-16 px-4 sm:px-6 lg:px-10 border-t border-outline-variant/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                <span>Keunggulan Platform</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                Mengapa Memilih Belajar di Naik Kelas?
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Ekosistem bimbingan terintegrasi dengan standar kurasi tinggi untuk mendampingi pencapaian akademik dan karier Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <VerifiedUserIcon sx={{ fontSize: 24 }} />
                </div>
                <h3 className="text-base font-bold text-on-surface">Mentor Terverifikasi</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Setiap mentor melalui seleksi ketat dokumen KYC, validasi almamater, dan rekam jejak beasiswa sebelum membuka sesi.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                  <MenuBookIcon sx={{ fontSize: 24 }} />
                </div>
                <h3 className="text-base font-bold text-on-surface">Materi Eksklusif & Terarah</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Akses modul bimbingan intensif, bank soal teruji, dan kurikulum aplikatif yang dirancang untuk hasil nyata.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center font-bold">
                  <ForumIcon sx={{ fontSize: 24 }} />
                </div>
                <h3 className="text-base font-bold text-on-surface">Konsultasi 1-on-1 Fleksibel</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Jadwal mentoring privat yang fleksibel dengan bedah esai mendalam serta simulasi wawancara interaktif.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <ShieldOutlinedIcon sx={{ fontSize: 24 }} />
                </div>
                <h3 className="text-base font-bold text-on-surface">Jaminan Sesi & Transaksi Aman</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Sistem pembayaran aman dengan jaminan slot bimbingan. Dana diteruskan hanya setelah sesi belajar terlaksana.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
