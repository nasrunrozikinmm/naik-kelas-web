import { FormConfig } from "@/components/dynamic-form";

export const BANK_OPTIONS = [
  { label: "Bank Central Asia (BCA)", value: "BCA" },
  { label: "Bank Mandiri", value: "MANDIRI" },
  { label: "Bank Negara Indonesia (BNI)", value: "BNI" },
  { label: "Bank Rakyat Indonesia (BRI)", value: "BRI" },
  { label: "Bank Syariah Indonesia (BSI)", value: "BSI" },
  { label: "CIMB Niaga", value: "CIMB" },
  { label: "Bank Permata", value: "PERMATA" },
  { label: "Bank Danamon", value: "DANAMON" },
];

/**
 * Reusable Change Password Form Config (Student, Talent, Admin)
 */
export const changePasswordFormConfig: FormConfig = {
  submitLabel: "Perbarui Kata Sandi",
  fields: [
    {
      name: "current_password",
      label: "Kata Sandi Saat Ini",
      type: "password",
      placeholder: "Masukkan kata sandi saat ini",
      validation: { required: true, requiredMessage: "Kata sandi saat ini wajib diisi" },
      gridProps: { xs: 12 },
    },
    {
      name: "new_password",
      label: "Kata Sandi Baru",
      type: "password",
      placeholder: "Minimal 8 karakter",
      validation: {
        required: true,
        requiredMessage: "Kata sandi baru wajib diisi",
        min: 8,
        minMessage: "Kata sandi minimal 8 karakter",
      },
      gridProps: { xs: 12 },
    },
    {
      name: "confirm_password",
      label: "Konfirmasi Kata Sandi Baru",
      type: "password",
      placeholder: "Ketik ulang kata sandi baru",
      validation: {
        required: true,
        requiredMessage: "Konfirmasi kata sandi wajib diisi",
      },
      gridProps: { xs: 12 },
    },
  ],
};

/**
 * Student Profile Form Config
 */
export function getStudentProfileFormConfig(initial?: {
  displayName?: string;
  email?: string;
  phone?: string;
  bio?: string;
}): FormConfig {
  return {
    submitLabel: "Simpan Profil Siswa",
    fields: [
      {
        name: "display_name",
        label: "Nama Lengkap",
        type: "text",
        placeholder: "Nama lengkap Anda",
        defaultValue: initial?.displayName || "",
        validation: { required: true, requiredMessage: "Nama lengkap wajib diisi" },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "email",
        label: "Alamat Email Akun",
        type: "email",
        defaultValue: initial?.email || "",
        disabled: true,
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "phone",
        label: "Nomor WhatsApp / Telepon",
        type: "tel",
        placeholder: "08123456789",
        defaultValue: initial?.phone || "",
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "bio",
        label: "Bio / Profil Singkat",
        type: "text",
        placeholder: "Ceritakan sedikit latar belakang atau minat akademik Anda...",
        defaultValue: initial?.bio || "",
        minRows: 3,
        gridProps: { xs: 12 },
      },
    ],
  };
}

/**
 * Student Preferences Form Config
 */
export function getStudentPreferencesFormConfig(initial?: {
  learningGoals?: string;
  educationLevel?: string;
  englishLevel?: string;
  interests?: string;
}): FormConfig {
  return {
    submitLabel: "Simpan Preferensi Belajar & Minat",
    fields: [
      {
        name: "learning_goals",
        label: "Tujuan Belajar Utama (Goal Akhir)",
        type: "select",
        options: [
          { label: "Persiapan Karir & Wawancara Kerja", value: "career" },
          { label: "Persiapan Beasiswa Luar Negeri (LPDP, Chevening, dll)", value: "scholarship_abroad" },
          { label: "Persiapan Beasiswa Dalam Negeri", value: "scholarship_domestic" },
          { label: "Peningkatan Akademik / Skripsi & Tesis", value: "academic" },
          { label: "Eksplorasi Minat & Wawasan Baru", value: "other" },
        ],
        defaultValue: initial?.learningGoals || "career",
        validation: { required: true, requiredMessage: "Tujuan belajar wajib dipilih" },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "education_level",
        label: "Jenjang Pendidikan Terakhir",
        type: "select",
        options: [
          { label: "SMA / SMK Sederajat", value: "high_school" },
          { label: "S1 (Sarjana)", value: "bachelor" },
          { label: "S2 (Magister)", value: "master" },
          { label: "S3 (Doktor)", value: "doctorate" },
          { label: "Umum / Profesional", value: "professional" },
        ],
        defaultValue: initial?.educationLevel || "bachelor",
        validation: { required: true, requiredMessage: "Jenjang pendidikan wajib dipilih" },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "english_level",
        label: "Tingkat Kemampuan Bahasa Inggris",
        type: "select",
        options: [
          { label: "Beginner (Pemula)", value: "beginner" },
          { label: "Intermediate (Menengah)", value: "intermediate" },
          { label: "Advanced (Mahir)", value: "advanced" },
          { label: "Native / Bilingual", value: "native" },
        ],
        defaultValue: initial?.englishLevel || "intermediate",
        validation: { required: true, requiredMessage: "Kemampuan Bahasa Inggris wajib dipilih" },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "interests",
        label: "Minat & Topik Bimbingan Spesifik",
        type: "text",
        placeholder: "Contoh: Review Motivation Letter, Mock Interview, UI/UX Design, Next.js, Data Science",
        defaultValue: initial?.interests || "",
        minRows: 3,
        gridProps: { xs: 12 },
      },
    ],
  };
}

/**
 * Talent Profile Form Config
 */
export function getTalentProfileFormConfig(initial?: {
  displayName?: string;
  email?: string;
  phone?: string;
  bio?: string;
}): FormConfig {
  return {
    submitLabel: "Simpan Profil Mentor",
    fields: [
      {
        name: "display_name",
        label: "Nama Tampilan Publik",
        type: "text",
        placeholder: "Contoh: Budi Santoso, M.Kom.",
        defaultValue: initial?.displayName || "",
        validation: { required: true, requiredMessage: "Nama tampilan wajib diisi" },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "email",
        label: "Alamat Email Akun",
        type: "email",
        defaultValue: initial?.email || "",
        disabled: true,
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "phone",
        label: "Nomor WhatsApp Resmi",
        type: "tel",
        placeholder: "08123456789",
        defaultValue: initial?.phone || "",
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "bio",
        label: "Ringkasan Bio Profesional",
        type: "text",
        placeholder: "Tuliskan ringkasan pengalaman karir, latar belakang akademik, dan bidang keahlian bimbingan Anda...",
        defaultValue: initial?.bio || "",
        minRows: 4,
        gridProps: { xs: 12 },
      },
    ],
  };
}

/**
 * Talent Payout Bank Account Form Config
 */
export function getTalentPayoutFormConfig(initial?: {
  bankCode?: string;
  accountNumber?: string;
  accountHolderName?: string;
  branch?: string;
}): FormConfig {
  return {
    submitLabel: "Simpan Rekening Payout",
    fields: [
      {
        name: "bank_code",
        label: "Pilih Bank Tujuan",
        type: "select",
        options: BANK_OPTIONS,
        defaultValue: initial?.bankCode || "BCA",
        validation: { required: true, requiredMessage: "Bank tujuan wajib dipilih" },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "account_number",
        label: "Nomor Rekening Bank",
        type: "text",
        placeholder: "Masukkan nomor rekening",
        defaultValue: initial?.accountNumber || "",
        validation: {
          required: true,
          requiredMessage: "Nomor rekening wajib diisi",
          pattern: /^[0-9]+$/,
          patternMessage: "Nomor rekening hanya boleh berupa angka",
        },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "account_holder_name",
        label: "Nama Lengkap Pemilik Rekening",
        type: "text",
        placeholder: "Nama sesuai buku tabungan / KTP",
        defaultValue: initial?.accountHolderName || "",
        validation: { required: true, requiredMessage: "Nama pemilik rekening wajib diisi" },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "branch",
        label: "Kantor Cabang Bank (Opsional)",
        type: "text",
        placeholder: "Contoh: KCU Sudirman Jakarta",
        defaultValue: initial?.branch || "",
        gridProps: { xs: 12, md: 6 },
      },
    ],
  };
}

/**
 * Talent Session Preferences Form Config
 */
export function getTalentSessionFormConfig(initial?: {
  meetingUrl?: string;
  sessionBuffer?: string;
  instantBooking?: boolean;
}): FormConfig {
  return {
    submitLabel: "Simpan Pengaturan Sesi",
    fields: [
      {
        name: "meeting_url",
        label: "Default Link Google Meet / Zoom Room",
        type: "url",
        placeholder: "https://meet.google.com/abc-defg-hij",
        defaultValue: initial?.meetingUrl || "https://meet.google.com/abc-defg-hij",
        validation: { required: true, requiredMessage: "Link ruang meeting wajib diisi" },
        gridProps: { xs: 12 },
      },
      {
        name: "session_buffer",
        label: "Waktu Jeda Istirahat Antar Sesi (Buffer Time)",
        type: "select",
        options: [
          { label: "Tanpa Jeda (0 Menit)", value: "0" },
          { label: "15 Menit (Rekomendasi)", value: "15" },
          { label: "30 Menit", value: "30" },
        ],
        defaultValue: initial?.sessionBuffer || "15",
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "instant_booking",
        label: "Konfirmasi Otomatis (Instant Booking tanpa persetujuan manual)",
        type: "switch",
        defaultValue: initial?.instantBooking ?? true,
        gridProps: { xs: 12, md: 6 },
      },
    ],
  };
}

/**
 * Admin Platform Configuration Form Config
 */
export function getAdminPlatformConfigFormConfig(initial?: {
  platformFee?: string | number;
  minPayout?: string | number;
  gatewayMode?: string;
  maintenanceMode?: string;
  supportEmail?: string;
  supportWhatsapp?: string;
}): FormConfig {
  return {
    submitLabel: "Simpan Konfigurasi Platform",
    fields: [
      {
        name: "platform_fee_percent",
        label: "Potongan Komisi Platform (%)",
        type: "number",
        defaultValue: Number(initial?.platformFee ?? 10),
        validation: {
          required: true,
          requiredMessage: "Persentase komisi wajib diisi",
          min: 0,
          minMessage: "Minimal 0%",
          max: 50,
          maxMessage: "Maksimal 50%",
        },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "minimum_payout_amount",
        label: "Batas Minimal Penarikan Dana Payout (IDR)",
        type: "number",
        defaultValue: Number(initial?.minPayout ?? 50000),
        validation: {
          required: true,
          requiredMessage: "Minimal payout wajib diisi",
          min: 10000,
          minMessage: "Minimal penarikan adalah Rp 10.000",
        },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "payment_gateway_mode",
        label: "Mode Gateway Midtrans",
        type: "select",
        options: [
          { label: "Sandbox (Mode Simulasi Pengujian)", value: "sandbox" },
          { label: "Production (Mode Live Transaksi Nyata)", value: "production" },
        ],
        defaultValue: initial?.gatewayMode || "sandbox",
        validation: { required: true },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "maintenance_mode",
        label: "Status Pemeliharaan Sistem",
        type: "select",
        options: [
          { label: "Normal (Sistem Beroperasi Penuh)", value: "false" },
          { label: "Maintenance (Situs Dikunci untuk Perbaikan)", value: "true" },
        ],
        defaultValue: initial?.maintenanceMode || "false",
        validation: { required: true },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "support_email",
        label: "Email Resmi Layanan Pelanggan (CS)",
        type: "email",
        placeholder: "support@naikkelas.id",
        defaultValue: initial?.supportEmail || "support@naikkelas.id",
        validation: { required: true, requiredMessage: "Email CS wajib diisi" },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "support_whatsapp",
        label: "Nomor WhatsApp Resmi Bantuan",
        type: "tel",
        placeholder: "+6281234567890",
        defaultValue: initial?.supportWhatsapp || "+6281234567890",
        validation: { required: true, requiredMessage: "WhatsApp CS wajib diisi" },
        gridProps: { xs: 12, md: 6 },
      },
    ],
  };
}

/**
 * Admin Profile Form Config
 */
export function getAdminProfileFormConfig(initial?: {
  displayName?: string;
  email?: string;
  phone?: string;
}): FormConfig {
  return {
    submitLabel: "Simpan Profil Administrator",
    fields: [
      {
        name: "display_name",
        label: "Nama Administrator",
        type: "text",
        placeholder: "Nama lengkap Anda",
        defaultValue: initial?.displayName || "",
        validation: { required: true, requiredMessage: "Nama administrator wajib diisi" },
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "email",
        label: "Alamat Email Superadmin",
        type: "email",
        defaultValue: initial?.email || "",
        disabled: true,
        gridProps: { xs: 12, md: 6 },
      },
      {
        name: "phone",
        label: "Nomor Telepon Internal",
        type: "tel",
        placeholder: "08123456789",
        defaultValue: initial?.phone || "",
        gridProps: { xs: 12, md: 6 },
      },
    ],
  };
}

