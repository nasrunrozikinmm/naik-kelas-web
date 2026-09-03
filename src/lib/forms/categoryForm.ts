import type { FormConfig } from "@/components/dynamic-form";
import type { Category } from "@/types/domain";

export interface CategoryFormOptions {
  parentCategories: Category[];
  initialData?: Partial<Category> | null;
  isEdit?: boolean;
}

export function getCategoryFormConfig({
  parentCategories,
  initialData,
  isEdit = false,
}: CategoryFormOptions): FormConfig {
  return {
    submitLabel: isEdit ? "Perbarui Kategori" : "Simpan Kategori",
    fields: [
      {
        name: "name",
        label: "Nama Kategori",
        type: "text",
        placeholder: "Contoh: Pemrograman Web, Desain Grafis...",
        defaultValue: initialData?.name || "",
        validation: {
          required: true,
          requiredMessage: "Nama kategori wajib diisi",
          max: 255,
          maxMessage: "Nama kategori maksimal 255 karakter",
        },
        gridProps: { xs: 12 },
      },
      {
        name: "slug",
        label: "Slug URL",
        type: "text",
        placeholder: "pemrograman-web",
        defaultValue: initialData?.slug || "",
        validation: {
          required: true,
          requiredMessage: "Slug kategori wajib diisi",
          max: 255,
          maxMessage: "Slug kategori maksimal 255 karakter",
        },
        gridProps: { xs: 12 },
      },
      {
        name: "parent_id",
        label: "Kategori Induk (Opsional)",
        type: "select",
        placeholder: "Pilih Kategori Utama...",
        defaultValue: initialData?.parent_id || "",
        options: [
          { label: "Tidak Ada (Jadikan Kategori Utama)", value: "" },
          ...parentCategories
            .filter((p) => !isEdit || p.id !== initialData?.id)
            .map((parent) => ({
              label: parent.name,
              value: parent.id,
            })),
        ],
        gridProps: { xs: 12 },
      },
      {
        name: "status",
        label: "Status Kategori",
        type: "select",
        defaultValue: initialData?.status || "active",
        options: [
          { label: "Aktif (Dapat dipilih dan tampil di pencarian)", value: "active" },
          { label: "Nonaktif (Disembunyikan sementara)", value: "inactive" },
        ],
        validation: { required: true },
        gridProps: { xs: 12 },
      },
    ],
  };
}
