import PersonIcon from "@mui/icons-material/Person";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CatalogCard } from "@/components/marketplace/CatalogCard";
import { mockFeaturedCatalogs } from "@/lib/mock/data";

import { use } from "react";
import VerifiedIcon from "@mui/icons-material/Verified";
import StarIcon from "@mui/icons-material/Star";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolIcon from "@mui/icons-material/School";
import LanguageIcon from "@mui/icons-material/Language";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  // Resolve mentor data from mockFeaturedCatalogs or matching talent ID
  const matchedCatalog =
    mockFeaturedCatalogs.find(
      (c) =>
        c.talent_profile_id === id ||
        c.id === id ||
        c.talentName.toLowerCase().includes(id.toLowerCase())
    ) || mockFeaturedCatalogs[0];

  const mentorName = matchedCatalog.talentName || "Dr. Amanda Wijaya, M.Sc.";
  const mentorAvatar =
    matchedCatalog.talentAvatar ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400";
  const mentorTitle =
    matchedCatalog.talentTitle || matchedCatalog.institution || "Alumni Oxford University";
  const institution =
    matchedCatalog.institution || "Awardee LPDP Luar Negeri";
  const mentorBio =
    matchedCatalog.talentBio ||
    "Berpengalaman mendampingi 80+ awardee lolos seleksi beasiswa S2/S3 di Inggris dan Eropa dengan kurasi esai dan simulasi wawancara mendalam.";
  const expertise = matchedCatalog.talentExpertise || [
    "Beasiswa LPDP",
    "Motivation Letter",
    "Mock Interview",
    "Oxford & UK Admissions"
  ];
  const languages = matchedCatalog.talentLanguages || ["Bahasa Indonesia", "English (Fluent)"];
  const rating = matchedCatalog.talentRating || 4.98;
  const reviewsCount = matchedCatalog.talentReviewsCount || 142;
  const sessionsCount = matchedCatalog.talentSessionsCount || 310;
  const experienceYears = matchedCatalog.talentExperienceYears || 6;

  // Find all catalogs by this talent
  const talentCatalogs = mockFeaturedCatalogs.filter(
    (c) => c.talentName === matchedCatalog.talentName || c.talent_profile_id === matchedCatalog.talent_profile_id
  );
  const displayCatalogs = talentCatalogs.length > 0 ? talentCatalogs : [matchedCatalog];

  return (
    <AppShell>
      <Box sx={{ py: 4 }}>
        <Container maxWidth="md">
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2} alignItems="flex-start">
              <PersonIcon color="primary" />
              <Typography component="h1" variant="h2">
                Public Profile — {id}
              </Typography>
              <Typography color="text.secondary">Profile details and verification status (mock).</Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
      <div className="bg-background min-h-screen pb-20">
        {/* Navigation Breadcrumb */}
        <div className="border-b border-outline-variant/30 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <span>Kembali ke Marketplace</span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <VerifiedIcon sx={{ fontSize: 15 }} />
              <span>Profil Mentor Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-surface border-b border-outline-variant/30 pt-8 pb-12 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-primary shrink-0 shadow-md border-4 border-surface-container-lowest">
              <Image
                src={mentorAvatar}
                alt={mentorName}
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                  {mentorName}
                </h1>
                <VerifiedIcon sx={{ fontSize: 22, color: "primary.main" }} />
              </div>

              <div className="flex items-center gap-2 text-sm text-primary font-bold flex-wrap">
                <SchoolIcon sx={{ fontSize: 18 }} />
                <span>{mentorTitle}</span>
                <span className="text-outline-variant">•</span>
                <span className="text-on-surface-variant font-medium">{institution}</span>
              </div>

              {/* Quick Metrics Bar */}
              <div className="flex items-center gap-6 pt-2 text-sm flex-wrap">
                <div className="flex items-center gap-1.5 font-bold text-on-surface">
                  <StarIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
                  <span>{rating.toFixed(2)}</span>
                  <span className="text-xs text-on-surface-variant font-normal">
                    ({reviewsCount} Ulasan)
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-outline-variant" />
                <div className="flex items-center gap-1.5 font-semibold text-on-surface text-xs sm:text-sm">
                  <WorkspacePremiumIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <span>{sessionsCount}+ Sesi Bimbingan Selesai</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-outline-variant" />
                <div className="text-xs sm:text-sm text-on-surface-variant font-medium">
                  {experienceYears}+ Tahun Pengalaman
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3 flex-wrap">
                <Link
                  href={`/chat?recipient=${id}`}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
                  <span>Kirim Pesan Langsung</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Details & Offered Catalogs */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left Sidebar: About & Expertise */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-on-surface">Tentang Mentor</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {mentorBio}
                </p>

                <div className="pt-3 border-t border-outline-variant/30 space-y-3">
                  <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider">
                    Bidang Keahlian
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {expertise.map((exp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/30 space-y-2">
                  <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider">
                    Bahasa Pengantar
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <LanguageIcon sx={{ fontSize: 16 }} className="text-primary" />
                    <span className="font-semibold text-on-surface">{languages.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Area: Catalogs Offered by Mentor */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">
                    Layanan &amp; Kelas yang Tersedia
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Pilih program bimbingan untuk reservasi sesi bersama {mentorName}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {displayCatalogs.length} Program
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayCatalogs.map((catalog) => (
                  <CatalogCard key={catalog.id} catalog={catalog} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
