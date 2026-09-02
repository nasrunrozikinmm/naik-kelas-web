"use client";

import React, { useState } from "react";
import { DynamicForm, FormConfig } from "@/components/dynamic-form";
import { Paper, Typography, Box } from "@mui/material";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getApiErrorMessage } from "@/lib/utils/api-error";

export default function StudentPreferencesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);

  const preferencesConfig: FormConfig = {
    submitLabel: "Simpan Preferensi",
    fields: [
      {
        name: "educationLevel",
        label: "Tingkat Pendidikan",
        type: "select",
        placeholder: "Pilih tingkat pendidikan",
        options: [
          { label: "SMA/SMK Sederajat", value: "high_school" },
          { label: "S1 (Sarjana)", value: "bachelor" },
          { label: "S2 (Magister)", value: "master" },
          { label: "S3 (Doktor)", value: "doctorate" },
          { label: "Umum/Profesional", value: "professional" },
        ],
        validation: { required: true, requiredMessage: "Tingkat pendidikan wajib diisi" },
        gridProps: { xs: 12, md: 6 }
      },
      {
        name: "englishLevel",
        label: "Tingkat Bahasa Inggris",
        type: "select",
        placeholder: "Pilih tingkat kemampuan",
        options: [
          { label: "Beginner (Pemula)", value: "beginner" },
          { label: "Intermediate (Menengah)", value: "intermediate" },
          { label: "Advanced (Mahir)", value: "advanced" },
          { label: "Native/Bilingual", value: "native" },
        ],
        validation: { required: true, requiredMessage: "Kemampuan Bahasa Inggris wajib diisi" },
        gridProps: { xs: 12, md: 6 }
      },
      {
        name: "learningGoals",
        label: "Tujuan Belajar Utama",
        type: "select",
        placeholder: "Pilih tujuan utama",
        options: [
          { label: "Persiapan Beasiswa Luar Negeri", value: "scholarship_abroad" },
          { label: "Persiapan Beasiswa Dalam Negeri", value: "scholarship_domestic" },
          { label: "Persiapan Karir / Wawancara", value: "career" },
          { label: "Peningkatan Akademik", value: "academic" },
          { label: "Lainnya", value: "other" },
        ],
        validation: { required: true, requiredMessage: "Tujuan belajar wajib diisi" },
        gridProps: { xs: 12 }
      },
      {
        name: "interests",
        label: "Minat / Topik Spesifik (Opsional)",
        type: "text",
        placeholder: "Contoh: TOEFL, IELTS, Motivation Letter, dll",
        gridProps: { xs: 12 }
      }
    ]
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setGlobalError("");
    setSuccess(false);

    try {
      const reqData = {
        learning_goals: data.learningGoals as string,
        education_level: data.educationLevel as string,
        english_level: data.englishLevel as string,
        interests: data.interests as string || "",
        languages: ["id", "en"], // default languages for now
      };
      
      const response = await apiClient.put(endpoints.profile.preferences, reqData);
      if (response.data?.success) {
        setSuccess(true);
      }
    } catch (error: unknown) {
      setGlobalError(getApiErrorMessage(error, "Gagal menyimpan preferensi"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Preferensi Belajar</h2>
        <p className="text-on-surface-variant mt-2">
          Bantu kami merekomendasikan mentor dan kelas yang paling sesuai dengan tujuanmu.
        </p>
      </div>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #e0e0e0" }}>
        {success && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "#dcfce7", color: "#166534", borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="bold">Preferensi berhasil disimpan!</Typography>
          </Box>
        )}
        <DynamicForm 
          config={preferencesConfig}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          globalError={globalError}
          submitButtonSx={{
            bgcolor: "#1a56db",
            "&:hover": { bgcolor: "#1e40af" },
            fontFamily: "Plus Jakarta Sans, sans-serif",
            py: 1.5,
            mt: 2
          }}
        />
      </Paper>
    </div>
  );
}
