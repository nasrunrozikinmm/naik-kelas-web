"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import {
  getMyAccount,
  updateMyProfile,
  changePassword,
  getPlatformSettings,
  updatePlatformSettings,
} from "@/lib/api/settings";
import { DynamicForm } from "@/components/dynamic-form";
import {
  getAdminPlatformConfigFormConfig,
  getAdminProfileFormConfig,
  changePasswordFormConfig,
} from "@/lib/forms/settingsForm";

// MUI Icons
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

function AdminSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"platform" | "profile" | "security">("platform");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync tab with URL query parameter ?tab=...
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "platform" || tabParam === "profile" || tabParam === "security") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: "platform" | "profile" | "security") => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Platform Config States
  const [platformFee, setPlatformFee] = useState("10");
  const [minPayout, setMinPayout] = useState("50000");
  const [gatewayMode, setGatewayMode] = useState("sandbox");
  const [maintenanceMode, setMaintenanceMode] = useState("false");
  const [supportEmail, setSupportEmail] = useState("support@naikkelas.id");
  const [supportWhatsapp, setSupportWhatsapp] = useState("+6281234567890");

  // Profile States
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [acc, settings] = await Promise.allSettled([
        getMyAccount(),
        getPlatformSettings(),
      ]);

      if (acc.status === "fulfilled" && acc.value) {
        setEmail(acc.value.email || "");
        setDisplayName(acc.value.name || "");
        setPhone(acc.value.phone || "");
      }

      if (settings.status === "fulfilled" && Array.isArray(settings.value)) {
        settings.value.forEach((item) => {
          if (item.key === "platform_fee_percent") setPlatformFee(item.value);
          if (item.key === "minimum_payout_amount") setMinPayout(item.value);
          if (item.key === "payment_gateway_mode") setGatewayMode(item.value);
          if (item.key === "maintenance_mode") setMaintenanceMode(item.value);
          if (item.key === "support_email") setSupportEmail(item.value);
          if (item.key === "support_whatsapp") setSupportWhatsapp(item.value);
        });
      }
    } catch (err) {
      console.error("Failed to load admin settings", err);
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

  const handleUpdatePlatform = async (formData: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      const fee = formData.platform_fee_percent !== undefined ? String(formData.platform_fee_percent) : platformFee;
      const min = formData.minimum_payout_amount !== undefined ? String(formData.minimum_payout_amount) : minPayout;
      const mode = (formData.payment_gateway_mode as string) || gatewayMode;
      const maint = (formData.maintenance_mode as string) || maintenanceMode;
      const email = (formData.support_email as string) || supportEmail;
      const wa = (formData.support_whatsapp as string) || supportWhatsapp;

      await updatePlatformSettings({
        platform_fee_percent: fee,
        minimum_payout_amount: min,
        payment_gateway_mode: mode,
        maintenance_mode: maint,
        support_email: email,
        support_whatsapp: wa,
      });

      setPlatformFee(fee);
      setMinPayout(min);
      setGatewayMode(mode);
      setMaintenanceMode(maint);
      setSupportEmail(email);
      setSupportWhatsapp(wa);

      showFeedback("success", "Konfigurasi parameter platform berhasil diperbarui!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal memperbarui konfigurasi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async (formData: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      const name = (formData.display_name as string) || displayName;
      const ph = (formData.phone as string) ?? phone;

      await updateMyProfile({
        display_name: name,
        phone: ph,
        bio,
      });

      setDisplayName(name);
      setPhone(ph);

      showFeedback("success", "Profil administrator berhasil disimpan!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal memperbarui profil admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (formData: Record<string, unknown>) => {
    const currentPass = formData.current_password as string;
    const newPass = formData.new_password as string;
    const confirmPass = formData.confirm_password as string;

    if (newPass !== confirmPass) {
      showFeedback("error", "Konfirmasi kata sandi baru tidak sesuai!");
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
      showFeedback("success", "Kata sandi superadmin berhasil diperbarui!");
    } catch (err: any) {
      showFeedback("error", err?.response?.data?.error?.message || "Gagal mengubah kata sandi");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: "platform", label: "Konfigurasi Platform", icon: <TuneOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: "profile", label: "Profil Admin", icon: <PersonOutlineIcon sx={{ fontSize: 18 }} /> },
    { id: "security", label: "Keamanan Akun", icon: <LockOutlinedIcon sx={{ fontSize: 18 }} /> },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Pengaturan Sistem & Platform"
        description="Atur parameter operasional global marketplace Naik Kelas, akun administrator, dan preferensi keamanan."
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
          <span className="text-xs text-on-surface-variant">Memuat konfigurasi sistem...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: KONFIGURASI PLATFORM */}
          {activeTab === "platform" && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-6">
              <div className="pb-3 border-b border-outline-variant/20 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Parameter Finansial & Marketplace</h3>
                  <p className="text-xs text-on-surface-variant">Aturan pembagian komisi, batasan pencairan dana, dan integrasi payment gateway.</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <SecurityOutlinedIcon sx={{ fontSize: 14 }} /> Khusus Superadmin
                </span>
              </div>

              <DynamicForm
                key={`admin-platform-${platformFee}-${minPayout}-${gatewayMode}-${maintenanceMode}`}
                config={getAdminPlatformConfigFormConfig({
                  platformFee,
                  minPayout,
                  gatewayMode,
                  maintenanceMode,
                  supportEmail,
                  supportWhatsapp,
                })}
                onSubmit={handleUpdatePlatform}
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

          {/* TAB 2: PROFIL ADMIN */}
          {activeTab === "profile" && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Data Akun Administrator</h3>
                <p className="text-xs text-on-surface-variant">Informasi identitas akun yang digunakan untuk logging aksi audit sistem.</p>
              </div>

              <DynamicForm
                key={`admin-profile-${displayName}-${email}-${phone}`}
                config={getAdminProfileFormConfig({ displayName, email, phone })}
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

          {/* TAB 3: KEAMANAN SUPERADMIN */}
          {activeTab === "security" && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5 max-w-xl">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Ubah Kata Sandi Superadmin</h3>
                <p className="text-xs text-on-surface-variant">Lindungi akses backend dengan kata sandi berkekuatan tinggi.</p>
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

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-container-lowest rounded-2xl p-12 border border-outline-variant/40 shadow-xs flex flex-col items-center justify-center gap-3">
          <CircularProgress size={32} />
          <span className="text-xs text-on-surface-variant">Memuat konfigurasi sistem...</span>
        </div>
      }
    >
      <AdminSettingsContent />
    </Suspense>
  );
}

