"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { createCatalog } from "@/lib/api/catalog";
import { DynamicForm } from "@/components/dynamic-form";
import { getCatalogFormConfig } from "@/lib/forms/catalogForm";
import type { Category } from "@/types/domain";
import type { SlotItem } from "@/components/catalog/ScheduleSlotPicker";

// MUI Icons
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CircularProgress from "@mui/material/CircularProgress";

export default function NewCatalogPage() {
  const router = useRouter();

  // Metadata states
  const [categories, setCategories] = useState<Category[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Submitting states
  const [submitStatus, setSubmitStatus] = useState<"draft" | "pending_review">("draft");
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
            setCategories(catRes.value.data.data);
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

  const formConfig = useMemo(() => {
    return getCatalogFormConfig({
      categories,
      isEdit: false,
    });
  }, [categories]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setErrorMsg(null);

    if (submitStatus === "pending_review" && !isVerified) {
      setErrorMsg(
        "Profil talent Anda belum terverifikasi (KYC). Anda hanya dapat menyimpan layanan sebagai draft hingga profil disetujui."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const slots = (formData.slots as SlotItem[]) || [];

      await createCatalog({
        category_id: formData.category_id as string,
        title: formData.title as string,
        description: (formData.description as string) || "",
        type: (formData.type as string) || "live_session",
        price: Number(formData.price),
        duration: formData.duration ? Number(formData.duration) : undefined,
        quota: formData.quota ? Number(formData.quota) : undefined,
        requirements: (formData.requirements as string) || "",
        status: submitStatus,
        slots:
          slots.length > 0
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
      <div>
        <h1 className="text-2xl font-bold text-on-surface font-headline-md tracking-tight">
          Buat Layanan Baru
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Bagikan keahlian Anda dan bantu ribuan pelajar di seluruh Indonesia via formulir dinamis terpadu.
        </p>
      </div>

      {/* Unverified KYC Alert Banner */}
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

      {/* Dynamic Form with Bento Sections */}
      {loadingMeta ? (
        <div className="p-12 text-center">
          <CircularProgress size={32} />
          <p className="text-xs text-on-surface-variant mt-3">Menyiapkan konfigurasi formulir...</p>
        </div>
      ) : (
        <DynamicForm
          config={formConfig}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          globalError={errorMsg}
          hideSubmitButton={true}
          extraActions={
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => setSubmitStatus("draft")}
                className="px-5 py-2.5 rounded-[10px] border border-primary text-primary font-bold text-xs hover:bg-surface-container-low transition-all disabled:opacity-50"
              >
                {isSubmitting && submitStatus === "draft" ? "Menyimpan..." : "Simpan Draft"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => setSubmitStatus("pending_review")}
                className="px-6 py-2.5 rounded-[10px] bg-primary !text-white font-bold text-xs hover:bg-primary/90 shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && submitStatus === "pending_review" && (
                  <CircularProgress size={14} color="inherit" />
                )}
                <span className="!text-white">Ajukan Review</span>
              </button>
            </div>
          }
        />
      )}
    </div>
  );
}
