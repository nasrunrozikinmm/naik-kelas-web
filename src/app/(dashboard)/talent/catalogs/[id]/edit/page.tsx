"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getCatalog, updateCatalog, addScheduleSlot } from "@/lib/api/catalog";
import { ScheduleSlotPicker, SlotItem } from "@/components/catalog/ScheduleSlotPicker";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Category, Catalog } from "@/types/domain";

// MUI Icons
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import CircularProgress from "@mui/material/CircularProgress";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCatalogPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const catalogId = resolvedParams.id;
  const router = useRouter();

  // Form states
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("live_session");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [quota, setQuota] = useState<number>(10);
  const [requirements, setRequirements] = useState("");
  const [slots, setSlots] = useState<SlotItem[]>([]);

  // Metadata states
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [catRes, catalogData] = await Promise.all([
          apiClient.get(endpoints.categories.list),
          getCatalog(catalogId),
        ]);

        if (isMounted) {
          if (catRes.data?.data) {
            setCategories(catRes.data.data);
          }

          if (catalogData) {
            setCatalog(catalogData);
            setTitle(catalogData.title || "");
            setCategoryId(catalogData.category_id || "");
            setType(catalogData.type || "live_session");
            setDescription(catalogData.description || "");
            setPrice(catalogData.price || 0);
            setDuration(catalogData.duration || 60);
            setQuota(catalogData.quota || 10);
            setRequirements(catalogData.requirements || "");

            if (catalogData.schedule_slots && Array.isArray(catalogData.schedule_slots)) {
              setSlots(
                catalogData.schedule_slots.map((s) => ({
                  id: s.id,
                  start_time: s.start_time,
                  end_time: s.end_time,
                  capacity: s.capacity,
                  booked_count: s.booked_count,
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to load catalog for editing", err);
        if (isMounted) setErrorMsg("Gagal memuat data layanan");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [catalogId]);

  const handleUpdate = async (targetStatus?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg("Judul layanan wajib diisi");
      return;
    }
    if (!categoryId) {
      setErrorMsg("Silakan pilih kategori");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateCatalog(catalogId, {
        title: title.trim(),
        category_id: categoryId,
        description: description.trim(),
        price: Number(price),
        duration: duration ? Number(duration) : undefined,
        quota: quota ? Number(quota) : undefined,
        status: targetStatus || catalog?.status,
        requirements: requirements.trim(),
      });

      setSuccessMsg("Perubahan layanan berhasil disimpan!");
      setTimeout(() => {
        router.push("/talent/catalogs");
      }, 1200);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      setErrorMsg(
        errorObj.response?.data?.error?.message || "Gagal memperbarui layanan. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlotChange = async (newSlots: SlotItem[]) => {
    // If a new slot was appended (doesn't have an id yet), send to API
    const newItems = newSlots.filter((s) => !s.id);
    if (newItems.length > 0) {
      const itemToAdd = newItems[newItems.length - 1];
      try {
        const createdSlot = await addScheduleSlot(catalogId, {
          start_time: itemToAdd.start_time,
          end_time: itemToAdd.end_time,
          capacity: itemToAdd.capacity,
        });
        setSlots([
          ...newSlots.filter((s) => s.id),
          {
            id: createdSlot.id,
            start_time: createdSlot.start_time,
            end_time: createdSlot.end_time,
            capacity: createdSlot.capacity,
            booked_count: createdSlot.booked_count,
          },
        ]);
        return;
      } catch (err) {
        console.error("Failed to add slot", err);
        setErrorMsg("Gagal menambahkan slot jadwal ke server");
      }
    }

    setSlots(newSlots);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <CircularProgress size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
        <Link href="/talent/catalogs" className="hover:text-primary transition-colors">
          Layanan Saya
        </Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} className="text-outline" />
        <span className="text-on-surface font-bold">Edit Layanan</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-on-surface font-headline-md tracking-tight">
              Edit Layanan
            </h1>
            {catalog && <StatusBadge status={catalog.status} />}
          </div>
          <p className="text-xs text-on-surface-variant">
            Perbarui informasi, harga, atau ketersediaan jadwal bimbingan Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/talent/catalogs"
            className="px-4 py-2 rounded-xl border border-outline-variant/60 text-on-surface font-bold text-xs hover:bg-surface-container-low transition-all"
          >
            Kembali
          </Link>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleUpdate()}
            className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting && <CircularProgress size={14} color="inherit" />}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-success-container text-on-success-container rounded-xl text-xs font-semibold">
          {successMsg}
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
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
              />
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
                  Tipe Layanan (Read-only)
                </label>
                <input
                  type="text"
                  disabled
                  value={type}
                  className="w-full px-3.5 py-2.5 bg-surface-container rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Deskripsi Lengkap Layanan
              </label>
              <textarea
                rows={5}
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

          {/* Card 3: Jadwal Ketersediaan */}
          {type === "live_session" && (
            <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />
                <span>Slot Jadwal Bimbingan</span>
              </h2>
              <ScheduleSlotPicker slots={slots} onChange={handleSlotChange} />
            </section>
          )}

          {/* Card 4: Persyaratan */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <FactCheckOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />
              <span>Persyaratan & Prasyarat Siswa</span>
            </h2>
            <div>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/40 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-hidden resize-y"
              />
            </div>
          </section>
        </div>

        {/* Right Column: Status & Actions */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-xs space-y-3">
            <p className="text-xs font-bold text-on-surface">Status Publikasi</p>
            <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">Status Saat Ini:</span>
              {catalog && <StatusBadge status={catalog.status} />}
            </div>

            {catalog?.status === "draft" && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleUpdate("pending_review")}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 shadow-xs transition-colors disabled:opacity-50"
              >
                Ajukan Review Layanan
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleUpdate()}
              className="w-full py-2.5 bg-surface-container border border-outline-variant/40 text-on-surface rounded-xl text-xs font-bold hover:bg-surface-variant transition-colors disabled:opacity-50"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
