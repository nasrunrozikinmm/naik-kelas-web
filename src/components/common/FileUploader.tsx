"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { uploadMedia, deleteMedia } from "@/lib/api/media";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

export interface FileUploaderAcceptConfig {
  mimes: string[];
  maxBytes: number;
  label: string;
}

export interface FileUploaderProps {
  /** Current file URL */
  value: string;
  /** Storage key in MinIO for delete/cleanup */
  objectKey?: string;
  /** Change callback returning URL and storage key */
  onChange: (url: string, key: string) => void;
  /** Optional callback fired when file is removed */
  onRemove?: () => void;
  /** Storage folder prefix (e.g., "catalogs", "kyc", "uploads") */
  folder?: string;
  /** Custom accept rules and file size limit */
  accept?: FileUploaderAcceptConfig;
  /** Field label */
  label?: string;
  /** Disable interactions */
  disabled?: boolean;
  /** Validation error message */
  error?: string;
  /** Component display and accept variant */
  variant?: "image" | "document" | "any";
  /** Optional custom class name */
  className?: string;
}

const DEFAULT_IMAGE_ACCEPT: FileUploaderAcceptConfig = {
  mimes: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 5 * 1024 * 1024, // 5 MB
  label: "JPG, PNG, WEBP • Maks. 5 MB",
};

const DEFAULT_DOC_ACCEPT: FileUploaderAcceptConfig = {
  mimes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  maxBytes: 10 * 1024 * 1024, // 10 MB
  label: "PDF, JPG, PNG, WEBP • Maks. 10 MB",
};

const DEFAULT_ANY_ACCEPT: FileUploaderAcceptConfig = {
  mimes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  maxBytes: 10 * 1024 * 1024, // 10 MB
  label: "PDF, JPG, PNG, WEBP • Maks. 10 MB",
};

function isImageUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.endsWith(".gif") ||
    cleanUrl.endsWith(".svg")
  );
}

function isPdfUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return cleanUrl.endsWith(".pdf");
}

function extractFilename(url: string): string {
  if (!url) return "Berkas Terunggah";
  try {
    const cleanUrl = url.split("?")[0];
    const segments = cleanUrl.split("/");
    const last = segments[segments.length - 1];
    return last ? decodeURIComponent(last) : "Berkas Terunggah";
  } catch {
    return "Berkas Terunggah";
  }
}

export function FileUploader({
  value,
  objectKey,
  onChange,
  onRemove,
  folder = "uploads",
  accept,
  label,
  disabled = false,
  error,
  variant = "any",
  className = "",
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastUploadedKey, setLastUploadedKey] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageError, setPreviewImageError] = useState(false);

  // Determine active accept rules
  const activeAccept = useMemo(() => {
    if (accept) return accept;
    if (variant === "image") return DEFAULT_IMAGE_ACCEPT;
    if (variant === "document") return DEFAULT_DOC_ACCEPT;
    return DEFAULT_ANY_ACCEPT;
  }, [accept, variant]);

  // Extract storage object key from URL if not explicitly provided
  const extractKeyFromUrl = useCallback(
    (url: string): string | null => {
      if (!url) return null;
      if (objectKey) return objectKey;
      if (lastUploadedKey) return lastUploadedKey;

      const knownFolders = [folder, "catalogs", "kyc", "uploads", "media"];
      for (const f of knownFolders) {
        const idx = url.indexOf(`${f}/`);
        if (idx !== -1) {
          return url.substring(idx);
        }
      }
      return null;
    },
    [objectKey, lastUploadedKey, folder]
  );

  const handleProcessFile = async (file: File) => {
    setUploadError(null);

    // Validate MIME type
    if (activeAccept.mimes.length > 0 && !activeAccept.mimes.includes(file.type)) {
      setUploadError(
        `Format file tidak didukung (${file.type || "unknown"}). Harap gunakan: ${activeAccept.label}.`
      );
      return;
    }

    // Validate size limit
    if (file.size > activeAccept.maxBytes) {
      const maxMb = Math.round(activeAccept.maxBytes / (1024 * 1024));
      setUploadError(`Ukuran file terlalu besar. Maksimal ukuran berkas adalah ${maxMb} MB.`);
      return;
    }

    try {
      setIsUploading(true);

      // Upload file to storage through backend
      const res = await uploadMedia(file, folder);

      // Auto-cleanup: If a previous file exists in this session, delete it from MinIO
      const previousKey = lastUploadedKey || objectKey;
      if (previousKey && previousKey !== res.key) {
        deleteMedia(previousKey).catch((err) => {
          console.warn("Failed to auto-cleanup previous file from storage:", err);
        });
      }

      setLastUploadedKey(res.key);
      setUploadedFilename(res.filename || file.name);
      onChange(res.url, res.key);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Gagal mengunggah berkas. Silakan periksa koneksi dan coba lagi.";
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleProcessFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, activeAccept, folder]
  );

  const handleRemoveFile = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (disabled || isUploading) return;

    const keyToDelete = lastUploadedKey || objectKey || extractKeyFromUrl(value);
    if (keyToDelete) {
      deleteMedia(keyToDelete).catch((err) => {
        console.warn("Failed to delete removed file from storage:", err);
      });
    }

    setLastUploadedKey(null);
    setUploadedFilename(null);
    setUploadError(null);

    if (onRemove) {
      onRemove();
    }
    onChange("", "");
  };

  const activeError = uploadError || error;
  const hasFile = Boolean(value && value.trim() !== "");

  // Auto-detect render mode for preview
  const displayName = uploadedFilename || extractFilename(value);
  const isImage = variant === "image" || (variant === "any" && isImageUrl(value));
  const isPdf = isPdfUrl(value) || isPdfUrl(displayName);
  const isImageDoc = isImageUrl(value) || isImageUrl(displayName);

  const previewModal = isPreviewOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Tutup pratinjau"
        onClick={() => setIsPreviewOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs"
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-outline-variant/30 bg-surface-container-low px-4 py-3">
          <p className="min-w-0 truncate text-xs font-bold text-on-surface" title={displayName}>
            {displayName}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
            >
              <OpenInNewIcon sx={{ fontSize: 14 }} />
              <span className="hidden sm:inline">Buka Tab Baru</span>
            </a>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="rounded-[8px] p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              title="Tutup pratinjau"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
        <div className="flex min-h-[320px] flex-1 items-center justify-center overflow-auto bg-surface-container/30 p-4 sm:p-6">
          {isImageDoc && !previewImageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={displayName}
              className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-md"
              onError={() => setPreviewImageError(true)}
            />
          ) : isPdf ? (
            <iframe
              src={value}
              title={displayName}
              className="h-[72vh] w-full rounded-xl border border-outline-variant/30 bg-white"
            />
          ) : (
            <div className="space-y-3 p-8 text-center">
              <DescriptionOutlinedIcon sx={{ fontSize: 42 }} className="text-on-surface-variant" />
              <p className="text-sm font-bold text-on-surface">
                Pratinjau langsung tidak tersedia untuk berkas ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className={`w-full space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-on-surface">{label}</label>
          <span className="text-[11px] text-on-surface-variant font-normal">
            {activeAccept.label}
          </span>
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={activeAccept.mimes.join(",")}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Uploading Progress State */}
      {isUploading ? (
        <div
          className={`w-full ${
            isImage ? "aspect-video max-h-52" : "h-40 min-h-40 max-h-40"
          } rounded-xl border border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-3 p-6 text-center animate-pulse`}
        >
          <CircularProgress size={30} thickness={4} className="text-primary" />
          <div>
            <p className="text-xs font-bold text-primary">Mengunggah berkas ke MinIO storage...</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Mohon tunggu sebentar selagi berkas diproses.
            </p>
          </div>
        </div>
      ) : hasFile ? (
        isImage ? (
          /* Image Preview State (16:9) */
          <div className="relative w-full aspect-video max-h-56 rounded-xl border border-outline-variant/40 overflow-hidden bg-surface-container shadow-xs group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={displayName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              onError={() => {
                setUploadError("Gambar gagal dimuat atau URL tidak valid.");
              }}
            />

            {/* Badge Overlay */}
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-surface/90 text-on-surface backdrop-blur-md border border-outline-variant/30 shadow-xs">
                <CheckCircleOutlineIcon sx={{ fontSize: 15 }} className="text-primary" />
                <span>Gambar Terpasang</span>
              </span>
            </div>

            {/* Action Buttons Overlay */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-surface/90 px-3 py-1.5 text-xs font-bold text-on-surface shadow-xs backdrop-blur-md transition-all hover:bg-surface hover:text-primary"
                title="Lihat gambar"
              >
                <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                <span>Lihat</span>
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold bg-surface/90 text-on-surface hover:bg-surface hover:text-primary backdrop-blur-md border border-outline-variant/40 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Pilih gambar lain untuk menggantikan"
              >
                <EditOutlinedIcon sx={{ fontSize: 14 }} />
                <span>Ganti Gambar</span>
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleRemoveFile}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] text-xs font-bold bg-error/90 text-white hover:bg-error backdrop-blur-md shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Hapus gambar"
              >
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            </div>
          </div>
        ) : (
          /* Document Preview Bento Card */
          <div className="h-40 min-h-40 max-h-40 w-full overflow-hidden rounded-xl border-2 border-dashed border-primary/25 bg-surface-container-lowest p-4 shadow-xs transition-all hover:border-primary/55 hover:bg-primary/[0.02]">
            <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-2xs ${
                    isPdf
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40"
                      : isImageDoc
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {isPdf ? (
                    <PictureAsPdfOutlinedIcon sx={{ fontSize: 24 }} />
                  ) : isImageDoc ? (
                    <ImageOutlinedIcon sx={{ fontSize: 24 }} />
                  ) : (
                    <DescriptionOutlinedIcon sx={{ fontSize: 24 }} />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="break-words text-xs font-bold text-on-surface sm:text-sm" title={displayName}>
                    {displayName}
                  </p>
                  <div className="mt-1 inline-flex max-w-full items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircleOutlineIcon sx={{ fontSize: 12 }} />
                    <span className="wrap-break-word">Tersimpan di MinIO</span>
                  </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 grid w-full grid-cols-3 gap-1.5 border-t border-dashed border-outline-variant/50 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="inline-flex min-w-0 items-center justify-center gap-1 rounded-[10px] border border-primary/20 bg-primary/10 px-2 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/20"
                  title="Lihat berkas"
                >
                  <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                  <span>Lihat</span>
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-w-0 items-center justify-center gap-1 rounded-[10px] border border-outline-variant/40 px-2 py-1.5 text-[11px] font-bold text-on-surface transition-colors hover:bg-surface-container hover:text-primary disabled:opacity-50 cursor-pointer"
                  title="Ganti berkas"
                >
                  <EditOutlinedIcon sx={{ fontSize: 14 }} />
                  <span>Ganti</span>
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleRemoveFile}
                  className="inline-flex min-w-0 items-center justify-center gap-1 rounded-[10px] px-2 py-1.5 text-[11px] font-bold text-error transition-colors hover:bg-error/10 disabled:opacity-50 cursor-pointer"
                  title="Hapus berkas"
                >
                  <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                  <span>Hapus</span>
                </button>
            </div>
          </div>
        )
      ) : (
        /* Empty State Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`w-full ${
            variant === "image" ? "aspect-video max-h-52" : "h-40 min-h-40 max-h-40"
          } min-h-40 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.005]"
              : activeError
              ? "border-error/60 bg-error/5 hover:border-error"
              : "border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low/50 hover:border-primary/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 shadow-2xs">
            {variant === "image" ? (
              <ImageOutlinedIcon sx={{ fontSize: 24 }} />
            ) : (
              <CloudUploadOutlinedIcon sx={{ fontSize: 24 }} />
            )}
          </div>
          <p className="text-xs font-bold text-on-surface">
            Klik untuk memilih berkas atau seret file ke sini
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1">{activeAccept.label}</p>
        </div>
      )}

      {/* Helper & Error Feedback */}
      {activeError ? (
        <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-1">
          <ErrorOutlineIcon sx={{ fontSize: 13 }} />
          <span>{activeError}</span>
        </p>
      ) : null}
      </div>
      {previewModal}
    </>
  );
}
