"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { createCatalog } from "@/lib/api/catalog";
import { ScheduleSlotPicker, SlotItem } from "@/components/catalog/ScheduleSlotPicker";
import type { Category } from "@/types/domain";

// MUI Icons
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CircularProgress from "@mui/material/CircularProgress";

export default function NewCatalogPage() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("live_session");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(150000);
  const [duration, setDuration] = useState<number>(60);
  const [quota, setQuota] = useState<number>(10);
  const [requirements, setRequirements] = useState("");
  const [slots, setSlots] = useState<SlotItem[]>([]);

  // Metadata & Profile states
  const [categories, setCategories] = useState<Category[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Submitting states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadMetadata = async () => {
      try {
        const [catRes, profileRes] = await Promise.allSettled([
          apiClient.get(endpoints.categories.list),
          apiClient.get(endpoints.profile.me),
        ]);

        if (isMounted) {
          if (catRes.status === "fulfilled" && catRes.value.data?.data) {
            const list = catRes.value.data.data;
            setCategories(list);
            if (list.length > 0) {
              setCategoryId(list[0].id);
            }
          }

          if (profileRes.status === "fulfilled" && profileRes.value.data?.data) {
            const profile = profileRes.value.data.data;
            setIsVerified(profile.verification_status === "verified");
          }
        }
      } catch (err) {
        console.error("Failed to load metadata", err);
      } finally {
        if (isMounted) setLoadingMeta(false);
      }
    };

    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (targetStatus: "draft" | "pending_review") => {
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Judul layanan wajib diisi");
      return;
    }
    if (!categoryId) {
      setErrorMsg("Silakan pilih kategori");
      return;
    }
    if (price < 0) {
      setErrorMsg("Harga layanan tidak boleh negatif");
      return;
    }

    if (targetStatus === "pending_review" && !isVerified) {
      setErrorMsg(
        "Profil talent Anda belum terverifikasi (KYC). Anda hanya dapat menyimpan layanan sebagai draft hingga profil disetujui."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await createCatalog({
        title: title.trim(),
        category_id: categoryId,
        type,
        description: description.trim(),
        price: Number(price),
        duration: duration ? Number(duration) : undefined,
        quota: quota ? Number(quota) : undefined,
        status: targetStatus,
        requirements: requirements.trim(),
        slots:
          type === "live_session" && slots.length > 0
            ? slots.map((s) => ({
                start_time: s.start_time,
                end_time: s.end_time,
                capacity: s.capacity,
              }))
            : undefined,
      });

      router.push("/talent/catalogs");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      setErrorMsg(
        errorObj.response?.data?.error?.message ||
          "Gagal membuat layanan baru. Silakan periksa kembali formulir."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
        <Link href="/talent/catalogs" className="hover:text-primary transition-colors">
          Layanan Saya
        </Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} className="text-outline" />
        <span className="text-on-surface font-bold">Tambah Layanan Baru</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline-md tracking-tight">
            Buat Layanan Baru
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Bagikan keahlian Anda dan bantu ribuan pelajar di seluruh Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting || loadingMeta}
            onClick={() => handleSubmit("draft")}
            className="px-4 py-2 rounded-xl border border-primary text-primary font-bold text-xs hover:bg-surface-container-low transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Draft"}
          </button>
          <button
            type="button"
            disabled={isSubmitting || loadingMeta}
            onClick={() => handleSubmit("pending_review")}
            className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting && <CircularProgress size={14} color="inherit" />}
            <span>Ajukan Review</span>
          </button>
        </div>
      </div>

      {/* Unverified Warning Box */}
      {!loadingMeta && !isVerified && (
        <div className="p-4 bg-secondary-fixed text-on-secondary-fixed rounded-2xl flex items-start gap-3 border border-secondary-container/60 shadow-xs">
          <WarningAmberOutlinedIcon className="text-secondary mt-0.5" sx={{ fontSize: 22 }} />
          <div className="text-xs space-y-1">
            <p className="font-bold">Identitas Anda Belum Terverifikasi (KYC)</p>
            <p className="leading-relaxed opacity-90">
              Anda tetap dapat menyusun dan menyimpan draft layanan. Namun, Anda perlu menyelesaikan
              verifikasi identitas (KTP) sebelum layanan dapat diajukan review atau diterbitkan ke publik.
            </p>
            <Link
              href="/talent/profile"
              className="inline-flex items-center gap-1 text-secondary font-bold underline hover:opacity-80 pt-1"
            >
              Verifikasi Profil Sekarang &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form Fields */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Informasi Utama */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <InfoOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />
              <span>Informasi Utama</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Judul Layanan <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Mastering TOEFL ITP & Essay Beasiswa LPDP"
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
              />
              <p className="text-[11px] text-on-surface-variant mt-1">
                Maksimal 80 karakter. Gunakan judul yang spesifik dan menarik minat siswa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Kategori Layanan <span className="text-error">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Tipe Layanan <span className="text-error">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
                >
                  <option value="live_session">Live Session (Zoom / GMeet)</option>
                  <option value="recorded_course">Video Belajar (Rekaman)</option>
                  <option value="document_material">Materi Dokumen / E-Book</option>
                  <option value="chat_consultation">Konsultasi Chat</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Deskripsi Lengkap Layanan
              </label>
              <textarea
                rows={5}
                placeholder="Jelaskan silabus, materi yang dibahas, metode pembelajaran, dan manfaat yang akan diperoleh siswa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden resize-y"
              />
            </div>
          </section>

          {/* Card 2: Harga & Kapasitas */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <PaymentsOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />
              <span>Harga & Kapasitas</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Harga Layanan (Rp) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Durasi (Menit)
                </label>
                <input
                  type="number"
                  min={0}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Kuota Maksimal Siswa
                </label>
                <input
                  type="number"
                  min={1}
                  value={quota}
                  onChange={(e) => setQuota(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
                />
              </div>
            </div>
          </section>

          {/* Card 3: Jadwal Ketersediaan (hanya jika live_session) */}
          {type === "live_session" && (
            <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />
                <span>Jadwal Sesi Ketersediaan</span>
              </h2>
              <p className="text-xs text-on-surface-variant">
                Tentukan slot waktu bagi siswa untuk memesan bimbingan tatap muka online dengan Anda.
              </p>
              <ScheduleSlotPicker slots={slots} onChange={setSlots} />
            </section>
          )}

          {/* Card 4: Persyaratan & Prasyarat */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <FactCheckOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />
              <span>Persyaratan & Prasyarat Siswa</span>
            </h2>
            <div>
              <textarea
                rows={3}
                placeholder="Contoh: Sudah memiliki draft essay, aplikasi Zoom terinstal, atau level bahasa Inggris minimal intermediate..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden resize-y"
              />
            </div>
          </section>
        </div>

        {/* Right Column: Tips & Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30 space-y-3">
            <h3 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />
              <span>Tips Publikasi Layanan</span>
            </h3>
            <ul className="text-[11px] text-on-surface-variant space-y-2 leading-relaxed list-disc list-inside">
              <li>
                <strong>Judul Jelas:</strong> Sebutkan target hasil, contoh <em>&ldquo;Persiapan Beasiswa Chevening&rdquo;</em>.
              </li>
              <li>
                <strong>Harga Wajar:</strong> Sesuaikan harga dengan durasi dan nilai manfaat bimbingan Anda.
              </li>
              <li>
                <strong>Slot Terjadwal:</strong> Tambahkan beberapa alternatif tanggal untuk memudahkan siswa memilih waktu.
              </li>
              <li>
                <strong>Kelayakan KYC:</strong> Pastikan Anda telah mengunggah KTP dan Ijazah untuk kelancaran moderasi.
              </li>
            </ul>
          </div>

          <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-3">
            <p className="text-xs font-bold text-on-surface">Aksi Cepat</p>
            <button
              type="button"
              disabled={isSubmitting || loadingMeta}
              onClick={() => handleSubmit("pending_review")}
              className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 shadow-xs transition-colors disabled:opacity-50"
            >
              Ajukan Review Layanan
            </button>
            <button
              type="button"
              disabled={isSubmitting || loadingMeta}
              onClick={() => handleSubmit("draft")}
              className="w-full py-2.5 bg-surface-container-lowest border border-outline-variant/40 text-on-surface rounded-xl text-xs font-bold hover:bg-surface-variant transition-colors disabled:opacity-50"
            >
              Simpan Sebagai Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
