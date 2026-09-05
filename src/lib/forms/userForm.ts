import type { FormConfig } from "@/components/dynamic-form";

export function getUserCreateFormConfig(): FormConfig {
  return {
    submitLabel: "Simpan Pengguna",
    fields: [
      {
        name: "name",
        label: "Nama Lengkap",
        type: "text",
        placeholder: "Contoh: Budi Santoso",
        defaultValue: "",
        validation: {
          required: true,
          requiredMessage: "Nama lengkap wajib diisi",
          min: 2,
          minMessage: "Nama minimal 2 karakter",
        },
        gridProps: { xs: 12 },
      },
      {
        name: "email",
        label: "Alamat Email",
        type: "email",
        placeholder: "budi@example.com",
        defaultValue: "",
        validation: {
          required: true,
          requiredMessage: "Alamat email wajib diisi",
        },
        gridProps: { xs: 12 },
      },
      {
        name: "phone",
        label: "Nomor Telepon (Opsional)",
        type: "text",
        placeholder: "081234567890",
        defaultValue: "",
        gridProps: { xs: 12 },
      },
      {
        name: "password",
        label: "Kata Sandi Awal",
        type: "password",
        placeholder: "Minimal 8 karakter",
        defaultValue: "",
        validation: {
          required: true,
          requiredMessage: "Kata sandi wajib diisi",
          min: 8,
          minMessage: "Kata sandi minimal 8 karakter",
        },
        gridProps: { xs: 12 },
      },
      {
        name: "role",
        label: "Peran Pengguna (Role)",
        type: "select",
        defaultValue: "student",
        options: [
          { label: "Siswa (Student) - Pembeli Layanan", value: "student" },
          { label: "Mentor (Talent) - Penyedia Layanan", value: "talent" },
        ],
        validation: {
          required: true,
          requiredMessage: "Silakan pilih peran pengguna",
        },
        gridProps: { xs: 12 },
      },
    ],
  };
}

export function getUserEditFormConfig(defaults: {
  name: string;
  email: string;
  phone?: string;
  role: "student" | "talent";
}): FormConfig {
  const config = getUserCreateFormConfig();
  return {
    ...config,
    submitLabel: "Simpan Perubahan",
    fields: (config.fields ?? [])
      .filter((field) => field.name !== "password")
      .map((field) => ({
        ...field,
        defaultValue: defaults[field.name as keyof typeof defaults] ?? "",
      })),
  };
}

export function getUserResetPasswordFormConfig(): FormConfig {
  return {
    submitLabel: "Simpan Kata Sandi",
    fields: [
      {
        name: "password",
        label: "Kata Sandi Baru",
        type: "password",
        placeholder: "Masukkan kata sandi baru (minimal 8 karakter)",
        defaultValue: "",
        validation: {
          required: true,
          requiredMessage: "Kata sandi baru wajib diisi",
          min: 8,
          minMessage: "Kata sandi minimal 8 karakter",
        },
        gridProps: { xs: 12 },
      },
    ],
  };
}
