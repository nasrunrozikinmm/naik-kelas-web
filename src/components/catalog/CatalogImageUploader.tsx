"use client";

import React from "react";
import { FileUploader } from "@/components/common/FileUploader";

export interface CatalogImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  error?: string;
  folder?: string;
}

export function CatalogImageUploader({
  label = "Gambar Cover / Banner Layanan",
  value,
  onChange,
  disabled = false,
  error,
  folder = "catalogs",
}: CatalogImageUploaderProps) {
  return (
    <FileUploader
      label={label}
      value={value}
      onChange={(url) => onChange(url)}
      disabled={disabled}
      error={error}
      folder={folder}
      variant="image"
    />
  );
}
