"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getCatalog, updateCatalog, addScheduleSlot } from "@/lib/api/catalog";
import { DynamicForm } from "@/components/dynamic-form";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getCatalogStatusLabel } from "@/lib/utils/catalog";
import { getCatalogFormConfig } from "@/lib/forms/catalogForm";
import type { Category, Catalog } from "@/types/domain";
import type { SlotItem } from "@/components/catalog/ScheduleSlotPicker";

// MUI Icons
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCatalogPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const catalogId = resolvedParams.id;
  const router = useRouter();

  // Data states
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Submitting states
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

  const formConfig = useMemo(() => {
    if (!catalog) return null;
    return getCatalogFormConfig({
      categories,
      initialData: catalog,
      isEdit: true,
    });
  }, [catalog, categories]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (!catalog) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setIsSubmitting(true);

      const priceVal = Number(formData.price);
      const durationVal = formData.duration ? Number(formData.duration) : undefined;
      const quotaVal = formData.quota ? Number(formData.quota) : undefined;
      const categoryIdVal = formData.category_id as string;
      const titleVal = formData.title as string;
      const descVal = (formData.description as string) || "";
      const imageUrlVal = typeof formData.image_url === "string" ? formData.image_url.trim() : undefined;
      const reqVal = (formData.requirements as string) || "";

      await updateCatalog(catalogId, {
        title: titleVal,
        description: descVal,
        category_id: categoryIdVal,
        image_url: imageUrlVal,
        price: priceVal,
        duration: durationVal,
        quota: quotaVal,
        requirements: reqVal,
      });

      // Synchronize new slots added in UI
      const currentSlots = (formData.slots as SlotItem[]) || [];
      const newSlots = currentSlots.filter((s) => !s.id);
      for (const slot of newSlots) {
        await addScheduleSlot(catalogId, {
          start_time: slot.start_time,
          end_time: slot.end_time,
          capacity: slot.capacity,
        });
      }

      setSuccessMsg("Perubahan layanan berhasil disimpan!");
      setTimeout(() => {
        router.push("/talent/catalogs");
      }, 1200);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      setErrorMsg(
        errorObj.response?.data?.error?.message ||
          "Gagal memperbarui layanan. Silakan periksa kembali data Anda."
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
        <span className="text-on-surface font-bold">Edit Layanan</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-on-surface font-headline-md tracking-tight">
              Edit Layanan
            </h1>
            {catalog && (
              <StatusBadge
                status={catalog.status}
                label={getCatalogStatusLabel(catalog.status)}
              />
            )}
          </div>
          <p className="text-xs text-on-surface-variant">
            Perbarui informasi, harga, atau ketersediaan jadwal bimbingan Anda via formulir dinamis terstruktur.
          </p>
        </div>

        <Link
          href="/talent/catalogs"
          className="px-4 py-2 rounded-[10px] bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors self-start md:self-auto shadow-xs"
        >
          Kembali ke Layanan Saya
        </Link>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="p-4 bg-primary-container text-on-primary-container rounded-[10px] flex items-center gap-2.5 text-xs font-semibold shadow-xs">
          <CheckCircleOutlineIcon sx={{ fontSize: 20 }} className="text-primary" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dynamic Form with Bento Sections */}
      {loading || !formConfig ? (
        <div className="p-12 text-center">
          <CircularProgress size={32} />
          <p className="text-xs text-on-surface-variant mt-3">Memuat detail data layanan...</p>
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
              <Link
                href="/talent/catalogs"
                className="px-4 py-2.5 rounded-[10px] border border-outline-variant text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-[10px] bg-primary text-white font-bold text-xs hover:bg-primary/90 shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <CircularProgress size={14} color="inherit" />}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          }
        />
      )}
    </div>
  );
}
