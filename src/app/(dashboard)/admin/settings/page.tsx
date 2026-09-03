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

  const handleUpdatePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
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
        platform_fee_percent: platformFee,
        minimum_payout_amount: minPayout,
        payment_gateway_mode: gatewayMode,
        maintenance_mode: maintenanceMode,
        support_email: supportEmail,
        support_whatsapp: supportWhatsapp,
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
  const handleUpdateProfile = async (formData: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      const name = (formData.display_name as string) || displayName;
      const ph = (formData.phone as string) ?? phone;

      await updateMyProfile({
        display_name: displayName,
        phone,
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
            <form onSubmit={handleUpdatePlatform} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-6">
                <div className="pb-3 border-b border-outline-variant/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Parameter Finansial & Marketplace</h3>
                    <p className="text-xs text-on-surface-variant">Aturan pembagian komisi, batasan pencairan dana, dan integrasi payment gateway.</p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <SecurityOutlinedIcon sx={{ fontSize: 14 }} /> Khusus Superadmin
                  </span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform Fee Percent */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">
                      Potongan Komisi Platform Naik Kelas (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        required
                        value={platformFee}
                        onChange={(e) => setPlatformFee(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">%</span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant block">
                      Diterapkan langsung saat transaksi checkout pesanan siswa berhasil.
                    </span>
                  </div>

                  {/* Minimum Payout Amount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">
                      Minimal Penarikan Dana Payout (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">Rp</span>
                      <input
                        type="number"
                        min="10000"
                        step="5000"
                        required
                        value={minPayout}
                        onChange={(e) => setMinPayout(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                      />
                    </div>
                    <span className="text-[11px] text-on-surface-variant block">
                      Batas saldo minimal agar mentor dapat mengajukan pencairan dana.
                    </span>
                  </div>

                  {/* Payment Gateway Mode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Mode Gateway Midtrans</label>
                    <select
                      value={gatewayMode}
                      onChange={(e) => setGatewayMode(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    >
                      <option value="sandbox">Sandbox (Pengujian / Simulasi QRIS & VA)</option>
                      <option value="production">Production (Uang Riil Aktif)</option>
                    </select>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Status Pemeliharaan Sistem (Maintenance)</label>
                    <select
                      value={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    >
                      <option value="false">Normal (Platform Beroperasi Penuh)</option>
                      <option value="true">Maintenance (Hanya Admin yang dapat login)</option>
                    </select>
                  </div>

                  {/* Support Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Email Layanan Pelanggan (CS)</label>
                    <input
                      type="email"
                      required
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Support WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Nomor WhatsApp Resmi Bantuan</label>
                    <input
                      type="text"
                      required
                      value={supportWhatsapp}
                      onChange={(e) => setSupportWhatsapp(e.target.value)}
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
                    <span>Simpan Konfigurasi Platform</span>
                  </button>
                </div>
              </div>
            </form>
              <DynamicForm
                key={`admin-platform-${platformFee}-${minPayout}-${gatewayMode}`}
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
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
                <div className="pb-3 border-b border-outline-variant/20">
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5">
              <div className="pb-3 border-b border-outline-variant/20 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Data Akun Administrator</h3>
                  <p className="text-xs text-on-surface-variant">Informasi identitas akun yang digunakan untuk logging aksi audit sistem.</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                  <VerifiedUserOutlinedIcon sx={{ fontSize: 12 }} /> Otoritas Penuh
                </span>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Nama Administrator</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full px-3.5 py-2.5 text-xs bg-surface text-on-surface border border-outline-variant/50 rounded-[10px] focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-on-surface">Email Superadmin</label>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                        <VerifiedUserOutlinedIcon sx={{ fontSize: 12 }} /> Otoritas Penuh
                      </span>
                    </div>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low text-on-surface-variant border border-outline-variant/30 rounded-[10px] cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Nomor Telepon Internal</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08..."
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
                    <span>Simpan Profil Admin</span>
                  </button>
                </div>
              </div>
            </form>
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
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5 max-w-xl">
                <div className="pb-3 border-b border-outline-variant/20">
                  <h3 className="text-sm font-bold text-on-surface">Ubah Kata Sandi Superadmin</h3>
                  <p className="text-xs text-on-surface-variant">Lindungi akses backend dengan kata sandi berkekuatan tinggi.</p>
                </div>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-xs space-y-5 max-w-xl">
              <div className="pb-3 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Ubah Kata Sandi Superadmin</h3>
                <p className="text-xs text-on-surface-variant">Lindungi akses backend dengan kata sandi berkekuatan tinggi.</p>
              </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface block">Kata Sandi Saat Ini</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi lama"
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
                      placeholder="Ulangi kata sandi baru"
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

