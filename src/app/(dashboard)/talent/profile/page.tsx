"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getApiErrorMessage } from "@/lib/utils/api-error";
import { formatCurrency } from "@/lib/utils/format";
import { DynamicForm, FormConfig } from "@/components/dynamic-form";

// MUI Icons & Components
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import VerifiedIcon from "@mui/icons-material/Verified";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CircularProgress from "@mui/material/CircularProgress";

interface UploadedDoc {
  url: string;
  name: string;
  size?: number;
}

interface InitialProfileData {
  displayName: string;
  bio: string;
  educationLevel: string;
  experienceYears: number;
  portfolio: string;
  startingPrice: number;
  skills: string[];
}

export default function TalentProfilePage() {
  const { displayName: authName } = useAuth();

  // Document states (managed for MinIO direct upload)
  const [ktpDoc, setKtpDoc] = useState<UploadedDoc | null>(null);
  const [ijazahDoc, setIjazahDoc] = useState<UploadedDoc | null>(null);
  const [uploadingKtp, setUploadingKtp] = useState(false);
  const [uploadingIjazah, setUploadingIjazah] = useState(false);

  // Status & loading states
  const [verificationStatus, setVerificationStatus] = useState<string>("not_required");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initial loaded profile data for DynamicForm defaultValues
  const [initialData, setInitialData] = useState<InitialProfileData>({
    displayName: authName || "",
    bio: "",
    educationLevel: "S1 (Sarjana)",
    experienceYears: 3,
    portfolio: "",
    startingPrice: 100000,
    skills: ["Bimbingan Beasiswa", "Persiapan UTBK"]
  });

  // Current preview states
  const [previewName, setPreviewName] = useState(authName || "Nama Mentor");
  const [previewBio, setPreviewBio] = useState("");
  const [previewEducation, setPreviewEducation] = useState("S1 (Sarjana)");
  const [previewPrice, setPreviewPrice] = useState(100000);

  // Skills state
  const [skills, setSkills] = useState<string[]>(["Bimbingan Beasiswa", "Persiapan UTBK"]);
  const [newSkill, setNewSkill] = useState("");

  const ktpInputRef = useRef<HTMLInputElement>(null);
  const ijazahInputRef = useRef<HTMLInputElement>(null);

  // Fetch current talent profile from backend
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const res = await apiClient.get(endpoints.profile.me);
        if (isMounted && res.data?.data) {
          const p = res.data.data;
          const loadedSkills: string[] = p.expertise
            ? p.expertise.split(",").map((s: string) => s.trim()).filter(Boolean)
            : ["Bimbingan Beasiswa", "Persiapan UTBK"];

          const loadedData: InitialProfileData = {
            displayName: p.display_name || authName || "",
            bio: p.bio || "",
            educationLevel: p.education_level || "S1 (Sarjana)",
            experienceYears: p.experience_years ?? 3,
            portfolio: p.portfolio || "",
            startingPrice: p.starting_price ? Number(p.starting_price) : 100000,
            skills: loadedSkills.length > 0 ? loadedSkills : ["Bimbingan Beasiswa", "Persiapan UTBK"]
          };

          setInitialData(loadedData);
          setPreviewName(loadedData.displayName || "Nama Mentor");
          setPreviewBio(loadedData.bio);
          setPreviewEducation(loadedData.educationLevel);
          setPreviewPrice(loadedData.startingPrice);
          setSkills(loadedData.skills);

          if (p.verification_status) setVerificationStatus(p.verification_status);

          if (p.documents) {
            try {
              const docs = typeof p.documents === "string" ? JSON.parse(p.documents) : p.documents;
              if (docs.ktp_url) {
                setKtpDoc({ url: docs.ktp_url, name: docs.ktp_name || "KTP_Identitas.pdf" });
              }
              if (docs.ijazah_url) {
                setIjazahDoc({ url: docs.ijazah_url, name: docs.ijazah_name || "Ijazah_Terakhir.pdf" });
              }
            } catch {
              // JSON parse fallback
            }
          }
        }
      } catch {
        // Fallback or network error
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [authName]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "ktp" | "ijazah") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSubmitError("Ukuran file maksimal 10 MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setSubmitError(null);
      if (type === "ktp") setUploadingKtp(true);
      else setUploadingIjazah(true);

      const res = await apiClient.post(
        `${endpoints.media.upload}?folder=kyc`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      const data = res.data?.data;
      if (data?.url) {
        const doc: UploadedDoc = {
          url: data.url,
          name: data.filename || file.name,
          size: file.size
        };
        if (type === "ktp") setKtpDoc(doc);
        else setIjazahDoc(doc);
      }
    } catch (err: unknown) {
      setSubmitError(getApiErrorMessage(err, "Gagal mengunggah berkas. Pastikan format JPG, PNG, atau PDF."));
    } finally {
      if (type === "ktp") setUploadingKtp(false);
      else setUploadingIjazah(false);
    }
  };

  const handleAddSkill = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && newSkill.trim() !== "") {
        e.preventDefault();
        setSkills((prev) => (prev.includes(newSkill.trim()) ? prev : [...prev, newSkill.trim()]));
        setNewSkill("");
      }
    },
    [newSkill]
  );

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  }, []);

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!ktpDoc || !ijazahDoc) {
      setSubmitError("Harap unggah kedua dokumen identitas (KTP dan Ijazah) sebelum mengajukan verifikasi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const reqData = {
        bio: formData.bio as string,
        education_level: formData.educationLevel as string,
        expertise: skills.join(", "),
        experience_years: Number(formData.experienceYears) || 1,
        portfolio: (formData.portfolio as string) || "https://naikKelas.id",
        languages: ["id", "en"],
        starting_price: Number(formData.startingPrice) || 50000,
        documents: JSON.stringify({
          ktp_url: ktpDoc.url,
          ktp_name: ktpDoc.name,
          ijazah_url: ijazahDoc.url,
          ijazah_name: ijazahDoc.name
        })
      };

      const response = await apiClient.post(endpoints.profile.kyc, reqData);
      if (response.data?.success) {
        setVerificationStatus("pending");
        setSubmitSuccess("Pengajuan verifikasi KYC berhasil dikirim! Tim Admin Naik Kelas akan meninjau berkas Anda.");
      }
    } catch (error: unknown) {
      setSubmitError(getApiErrorMessage(error, "Gagal mengirimkan pengajuan KYC. Silakan coba lagi."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = verificationStatus === "pending";
  const isVerified = verificationStatus === "verified";
  const isRejected = verificationStatus === "rejected";

  // DynamicForm configuration
  const formConfig: FormConfig = useMemo(() => {
    return {
      submitLabel: isVerified
        ? "Profil Sudah Terverifikasi"
        : isPending
        ? "Sedang Ditinjau Admin"
        : "Ajukan Verifikasi Profil",
      fields: [
        {
          name: "displayName",
          label: "Nama Lengkap & Gelar",
          type: "text",
          placeholder: "Contoh: Ahmad Wijaya, S.Kom., M.Sc",
          defaultValue: initialData.displayName,
          validation: { required: true, requiredMessage: "Nama lengkap wajib diisi" },
          gridProps: { xs: 12 }
        },
        {
          name: "bio",
          label: "Bio Ringkas & Pengantar Mentor",
          type: "text",
          placeholder: "Jelaskan latar belakang pendidikan, spesialisasi bimbingan, serta portofolio kelulusan siswa bimbingan Anda...",
          minRows: 4,
          defaultValue: initialData.bio,
          validation: { required: true, requiredMessage: "Bio ringkas wajib diisi" },
          gridProps: { xs: 12 }
        },
        {
          name: "educationLevel",
          label: "Tingkat Pendidikan Terakhir",
          type: "select",
          options: [
            { label: "S1 (Sarjana)", value: "S1 (Sarjana)" },
            { label: "S2 (Magister)", value: "S2 (Magister)" },
            { label: "S3 (Doktor)", value: "S3 (Doktor)" },
            { label: "Praktisi / Profesional", value: "Praktisi / Profesional" }
          ],
          defaultValue: initialData.educationLevel,
          validation: { required: true, requiredMessage: "Tingkat pendidikan wajib dipilih" },
          gridProps: { xs: 12, sm: 6 }
        },
        {
          name: "experienceYears",
          label: "Pengalaman Mengajar (Tahun)",
          type: "number",
          defaultValue: initialData.experienceYears,
          validation: { min: 0, minMessage: "Minimal 0 tahun" },
          gridProps: { xs: 12, sm: 6 }
        },
        {
          name: "startingPrice",
          label: "Tarif Sesi Bimbingan Mulai Dari (IDR)",
          type: "number",
          defaultValue: initialData.startingPrice,
          validation: { min: 10000, minMessage: "Tarif minimal Rp 10.000" },
          gridProps: { xs: 12, sm: 6 }
        },
        {
          name: "portfolio",
          label: "Tautan Portofolio / LinkedIn (Opsional)",
          type: "url",
          placeholder: "https://linkedin.com/in/username",
          defaultValue: initialData.portfolio,
          gridProps: { xs: 12, sm: 6 }
        },
        {
          name: "expertiseTags",
          label: "Bidang Keahlian & Topik Bimbingan",
          type: "custom",
          gridProps: { xs: 12 },
          render: () => (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface">
                Bidang Keahlian & Topik Bimbingan
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-surface-container-low border border-outline-variant/40 rounded-xl min-h-[56px] items-center">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1.5 font-bold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-error transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Ketik keahlian & tekan Enter..."
                  className="border-none bg-transparent outline-hidden text-sm flex-1 min-w-[150px] text-on-surface"
                />
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Tekan <strong>Enter</strong> untuk menambahkan tag keahlian.
              </p>
            </div>
          )
        },
        {
          name: "kycUploadDocs",
          label: "Dokumen Verifikasi KYC",
          type: "custom",
          gridProps: { xs: 12 },
          render: () => (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <VerifiedIcon sx={{ fontSize: 20 }} />
                  <span>Dokumen Identitas KYC (MinIO Storage)</span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">Maksimal 10 MB (PDF, JPG, PNG)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* KTP Document Card */}
                <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <BadgeIcon sx={{ fontSize: 18 }} className="text-primary" />
                      <span>Kartu Tanda Penduduk (KTP)</span>
                    </span>
                    {ktpDoc ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Terunggah
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Wajib
                      </span>
                    )}
                  </div>

                  {ktpDoc ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-on-surface truncate" title={ktpDoc.name}>
                        📄 {ktpDoc.name}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={ktpDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <span>Lihat Berkas</span>
                          <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setKtpDoc(null)}
                          className="text-xs font-bold text-error hover:underline flex items-center gap-1 ml-auto"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                          <span>Ganti</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={ktpInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "ktp")}
                      />
                      <button
                        type="button"
                        disabled={uploadingKtp}
                        onClick={() => ktpInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl border border-dashed border-primary text-primary hover:bg-primary/5 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {uploadingKtp ? (
                          <>
                            <CircularProgress size={16} color="inherit" />
                            <span>Mengunggah ke MinIO...</span>
                          </>
                        ) : (
                          <>
                            <CloudUploadIcon sx={{ fontSize: 18 }} />
                            <span>Pilih Berkas KTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Ijazah Document Card */}
                <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <SchoolIcon sx={{ fontSize: 18 }} className="text-secondary" />
                      <span>Ijazah / Sertifikat</span>
                    </span>
                    {ijazahDoc ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Terunggah
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Wajib
                      </span>
                    )}
                  </div>

                  {ijazahDoc ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-on-surface truncate" title={ijazahDoc.name}>
                        🎓 {ijazahDoc.name}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={ijazahDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
                        >
                          <span>Lihat Berkas</span>
                          <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setIjazahDoc(null)}
                          className="text-xs font-bold text-error hover:underline flex items-center gap-1 ml-auto"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                          <span>Ganti</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={ijazahInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "ijazah")}
                      />
                      <button
                        type="button"
                        disabled={uploadingIjazah}
                        onClick={() => ijazahInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl border border-dashed border-secondary text-secondary hover:bg-secondary/5 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {uploadingIjazah ? (
                          <>
                            <CircularProgress size={16} color="inherit" />
                            <span>Mengunggah ke MinIO...</span>
                          </>
                        ) : (
                          <>
                            <CloudUploadIcon sx={{ fontSize: 18 }} />
                            <span>Pilih Berkas Ijazah</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }
      ]
    };
  }, [
    initialData,
    isVerified,
    isPending,
    skills,
    newSkill,
    ktpDoc,
    ijazahDoc,
    uploadingKtp,
    uploadingIjazah,
    handleAddSkill,
    handleRemoveSkill
  ]);

  if (isLoadingProfile) {
    return (
      <div className="max-w-5xl mx-auto py-20 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
        <CircularProgress size={32} color="primary" />
        <p className="text-sm font-semibold">Memuat data profil & status verifikasi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Verification Timeline Header */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Lengkapi Profil Publik & Verifikasi KYC
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Unggah identitas dan keahlian Anda untuk mendapatkan centang biru (*Verified Mentor*) dan mulai membuka bimbingan.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border shrink-0">
            {isVerified ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full font-bold text-xs">
                <VerifiedIcon sx={{ fontSize: 18 }} />
                <span>Terverifikasi Resmi</span>
              </div>
            ) : isPending ? (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full font-bold text-xs">
                <HourglassEmptyIcon sx={{ fontSize: 18 }} className="animate-spin" />
                <span>Menunggu Review Admin</span>
              </div>
            ) : isRejected ? (
              <div className="flex items-center gap-2 text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full font-bold text-xs">
                <CancelIcon sx={{ fontSize: 18 }} />
                <span>Perlu Revisi Dokumen</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Belum Diajukan</span>
              </div>
            )}
          </div>
        </div>

        {/* Multi-step Horizontal Timeline */}
        <div className="relative flex items-start justify-between w-full max-w-2xl mx-auto pt-2 pb-1">
          {/* Connecting Line Track */}
          <div className="absolute top-6 left-5 right-5 h-[2px] -translate-y-1/2 bg-outline-variant/30 z-0">
            {/* Active Colored Progress Fill */}
            <div
              className={`h-full transition-all duration-500 ${
                isVerified
                  ? "w-full bg-emerald-600"
                  : isPending
                  ? "w-1/2 bg-amber-500"
                  : isRejected
                  ? "w-1/2 bg-rose-500"
                  : "w-0 bg-primary"
              }`}
            />
          </div>

          {/* Step 1: Lengkapi Data */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-[110px]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-bold shadow-md ring-4 ring-surface-container-lowest">
              <CheckCircleIcon sx={{ fontSize: 20 }} />
            </div>
            <span className="text-xs font-bold text-primary mt-2">Lengkapi Data</span>
          </div>

          {/* Step 2: Review Admin */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-[110px]">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-colors ring-4 ring-surface-container-lowest ${
                isVerified
                  ? "bg-primary text-white border-primary"
                  : isPending
                  ? "bg-amber-500 text-white border-amber-500 shadow-md ring-amber-100 dark:ring-amber-950"
                  : isRejected
                  ? "bg-rose-500 text-white border-rose-500 shadow-md"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant/40"
              }`}
            >
              {isVerified ? <CheckCircleIcon sx={{ fontSize: 20 }} /> : "2"}
            </div>
            <span
              className={`text-xs font-bold mt-2 ${
                isPending ? "text-amber-700 dark:text-amber-300" : isRejected ? "text-rose-600" : "text-on-surface-variant"
              }`}
            >
              Review Admin
            </span>
          </div>

          {/* Step 3: Terverifikasi */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-[110px]">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-colors ring-4 ring-surface-container-lowest ${
                isVerified
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-emerald-100 dark:ring-emerald-950"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant/40"
              }`}
            >
              {isVerified ? <VerifiedIcon sx={{ fontSize: 20 }} /> : "3"}
            </div>
            <span className={`text-xs font-bold mt-2 ${isVerified ? "text-emerald-600" : "text-on-surface-variant"}`}>
              Terverifikasi
            </span>
          </div>
        </div>
      </section>

      {/* Notifications */}
      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2">
          <CheckCircleIcon sx={{ fontSize: 20 }} />
          <span>{submitSuccess}</span>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm font-semibold flex items-center gap-2">
          <CancelIcon sx={{ fontSize: 20 }} />
          <span>{submitError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Section via DynamicForm */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-xs">
            <div className="flex items-center gap-2 text-primary font-bold text-lg mb-6">
              <BadgeIcon sx={{ fontSize: 22 }} />
              <span>Formulir Pengajuan Profil & Kualifikasi</span>
            </div>

            <DynamicForm
              config={formConfig}
              onSubmit={handleFormSubmit}
              isLoading={isSubmitting}
              disabled={isPending || isVerified}
              globalError={submitError}
              spacing={3}
              submitButtonSx={{
                bgcolor: isVerified ? "success.main" : isPending ? "warning.main" : "primary.main",
                "&:hover": {
                  bgcolor: isVerified ? "success.dark" : isPending ? "warning.dark" : "primary.dark"
                }
              }}
            />
          </div>
        </div>

        {/* Right Column: Guidance & Live Preview Mockup */}
        <div className="space-y-6">
          {/* Profile Card Preview */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xs p-6 text-center space-y-4">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider text-left">
              Pratinjau Kartu Mentor
            </h4>

            <div className="relative w-20 h-20 rounded-full mx-auto bg-primary-container text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-primary">
              {previewName?.[0] || "T"}
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 font-bold text-base text-on-surface">
                <span>{previewName || "Nama Mentor"}</span>
                {isVerified && <VerifiedIcon sx={{ fontSize: 16 }} className="text-primary" />}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">{previewEducation}</p>
            </div>

            <p className="text-xs text-on-surface-variant line-clamp-3 italic px-2">
              &quot;{previewBio || "Deskripsi profil mentor akan tampil di sini untuk calon siswa."}&quot;
            </p>

            <div className="pt-2 border-t border-outline-variant/30 flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Mulai Dari</span>
              <span className="font-extrabold text-primary">{formatCurrency(previewPrice)}</span>
            </div>
          </div>

          {/* Verification Process Notice */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <HourglassEmptyIcon sx={{ fontSize: 18 }} className="text-primary" />
              <span>Proses Review Dokumen</span>
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Setelah dikirimkan, profil Anda akan berstatus <strong>Menunggu Review</strong>. Tim verifikasi Naik Kelas akan meninjau keaslian KTP dan Ijazah dalam waktu maksimal <strong>1x24 jam kerja</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
