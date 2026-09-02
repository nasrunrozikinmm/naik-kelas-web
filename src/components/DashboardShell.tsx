"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/utils/role";

// MUI Icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />, href: "/student/dashboard" },
  { label: "Pesanan Saya", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />, href: "/student/orders" },
  { label: "Kelas & Materi", icon: <MenuBookOutlinedIcon sx={{ fontSize: 20 }} />, href: "/student/courses" },
  { label: "Booking", icon: <EventOutlinedIcon sx={{ fontSize: 20 }} />, href: "/student/bookings" },
  { label: "Chat", icon: <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />, href: "/student/chat" },
  { label: "Ulasan", icon: <StarBorderOutlinedIcon sx={{ fontSize: 20 }} />, href: "/student/reviews" },
  { label: "Profil & Preferensi", icon: <PersonOutlineIcon sx={{ fontSize: 20 }} />, href: "/student/preferences" },
  { label: "Pengaturan", icon: <SettingsOutlinedIcon sx={{ fontSize: 20 }} />, href: "/student/settings" },
];

const TALENT_NAV: NavItem[] = [
  { label: "Dashboard", icon: <AnalyticsOutlinedIcon sx={{ fontSize: 20 }} />, href: "/talent/dashboard" },
  { label: "Profil Publik & KYC", icon: <BadgeOutlinedIcon sx={{ fontSize: 20 }} />, href: "/talent/profile" },
  { label: "Layanan Saya", icon: <LayersOutlinedIcon sx={{ fontSize: 20 }} />, href: "/talent/catalogs" },
  { label: "Jadwal", icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />, href: "/talent/schedule" },
  { label: "Konten", icon: <VideoLibraryOutlinedIcon sx={{ fontSize: 20 }} />, href: "/talent/media" },
  { label: "Order", icon: <ShoppingBasketOutlinedIcon sx={{ fontSize: 20 }} />, href: "/talent/orders" },
  { label: "Chat Siswa", icon: <ForumOutlinedIcon sx={{ fontSize: 20 }} />, href: "/talent/chat" },
  { label: "Payout", icon: <PaymentsOutlinedIcon sx={{ fontSize: 20 }} />, href: "/talent/payouts" },
  { label: "Pengaturan", icon: <SettingsOutlinedIcon sx={{ fontSize: 20 }} />, href: "/talent/settings" },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />, href: "/admin/dashboard" },
  { label: "Persetujuan Talent", icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 20 }} />, href: "/admin/talent-approval" },
  { label: "Manajemen Transaksi", icon: <AccountBalanceOutlinedIcon sx={{ fontSize: 20 }} />, href: "/admin/transactions" },
  { label: "Kategori", icon: <CategoryOutlinedIcon sx={{ fontSize: 20 }} />, href: "/admin/categories" },
  { label: "Manajemen User", icon: <GroupOutlinedIcon sx={{ fontSize: 20 }} />, href: "/admin/users" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { displayName, activeRole, logout, isTalent, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  let navItems: NavItem[] = STUDENT_NAV;
  let title = "Dashboard Siswa";

  if (isTalent) {
    navItems = TALENT_NAV;
    title = "Dashboard Talent";
  } else if (isAdmin) {
    navItems = ADMIN_NAV;
    title = "Admin Dashboard";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col bg-surface-container-low border-r border-outline-variant/40 z-40">
        <div className="p-6 pb-4">
          <Link href="/" className="font-headline-md font-bold text-xl text-primary tracking-tight">
            Naik Kelas
          </Link>
        </div>

        <div className="flex flex-col gap-2 px-4 py-2 flex-1 overflow-y-auto">
          {/* User Profile Card */}
          <div className="mb-3 p-3 bg-surface-container rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              {displayName?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-on-surface truncate">{displayName || "Pengguna"}</p>
              <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider truncate">
                {getRoleLabel(activeRole)}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-on-surface-variant"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-auto p-4 border-t border-outline-variant/40">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-error hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
          >
            <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="flex justify-between items-center w-full px-4 md:px-8 h-16 sticky top-0 z-30 bg-surface/90 backdrop-blur-xs border-b border-outline-variant/40 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle Menu"
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon sx={{ fontSize: 22 }} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Notifikasi"
              className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors relative"
            >
              <NotificationsNoneIcon sx={{ fontSize: 22 }} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full ring-2 ring-surface" />
            </button>
            <div className="hidden sm:block h-6 w-px bg-outline-variant/50 mx-1" />
            <div
              className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs"
              onClick={() => router.push("/")}
              title="Ke Halaman Utama"
            >
              {displayName?.[0] || "U"}
            </div>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar pb-24 md:pb-12">
          {children}
        </div>
      </main>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" />
          <aside
            className="relative w-72 bg-surface h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 flex items-center justify-between border-b border-outline-variant/40">
              <span className="font-headline-md font-bold text-lg text-primary">Naik Kelas</span>
              <button
                aria-label="Tutup Menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded-lg"
              >
                <CloseIcon sx={{ fontSize: 22 }} />
              </button>
            </div>

            <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
              <div className="mb-2 p-3 bg-surface-container-low rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
                  {displayName?.[0] || "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-on-surface truncate">{displayName || "Pengguna"}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase">{getRoleLabel(activeRole)}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-on-surface-variant hover:bg-surface-variant"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto p-4 border-t border-outline-variant/40">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-error hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
                <span>Keluar</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
