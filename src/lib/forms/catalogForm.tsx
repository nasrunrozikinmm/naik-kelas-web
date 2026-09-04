import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { ScheduleSlotPicker, SlotItem } from "@/components/catalog/ScheduleSlotPicker";
import { CATALOG_TYPE_OPTIONS } from "@/lib/utils/catalog";
import type { FormConfig } from "@/components/dynamic-form";
import type { Category, Catalog } from "@/types/domain";

export interface CatalogFormOptions {
  categories: Category[];
  initialData?: Partial<Catalog>;
  isEdit?: boolean;
}

export function getCatalogFormConfig({
  categories,
  initialData,
  isEdit = false,
}: CatalogFormOptions): FormConfig {
  const initialSlots: SlotItem[] =
    initialData?.schedule_slots?.map((s) => ({
      id: s.id,
      start_time: s.start_time,
      end_time: s.end_time,
      capacity: s.capacity,
      booked_count: s.booked_count,
    })) || [];

  return {
    sections: [
      {
        id: "main-info",
        title: "Informasi Utama",
        description: "Tentukan judul, kategori, dan deskripsi komprehensif layanan bimbingan Anda.",
        icon: <InfoOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />,
        fields: [
          {
            name: "title",
            label: "Judul Layanan",
            type: "text",
            placeholder: "Contoh: Mentoring 1-on-1 Persiapan Beasiswa LPDP",
            defaultValue: initialData?.title || "",
            validation: {
              required: true,
              requiredMessage: "Judul layanan wajib diisi",
              max: 255,
              maxMessage: "Judul maksimal 255 karakter",
            },
            gridProps: { xs: 12 },
          },
          {
            name: "category_id",
            label: "Kategori Layanan",
            type: "select",
            searchable: true,
            placeholder: "Cari atau pilih kategori...",
            defaultValue: initialData?.category_id || (categories[0]?.id ?? ""),
            options: categories.map((c) => ({ label: c.name, value: c.id })),
            validation: { required: true, requiredMessage: "Silakan pilih kategori" },
            gridProps: { xs: 12, sm: 4 },
          },
          {
            name: "type",
            label: isEdit ? "Tipe Layanan (Read-only)" : "Tipe Layanan",
            type: "select",
            defaultValue: initialData?.type || "live_session",
            options: CATALOG_TYPE_OPTIONS.map((o) => ({
              label: `${o.label} - ${o.description}`,
              value: o.value,
            })),
            validation: { required: true },
            gridProps: { xs: 12, sm: 8 },
          },
          {
            name: "image_url",
            label: "URL Gambar Cover / Banner Layanan",
            type: "custom",
            defaultValue: initialData?.image_url || "",
            gridProps: { xs: 12 },
            render: ({ field, fieldState }) => {
              const urlVal = typeof field.value === "string" ? field.value.trim() : "";
              const hasValidImage = urlVal.startsWith("http://") || urlVal.startsWith("https://");
              return (
                <div className="w-full space-y-2">
                  <label className="block text-xs font-semibold text-on-surface">
                    URL Gambar Cover / Banner
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="url"
                      value={urlVal}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="https://... (contoh: link gambar dari Unsplash atau media storage)"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50"
                    />
                    {hasValidImage && (
                      <div className="w-20 h-11 rounded-lg overflow-hidden relative bg-surface-container shrink-0 border border-outline-variant/40 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={urlVal}
                          alt="Pratinjau Cover"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Tautan gambar cover untuk ditampilkan pada kartu katalog di marketplace dan halaman detail.
                  </p>
                  {fieldState.error && (
                    <p className="text-[11px] text-error font-medium">{fieldState.error.message}</p>
                  )}
                </div>
              );
            },
          },
          {
            name: "description",
            label: "Deskripsi Lengkap Layanan",
            type: "text",
            minRows: 4,
            placeholder: "Jelaskan silabus, materi yang dibahas, metode pembelajaran, dan manfaat yang akan diperoleh siswa...",
            defaultValue: initialData?.description || "",
            gridProps: { xs: 12 },
          },
        ],
      },
      {
        id: "pricing-capacity",
        title: "Harga & Kapasitas",
        description: "Atur skema harga per sesi/paket dan batasan kuota peserta.",
        icon: <PaymentsOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />,
        fields: [
          {
            name: "price",
            label: "Harga Layanan (Rp)",
            type: "number",
            defaultValue: initialData?.price !== undefined ? initialData.price : 150000,
            validation: {
              required: true,
              requiredMessage: "Harga layanan wajib diisi",
              min: 0,
              minMessage: "Harga minimal Rp 0",
            },
            gridProps: { xs: 12, sm: 4 },
          },
          {
            name: "duration",
            label: "Durasi (Menit)",
            type: "number",
            defaultValue: initialData?.duration !== undefined ? initialData.duration : 60,
            validation: { min: 0, minMessage: "Durasi minimal 0 menit" },
            gridProps: { xs: 12, sm: 4 },
          },
          {
            name: "quota",
            label: "Kuota Siswa (Opsional)",
            type: "number",
            defaultValue: initialData?.quota !== undefined ? initialData.quota : 10,
            validation: { min: 0, minMessage: "Kuota minimal 0" },
            gridProps: { xs: 12, sm: 4 },
          },
        ],
      },
      {
        id: "schedule-slots",
        title: "Jadwal Ketersediaan",
        description: "Tentukan slot tanggal dan jam pelaksanaan khusus untuk layanan sesi live.",
        icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />,
        fields: [
          {
            name: "slots",
            label: "Jadwal Sesi Live",
            type: "custom",
            defaultValue: initialSlots,
            gridProps: { xs: 12 },
            render: ({ field }) => (
              <ScheduleSlotPicker
                slots={(field.value as SlotItem[]) || []}
                onChange={(newSlots) => field.onChange(newSlots)}
              />
            ),
          },
        ],
      },
      {
        id: "requirements",
        title: "Persyaratan & Ketentuan Peserta",
        description: "Hal-hal atau perlengkapan yang perlu disiapkan siswa sebelum mengikuti sesi/kelas ini.",
        icon: <FactCheckOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" />,
        fields: [
          {
            name: "requirements",
            label: "Prasyarat Peserta",
            type: "text",
            minRows: 3,
            placeholder: "Contoh: Koneksi internet stabil, laptop terpasang Node.js v18+, pemahaman dasar HTML...",
            defaultValue: initialData?.requirements || "",
            gridProps: { xs: 12 },
          },
        ],
      },
    ],
  };
}
