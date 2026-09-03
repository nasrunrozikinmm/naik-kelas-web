"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/utils/role";
import { ThemeToggle } from "./ThemeToggle";
import { BrandLogo } from "./BrandLogo";

// MUI Icons
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SendIcon from "@mui/icons-material/Send";
import PublicIcon from "@mui/icons-material/Public";
import ShareIcon from "@mui/icons-material/Share";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, displayName, activeRole, dashboardUrl } = useAuth();
  const cartItemsCount = useAppSelector((s) => s.cart.items.reduce((a, b) => a + b.qty, 0));
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-surface border-b border-outline-variant/40 shadow-xs flex justify-between items-center w-full px-4 lg:px-10 h-16 sticky top-0 z-50">
        <div className="flex items-center gap-6 lg:gap-8 flex-1">
          <Link href="/" className="shrink-0">
            <BrandLogo size="md" priority />
          </Link>
          {/* Desktop Search Bar */}
          <div className="hidden md:flex relative w-full max-w-md items-center">
            <SearchIcon className="absolute left-3 text-outline" sx={{ fontSize: 20 }} />
            <input
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:outline-hidden transition-all text-on-surface placeholder:text-on-surface-variant/70"
              placeholder="Cari mentor, topik, atau kursus..."
              type="text"
            />
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 px-6">
          <Link className="text-primary border-b-2 border-primary font-bold pb-1 text-sm transition-colors" href="/">
            Beranda
          </Link>
          <Link className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors" href="/catalog/mentoring">
            Mentoring
          </Link>
          <Link className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors" href="/catalog/course">
            Video Course
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            aria-label="Notifikasi"
            className="hidden sm:flex items-center justify-center p-2 h-10 w-10 text-on-surface-variant hover:bg-surface-variant rounded-full transition-all"
          >
            <NotificationsNoneIcon sx={{ fontSize: 22 }} />
          </button>

          <Link
            href="/cart"
            aria-label="Keranjang Belanja"
            className="relative h-10 w-10 p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-all flex items-center justify-center"
          >
            <ShoppingCartOutlinedIcon sx={{ fontSize: 22 }} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <div className="hidden sm:block h-7 w-px bg-outline-variant/50 mx-1" />

          {isAuthenticated ? (
            <div
              className="hidden sm:flex items-center gap-2.5 cursor-pointer p-1 rounded-xl hover:bg-surface-container transition-all"
              onClick={() => router.push(dashboardUrl)}
            >
              <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {displayName?.[0] || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-on-surface leading-tight max-w-[120px] truncate">{displayName}</p>
                <p className="text-[10px] text-outline uppercase tracking-wider font-semibold">
                  {getRoleLabel(activeRole)}
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-container rounded-xl shadow-xs transition-colors"
              >
                Masuk
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            aria-label="Menu"
            className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon sx={{ fontSize: 24 }} /> : <MenuIcon sx={{ fontSize: 24 }} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-xs flex flex-col" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="bg-surface border-b border-outline-variant p-6 space-y-5 shadow-xl animate-in slide-in-from-top duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-2.5 text-outline" sx={{ fontSize: 20 }} />
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:outline-hidden transition-all text-on-surface"
                placeholder="Cari mentor atau kursus..."
                type="text"
              />
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                className="text-primary font-bold text-sm py-2 px-3 rounded-lg hover:bg-surface-variant"
                href="/"
                onClick={() => setMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                className="text-on-surface-variant text-sm py-2 px-3 rounded-lg hover:bg-surface-variant"
                href="/catalog/mentoring"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mentoring
              </Link>
              <Link
                className="text-on-surface-variant text-sm py-2 px-3 rounded-lg hover:bg-surface-variant"
                href="/catalog/course"
                onClick={() => setMobileMenuOpen(false)}
              >
                Video Course
              </Link>

              <hr className="border-outline-variant/40 my-2" />

              {isAuthenticated ? (
                <Link
                  className="text-on-surface font-semibold text-sm flex items-center gap-2.5 py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-variant"
                  href={dashboardUrl}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <AccountCircleOutlinedIcon sx={{ fontSize: 20 }} className="text-primary" />
                  <span>Dashboard ({getRoleLabel(activeRole)})</span>
                </Link>
              ) : (
                <Link
                  className="text-center font-bold text-sm py-2.5 px-4 rounded-xl bg-primary text-white hover:bg-primary-container"
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Masuk ke Akun
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Responsive Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <BrandLogo size="md" textClassName="text-primary-fixed-dim" variant="dark" />
            <p className="text-sm pr-4 opacity-80 leading-relaxed">
              Membangun masa depan pendidikan Indonesia melalui kolaborasi mentor terverifikasi dan siswa berprestasi.
            </p>
            <div className="flex gap-4 pt-2">
              <a className="text-primary-fixed-dim hover:scale-110 transition-transform" href="#" aria-label="Website">
                <PublicIcon sx={{ fontSize: 20 }} />
              </a>
              <a className="text-primary-fixed-dim hover:scale-110 transition-transform" href="#" aria-label="Bagikan">
                <ShareIcon sx={{ fontSize: 20 }} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link className="hover:text-white transition-colors" href="/catalog/mentoring">Mentoring 1-on-1</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/catalog/course">Video Course</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/talent/register">Menjadi Mentor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Bantuan</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a className="hover:text-white transition-colors" href="#">Pusat Bantuan</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Kebijakan Privasi</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Syarat & Ketentuan</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Newsletter</h4>
            <p className="text-xs mb-3 opacity-80">Dapatkan info beasiswa dan promo materi terbaru.</p>
            <div className="flex gap-2">
              <input
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-hidden flex-1 w-full text-white placeholder-slate-400"
                placeholder="Email Anda"
                type="email"
              />
              <button
                aria-label="Kirim"
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary-container transition-all flex items-center justify-center shrink-0"
              >
                <SendIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-10 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs opacity-60">© 2026 Naik Kelas Online Education. Hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}
