"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// MUI Icons
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import SchoolIcon from "@mui/icons-material/School";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, dashboardUrl } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(dashboardUrl);
    }
  }, [isAuthenticated, dashboardUrl, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-body-md selection:bg-primary selection:text-white">
      {/* Left Showcase Banner (Desktop & Tablet) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#002266] via-[#00399e] to-[#1353d8] text-white p-10 xl:p-14 flex-col justify-between overflow-hidden">
        {/* Background Ambient Lighting Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Back Link */}
        <div className="flex items-center justify-between relative z-10">
          <Link href="/" className="flex items-center gap-2.5 text-white group">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
              <SchoolIcon sx={{ fontSize: 22, color: "#ffffff" }} />
            </div>
            <span className="font-headline-md text-xl font-bold tracking-tight">
              Naik Kelas
            </span>
          </Link>
        </div>

        {/* Center Showcase Card */}
        <div className="relative z-10 my-auto py-6 max-w-lg mx-auto w-full">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2">
            <div className="relative w-full h-[340px] xl:h-[380px] rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"
                alt="Naik Kelas"
                fill
                priority
                sizes="500px"
                className="object-cover"
              />
              {/* Floating Stat Badge 1 */}
              <div className="absolute top-4 right-4 bg-white/95 text-[#151c27] px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 text-xs font-bold">
                <StarIcon sx={{ fontSize: 16, color: "#FAB005" }} />
                <span>4.9 / 5.0 (12rb+ Siswa)</span>
              </div>
              {/* Floating Stat Badge 2 */}
              <div className="absolute bottom-4 left-4 bg-white/95 text-[#151c27] px-4 py-2 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2.5 text-xs font-bold">
                <VerifiedIcon sx={{ fontSize: 20, color: "#008545" }} />
                <div>
                  <p className="text-xs leading-none">
                    500+ Mentor Terverifikasi
                  </p>
                  <span className="text-[10px] text-[#434654] font-normal">
                    Alumni LPDP &amp; Global Top Univ
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2 text-left">
            <h2 className="font-headline-lg text-2xl xl:text-3xl font-bold tracking-tight text-white leading-snug">
              Wujudkan Impian Akademik &amp; Kariermu Bersama Naik Kelas.
            </h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-md">
              Platform edukasi terpercaya untuk bimbingan beasiswa, kursus
              privat intensif, dan bimbingan karier langsung dari para ahli.
            </p>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
          <div>
            <span className="font-bold text-white text-base block">
              10.000+
            </span>
            <span>Alumni Lolos Beasiswa</span>
          </div>
          <div className="w-[1px] h-8 bg-white/20" />
          <div>
            <span className="font-bold text-white text-base block">98%</span>
            <span>Tingkat Kepuasan Siswa</span>
          </div>
          <div className="w-[1px] h-8 bg-white/20" />
          <div>
            <span className="font-bold text-white text-base block">100%</span>
            <span>Materi Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between min-h-screen p-4 sm:p-8 lg:p-12 overflow-y-auto bg-surface text-on-surface">
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-end mb-2">
          <ThemeToggle />
        </div>

        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/30">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
              <SchoolIcon sx={{ fontSize: 18 }} />
            </div>
            <span>Naik Kelas</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Centered Form Wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-4 sm:py-6">
          {children}
        </div>

        {/* Auth Footer */}
        <div className="w-full max-w-md mx-auto pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <p>© 2026 Naik Kelas</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-primary transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Privasi
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Bantuan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
