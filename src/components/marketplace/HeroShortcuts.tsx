"use client";

import React from "react";
import SchoolIcon from "@mui/icons-material/School";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import TranslateIcon from "@mui/icons-material/Translate";
import DescriptionIcon from "@mui/icons-material/Description";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";

export interface ShortcutItem {
  id: string;
  label: string;
  sublabel: string;
  badge?: string;
  categoryQuery: string;
  icon: React.ReactNode;
  iconColorClass: string;
  badgeColorClass?: string;
}

const SHORTCUTS: ShortcutItem[] = [
  {
    id: "beasiswa",
    label: "Beasiswa",
    sublabel: "LPDP & Luar Negeri",
    badge: "LPDP",
    categoryQuery: "beasiswa",
    icon: <SchoolIcon sx={{ fontSize: 26 }} />,
    iconColorClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 border-blue-100 dark:border-blue-800/40 group-hover:shadow-blue-500/20",
    badgeColorClass: "bg-blue-600 text-white"
  },
  {
    id: "utbk",
    label: "UTBK & SNBT",
    sublabel: "TPS & Skolastik",
    badge: "Intensif",
    categoryQuery: "persiapan tes",
    icon: <TrackChangesIcon sx={{ fontSize: 26 }} />,
    iconColorClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/40 group-hover:shadow-emerald-500/20",
    badgeColorClass: "bg-emerald-600 text-white"
  },
  {
    id: "bahasa",
    label: "Bahasa Asing",
    sublabel: "TOEFL & IELTS",
    badge: "Band 7+",
    categoryQuery: "bahasa",
    icon: <TranslateIcon sx={{ fontSize: 26 }} />,
    iconColorClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 border-amber-100 dark:border-amber-800/40 group-hover:shadow-amber-500/20",
    badgeColorClass: "bg-amber-600 text-white"
  },
  {
    id: "essay",
    label: "Review Esai",
    sublabel: "Esai & Portofolio",
    badge: "Detail",
    categoryQuery: "review",
    icon: <DescriptionIcon sx={{ fontSize: 26 }} />,
    iconColorClass:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300 border-violet-100 dark:border-violet-800/40 group-hover:shadow-violet-500/20",
    badgeColorClass: "bg-violet-600 text-white"
  },
  {
    id: "mentoring",
    label: "Mentoring",
    sublabel: "Konsultasi 1-on-1",
    badge: "1-on-1",
    categoryQuery: "mentoring",
    icon: <QuestionAnswerIcon sx={{ fontSize: 26 }} />,
    iconColorClass:
      "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border-rose-100 dark:border-rose-800/40 group-hover:shadow-rose-500/20",
    badgeColorClass: "bg-rose-600 text-white"
  },
  {
    id: "karier",
    label: "Karier & CV",
    sublabel: "Magang & Kerja",
    badge: "Praktisi",
    categoryQuery: "karier",
    icon: <WorkOutlineIcon sx={{ fontSize: 26 }} />,
    iconColorClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/40 group-hover:shadow-indigo-500/20",
    badgeColorClass: "bg-indigo-600 text-white"
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
    <div className="w-full mt-6">
      {/* Modern E-wallet Bento Container */}
      <div className="rounded-2xl sm:rounded-3xl bg-surface-container-lowest/85 dark:bg-surface-container-low/75 backdrop-blur-md border border-outline-variant/30 shadow-xs sm:shadow-sm p-4 sm:p-5 lg:p-6 transition-all">
        {/* Header Strip */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/15">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BoltOutlinedIcon sx={{ fontSize: 16 }} />
            </span>
            <span className="text-xs sm:text-sm font-bold text-on-surface tracking-tight">
              Akses Cepat Program
            </span>
          </div>
          <span className="text-[11px] font-medium text-on-surface-variant hidden sm:inline-block">
            Pilih untuk filter katalog langsung
          </span>
        </div>

        {/* Quick Action Grid (e-wallet style) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 lg:gap-4">
          {SHORTCUTS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.categoryQuery)}
              type="button"
              className="group flex flex-col items-center justify-start text-center p-2 sm:p-2.5 rounded-xl sm:rounded-2xl hover:bg-surface-container-low/60 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              {/* Icon Squircle with Badge */}
              <div className="relative mb-2">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105 group-hover:shadow-md ${item.iconColorClass}`}
                >
                  {item.icon}
                </div>

                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-extrabold rounded-full shadow-2xs border border-surface-container-lowest leading-none tracking-tight ${item.badgeColorClass}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <span className="text-xs sm:text-[13px] font-bold text-on-surface group-hover:text-primary transition-colors leading-tight line-clamp-1">
                {item.label}
              </span>
              <span className="text-[10px] sm:text-[11px] text-on-surface-variant/80 group-hover:text-on-surface-variant transition-colors line-clamp-1 mt-0.5">
                {item.sublabel}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

