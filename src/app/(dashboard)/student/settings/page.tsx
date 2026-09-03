"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import {
  getMyAccount,
  getMyProfile,
  updateMyProfile,
  changePassword,
  updateStudentPreferences,
} from "@/lib/api/settings";
import { DynamicForm } from "@/components/dynamic-form";
import {
  getStudentProfileFormConfig,
  getStudentPreferencesFormConfig,
  changePasswordFormConfig,
} from "@/lib/forms/settingsForm";

// MUI Icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";

const POPULAR_INTERESTS = [
  "Review Essay Beasiswa",
  "Mock Interview Beasiswa & Karir",
  "Persiapan TOEFL / IELTS",
  "UI/UX Design & Figma",
  "Web Development (Next.js & Go)",
  "Data Science & AI",
  "Product Management",
  "Bimbingan Skripsi & Riset Ilmiah",
];

function StudentSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"profile" | "learning" | "security" | "notifications">("profile");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Profile States
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Learning Preferences States
  const [learningGoals, setLearningGoals] = useState("career");
  const [educationLevel, setEducationLevel] = useState("bachelor");
  const [interests, setInterests] = useState("Software Engineering, Data Science, AI");
  const [englishLevel, setEnglishLevel] = useState("intermediate");
  const [languages, setLanguages] = useState<string[]>(["Bahasa Indonesia", "English"]);

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification States
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifSessionReminder, setNotifSessionReminder] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  // Sync tab with URL query parameter ?tab=...
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "learning" || tabParam === "profile" || tabParam === "security" || tabParam === "notifications") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: "profile" | "learning" | "security" | "notifications") => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [acc, prof] = await Promise.allSettled([getMyAccount(), getMyProfile()]);

      if (acc.status === "fulfilled" && acc.value) {
        setEmail(acc.value.email || "");
        setDisplayName(acc.value.name || "");
        setPhone(acc.value.phone || "");
      }

      if (prof.status === "fulfilled" && prof.value) {
        if (prof.value.bio) setBio(prof.value.bio);
        if (prof.value.learning_goals) setLearningGoals(prof.value.learning_goals);
        if (prof.value.education_level) setEducationLevel(prof.value.education_level);
        if (prof.value.interests) setInterests(prof.value.interests);
        if (prof.value.english_level) setEnglishLevel(prof.value.english_level);
        if (prof.value.languages && Array.isArray(prof.value.languages)) {
          setLanguages(prof.value.languages);
        }
      }
    } catch (err) {
      console.error("Failed to load settings data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleInterest = (tag: string) => {
    const currentTags = interests
      ? interests.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    if (currentTags.includes(tag)) {
      setInterests(currentTags.filter((t) => t !== tag).join(", "));
    } else {
      setInterests([...currentTags, tag].join(", "));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
  const handleUpdateProfile = async (formData: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      const name = (formData.display_name as string) || displayName;
      const ph = (formData.phone as string) ?? phone;
      const b = (formData.bio as string) ?? bio;
      await updateMyProfile({
        display_name: displayName,
        phone,
        bio,
        display_name: name,
        phone: ph,
        bio: b,
      });
      setDisplayName(name);
      setPhone(ph);
      setBio(b);
      showFeedback("success", "Profil Anda berhasil diperbarui!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal memperbarui profil");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLearning = async (e: React.FormEvent) => {
    e.preventDefault();
  const handleUpdateLearning = async (formData: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      const goals = (formData.learning_goals as string) || learningGoals;
      const edu = (formData.education_level as string) || educationLevel;
      const eng = (formData.english_level as string) || englishLevel;
      const intr = (formData.interests as string) ?? interests;

      await updateStudentPreferences({
        learning_goals: learningGoals,
        education_level: educationLevel,
        interests,
        english_level: englishLevel,
        learning_goals: goals,
        education_level: edu,
        interests: intr,
        english_level: eng,
        languages,
      });
      setLearningGoals(goals);
      setEducationLevel(edu);
      setEnglishLevel(eng);
      setInterests(intr);
      showFeedback("success", "Preferensi belajar & minat berhasil disimpan!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal menyimpan preferensi belajar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
  const handleChangePassword = async (formData: Record<string, unknown>) => {
    const currentPass = formData.current_password as string;
    const newPass = formData.new_password as string;
    const confirmPass = formData.confirm_password as string;

    if (newPass !== confirmPass) {
      showFeedback("error", "Konfirmasi kata sandi baru tidak sesuai!");
      return;
    }
    if (newPassword.length < 8) {
    if (newPass.length < 8) {
      showFeedback("error", "Kata sandi baru minimal 8 karakter!");
      return;
    }

    try {
      setSubmitting(true);
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        current_password: currentPass,
        new_password: newPass,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showFeedback("success", "Kata sandi akun Anda berhasil diperbarui!");
      showFeedback("success", "Kata sandi berhasil diperbarui!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal mengubah kata sandi");
      showFeedback("error", err?.response?.data?.error?.message || "Gagal memperbarui kata sandi");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profil & Akun", icon: <PersonOutlineIcon sx={{ fontSize: 18 }} /> },
    { id: "learning", label: "Preferensi Belajar & Minat", icon: <SchoolOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: "security", label: "Keamanan Akun", icon: <LockOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: "notifications", label: "Notifikasi", icon: <NotificationsNoneIcon sx={{ fontSize: 18 }} /> },
  ] as const;

  const currentInterestList = interests
    ? interests.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Pengaturan Akun & Preferensi"
        description="Kelola informasi profil pribadi, tujuan belajar, minat topik bimbingan, kata sandi, dan notifikasi Anda."
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-[10px] text-xs font-semibold flex items-center gap-2.5 transition-all shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 18 }} className="text-emerald-600" />
          ) : (
            <ErrorOutlineIcon sx={{ fontSize: 18 }} className="text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tab Selector */}
      <div className="bg-surface-container-lowest rounded-2xl p-2 border border-outline-variant/40 shadow-xs flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-surface-container hover:text-primary"
              }`}
              style={isActive ? { color: "#ffffff", backgroundColor: "var(--color-primary)" } : undefined}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/40 shadow-xs flex flex-col items-center justify-center gap-3">
          <CircularProgress size={32} />
          <span className="text-xs text-on-surface-variant">Memuat data pengaturan...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: PROFIL & AKUN */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
                <div className="pb-3 border-b border-outline-variant/20">
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
              <div className="pb-3 border-b border-outline-variant/20 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Data Pribadi & Kontak</h3>
                  <p className="text-xs text-on-surface-variant">Informasi ini digunakan oleh mentor untuk mengenal Anda saat sesi bimbingan.</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                  <VerifiedUserOutlinedIcon sx={{ fontSize: 12 }} /> Akun Terverifikasi
                </span>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Email (Readonly) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-on-surface">Alamat Email</label>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                        <VerifiedUserOutlinedIcon sx={{ fontSize: 12 }} /> Terverifikasi
                      </span>
                    </div>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low text-on-surface-variant border border-outline-variant/30 rounded-[10px] cursor-not-allowed"
                    />
                  </div>

                  {/* Nomor Telepon */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Nomor WhatsApp / Telepon</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface block">Bio / Catatan Singkat Tentang Anda</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tuliskan latar belakang pendidikan atau ketertarikan Anda..."
                    className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-[10px] hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
                    style={{ color: "#ffffff", backgroundColor: "var(--color-primary)" }}
                  >
                    {submitting ? <CircularProgress size={16} sx={{ color: "#ffffff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                    <span>Simpan Perubahan Profil</span>
                  </button>
                </div>
              </div>
            </form>
              <DynamicForm
                key={`student-profile-${displayName}-${email}-${phone}`}
                config={getStudentProfileFormConfig({ displayName, email, phone, bio })}
                onSubmit={handleUpdateProfile}
                isLoading={submitting}
                submitButtonSx={{
                  bgcolor: "var(--color-primary, #1a56db)",
                  "&:hover": { bgcolor: "#1e40af" },
                  color: "#ffffff !important",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  textTransform: "none",
                  px: 3,
                  py: 1.2,
                }}
              />
            </div>
          )}

          {/* TAB 2: PREFERENSI BELAJAR & MINAT BIMBINGAN */}
          {activeTab === "learning" && (
            <form onSubmit={handleUpdateLearning} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-6">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-sm font-bold text-on-surface">Preferensi Belajar & Minat Bimbingan</h3>
                  <p className="text-xs text-on-surface-variant">Tentukan tujuan akhir capaian Anda dan topik/materi spesifik yang ingin Anda pelajari bersama mentor Naik Kelas.</p>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-6">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Preferensi Belajar & Minat Bimbingan</h3>
                <p className="text-xs text-on-surface-variant">Tentukan tujuan akhir capaian Anda dan topik/materi spesifik yang ingin Anda pelajari bersama mentor Naik Kelas.</p>
              </div>

              {/* Penjelasan Perbedaan Target Belajar vs Minat Bimbingan (TETAP UTUH) */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-[10px] space-y-2.5 text-xs text-on-surface">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                  <span>Perbedaan Sasaran (Goal) & Minat Topik Bimbingan:</span>
                </div>

                {/* Penjelasan Perbedaan Target Belajar vs Minat Bimbingan */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-[10px] space-y-2.5 text-xs text-on-surface">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                    <span>Perbedaan Sasaran (Goal) & Minat Topik Bimbingan:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 pl-6 border-t border-primary/10">
                  <div>
                    <span className="font-bold text-primary block">1. Sasaran / Target Belajar (Goals)</span>
                    <span className="text-[11px] text-on-surface-variant block mt-0.5 leading-relaxed">
                      Goal akhir yang ingin Anda capai setelah bimbingan (misal: Lolos Seleksi Beasiswa Luar Negeri, Naik Karir / Lolos Interview Kerja, atau Lulus Skripsi).
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 pl-6 border-t border-primary/10">
                    <div>
                      <span className="font-bold text-primary block">1. Sasaran / Target Belajar (Goals)</span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5 leading-relaxed">
                        Goal akhir yang ingin Anda capai setelah bimbingan (misal: Lolos Seleksi Beasiswa Luar Negeri, Naik Karir / Lolos Interview Kerja, atau Lulus Skripsi).
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-primary block">2. Minat / Topik Bimbingan (Interests)</span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5 leading-relaxed">
                        Materi atau skill spesifik yang ingin Anda diskusikan langsung dengan mentor (misal: Review Motivation Letter, Latihan Mock Interview, UI/UX Design, Coding Fullstack).
                      </span>
                    </div>
                  <div>
                    <span className="font-bold text-primary block">2. Minat / Topik Bimbingan (Interests)</span>
                    <span className="text-[11px] text-on-surface-variant block mt-0.5 leading-relaxed">
                      Materi atau skill spesifik yang ingin Anda diskusikan langsung dengan mentor (misal: Review Motivation Letter, Latihan Mock Interview, UI/UX Design, Coding Fullstack).
                    </span>
                  </div>
                </div>
              </div>

                {/* Bagian 1: Target Belajar & Jenjang */}
                <div className="space-y-4">
              {/* Quick Recommendation Pills (TETAP UTUH) */}
              <div className="space-y-2 pt-1 border-t border-outline-variant/20">
                <div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider text-primary">
                    Bagian 1: Target Belajar & Jenjang Pendidikan
                    Pilihan Rekomendasi Topik Populer
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tujuan Belajar */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface block">
                        Tujuan Belajar Utama (Goal Akhir)
                      </label>
                      <select
                        value={learningGoals}
                        onChange={(e) => setLearningGoals(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Klik tombol rekomendasi di bawah untuk menambahkan atau menghapus topik bimbingan pada form:
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {POPULAR_INTERESTS.map((tag) => {
                    const isSelected = currentInterestList.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleInterest(tag)}
                        className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-surface text-slate-600 dark:text-slate-300 border-outline-variant/40 hover:border-primary hover:text-primary"
                        }`}
                        style={isSelected ? { color: "#ffffff", backgroundColor: "var(--color-primary)" } : undefined}
                      >
                        <option value="career">Persiapan Karir & Wawancara Kerja</option>
                        <option value="scholarship_abroad">Persiapan Beasiswa Luar Negeri (LPDP, Chevening, Fulbright, dll.)</option>
                        <option value="scholarship_domestic">Persiapan Beasiswa Dalam Negeri</option>
                        <option value="academic">Peningkatan Nilai, Skripsi, & Riset Akademik</option>
                        <option value="other">Eksplorasi Skill Baru / Lainnya</option>
                      </select>
                    </div>

                    {/* Jenjang Pendidikan */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface block">Jenjang Pendidikan Terakhir</label>
                      <select
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      >
                        <option value="high_school">SMA / SMK / Sederajat</option>
                        <option value="bachelor">Sarjana (S1)</option>
                        <option value="master">Magister (S2)</option>
                        <option value="doctorate">Doktor (S3)</option>
                        <option value="professional">Praktisi / Profesional</option>
                      </select>
                    </div>

                    {/* Kemampuan Bahasa Inggris */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-on-surface block">Tingkat Kemampuan Bahasa Inggris</label>
                      <select
                        value={englishLevel}
                        onChange={(e) => setEnglishLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      >
                        <option value="beginner">Pemula (Beginner - IELTS &lt; 5.0 / TOEFL &lt; 450)</option>
                        <option value="intermediate">Menengah (Intermediate - IELTS 5.5 - 6.5 / TOEFL 450 - 550)</option>
                        <option value="advanced">Mahir (Advanced - IELTS &ge; 7.0 / TOEFL &ge; 580)</option>
                        <option value="native">Fasih / Native Speaker</option>
                      </select>
                    </div>
                  </div>
                        {isSelected ? (
                          <CheckIcon sx={{ fontSize: 14 }} className="text-white" />
                        ) : (
                          <AddIcon sx={{ fontSize: 14 }} />
                        )}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

                {/* Bagian 2: Minat & Topik Spesifik */}
                <div className="space-y-3 pt-4 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider text-primary">
                        Bagian 2: Minat Bidang & Topik Spesifik (Interests)
                      </h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Ketik materi atau klik tombol rekomendasi cepat di bawah untuk menambahkan minat bimbingan Anda.
                      </p>
                    </div>
                  </div>

                  {/* Quick Recommendation Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {POPULAR_INTERESTS.map((tag) => {
                      const isSelected = currentInterestList.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleInterest(tag)}
                          className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-xs"
                              : "bg-surface text-slate-600 dark:text-slate-300 border-outline-variant/40 hover:border-primary hover:text-primary"
                          }`}
                          style={isSelected ? { color: "#ffffff", backgroundColor: "var(--color-primary)" } : undefined}
                        >
                          {isSelected ? (
                            <CheckIcon sx={{ fontSize: 14 }} className="text-white" />
                          ) : (
                            <AddIcon sx={{ fontSize: 14 }} />
                          )}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Input Teks Minat Spesifik */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-on-surface block">
                      Daftar Minat & Topik (Pisahkan dengan tanda koma):
                    </label>
                    <textarea
                      rows={3}
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="Contoh: Review Motivation Letter LPDP, Latihan Mock Interview, UI/UX Design, Fullstack Next.js"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-medium leading-relaxed"
                    />
                    <span className="text-[11px] text-on-surface-variant block">
                      Topik yang Anda masukkan akan dicocokkan dengan keahlian mentor dan silabus kelas bimbingan.
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-[10px] hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
                    style={{ color: "#ffffff", backgroundColor: "var(--color-primary)" }}
                  >
                    {submitting ? <CircularProgress size={16} sx={{ color: "#ffffff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                    <span>Simpan Preferensi Belajar & Minat</span>
                  </button>
                </div>
              </div>
            </form>
              {/* DynamicForm untuk Preferensi & Minat */}
              <DynamicForm
                key={`student-learning-${learningGoals}-${educationLevel}-${englishLevel}-${interests}`}
                config={getStudentPreferencesFormConfig({ learningGoals, educationLevel, englishLevel, interests })}
                onSubmit={handleUpdateLearning}
                isLoading={submitting}
                submitButtonSx={{
                  bgcolor: "var(--color-primary, #1a56db)",
                  "&:hover": { bgcolor: "#1e40af" },
                  color: "#ffffff !important",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  textTransform: "none",
                  px: 3,
                  py: 1.2,
                }}
              />
            </div>
          )}

          {/* TAB 3: KEAMANAN & KATA SANDI */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5 max-w-xl">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-sm font-bold text-on-surface">Ubah Kata Sandi</h3>
                  <p className="text-xs text-on-surface-variant">Pastikan kata sandi baru Anda unik dan memiliki minimal 8 karakter.</p>
                </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5 max-w-xl">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Ubah Kata Sandi</h3>
                <p className="text-xs text-on-surface-variant">Pastikan kata sandi baru Anda unik dan memiliki minimal 8 karakter.</p>
              </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Kata Sandi Saat Ini</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi lama Anda"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Kata Sandi Baru</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Konfirmasi Kata Sandi Baru</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru Anda"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-[10px] hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
                    style={{ color: "#ffffff", backgroundColor: "var(--color-primary)" }}
                  >
                    {submitting ? <CircularProgress size={16} sx={{ color: "#ffffff" }} /> : <LockOutlinedIcon sx={{ fontSize: 16 }} />}
                    <span>Perbarui Kata Sandi</span>
                  </button>
                </div>
              </div>
            </form>
              <DynamicForm
                config={changePasswordFormConfig}
                onSubmit={handleChangePassword}
                isLoading={submitting}
                submitButtonSx={{
                  bgcolor: "var(--color-primary, #1a56db)",
                  "&:hover": { bgcolor: "#1e40af" },
                  color: "#ffffff !important",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  textTransform: "none",
                  px: 3,
                  py: 1.2,
                }}
              />
            </div>
          )}

          {/* TAB 4: PREFERENSI NOTIFIKASI */}
          {activeTab === "notifications" && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5 max-w-2xl">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Notifikasi Email & Sistem</h3>
                <p className="text-xs text-on-surface-variant">Atur pesan apa saja yang ingin Anda terima melalui email terdaftar.</p>
              </div>

              <div className="space-y-4 divide-y divide-outline-variant/20">
                {/* Notif 1 */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Status Pesanan & Pembayaran</h4>
                    <p className="text-[11px] text-on-surface-variant">Terima bukti pembayaran dan update konfirmasi invoice pesanan.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifOrder}
                    onChange={(e) => {
                      setNotifOrder(e.target.checked);
                      showFeedback("success", "Pengaturan notifikasi berhasil diperbarui");
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </div>

                {/* Notif 2 */}
                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Pengingat Jadwal Sesi Live</h4>
                    <p className="text-[11px] text-on-surface-variant">Dapatkan pengingat 1 jam dan 15 menit sebelum sesi mentoring dimulai.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSessionReminder}
                    onChange={(e) => {
                      setNotifSessionReminder(e.target.checked);
                      showFeedback("success", "Pengaturan notifikasi berhasil diperbarui");
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </div>

                {/* Notif 3 */}
                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Rekomendasi Layanan & Diskon</h4>
                    <p className="text-[11px] text-on-surface-variant">Kabar informasi kelas baru dari mentor unggulan dan diskon promo berkala.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPromo}
                    onChange={(e) => {
                      setNotifPromo(e.target.checked);
                      showFeedback("success", "Pengaturan notifikasi berhasil diperbarui");
                    }}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/40 shadow-xs flex flex-col items-center justify-center gap-3">
          <CircularProgress size={32} />
          <span className="text-xs text-on-surface-variant">Memuat pengaturan...</span>
        </div>
      }
    >
      <StudentSettingsContent />
    </Suspense>
  );
}
