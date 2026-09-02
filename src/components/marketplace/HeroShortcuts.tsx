"use client";

import React from "react";
import SchoolIcon from "@mui/icons-material/School";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import TranslateIcon from "@mui/icons-material/Translate";
import DescriptionIcon from "@mui/icons-material/Description";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export interface ShortcutItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  categoryQuery: string;
  icon: React.ReactNode;
  accentBg: string;
  accentText: string;
}

const SHORTCUTS: ShortcutItem[] = [
  {
    id: "beasiswa",
    title: "Bimbingan Beasiswa",
    subtitle: "LPDP, AAS, Fulbright",
    tag: "Terfavorit",
    categoryQuery: "beasiswa",
    icon: <SchoolIcon sx={{ fontSize: 24 }} />,
    accentBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    accentText: "text-blue-700 dark:text-blue-300"
  },
  {
    id: "utbk",
    title: "Persiapan UTBK & SNBT",
    subtitle: "TPS, Skolastik & TKA",
    tag: "Intensif",
    categoryQuery: "persiapan tes",
    icon: <TrackChangesIcon sx={{ fontSize: 24 }} />,
    accentBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    accentText: "text-emerald-700 dark:text-emerald-300"
  },
  {
    id: "bahasa",
    title: "Kelas TOEFL & IELTS",
    subtitle: "Target Skor 550+ / Band 7+",
    tag: "Akurasi Tinggi",
    categoryQuery: "bahasa",
    icon: <TranslateIcon sx={{ fontSize: 24 }} />,
    accentBg: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    accentText: "text-amber-800 dark:text-amber-300"
  },
  {
    id: "essay",
    title: "Review Esai & Portofolio",
    subtitle: "Feedback Detail & Proofreading",
    tag: "1-on-1",
    categoryQuery: "review",
    icon: <DescriptionIcon sx={{ fontSize: 24 }} />,
    accentBg: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    accentText: "text-violet-700 dark:text-violet-300"
  },
  {
    id: "mentoring",
    title: "Konsultasi 1-on-1",
    subtitle: "Diskusi Bebas Bareng Mentor",
    tag: "Fleksibel",
    categoryQuery: "mentoring",
    icon: <QuestionAnswerIcon sx={{ fontSize: 24 }} />,
    accentBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    accentText: "text-rose-700 dark:text-rose-300"
  },
  {
    id: "karier",
    title: "Karier & Magang",
    subtitle: "CV ATS & Interview Hacks",
    tag: "Praktisi",
    categoryQuery: "karier",
    icon: <WorkOutlineIcon sx={{ fontSize: 24 }} />,
    accentBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    accentText: "text-indigo-700 dark:text-indigo-300"
  }
];

interface HeroShortcutsProps {
  onSelectShortcut: (categoryKeyword: string) => void;
}

export function HeroShortcuts({ onSelectShortcut }: HeroShortcutsProps) {
  const handleClick = (categoryQuery: string) => {
    onSelectShortcut(categoryQuery);
    const catalogEl = document.getElementById("katalog-section");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full mt-8 pt-6 border-t border-outline-variant/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Jalan Pintas Belajar
          </p>
          <h3 className="text-sm sm:text-base font-bold text-on-surface">
            Pilih Program Prioritas Anda
          </h3>
        </div>
        <span className="hidden sm:inline-block text-xs text-on-surface-variant font-medium">
          Klik untuk memfilter katalog langsung
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {SHORTCUTS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.categoryQuery)}
            type="button"
            className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-200 text-left hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="flex items-start justify-between w-full mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${item.accentBg}`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {item.tag}
              </span>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                {item.title}
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">
                {item.subtitle}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Buka Kelas</span>
              <ArrowForwardIosIcon sx={{ fontSize: 10 }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

