"use client";

import React from "react";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";

export default function StudentDashboardPage() {
  const auth = useAppSelector((s) => s.auth);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Welcome Hero Card */}
        <div className="md:col-span-8 p-8 rounded-2xl bg-primary text-white flex flex-col md:flex-row justify-between items-center overflow-hidden relative">
          <div className="z-10 relative">
            <h2 className="font-headline-lg text-3xl font-bold mb-2">Halo, {auth.displayName?.split(" ")[0] || "Siswa"}! 👋</h2>
            <p className="font-body-md opacity-90 max-w-md">
              Lanjutkan progres belajarmu hari ini. Kamu memiliki 2 sesi kelas yang akan datang dalam minggu ini.
            </p>
            <button className="mt-6 px-6 py-2 bg-secondary text-white font-bold rounded-lg hover:opacity-90 transition-all active:scale-95">
              Mulai Belajar
            </button>
          </div>
          <div className="absolute right-0 top-0 opacity-20 -mr-10">
            <span className="material-symbols-outlined text-[180px]">school</span>
          </div>
        </div>

        {/* Consultation Widget */}
        <div className="md:col-span-4 p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-primary/20 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary font-bold text-sm uppercase tracking-wider">Konsultasi Aktif</p>
              <h3 className="font-headline-md text-2xl font-bold mt-1">Chat Mentor</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">chat_bubble</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-md text-on-surface-variant">Sisa masa aktif</span>
              <span className="font-bold text-primary">12 Hari</span>
            </div>
            <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: "40%" }}></div>
            </div>
          </div>
          <button className="mt-4 w-full py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-all">
            Buka Chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Content & Active Sessions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Quick Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant flex items-center gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <p className="text-sm text-on-surface-variant">Pesanan Aktif</p>
                <p className="text-xl font-bold">3 Pesanan</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant flex items-center gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <div>
                <p className="text-sm text-on-surface-variant">Sesi Mendatang</p>
                <p className="text-xl font-bold">2 Sesi</p>
              </div>
            </div>
          </div>

          {/* Materi Terakhir Diakses */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-xl font-bold">Materi Terakhir Diakses</h3>
              <Link href="/student/courses" className="text-primary font-bold text-sm hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-all group border border-transparent hover:border-outline-variant/30 cursor-pointer">
                <div className="relative w-20 h-14 rounded-lg bg-surface-variant overflow-hidden shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200"
                    alt="Thumb"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface line-clamp-1">Dasar Pemrograman Python untuk Pemula</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Selesai 45%
                    </span>
                    <span className="text-xs text-on-surface-variant">Video 4 dari 12</span>
                  </div>
                </div>
                <button className="text-primary opacity-0 group-hover:opacity-100 transition-all p-2 bg-primary/10 rounded-full">
                  <span className="material-symbols-outlined">play_arrow</span>
                </button>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-all group border border-transparent hover:border-outline-variant/30 cursor-pointer">
                <div className="relative w-20 h-14 rounded-lg bg-surface-variant overflow-hidden shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=200"
                    alt="Thumb"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface line-clamp-1">E-book: Mastering English Grammar</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">menu_book</span>
                      Halaman 12 dari 150
                    </span>
                  </div>
                </div>
                <button className="text-primary opacity-0 group-hover:opacity-100 transition-all p-2 bg-primary/10 rounded-full">
                  <span className="material-symbols-outlined">open_in_new</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Pembayaran Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant">
              <h3 className="font-headline-md text-xl font-bold">Status Pembayaran Terakhir</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-md">
                    <th className="px-6 py-4 font-bold">Produk</th>
                    <th className="px-6 py-4 font-bold">Tanggal</th>
                    <th className="px-6 py-4 font-bold text-right">Total</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  <tr>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm">Live Class Python</p>
                      <p className="text-xs text-on-surface-variant">INV/20240510/05</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">10 Mei 2024</td>
                    <td className="px-6 py-4 text-sm font-bold text-right">Rp 450.000</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Aktif</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm">Mentor Beasiswa LPDP</p>
                      <p className="text-xs text-on-surface-variant">INV/20240515/09</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">Kemarin</td>
                    <td className="px-6 py-4 text-sm font-bold text-right">Rp 750.000</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAB0051a] text-[#976F00]">Menunggu</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Content */}
        <div className="space-y-8">
          {/* Sesi Mendatang Widget */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant">
            <h3 className="font-bold text-on-surface mb-4">Sesi Mendatang</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/10 bg-primary-container/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary text-white rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">videocam</span>
                  </div>
                  <p className="text-xs font-bold text-primary uppercase">Live Class</p>
                </div>
                <h4 className="font-bold text-sm">Live Class Python - Sesi 5</h4>
                <p className="text-xs text-on-surface-variant mt-1">Besok, 19:00 - 21:00 WIB</p>
                <button className="mt-3 w-full py-2 bg-primary text-white text-xs font-bold rounded-lg transition-transform active:scale-95">
                  Gabung Zoom
                </button>
              </div>
              <div className="p-4 rounded-xl border border-outline-variant bg-surface">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-secondary text-white rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">person_search</span>
                  </div>
                  <p className="text-xs font-bold text-secondary uppercase">Konsultasi</p>
                </div>
                <h4 className="font-bold text-sm">Review CV & Portfolio</h4>
                <p className="text-xs text-on-surface-variant mt-1">Kamis, 15 Mei 2024</p>
                <button className="mt-3 w-full py-2 border border-outline-variant text-on-surface text-xs font-bold rounded-lg hover:bg-surface-variant">
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>

          {/* Progress Belajar Widget */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant relative overflow-hidden">
            <h3 className="font-bold text-on-surface mb-6">Progres Mingguan</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-surface-variant rounded-t-sm" style={{ height: "40%" }}></div>
                <span className="text-[10px] font-bold text-outline">Sen</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-primary rounded-t-sm" style={{ height: "85%" }}></div>
                <span className="text-[10px] font-bold text-primary">Sel</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-surface-variant rounded-t-sm" style={{ height: "25%" }}></div>
                <span className="text-[10px] font-bold text-outline">Rab</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-surface-variant rounded-t-sm" style={{ height: "60%" }}></div>
                <span className="text-[10px] font-bold text-outline">Kam</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-surface-variant rounded-t-sm" style={{ height: "30%" }}></div>
                <span className="text-[10px] font-bold text-outline">Jum</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-surface-variant rounded-t-sm" style={{ height: "10%" }}></div>
                <span className="text-[10px] font-bold text-outline">Sab</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-surface-variant rounded-t-sm" style={{ height: "5%" }}></div>
                <span className="text-[10px] font-bold text-outline">Min</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant flex justify-between items-center">
              <div>
                <p className="text-xs text-on-surface-variant">Waktu Belajar</p>
                <p className="font-bold">12j 45m</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">Target Minggu Ini</p>
                <p className="font-bold text-primary">15j 00m</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
