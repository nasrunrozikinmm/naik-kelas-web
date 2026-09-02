"use client";

import React from "react";
import Image from "next/image";
import VerifiedIcon from "@mui/icons-material/Verified";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Chip } from "@mui/material";
import type { FeaturedMentor } from "@/types/domain";

const DEFAULT_FEATURED_MENTORS: FeaturedMentor[] = [
  {
    id: "mentor-1",
    name: "Dr. Amanda Wijaya, M.Sc.",
    title: "Alumni Oxford University",
    institution: "Awardee LPDP Luar Negeri",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
    rating: 4.98,
    reviewsCount: 142,
    sessionsCount: 310,
    isVerified: true,
    expertise: ["Beasiswa LPDP", "Motivation Letter", "Mock Interview", "Oxford & UK Admissions"],
    topScholarship: "LPDP Target Prestasi",
    bio: "Berpengalaman mendampingi 80+ awardee lolos seleksi beasiswa S2/S3 di Inggris dan Eropa."
  },
  {
    id: "mentor-2",
    name: "Rian Pratama, B.Eng., MBA",
    title: "Harvard Kennedy School Alum",
    institution: "AAS & Fulbright Scholar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    rating: 4.95,
    reviewsCount: 98,
    sessionsCount: 225,
    isVerified: true,
    expertise: ["AAS Australia", "Fulbright US", "Study Plan", "Leadership Essay"],
    topScholarship: "AAS Category A",
    bio: "Spesialisasi kurasi esai kontribusi dan strategi interview beasiswa Amerika & Australia."
  },
  {
    id: "mentor-3",
    name: "Nadia Safitri, S.Psi., M.Ed.",
    title: "Pendidik & Praktisi Tes",
    institution: "Universitas Indonesia Alum",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400",
    rating: 4.92,
    reviewsCount: 215,
    sessionsCount: 450,
    isVerified: true,
    expertise: ["TPS UTBK", "IELTS 8.5", "Manajemen Waktu Belajar", "Akademik High School"],
    topScholarship: "Best Educator 2024",
    bio: "Pengajar persiapan ujian terstruktur dengan bank soal analitis dan metode pemecahan cepat."
  }
];

interface MentorSpotlightProps {
  mentors?: FeaturedMentor[];
  onSelectMentor: (mentorName: string) => void;
}

export function MentorSpotlight({
  mentors = DEFAULT_FEATURED_MENTORS,
  onSelectMentor
}: MentorSpotlightProps) {
  const handleConsultClick = (mentorName: string) => {
    onSelectMentor(mentorName);
    const catalogEl = document.getElementById("katalog-section");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="w-full py-12 md:py-16 bg-surface-container-lowest border-y border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <VerifiedIcon sx={{ fontSize: 16 }} />
              <span>Standar Seleksi & Verifikasi Ketat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Belajar Langsung dari <span className="text-primary">Mentor Berprestasi</span>
            </h2>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Semua mentor kami telah melewati verifikasi identitas (KYC), rekam jejak akademik, dan kurikulum materi bimbingan yang terbukti meloloskan ribuan pelajar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant">
              100% Terverifikasi Resmi
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 hover:border-primary/50 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              <div>
                {/* Header: Avatar, Badge & Verified Indicator */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 shadow-xs">
                    <Image
                      src={mentor.avatar}
                      alt={mentor.name}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-on-surface truncate">
                        {mentor.name}
                      </h3>
                      {mentor.isVerified && (
                        <VerifiedIcon
                          sx={{ fontSize: 18 }}
                          className="text-primary shrink-0"
                          titleAccess="Mentor Terverifikasi"
                        />
                      )}
                    </div>

                    <p className="text-xs font-semibold text-primary mt-0.5 truncate">
                      {mentor.title}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-0.5">
                      <SchoolIcon sx={{ fontSize: 13 }} className="text-outline" />
                      <span className="truncate">{mentor.institution}</span>
                    </div>
                  </div>
                </div>

                {/* Bio Excerpt */}
                {mentor.bio && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                    {mentor.bio}
                  </p>
                )}

                {/* Expertise Chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {mentor.expertise.slice(0, 3).map((exp, idx) => (
                    <Chip
                      key={idx}
                      label={exp}
                      size="small"
                      sx={{
                        fontSize: "0.7rem",
                        height: 22,
                        borderRadius: 1,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider"
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                {/* Statistics Bar */}
                <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center gap-1">
                    <StarIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
                    <span className="font-bold text-on-surface">
                      {mentor.rating.toFixed(1)}
                    </span>
                    <span className="text-on-surface-variant text-[11px]">
                      ({mentor.reviewsCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-on-surface-variant text-[11px] font-medium">
                    <CalendarMonthIcon sx={{ fontSize: 14 }} className="text-outline" />
                    <span>{mentor.sessionsCount}+ Sesi Sukses</span>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() => handleConsultClick(mentor.name)}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-primary text-on-surface hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs group-hover:bg-primary group-hover:text-white"
                >
                  <span>Cari Layanan Mentor Ini</span>
                  <ArrowForwardIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

