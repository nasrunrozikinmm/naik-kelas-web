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

  const handleUpdateProfile = async (formData: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      const name = (formData.display_name as string) || displayName;
      const ph = (formData.phone as string) ?? phone;
      const b = (formData.bio as string) ?? bio;
      await updateMyProfile({
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

  const handleSavePayout = async (formData: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      const code = (formData.bank_code as string) || bankCode;
      const accNum = (formData.account_number as string) || accountNumber;
      const accHolder = (formData.account_holder_name as string) || accountHolderName;
      const br = (formData.branch as string) ?? branch;
      const selectedBank = BANK_OPTIONS.find((b) => b.value === code);
      const bankName = selectedBank ? selectedBank.label : code;

      const saved = await savePayoutAccount({
        bank_code: code,
        bank_name: bankName,
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
    if (newPass.length < 8) {
      showFeedback("error", "Kata sandi baru minimal 8 karakter!");
      return;
    }

    try {
      setSubmitting(true);
      await changePassword({
        current_password: currentPass,
        new_password: newPass,
      });
      showFeedback("success", "Kata sandi berhasil diperbarui!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal mengubah kata sandi");
    } finally {
      setSubmitting(false);
    }
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
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Identitas Publik Mentor</h3>
                <p className="text-xs text-on-surface-variant">Informasi ini akan ditampilkan pada profil publik dan kartu katalog layanan Anda.</p>
              </div>

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

              {/* Info Alert (TETAP UTUH) */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-[10px] flex items-start gap-3 text-xs text-on-surface">
                <InfoOutlinedIcon sx={{ fontSize: 18 }} className="text-primary mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Penting:</strong> Nama pemilik rekening harus sesuai dengan nama lengkap pada dokumen KTP/KYC terverifikasi Anda untuk menghindari pembatalan atau kegagalan saat proses transfer pencairan dana otomatis.
                </p>
              </div>

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
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Pengaturan Sesi Live Mentoring</h3>
                <p className="text-xs text-on-surface-variant">Konfigurasi ruang pertemuan virtual dan waktu jeda antar sesi bimbingan.</p>
              </div>

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
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5 max-w-xl">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Ubah Kata Sandi Mentor</h3>
                <p className="text-xs text-on-surface-variant">Jaga keamanan akun dan saldo penghasilan Anda dengan kata sandi yang kuat.</p>
              </div>

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

