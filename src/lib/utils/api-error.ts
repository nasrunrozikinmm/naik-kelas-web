import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/domain";

export function getApiErrorMessage(error: unknown, fallbackMessage = "Terjadi kesalahan pada sistem"): string {
  if (isAxiosError(error)) {
    const errorData = error.response?.data as ApiErrorResponse | undefined;
    if (errorData?.error?.message) {
      return errorData.error.message;
    }
    if (typeof error.response?.data === "string" && error.response.data.trim()) {
      return error.response.data;
    }
    if (error.response?.status === 401) {
      return "Sesi Anda telah berakhir. Silakan masuk kembali.";
    }
    if (error.response?.status === 403) {
      return "Anda tidak memiliki izin untuk melakukan tindakan ini.";
    }
    if (error.response?.status === 404) {
      return "Data yang diminta tidak ditemukan.";
    }
    if (error.response?.status === 500) {
      return "Terjadi kendala pada server. Silakan coba lagi beberapa saat lagi.";
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
