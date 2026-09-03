"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import {
  getMyAccount,
  getMyProfile,
  updateMyProfile,
  changePassword,
  getPayoutAccount,
  savePayoutAccount,
  PayoutAccountData,
} from "@/lib/api/settings";
import { DynamicForm } from "@/components/dynamic-form";
import {
  getTalentProfileFormConfig,
  getTalentPayoutFormConfig,
  getTalentSessionFormConfig,
  changePasswordFormConfig,
  BANK_OPTIONS,
} from "@/lib/forms/settingsForm";

// MUI Icons
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VideoCameraFrontOutlinedIcon from "@mui/icons-material/VideoCameraFrontOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const BANK_OPTIONS = [
  { code: "BCA", name: "Bank Central Asia (BCA)" },
  { code: "MANDIRI", name: "Bank Mandiri" },
  { code: "BNI", name: "Bank Negara Indonesia (BNI)" },
  { code: "BRI", name: "Bank Rakyat Indonesia (BRI)" },
  { code: "BSI", name: "Bank Syariah Indonesia (BSI)" },
  { code: "CIMB", name: "CIMB Niaga" },
  { code: "PERMATA", name: "Bank Permata" },
  { code: "DANAMON", name: "Bank Danamon" },
];

function TalentSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"profile" | "payout" | "security" | "session">("profile");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync tab with URL query parameter ?tab=...
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "profile" || tabParam === "payout" || tabParam === "security" || tabParam === "session") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: "profile" | "payout" | "security" | "session") => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Profile States
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Payout Account States
  const [bankCode, setBankCode] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [branch, setBranch] = useState("");
  const [isAccountVerified, setIsAccountVerified] = useState(false);

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Session Preferences States
  const [meetingUrl, setMeetingUrl] = useState("https://meet.google.com/abc-defg-hij");
  const [sessionBuffer, setSessionBuffer] = useState("15");
  const [instantBooking, setInstantBooking] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [acc, prof, payout] = await Promise.allSettled([
        getMyAccount(),
        getMyProfile(),
        getPayoutAccount(),
      ]);

      if (acc.status === "fulfilled" && acc.value) {
        setEmail(acc.value.email || "");
        setDisplayName(acc.value.name || "");
        setPhone(acc.value.phone || "");
      }

      if (prof.status === "fulfilled" && prof.value) {
        if (prof.value.bio) setBio(prof.value.bio);
      }

      if (payout.status === "fulfilled" && payout.value) {
        setBankCode(payout.value.bank_code || "BCA");
        setAccountNumber(payout.value.account_number || "");
        setAccountHolderName(payout.value.account_holder_name || "");
        setBranch(payout.value.branch || "");
        setIsAccountVerified(Boolean(payout.value.is_verified));
      }
    } catch (err) {
      console.error("Failed to load talent settings", err);
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
      showFeedback("success", "Profil mentor Anda berhasil disimpan!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal memperbarui profil");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
  const handleSavePayout = async (formData: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      const selectedBank = BANK_OPTIONS.find((b) => b.code === bankCode);
      const bankName = selectedBank ? selectedBank.name : bankCode;
      const code = (formData.bank_code as string) || bankCode;
      const accNum = (formData.account_number as string) || accountNumber;
      const accHolder = (formData.account_holder_name as string) || accountHolderName;
      const br = (formData.branch as string) ?? branch;
      const selectedBank = BANK_OPTIONS.find((b) => b.value === code);
      const bankName = selectedBank ? selectedBank.label : code;

      const saved = await savePayoutAccount({
        bank_code: bankCode,
        bank_code: code,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
        branch,
        account_number: accNum,
        account_holder_name: accHolder,
        branch: br,
      });

      setBankCode(code);
      setAccountNumber(accNum);
      setAccountHolderName(accHolder);
      setBranch(br);
      setIsAccountVerified(Boolean(saved.is_verified));
      showFeedback("success", "Rekening bank pencairan dana (payout) berhasil disimpan!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal menyimpan rekening payout");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
  const handleSaveSessionPrefs = async (formData: Record<string, unknown>) => {
    const url = (formData.meeting_url as string) || meetingUrl;
    const buf = (formData.session_buffer as string) || sessionBuffer;
    const inst = Boolean(formData.instant_booking ?? instantBooking);
    setMeetingUrl(url);
    setSessionBuffer(buf);
    setInstantBooking(inst);
    showFeedback("success", "Pengaturan sesi mentoring berhasil disimpan!");
  };

  const handleChangePassword = async (formData: Record<string, unknown>) => {
    const currentPass = formData.current_password as string;
    const newPass = formData.new_password as string;
    const confirmPass = formData.confirm_password as string;

    if (newPass !== confirmPass) {
      showFeedback("error", "Konfirmasi kata sandi baru tidak cocok!");
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
      showFeedback("success", "Kata sandi berhasil diperbarui!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal mengubah kata sandi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSessionPrefs = (e: React.FormEvent) => {
    e.preventDefault();
    showFeedback("success", "Pengaturan preferensi sesi bimbingan tersimpan!");
  };

  const tabs = [
    { id: "profile", label: "Profil Mentor", icon: <BadgeOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: "payout", label: "Rekening Payout", icon: <AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: "session", label: "Preferensi Sesi", icon: <VideoCameraFrontOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: "security", label: "Keamanan Akun", icon: <LockOutlinedIcon sx={{ fontSize: 18 }} /> },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Pengaturan Akun & Rekening Payout"
        description="Kelola identitas mentor, rekening bank pencairan dana hasil bimbingan, dan pengaturan sesi live."
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
          <span className="text-xs text-on-surface-variant">Memuat data pengaturan mentor...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: PROFIL MENTOR */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-sm font-bold text-on-surface">Identitas Publik Mentor</h3>
                  <p className="text-xs text-on-surface-variant">Informasi ini akan ditampilkan pada profil publik dan kartu katalog layanan Anda.</p>
                </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Identitas Publik Mentor</h3>
                <p className="text-xs text-on-surface-variant">Informasi ini akan ditampilkan pada profil publik dan kartu katalog layanan Anda.</p>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Tampilan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Nama Tampilan Publik</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Contoh: Dr. Budi Santoso, M.Kom"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Email (Readonly) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-on-surface">Email Akun</label>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                        <VerifiedUserOutlinedIcon sx={{ fontSize: 12 }} /> Terdaftar
                      </span>
                    </div>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low text-on-surface-variant border border-outline-variant/30 rounded-[10px] cursor-not-allowed"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Nomor WhatsApp Resmi</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {/* Bio Profesional */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface block">Ringkasan Bio Profesional</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Jelaskan keahlian, pengalaman profesional, atau bidang bimbingan yang Anda ampu..."
                    className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-[10px] hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
                  >
                    {submitting ? <CircularProgress size={16} sx={{ color: "#ffffff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                    <span>Simpan Profil Mentor</span>
                  </button>
                </div>
              </div>
            </form>
              <DynamicForm
                key={`talent-profile-${displayName}-${email}-${phone}`}
                config={getTalentProfileFormConfig({ displayName, email, phone, bio })}
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

          {/* TAB 2: REKENING PAYOUT */}
          {activeTab === "payout" && (
            <form onSubmit={handleSavePayout} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
                <div className="pb-3 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Rekening Bank Pencairan Dana (Payout)</h3>
                    <p className="text-xs text-on-surface-variant">Hasil bimbingan Anda (setelah potongan fee 10%) akan ditransfer otomatis ke rekening ini.</p>
                  </div>
                  {isAccountVerified && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 shrink-0">
                      <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> Rekening Siap Payout
                    </span>
                  )}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
              <div className="pb-3 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Rekening Bank Pencairan Dana (Payout)</h3>
                  <p className="text-xs text-on-surface-variant">Hasil bimbingan Anda (setelah potongan fee 10%) akan ditransfer otomatis ke rekening ini.</p>
                </div>
                {isAccountVerified && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 shrink-0">
                    <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> Rekening Siap Payout
                  </span>
                )}
              </div>

                {/* Info Alert */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-[10px] flex items-start gap-3 text-xs text-on-surface">
                  <InfoOutlinedIcon sx={{ fontSize: 18 }} className="text-primary mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Penting:</strong> Nama pemilik rekening harus sesuai dengan nama lengkap pada dokumen KTP/KYC terverifikasi Anda untuk menghindari pembatalan atau kegagalan saat proses transfer pencairan dana otomatis.
                  </p>
                </div>
              {/* Info Alert (TETAP UTUH) */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-[10px] flex items-start gap-3 text-xs text-on-surface">
                <InfoOutlinedIcon sx={{ fontSize: 18 }} className="text-primary mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Penting:</strong> Nama pemilik rekening harus sesuai dengan nama lengkap pada dokumen KTP/KYC terverifikasi Anda untuk menghindari pembatalan atau kegagalan saat proses transfer pencairan dana otomatis.
                </p>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bank Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Pilih Bank</label>
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {BANK_OPTIONS.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nomor Rekening */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Nomor Rekening</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Contoh: 1234567890"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                    />
                  </div>

                  {/* Nama Pemilik Rekening */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Nama Lengkap Pemilik Rekening</label>
                    <input
                      type="text"
                      required
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Sesuai buku tabungan / KTP"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Cabang Bank (Opsional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Kantor Cabang Bank (Opsional)</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Contoh: KCU Sudirman Jakarta"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-[10px] hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
                  >
                    {submitting ? <CircularProgress size={16} sx={{ color: "#ffffff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                    <span>Simpan Rekening Payout</span>
                  </button>
                </div>
              </div>
            </form>
              <DynamicForm
                key={`talent-payout-${bankCode}-${accountNumber}`}
                config={getTalentPayoutFormConfig({ bankCode, accountNumber, accountHolderName, branch })}
                onSubmit={handleSavePayout}
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

          {/* TAB 3: PREFERENSI SESI MENTORING */}
          {activeTab === "session" && (
            <form onSubmit={handleSaveSessionPrefs} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-sm font-bold text-on-surface">Pengaturan Sesi Live Mentoring</h3>
                  <p className="text-xs text-on-surface-variant">Konfigurasi ruang pertemuan virtual dan waktu jeda antar sesi bimbingan.</p>
                </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Pengaturan Sesi Live Mentoring</h3>
                <p className="text-xs text-on-surface-variant">Konfigurasi ruang pertemuan virtual dan waktu jeda antar sesi bimbingan.</p>
              </div>

                <div className="space-y-4 max-w-xl">
                  {/* Default Meeting Link */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Default Link Google Meet / Zoom Personal Room</label>
                    <input
                      type="url"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                    />
                    <span className="text-[11px] text-on-surface-variant block">
                      Tautan ini akan otomatis dikirimkan ke siswa saat jadwal bimbingan terkonfirmasi.
                    </span>
                  </div>

                  {/* Buffer Time */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Waktu Jeda Istirahat Antar Sesi (Buffer Time)</label>
                    <select
                      value={sessionBuffer}
                      onChange={(e) => setSessionBuffer(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="0">Tanpa Jeda (Langsung lanjut)</option>
                      <option value="15">15 Menit Istirahat</option>
                      <option value="30">30 Menit Istirahat</option>
                    </select>
                  </div>

                  {/* Toggle Instant Booking */}
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Konfirmasi Booking Instan</h4>
                      <p className="text-[11px] text-on-surface-variant">Langsung jadwalkan sesi begitu pembayaran siswa terverifikasi tanpa perlu konfirmasi manual.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={instantBooking}
                      onChange={(e) => setInstantBooking(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-[10px] hover:bg-primary/90 transition-all shadow-xs"
                  >
                    <SaveOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Simpan Pengaturan Sesi</span>
                  </button>
                </div>
              </div>
            </form>
              <DynamicForm
                key={`talent-session-${meetingUrl}-${sessionBuffer}-${instantBooking}`}
                config={getTalentSessionFormConfig({ meetingUrl, sessionBuffer, instantBooking })}
                onSubmit={handleSaveSessionPrefs}
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

          {/* TAB 4: KEAMANAN & KATA SANDI */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5 max-w-xl">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-sm font-bold text-on-surface">Ubah Kata Sandi Mentor</h3>
                  <p className="text-xs text-on-surface-variant">Jaga keamanan akun dan saldo penghasilan Anda dengan kata sandi yang kuat.</p>
                </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5 max-w-xl">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Ubah Kata Sandi Mentor</h3>
                <p className="text-xs text-on-surface-variant">Jaga keamanan akun dan saldo penghasilan Anda dengan kata sandi yang kuat.</p>
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
        </div>
      )}
    </div>
  );
}

export default function TalentSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/40 shadow-xs flex flex-col items-center justify-center gap-3">
          <CircularProgress size={32} />
          <span className="text-xs text-on-surface-variant">Memuat data pengaturan mentor...</span>
        </div>
      }
    >
      <TalentSettingsContent />
    </Suspense>
  );
}

